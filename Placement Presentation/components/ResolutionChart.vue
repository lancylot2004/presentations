<script setup lang="ts">
// The same ninety seconds of the same container, read at two intervals.
// Data: data/spike.csv and data/spike-coarse.csv, both measured, both sampled
// live from a sidecar while one workload ran.
//
// Drag or scroll to pan, pinch or wheel to zoom, and the buttons pick which
// series is drawn. Pan and zoom come from useTimeView, so they are shared with
// every other chart and sync across clients in remote mode.
import { computed } from 'vue'
import { bandPath, envelope, linePath, scale, type Pt } from './chart'
import { coarseSeconds, coarseSteps, fineCores, quota, throttled } from './spike'
import { useTimeView } from './useTimeView'

const W = 1000
const H = 300
const M = { top: 28, right: 58, bottom: 38, left: 62 }
const COLS = 470 // roughly one column per two pixels of plot width
const TMAX = 90
const yMax = 5

const { view, svg, bind, reset, zoomed, mode, setMode } = useTimeView('cpuView', [0, TMAX], {
  plot: { left: M.left, right: M.right, width: W },
  minSpan: 0.05, // 50 ms, far enough in to see individual samples
  defaultMode: 'both',
})

const showFine = computed(() => mode.value !== 'coarse')
const showCoarse = computed(() => mode.value !== 'fine')

const x = computed(() => scale([view.value.t0, view.value.t1], [M.left, W - M.right]))
const y = scale([0, yMax], [H - M.bottom, M.top])
const clamp = (v: number) => Math.max(0, Math.min(yMax, v))

const env = computed(() => envelope(fineCores, view.value.t0, view.value.t1, COLS))
const fineBand = computed(() => {
  const e = env.value
  return e.length < 2
    ? ''
    : bandPath(
        e.map((p) => [x.value(p.t), y(clamp(p.hi))] as Pt),
        e.map((p) => [x.value(p.t), y(clamp(p.lo))] as Pt),
      )
})
const fineMean = computed(() =>
  env.value.length < 2 ? '' : linePath(env.value.map((p) => [x.value(p.t), y(clamp(p.mean))] as Pt)))

// Zoomed in far enough that the columns are wider than the samples, draw the
// samples themselves. The envelope is for when there are more of them than
// there are pixels.
const rawLine = computed(() => {
  const { t0, t1 } = view.value
  if (t1 - t0 > 2)
    return ''
  return linePath(
    fineCores.filter(([t]) => t >= t0 && t <= t1).map(([t, v]) => [x.value(t), y(clamp(v))] as Pt),
  )
})

const coarseLine = computed(() => {
  const pts: Pt[] = []
  for (const s of coarseSteps)
    pts.push([x.value(s.t0), y(s.cores)], [x.value(s.t1), y(s.cores)])
  return linePath(pts)
})
const peak = Math.max(...coarseSteps.map((s) => s.cores))
const coarseDots = coarseSteps.map((s) => s.t0).concat(coarseSteps[coarseSteps.length - 1].t1)

const bands = computed(() => throttled.filter(([a, b]) => b > view.value.t0 && a < view.value.t1))

const xTicks = computed(() => {
  const { t0, t1 } = view.value
  const span = t1 - t0
  const dp = span >= 20 ? 0 : span >= 2 ? 1 : span >= 0.2 ? 2 : 3
  return Array.from({ length: 7 }, (_, i) => t0 + (span * i) / 6).map((t) => ({ t, label: `${t.toFixed(dp)}s` }))
})
const yTicks = [0, 1, 2, 3, 4]
</script>

<template>
  <div class="wrap">
    <div class="legend">
      <span class="key" :class="{ off: !showFine }"><i class="sw" style="background: var(--sp-accent)" />1 ms sampling</span>
      <span class="key" :class="{ off: !showCoarse }"><i class="sw" style="background: var(--sp-good)" />{{ coarseSeconds }} s polling</span>
      <span class="key"><i class="sw dash" style="border-color: var(--sp-text)" />quota, {{ quota }} core</span>
      <span class="key"><i class="sw" style="background: var(--sp-warn)" />periods throttled</span>

      <span class="controls">
        <button :class="{ on: mode === 'fine' }" @pointerdown.stop @click.stop="setMode('fine')">1 ms</button>
        <button :class="{ on: mode === 'coarse' }" @pointerdown.stop @click.stop="setMode('coarse')">{{ coarseSeconds }} s</button>
        <button :class="{ on: mode === 'both' }" @pointerdown.stop @click.stop="setMode('both')">both</button>
        <button v-if="zoomed" class="reset" @pointerdown.stop @click.stop="reset">reset</button>
      </span>
    </div>

    <svg ref="svg" :viewBox="`0 0 ${W} ${H}`" class="chart" v-bind="bind">
      <defs>
        <!-- Clip rather than mask the gutters: the panel behind this chart is
             tinted, so painting over the overflow would show as two grey bars. -->
        <clipPath id="cpu-clip">
          <rect :x="M.left" :y="0" :width="W - M.right - M.left" :height="H" />
        </clipPath>
      </defs>

      <!-- The whole plot is the drag target, including its empty parts. -->
      <rect :x="M.left" :y="M.top - 18" :width="W - M.right - M.left" :height="H - M.bottom - M.top + 18" fill="transparent" />

      <g v-if="showFine" clip-path="url(#cpu-clip)">
        <rect
          v-for="[a, b] in bands" :key="a"
          :x="x(a)" :width="Math.max(x(b) - x(a), 1)"
          :y="M.top - 15" height="8"
          fill="var(--sp-warn)" fill-opacity="0.9"
        />
      </g>

      <g stroke="var(--sp-border)" stroke-width="1">
        <line v-for="v in yTicks" :key="`g${v}`" :x1="M.left" :x2="W - M.right" :y1="y(v)" :y2="y(v)" />
      </g>

      <g v-if="showFine" clip-path="url(#cpu-clip)">
        <path v-if="!rawLine" :d="fineBand" fill="var(--sp-accent)" fill-opacity="0.2" />
        <path v-if="!rawLine" :d="fineMean" fill="none" stroke="var(--sp-accent)" stroke-width="2.4" />
        <path v-else :d="rawLine" fill="none" stroke="var(--sp-accent)" stroke-width="2" />
      </g>

      <line
        :x1="M.left" :x2="W - M.right" :y1="y(quota)" :y2="y(quota)"
        stroke="var(--sp-text)" stroke-width="2" stroke-dasharray="10 7"
      />

      <g v-if="showCoarse" clip-path="url(#cpu-clip)">
        <path :d="coarseLine" fill="none" stroke="var(--sp-good)" stroke-width="4" stroke-linejoin="round" />
        <circle v-for="t in coarseDots" :key="t" :cx="x(t)" :cy="H - M.bottom" r="4.5" fill="var(--sp-good)" />
      </g>

      <line
        :x1="M.left" :x2="W - M.right" :y1="H - M.bottom" :y2="H - M.bottom"
        stroke="var(--sp-dim)" stroke-width="1.5"
      />

      <g class="tick" fill="var(--sp-muted)" text-anchor="end">
        <text v-for="v in yTicks" :key="`l${v}`" :x="M.left - 12" :y="y(v) + 6">{{ v }}</text>
      </g>
      <g class="tick" fill="var(--sp-muted)" text-anchor="middle">
        <text v-for="t in xTicks" :key="t.t" :x="x(t.t)" :y="H - M.bottom + 26">{{ t.label }}</text>
      </g>
    </svg>

    <div class="foot">
      {{ throttled.length }} periods throttled over {{ (throttled.length / 10).toFixed(0) }}s.
      The coarse poll's highest reading is {{ peak.toFixed(2) }} cores.
    </div>
  </div>
</template>

<style scoped>
.wrap { width: 100%; }
.chart { width: 100%; height: auto; cursor: grab; touch-action: none; }
.chart:active { cursor: grabbing; }
.legend { display: flex; align-items: center; gap: 1.3rem; font-size: 0.85rem; color: var(--sp-muted); margin-bottom: 0.2rem; }
.key { display: inline-flex; align-items: center; gap: 0.45rem; transition: opacity 200ms ease; }
.key.off { opacity: 0.3; }
.sw { width: 1.1rem; height: 0.32rem; border-radius: 2px; display: inline-block; }
.sw.dash { height: 0; border-top: 3px dashed; border-radius: 0; }
.controls { margin-left: auto; display: flex; gap: 0.35rem; }
.controls button {
  font: inherit;
  font-size: 0.78rem;
  padding: 0.12rem 0.6rem;
  color: var(--sp-muted);
  background: transparent;
  border: 1px solid var(--sp-border);
  border-radius: 0.35rem;
  cursor: pointer;
}
.controls button.on { color: var(--sp-bg); background: var(--sp-accent); border-color: var(--sp-accent); }
.controls .reset { color: var(--sp-warn); border-color: var(--sp-warn); }
.tick { font-size: 17px; font-variant-numeric: tabular-nums; }
.foot { font-size: 1rem; color: var(--sp-warn); font-weight: 600; margin-top: 0.2rem; }
</style>
