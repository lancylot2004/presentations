<script setup lang="ts">
// Three failure modes. The first click expands one to fill the slide with its
// own measured plot, and each click after that hands the slide straight to the
// next one. It never returns to the three-across view, and the last one stays
// open until the deck moves on.
//   0 all three    1 OOM-killed    2 Throttled    3 Wasting resources
import { useSlideContext } from '@slidev/client'
import IconOctagonX from '~icons/lucide/octagon-x'
import IconHourglass from '~icons/lucide/hourglass'
import IconTrash from '~icons/lucide/trash-2'
import MemoryChart from './MemoryChart.vue'
import ResolutionChart from './ResolutionChart.vue'
import WasteChart from './WasteChart.vue'

const { $clicks } = useSlideContext()

const modes = [
  { key: 'oom', label: 'OOM-killed', icon: IconOctagonX, chart: MemoryChart, tone: 'var(--sp-rust)' },
  { key: 'thr', label: 'Throttled', icon: IconHourglass, chart: ResolutionChart, tone: 'var(--sp-warn)' },
  { key: 'waste', label: 'Resources', icon: IconTrash, chart: WasteChart, tone: 'var(--sp-warn)' },
]

// Collapsed geometry, as percentages, so one transition covers both states.
const collapsed = (i: number) => ({ left: `${i * (100 / 3)}%`, width: `${100 / 3}%` })
const expanded = { left: '0%', width: '100%' }

const active = () => ($clicks.value ?? 0) - 1
</script>

<template>
  <div class="stage">
    <div
      v-for="(mode, i) in modes"
      :key="mode.key"
      class="panel"
      :class="{ open: active() === i, gone: active() >= 0 && active() !== i }"
      :style="active() === i ? expanded : collapsed(i)"
    >
      <div class="inner" :style="{ '--tone': mode.tone }">
        <div class="head">
          <component :is="mode.icon" class="ico" />
          <div class="label">{{ mode.label }}</div>
        </div>
        <!-- Every plot stays mounted. Unmounting one mid-collapse was what made
             the return read as a snap rather than a transition. -->
        <div class="plot">
          <component :is="mode.chart" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stage {
  position: relative;
  flex: 1;
  width: 100%;
  min-height: 24rem;
  margin-bottom: 1.6rem;
}

/* One duration and one curve for everything that moves, so nothing finishes
   early and pops while the rest of the panel is still travelling. */
.panel {
  --move: 460ms cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  top: 0;
  height: 100%;
  padding: 0 0.45rem;
  transition: left var(--move), width var(--move), opacity var(--move);
}

.panel.gone { opacity: 0; pointer-events: none; }

.inner {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.2rem 1.4rem;
  border: 1.5px solid var(--sp-border);
  border-radius: 0.7rem;
  background: var(--sp-surface);
  overflow: hidden;
  transition: border-color var(--move), background var(--move);
}

.panel.open .inner {
  border-color: var(--tone);
  background: color-mix(in srgb, var(--tone) 8%, var(--sp-surface));
}

.head { display: flex; align-items: center; gap: 0.9rem; flex: none; }
.ico { font-size: 2rem; color: var(--tone); }
.label { font-size: 1.5rem; font-weight: 700; transition: font-size var(--move); }
.panel.open .label { font-size: 1.9rem; }

/* Taken out of flow so a collapsed card is just its icon and label, and the
   plot never contributes a height that has to animate. */
.plot {
  position: absolute;
  inset: 5.2rem 1.4rem 1.1rem;
  display: flex;
  opacity: 0;
  transition: opacity 260ms ease;
}
.panel.open .plot { opacity: 1; transition: opacity 300ms ease 300ms; }

/* The chart is given the box and told to fit it. Left to its own aspect ratio
   it runs its legend under the panel heading and its footer off the bottom. */
.plot > * { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; }
.plot :deep(.chart) { flex: 0 1 auto; min-height: 0; }
</style>
