// Minimal helpers shared by the two result charts. Hand-rolled SVG rather than
// a chart library: nothing animates, so PDF export captures the finished chart.

export type Row = Record<string, number>

/**
 * Parse a numeric CSV with a header row. Non-numeric cells become NaN.
 *
 * Handles CRLF: Python's csv writer emits \r\n, which otherwise leaves a
 * trailing \r on the last column's name and silently hides that column.
 */
export function parseCsv(raw: string): Row[] {
  const [head, ...lines] = raw.trim().split(/\r?\n/)
  const cols = head.split(',').map((c) => c.trim())
  return lines.map((line) => {
    const cells = line.split(',')
    return Object.fromEntries(cols.map((c, i) => [c, Number(cells[i])])) as Row
  })
}

/** Linear scale from a data domain to a pixel range. */
export function scale([d0, d1]: [number, number], [r0, r1]: [number, number]) {
  return (v: number) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0)
}

/** Centred rolling mean, used to de-alias a derivative sampled near its period. */
export function rollingMean(values: number[], window: number): number[] {
  const half = Math.floor(window / 2)
  return values.map((_, i) => {
    const lo = Math.max(0, i - half)
    const hi = Math.min(values.length, i + half + 1)
    let sum = 0
    for (let j = lo; j < hi; j++) sum += values[j]
    return sum / (hi - lo)
  })
}

export type Pt = [number, number]

export function linePath(pts: Pt[]): string {
  return pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
}

/** Filled band between an upper edge and a lower edge (given back-to-front). */
export function bandPath(upper: Pt[], lower: Pt[]): string {
  return `${linePath(upper)} L${lower[lower.length - 1][0].toFixed(1)} ${lower[lower.length - 1][1].toFixed(1)} ${lower
    .slice()
    .reverse()
    .map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ')} Z`
}

/** `count` evenly spaced tick values across [min, max], inclusive. */
export function ticks(min: number, max: number, count: number): number[] {
  return Array.from({ length: count + 1 }, (_, i) => min + ((max - min) * i) / count)
}

/**
 * Instantaneous cores used, from the cgroup's cumulative usage counter.
 *
 * cores = d(usage_usec) / dt. `window` is how many samples the delta spans:
 * 1 gives the raw per-sample value, which at a 1ms cadence is deliberately
 * bimodal under CFS throttling (full speed, then frozen for the rest of the
 * period) and is the honest picture of what the scheduler is doing.
 */
export function cores(rows: Row[], window = 1): Pt[] {
  const out: Pt[] = []
  for (let i = window; i < rows.length; i++) {
    const dt = rows[i].t_ns - rows[i - window].t_ns
    if (dt <= 0) continue
    out.push([rows[i].t_ns / 1e9, ((rows[i].usage_usec - rows[i - window].usage_usec) * 1000) / dt])
  }
  return out
}

/**
 * Periods in which the cgroup was throttled at all.
 *
 * throttled_usec only advances when the kernel actually freezes the group, and
 * it does so once per CFS period, not per sample. So the samples are bucketed
 * into real periods (100ms by default) and a bucket counts as throttled when
 * the counter moved across it. Testing successive 1ms samples instead would
 * mark only the single millisecond the counter happened to tick.
 *
 * Returns [start, end] in seconds for each throttled period.
 */
export function throttledPeriods(rows: Row[], periodUsec: number): [number, number][] {
  const periodNs = periodUsec * 1000
  const first = new Map<number, number>()
  const last = new Map<number, number>()
  for (const r of rows) {
    const b = Math.floor(r.t_ns / periodNs)
    if (!first.has(b)) first.set(b, r.throttled_usec)
    last.set(b, r.throttled_usec)
  }
  const out: [number, number][] = []
  for (const [b, start] of first) {
    if ((last.get(b) ?? start) - start > 0) {
      out.push([(b * periodNs) / 1e9, ((b + 1) * periodNs) / 1e9])
    }
  }
  return out.sort((a, b) => a[0] - b[0])
}

/** The single-row sidecar file holding a run's fixed limits. */
export function meta(raw: string): Row {
  return parseCsv(raw)[0]
}

/**
 * Collapse a dense series to one column per pixel, keeping the minimum, the
 * maximum and the mean of everything that falls in each column. Drawing 92k
 * points into a 1000px chart otherwise throws away the extremes at random;
 * this keeps them, so a series that swings between 0 and 4 still looks like
 * one. It is an aggregation for the screen, not a smoothing of the data.
 */
export function envelope(pts: Pt[], t0: number, t1: number, cols: number) {
  const lo = new Array<number>(cols).fill(Infinity)
  const hi = new Array<number>(cols).fill(-Infinity)
  const sum = new Array<number>(cols).fill(0)
  const n = new Array<number>(cols).fill(0)
  for (const [t, v] of pts) {
    if (t < t0 || t > t1)
      continue
    const i = Math.min(cols - 1, Math.floor(((t - t0) / (t1 - t0)) * cols))
    if (v < lo[i]) lo[i] = v
    if (v > hi[i]) hi[i] = v
    sum[i] += v
    n[i] += 1
  }
  const out: { t: number, lo: number, hi: number, mean: number }[] = []
  for (let i = 0; i < cols; i++) {
    if (!n[i])
      continue
    out.push({ t: t0 + ((i + 0.5) / cols) * (t1 - t0), lo: lo[i], hi: hi[i], mean: sum[i] / n[i] })
  }
  return out
}
