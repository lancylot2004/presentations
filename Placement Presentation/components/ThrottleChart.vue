<script setup lang="ts">
// What throttling actually looks like at 1ms. Data: data/spike.csv, measured.
// This is one second out of the burst the motivation slide shows whole: the
// workers sprint at four cores until the quota for the period is gone, then
// the kernel freezes them for the rest of it.
//
// Drag to move along the burst, wheel or pinch to zoom. The view is capped at
// two seconds, because past that the samples outnumber the pixels and the
// motivation chart is the one that draws the wide view.
import { computed } from 'vue'
import { linePath, scale, type Pt } from './chart'
import { fineCores, firstThrottleS, quota, throttled } from './spike'
import { useTimeView } from './useTimeView'

const W = 1000
const H = 262
const M = { top: 26, right: 52, bottom: 40, left: 62 }

const BURST = Math.floor(firstThrottleS)
const { view, svg, bind, reset, zoomed } = useTimeView('cpuZoom', [BURST, BURST + 10], {
  plot: { left: M.left, right: M.right, width: W },
  minSpan: 0.05,
  maxSpan: 2,
  initial: [BURST + 2, BURST + 3],
})

const yMax = 4.5
const x = computed(() => scale([view.value.t0, view.value.t1], [M.left, W - M.right]))
const y = scale([0, yMax], [H - M.bottom, M.top])

const pts = computed(() =>
  fineCores.filter(([t]) => t >= view.value.t0 && t <= view.value.t1))
const line = computed(() => linePath(pts.value.map(([t, v]) => [x.value(t), y(v)] as Pt)))
const bands = computed(() => throttled.filter(([a, b]) => b > view.value.t0 && a < view.value.t1))

const frozen = computed(() => pts.value.filter(([, v]) => v === 0).length / (pts.value.length || 1))

const yTicks = [0, 1, 2, 3, 4]
const xTicks = computed(() => {
  const { t0, t1 } = view.value
  return Array.from({ length: 5 }, (_, i) => t0 + ((t1 - t0) * i) / 4)
})
</script>

<template>
  <div class="wrap">
    <div class="legend">
      <span class="key"><i class="sw" style="background: var(--sp-accent)" />cores used (1 ms)</span>
      <span class="key"><i class="sw dash" style="border-color: var(--sp-text)" />quota, {{ quota }} core</span>
      <span class="key"><i class="sw" style="background: var(--sp-warn)" />periods throttled</span>
      <span class="controls">
        <button v-if="zoomed" class="reset" @pointerdown.stop @click.stop="reset">reset</button>
      </span>
    </div>

    <svg ref="svg" :viewBox="`0 0 ${W} ${H}`" class="chart" v-bind="bind">
      <defs>
        <clipPath id="thr-clip">
          <rect :x="M.left" :y="0" :width="W - M.right - M.left" :height="H" />
        </clipPath>
      </defs>

      <rect :x="M.left" :y="M.top - 18" :width="W - M.right - M.left" :height="H - M.bottom - M.top + 18" fill="transparent" />

      <g clip-path="url(#thr-clip)">
        <rect
          v-for="[a, b] in bands" :key="a"
          :x="x(a) + 1" :width="Math.max(x(b) - x(a) - 2, 1)"
          :y="M.top - 14" height="8" rx="2"
          fill="var(--sp-warn)" fill-opacity="0.85"
        />
      </g>

      <g stroke="var(--sp-border)" stroke-width="1">
        <line v-for="v in yTicks" :key="`g${v}`" :x1="M.left" :x2="W - M.right" :y1="y(v)" :y2="y(v)" />
      </g>

      <g clip-path="url(#thr-clip)">
        <path :d="line" fill="none" stroke="var(--sp-accent)" stroke-width="2" />
      </g>

      <line
        :x1="M.left" :x2="W - M.right" :y1="y(quota)" :y2="y(quota)"
        stroke="var(--sp-text)" stroke-width="2.5" stroke-dasharray="10 7"
      />
      <line
        :x1="M.left" :x2="W - M.right" :y1="H - M.bottom" :y2="H - M.bottom"
        stroke="var(--sp-dim)" stroke-width="1.5"
      />

      <g class="tick" fill="var(--sp-muted)" text-anchor="end">
        <text v-for="v in yTicks" :key="`l${v}`" :x="M.left - 12" :y="y(v) + 6">{{ v }}</text>
      </g>
      <g class="tick" fill="var(--sp-muted)" text-anchor="middle">
        <text v-for="v in xTicks" :key="v" :x="x(v)" :y="H - M.bottom + 26">
          {{ ((v - view.t0) * 1000).toFixed(0) }}ms
        </text>
      </g>
    </svg>

    <div class="foot">
      {{ (frozen * 100).toFixed(0) }}% of these samples read zero cores,
      across {{ throttled.length }} throttled periods in the run
    </div>
  </div>
</template>

<style scoped>
.wrap { width: 100%; }
.chart { width: 100%; height: auto; cursor: grab; touch-action: none; }
.chart:active { cursor: grabbing; }
.legend { display: flex; align-items: center; gap: 1.6rem; font-size: 0.85rem; color: var(--sp-muted); margin-bottom: 0.2rem; }
.key { display: inline-flex; align-items: center; gap: 0.45rem; }
.sw { width: 1.1rem; height: 0.32rem; border-radius: 2px; display: inline-block; }
.sw.dash { height: 0; border-top: 3px dashed; border-radius: 0; }
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
.foot { font-size: 1rem; color: var(--sp-warn); font-weight: 600; margin-top: 0.2rem; }
</style>
