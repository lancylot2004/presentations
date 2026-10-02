<script setup lang="ts">
// Reserved against actually used. Data: data/waste.csv, measured.
// Nothing here fails: the job runs, finishes, and hands back capacity nobody
// else could have used while it held it. That is the point.
import raw from '../data/waste.csv?raw'
import metaRaw from '../data/waste.meta.csv?raw'
import { cores, meta, parseCsv } from './chart'

const MB = 1024 * 1024
const rows = parseCsv(raw)
const m = meta(metaRaw)

const runS = rows[rows.length - 1].t_ns / 1e9
const cpuReserved = m.cpu_quota_usec / m.cpu_period_usec
const cpuUsed =
  (rows[rows.length - 1].usage_usec - rows[0].usage_usec) / 1e6 / runS
const cpuPeak = Math.max(...cores(rows, 100).map(([, v]) => v))

const memReserved = m.memory_max / MB
const memUsed = Math.max(...rows.map((r) => r.memory_current)) / MB

const bars = [
  { label: 'CPU', unit: 'cores', reserved: cpuReserved, used: cpuUsed, dp: 2 },
  { label: 'Memory', unit: 'MB', reserved: memReserved, used: memUsed, dp: 0 },
]
const pct = (b: typeof bars[number]) => (100 * b.used) / b.reserved
</script>

<template>
  <div class="wrap">
    <div v-for="b in bars" :key="b.label" class="row">
      <div class="head">
        <span class="name">{{ b.label }}</span>
        <span class="nums">
          <strong>{{ b.used.toFixed(b.dp) }}</strong> of {{ b.reserved.toFixed(b.dp) }} {{ b.unit }}
        </span>
      </div>
      <div class="track">
        <div class="fill" :style="{ width: `${pct(b)}%` }" />
        <div class="pct">{{ pct(b).toFixed(1) }}%</div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.wrap { width: 100%; display: flex; flex-direction: column; gap: 2rem; }

.head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.6rem; }
.name { font-size: 1.8rem; font-weight: 700; }
.nums { font-size: 1.1rem; color: var(--sp-muted); font-variant-numeric: tabular-nums; }
.nums strong { color: var(--sp-text); }

.track {
  position: relative;
  height: 3.2rem;
  border: 1.5px dashed var(--sp-border);
  border-radius: 0.5rem;
  background: color-mix(in srgb, var(--sp-surface) 60%, transparent);
}

.fill {
  height: 100%;
  border-radius: 0.4rem 0 0 0.4rem;
  background: var(--sp-warn);
  opacity: 0.85;
}

.pct {
  position: absolute;
  inset: 0 0.9rem 0 auto;
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--sp-muted);
  font-variant-numeric: tabular-nums;
}

</style>
