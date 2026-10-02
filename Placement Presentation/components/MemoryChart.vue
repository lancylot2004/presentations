<script setup lang="ts">
// One run, two readings. Data: data/memory.csv, measured at 1ms.
//
// reveal 0 is the whole story a single number can tell: memory.current climbs,
// sits near the limit, and the process is killed. The problem slide shows only
// this. reveal 1 fades in the rest of the same run, the anon and file split,
// which is the part that says the first two seconds were never in danger and
// the last two always were.
//
// Drag or scroll to pan, pinch or wheel to zoom, hover or hold to read off the
// exact numbers under the pointer. Zoomed right in the 8 MB allocation steps
// are individually visible.
import { computed } from 'vue'
import raw from '../data/memory.csv?raw'
import metaRaw from '../data/memory.meta.csv?raw'
import { bandPath, linePath, meta, parseCsv, scale, ticks, type Pt } from './chart'
import { useTimeView } from './useTimeView'

const { reveal = 0 } = defineProps<{ reveal?: number }>()

const W = 1000
const H = 300
const M = { top: 20, right: 186, bottom: 42, left: 78 }
const MB = 1024 * 1024

const all = parseCsv(raw)
const m = meta(metaRaw)
const limit = m.memory_max / MB

// The kill sample reads zero for everything, because by then the cgroup has
// stopped existing. Plot up to it and mark it; do not draw the cliff.
const killIdx = all.findIndex((r) => r.oom_kill > all[0].oom_kill)
const rows = all.slice(0, killIdx > 0 ? killIdx : all.length)
const killT = all[killIdx > 0 ? killIdx : all.length - 1].t_ns / 1e9

const { view, svg, bind, reset, zoomed } = useTimeView('memView', [0, killT], {
  plot: { left: M.left, right: M.right, width: W },
  minSpan: 0.02,
})

const x = computed(() => scale([view.value.t0, view.value.t1], [M.left, W - M.right]))
const y = scale([0, limit * 1.1], [H - M.bottom, M.top])

const seen = computed(() => {
  const { t0, t1 } = view.value
  // One sample either side of the window, so a line entering it starts at the
  // edge rather than at the first sample inside it.
  const lo = Math.max(0, rows.findIndex((r) => r.t_ns / 1e9 >= t0) - 1)
  let hi = rows.findIndex((r) => r.t_ns / 1e9 > t1)
  hi = hi < 0 ? rows.length : hi + 1
  return rows.slice(lo, hi)
})

const paths = computed(() => {
  const rs = seen.value
  const at = (r: (typeof rows)[number]) => x.value(r.t_ns / 1e9)
  const base: Pt[] = rs.map((r) => [at(r), y(0)])
  const anonTop: Pt[] = rs.map((r) => [at(r), y(r.anon / MB)])
  const fileTop: Pt[] = rs.map((r) => [at(r), y((r.anon + r.file) / MB)])
  return {
    anonArea: bandPath(anonTop, base),
    fileArea: bandPath(fileTop, anonTop),
    anonTop: linePath(anonTop),
    fileTop: linePath(fileTop),
    current: linePath(rs.map((r) => [at(r), y(r.memory_current / MB)] as Pt)),
  }
})

const peakFile = Math.max(...rows.map((r) => r.file))

// The readout: the sample nearest the pointer, found by bisection.
const cursor = computed(() => {
  const t = view.value.c
  if (t == null || t < view.value.t0 || t > view.value.t1)
    return null
  const ns = t * 1e9
  let lo = 0
  let hi = rows.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (rows[mid].t_ns < ns) lo = mid + 1
    else hi = mid
  }
  const r = rows[lo]
  const px = x.value(r.t_ns / 1e9)
  const high = r.memory_current / MB > limit * 0.55
  return {
    r,
    px,
    // Keep the readout off whichever half of the plot the lines are in.
    ty: high ? H - M.bottom - (reveal >= 1 ? 92 : 50) - 10 : M.top + 10,
    flip: px > W - M.right - 210,
    t: r.t_ns / 1e9,
    current: r.memory_current / MB,
    anon: r.anon / MB,
    file: r.file / MB,
  }
})

const yTicks = ticks(0, limit, 4)
const xTicks = computed(() => {
  const { t0, t1 } = view.value
  const span = t1 - t0
  const dp = span >= 2 ? 1 : span >= 0.2 ? 2 : 3
  return Array.from({ length: 5 }, (_, i) => t0 + (span * i) / 4).map((t) => ({ t, label: `${t.toFixed(dp)}s` }))
})
</script>

<template>
  <div class="wrap">
    <div class="legend">
      <span class="key"><i class="sw" style="background: var(--sp-text)" />memory.current</span>
      <span class="key"><i class="sw dash" style="border-color: var(--sp-text)" />memory.max, {{ limit.toFixed(0) }} MB</span>
      <span class="key fade" :style="{ opacity: reveal >= 1 ? 1 : 0 }">
        <i class="sw" style="background: var(--sp-rust)" />anon, cannot be reclaimed
      </span>
      <span class="key fade" :style="{ opacity: reveal >= 1 ? 1 : 0 }">
        <i class="sw" style="background: var(--sp-good)" />file, reclaimable
      </span>
      <span class="controls">
        <button v-if="zoomed" class="reset" @pointerdown.stop @click.stop="reset">reset</button>
      </span>
    </div>

    <svg ref="svg" :viewBox="`0 0 ${W} ${H}`" class="chart" v-bind="bind">
      <defs>
        <clipPath id="mem-clip">
          <rect :x="M.left" :y="0" :width="W - M.right - M.left" :height="H" />
        </clipPath>
      </defs>

      <rect :x="M.left" :y="M.top" :width="W - M.right - M.left" :height="H - M.bottom - M.top" fill="transparent" />

      <g stroke="var(--sp-border)" stroke-width="1">
        <line v-for="v in yTicks" :key="`g${v}`" :x1="M.left" :x2="W - M.right" :y1="y(v)" :y2="y(v)" />
      </g>

      <g clip-path="url(#mem-clip)">
        <g class="fade" :style="{ opacity: reveal >= 1 ? 1 : 0 }">
          <path :d="paths.fileArea" fill="var(--sp-good)" fill-opacity="0.3" />
          <path :d="paths.anonArea" fill="var(--sp-rust)" fill-opacity="0.4" />
          <path :d="paths.fileTop" fill="none" stroke="var(--sp-good)" stroke-width="2" />
          <path :d="paths.anonTop" fill="none" stroke="var(--sp-rust)" stroke-width="2" />
        </g>

        <path :d="paths.current" fill="none" stroke="var(--sp-text)" stroke-width="3" />

        <line :x1="x(killT)" :x2="x(killT)" :y1="M.top" :y2="H - M.bottom" stroke="var(--sp-rust)" stroke-width="3" />

        <g v-if="cursor" class="cursor">
          <line :x1="cursor.px" :x2="cursor.px" :y1="M.top" :y2="H - M.bottom" stroke="var(--sp-muted)" stroke-width="1.5" />
          <circle :cx="cursor.px" :cy="y(cursor.current)" r="4.5" fill="var(--sp-text)" />
          <g v-if="reveal >= 1">
            <circle :cx="cursor.px" :cy="y(cursor.anon)" r="4" fill="var(--sp-rust)" />
            <circle :cx="cursor.px" :cy="y(cursor.anon + cursor.file)" r="4" fill="var(--sp-good)" />
          </g>
        </g>
      </g>

      <line
        :x1="M.left" :x2="W - M.right" :y1="y(limit)" :y2="y(limit)"
        stroke="var(--sp-text)" stroke-width="2.5" stroke-dasharray="10 7"
      />
      <line
        :x1="M.left" :x2="W - M.right" :y1="H - M.bottom" :y2="H - M.bottom"
        stroke="var(--sp-dim)" stroke-width="1.5"
      />

      <g class="tick" fill="var(--sp-muted)" text-anchor="end">
        <text v-for="(v, i) in yTicks" :key="`l${v}`" :x="M.left - 12" :y="y(v) + 6">
          {{ v.toFixed(0) }}{{ i === yTicks.length - 1 ? ' MB' : '' }}
        </text>
      </g>
      <g class="tick" fill="var(--sp-muted)" text-anchor="middle">
        <text v-for="t in xTicks" :key="t.t" :x="x(t.t)" :y="H - M.bottom + 26">{{ t.label }}</text>
      </g>

      <g v-if="cursor" :transform="`translate(${cursor.flip ? cursor.px - 196 : cursor.px + 12}, ${cursor.ty})`">
        <rect width="184" :height="reveal >= 1 ? 92 : 50" rx="6" fill="var(--sp-bg)" fill-opacity="0.94" stroke="var(--sp-border)" />
        <text class="read" x="12" y="21" fill="var(--sp-muted)">{{ cursor.t.toFixed(3) }}s</text>
        <text class="read" x="12" y="41" fill="var(--sp-text)">current {{ cursor.current.toFixed(0) }} MB</text>
        <template v-if="reveal >= 1">
          <text class="read" x="12" y="63" fill="var(--sp-rust)">anon {{ cursor.anon.toFixed(0) }} MB</text>
          <text class="read" x="12" y="83" fill="var(--sp-good)">file {{ cursor.file.toFixed(0) }} MB</text>
        </template>
      </g>

      <g v-else text-anchor="start">
        <text class="callout" :x="W - M.right + 12" :y="y(limit) + 4" fill="var(--sp-rust)">oom_kill = 1</text>
        <text class="note" :x="W - M.right + 12" :y="y(limit) + 28" fill="var(--sp-muted)">
          killed at {{ killT.toFixed(2) }}s
        </text>
        <g class="fade" :style="{ opacity: reveal >= 1 ? 1 : 0 }">
          <text class="note" :x="W - M.right + 12" :y="y(peakFile / MB * 0.6)" fill="var(--sp-good)">
            {{ (peakFile / MB).toFixed(0) }} MB of cache,
          </text>
          <text class="note" :x="W - M.right + 12" :y="y(peakFile / MB * 0.6) + 22" fill="var(--sp-good)">
            reclaimed on demand
          </text>
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.wrap { width: 100%; }
.chart { width: 100%; height: auto; cursor: crosshair; touch-action: none; }
.legend { display: flex; align-items: center; gap: 1.3rem; font-size: 0.85rem; color: var(--sp-muted); margin-bottom: 0.2rem; }
.key { display: inline-flex; align-items: center; gap: 0.45rem; }
.sw { width: 1.1rem; height: 0.32rem; border-radius: 2px; display: inline-block; }
.sw.dash { height: 0; border-top: 3px dashed; border-radius: 0; }
.fade { transition: opacity 600ms ease; }
.controls { margin-left: auto; }
.controls button {
  font: inherit;
  font-size: 0.78rem;
  padding: 0.12rem 0.6rem;
  color: var(--sp-warn);
  background: transparent;
  border: 1px solid var(--sp-warn);
  border-radius: 0.35rem;
  cursor: pointer;
}
.tick { font-size: 17px; font-variant-numeric: tabular-nums; }
.read { font-size: 15px; font-variant-numeric: tabular-nums; }
.callout { font-size: 22px; font-weight: 700; }
.note { font-size: 16px; }
</style>
