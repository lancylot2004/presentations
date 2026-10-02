// Self-check for the chart helpers, plus a sanity check that the committed
// datasets still say what the slides claim. Run: node scripts/test-chart.mjs
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { bandPath, cores, linePath, meta, parseCsv, rollingMean, scale, throttledPeriods, ticks } from '../components/chart.ts'

// CRLF: the bug that hid the oom_kill column, since Python's csv writer uses \r\n.
const rows = parseCsv('a,b,c\r\n1,2,3\r\n4,5,6\r\n')
assert.deepEqual(rows, [{ a: 1, b: 2, c: 3 }, { a: 4, b: 5, c: 6 }])
assert.equal(rows[1].c, 6, 'last column must survive CRLF line endings')
assert.deepEqual(parseCsv('a,b\n1,2'), [{ a: 1, b: 2 }], 'LF must still work')

const y = scale([0, 10], [100, 0])
assert.equal(y(0), 100)
assert.equal(y(10), 0)
assert.equal(y(5), 50)

assert.deepEqual(rollingMean([1, 1, 1, 1, 1], 3), [1, 1, 1, 1, 1])
assert.equal(rollingMean([2, 4, 6], 3)[1], 4)
assert.equal(linePath([[0, 1], [2, 3]]), 'M0.0 1.0 L2.0 3.0')
assert.ok(bandPath([[0, 0], [1, 0]], [[0, 5], [1, 5]]).endsWith('Z'), 'band must close')
assert.deepEqual(ticks(0, 512, 4), [0, 128, 256, 384, 512])

// cores() is a delta over the cumulative counter: a flat 1 core/sec climb at a
// 1ms cadence must read exactly 1.0.
const synth = [0, 1, 2, 3].map((i) => ({ t_ns: i * 1e6, usage_usec: i * 1000 }))
assert.deepEqual(cores(synth, 1).map(([, v]) => v), [1, 1, 1])

// throttledPeriods buckets by real CFS period, not by sample. Two 100ms periods,
// the counter only moves in the first.
const tp = throttledPeriods(
  [
    { t_ns: 0, throttled_usec: 0 },
    { t_ns: 50e6, throttled_usec: 7 },
    { t_ns: 120e6, throttled_usec: 7 },
    { t_ns: 180e6, throttled_usec: 7 },
  ],
  100_000,
)
assert.deepEqual(tp, [[0, 0.1]], 'only the period whose counter moved is marked')

const read = (f) => readFileSync(new URL(`../data/${f}`, import.meta.url), 'utf8')
const MB = 1024 * 1024

// Every dataset must have been sampled at a true 1ms, since that is the claim
// the deck makes about how it was collected.
for (const name of ['spike', 'memory', 'waste']) {
  const r = parseCsv(read(`${name}.csv`))
  const gaps = r.slice(1).map((x, i) => x.t_ns - r[i].t_ns)
  const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length / 1e6
  assert.ok(Math.abs(mean - 1) < 0.01, `${name}: mean gap ${mean.toFixed(4)}ms is not 1ms`)
  assert.ok(r.length > 2000, `${name}: only ${r.length} samples`)
}

// Throttling, and the whole argument of the motivation slide: the coarse poll
// and the 1ms sampling disagree about the same ten seconds.
const fine = parseCsv(read('spike.csv'))
const fineMeta = meta(read('spike.meta.csv'))
const coarse = parseCsv(read('spike-coarse.csv'))
const coarseMeta = meta(read('spike-coarse.meta.csv'))
const quota = fineMeta.cpu_quota_usec / fineMeta.cpu_period_usec
assert.equal(quota, 1, 'the spike ran under a one core quota')
assert.equal(coarseMeta.interval_ns, 30e9, 'the coarse poll must be a 30s interval')
assert.ok(coarse.length >= 4, `the coarse poll needs a baseline sample, got ${coarse.length}`)

// The coarse poll can only ever report an average, and that average is calm.
const coarseCores = coarse.slice(1).map((r, i) => {
  const prev = coarse[i]
  return (r.usage_usec - prev.usage_usec) / 1e6 / ((r.t_ns - prev.t_ns) / 1e9)
})
assert.ok(Math.max(...coarseCores) < 0.6 * quota, 'the coarse poll must look unremarkable')

// The 1ms samples of the same run say the group spent ten seconds on its limit.
const periods = throttledPeriods(fine, fineMeta.cpu_period_usec)
assert.ok(periods.length > 80, `expected the burst to be throttled, got ${periods.length} periods`)
const [burstStart] = periods[0]
const burst = cores(fine, 1).filter(([t]) => t >= burstStart && t <= burstStart + 8)
const burstMean = burst.reduce((a, [, v]) => a + v, 0) / burst.length
assert.ok(Math.abs(burstMean - quota) < 0.15, `the burst must sit on the quota, got ${burstMean.toFixed(2)}`)
assert.ok(burst.filter(([, v]) => v === 0).length / burst.length > 0.5, 'the burst must be mostly frozen')
assert.ok(Math.max(...burst.map(([, v]) => v)) > 3, 'expected sprints well above the quota')

// Memory: one run that is safe and then fatal at the same memory.current, which
// is the whole argument of the slide it feeds.
const mem = parseCsv(read('memory.csv'))
const memMeta = meta(read('memory.meta.csv'))
const limit = memMeta.memory_max
assert.equal(mem[0].oom_kill, 0)
assert.ok(mem.at(-1).oom_kill >= 1, 'the run must end in an OOM kill')

// Phase one: sitting high on the limit with almost all of it reclaimable.
const cached = mem.filter((r) => r.file > 0.6 * limit)
assert.ok(cached.length > 1000, `expected a long cache plateau, got ${cached.length} samples`)
assert.ok(cached.every((r) => r.oom_kill === 0), 'nothing may be killed during the cache plateau')
assert.ok(cached.every((r) => r.file > 2.5 * r.anon), 'the plateau must be mostly reclaimable cache')
assert.ok(Math.max(...cached.map((r) => r.memory_current)) > 0.75 * limit)

// Phase two: the cache is reclaimed away and anon takes its place. The reading
// that matters is that memory.current does not distinguish the two.
const dying = mem.filter((r) => r.anon > 0.85 * limit)
assert.ok(dying.length > 0, 'anon must climb into the limit before the kill')
const plateauCurrent = cached.at(-1).memory_current
assert.ok(
  Math.abs(dying.at(-1).memory_current - plateauCurrent) < 0.25 * limit,
  'the safe and the fatal samples must read a similar memory.current',
)
assert.ok(Math.max(...mem.map((r) => r.file)) / MB > 300, 'the cache must be worth plotting')

// Waste: nothing fails, the reservation is simply far larger than the need.
const waste = parseCsv(read('waste.csv'))
const wasteMeta = meta(read('waste.meta.csv'))
const wasteRunS = waste.at(-1).t_ns / 1e9
const wasteCores = (waste.at(-1).usage_usec - waste[0].usage_usec) / 1e6 / wasteRunS
assert.equal(waste.at(-1).oom_kill, 0, 'the waste case must not fail')
assert.ok(wasteCores < 0.2 * (wasteMeta.cpu_quota_usec / wasteMeta.cpu_period_usec))
assert.ok(Math.max(...waste.map((r) => r.memory_current)) < 0.2 * wasteMeta.memory_max)

console.log('chart helpers and all four measured datasets: ok')
