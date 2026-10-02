<script setup lang="ts">
// Icons are imported as components rather than used as UnoCSS `i-lucide-*`
// classes: components are real inline SVG in the module graph, so they are
// always present when the PDF export captures the page.
import IconBox from '~icons/lucide/box'
import IconGauge from '~icons/lucide/gauge'
import IconCpu from '~icons/lucide/cpu'
import IconScanLine from '~icons/lucide/scan-line'
import IconLayers from '~icons/lucide/layers'
import IconSiren from '~icons/lucide/siren'
import IconContainer from '~icons/lucide/container'
import IconGitBranch from '~icons/lucide/git-branch'
import IconMicrochip from '~icons/lucide/microchip'
import IconSearch from '~icons/lucide/search'
import IconTerminal from '~icons/lucide/terminal'
import IconSquareTerminal from '~icons/lucide/square-terminal'
import IconChartLine from '~icons/lucide/chart-line'
import IconServer from '~icons/lucide/server'
import IconPlay from '~icons/lucide/circle-play'
import IconScrollText from '~icons/lucide/scroll-text'
import IconEraser from '~icons/lucide/eraser'
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

const { $clicks } = useSlideContext()

// The band is sized for the metrics row alone until orchestration slots into
// it. v-click would reserve the space from the start, so the open state is
// driven off the click count instead and the height is animated.
const orchOpen = computed(() => ($clicks.value ?? 0) >= 3)

type Node = { label: string; icon: unknown; accent?: string }

// The metrics half of the library, left to right. It is the bottom row of the
// band so that each card sits directly above the source it reads. The two GPU
// components are adjacent so they can both fan into NVML.
const metrics: Node[] = [
  { label: 'Lifecycle events', icon: IconBox },
  { label: 'cgroup metrics', icon: IconGauge },
  { label: 'GPU metrics', icon: IconCpu },
  { label: 'GPU per-process', icon: IconScanLine },
  { label: 'Python stack sampling', icon: IconLayers },
  { label: 'GPU OOM detector', icon: IconSiren, accent: 'rust' },
]

// The other half of the same library. These do not read a source and report a
// number; they drive the runtime. Kept in the same band because they ship
// together, and visually apart because the relation runs the opposite way.
const orchestration: Node[] = [
  { label: 'Create and start', icon: IconPlay },
  { label: 'Log redirection', icon: IconScrollText },
  { label: 'Stop and remove', icon: IconEraser },
]

// Each source spans the columns of the component(s) that read it.
const sources: (Node & { span: string })[] = [
  { label: 'Container runtime', icon: IconContainer, span: '1 / 3' },
  { label: 'Linux cgroups', icon: IconGitBranch, span: '3 / 5' },
  { label: 'NVIDIA driver / NVML', icon: IconMicrochip, span: '5 / 9' },
  { label: 'py-spy', icon: IconSearch, span: '9 / 11' },
  { label: 'User process (CUDA)', icon: IconTerminal, span: '11 / 13' },
]

const consumers: Node[] = [
  { label: 'CLI', icon: IconSquareTerminal },
  { label: 'Visualisations', icon: IconChartLine },
  { label: 'User code / ICF platforms', icon: IconServer },
]

// Metrics centres and the source centre each one drops into, in the 12-column
// coordinate system shared by the grid and the SVG edge strips.
const edges = [
  [1, 1], [3, 3], [5, 6], [7, 6], [9, 9], [11, 11],
]
// One stem per consumer, straight down into the band, tied together by a rail
// at mid height: three consumers, one library between them.
const consumerStems = [2, 6, 10]
</script>

<template>
  <div class="arch">
    <!-- Consumers -->
    <div v-click="4" class="band">
      <div class="band-label">Consumers</div>
      <div class="grid12">
        <div v-for="c in consumers" :key="c.label" class="card card-consumer" style="grid-column: span 4">
          <component :is="c.icon" class="ico" />
          <div class="label">{{ c.label }}</div>
        </div>
      </div>
    </div>

    <!-- Consumers compose the library: a shared rail feeding the whole band -->
    <svg v-click="4" class="edges" viewBox="0 0 12 1" preserveAspectRatio="none">
      <g stroke="var(--sp-accent)" stroke-width="1.5" fill="none">
        <line v-for="x in consumerStems" :key="`s${x}`" :x1="x" y1="0" :x2="x" y2="1" vector-effect="non-scaling-stroke" />
        <line x1="2" y1="0.5" x2="10" y2="0.5" vector-effect="non-scaling-stroke" />
      </g>
    </svg>

    <!-- Library: orchestration on top, metrics below so its cards sit directly
         above the sources they read. -->
    <div v-click="1" class="band band-library">
      <div class="orch-wrap" :class="{ open: orchOpen }">
        <div class="sub">
          <div class="sub-label sub-label-orch">Orchestration</div>
          <div class="grid12 sub-grid">
            <div v-for="o in orchestration" :key="o.label" class="card card-orch" style="grid-column: span 4">
              <component :is="o.icon" class="ico" />
              <div class="label">{{ o.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="sub">
        <div class="sub-label">Metrics</div>
        <div class="grid12">
          <div
            v-for="m in metrics"
            :key="m.label"
            class="card"
            :class="m.accent === 'rust' ? 'card-rust' : 'card-lib'"
            style="grid-column: span 2"
          >
            <component :is="m.icon" class="ico" />
            <div class="label">{{ m.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Each metrics component reads exactly one source -->
    <svg v-click="2" class="edges" viewBox="0 0 12 1" preserveAspectRatio="none">
      <g stroke="var(--sp-dim)" stroke-width="1.5" fill="none">
        <line v-for="([a, b]) in edges" :key="`e${a}`" :x1="a" y1="0" :x2="b" y2="1" vector-effect="non-scaling-stroke" />
      </g>
    </svg>

    <!-- Sources. Label sits below the cards so the edges above can reach them. -->
    <div v-click="2" class="band">
      <div class="grid12">
        <div v-for="s in sources" :key="s.label" class="card card-source" :style="{ gridColumn: s.span }">
          <component :is="s.icon" class="ico" />
          <div class="label">{{ s.label }}</div>
        </div>
      </div>
      <div class="band-label">Sources</div>
    </div>
  </div>
</template>

<style scoped>
.arch {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.band { display: flex; flex-direction: column; gap: 0.35rem; }

.band-library {
  border: 1px solid var(--sp-border);
  border-radius: 0.6rem;
  background: color-mix(in srgb, var(--sp-accent) 4%, transparent);
  padding: 0.5rem;
}

.band-label {
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--sp-dim);
}

/* Collapsed to nothing until orchestration arrives, then opened on a height
   transition so the band grows into it rather than jumping. 0fr to 1fr is the
   one way to animate a height that is not known in advance. */
.orch-wrap {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  margin-bottom: 0;
  transition: grid-template-rows 420ms cubic-bezier(0.4, 0, 0.2, 1),
              margin-bottom 420ms cubic-bezier(0.4, 0, 0.2, 1),
              opacity 260ms ease;
}
.orch-wrap > * { overflow: hidden; min-height: 0; }
.orch-wrap.open { grid-template-rows: 1fr; opacity: 1; margin-bottom: 0.4rem; }

.sub { display: flex; flex-direction: column; gap: 0.28rem; }
.sub-label {
  font-size: 0.66rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--sp-dim);
}
.sub-label-orch { color: var(--sp-warn); }

.grid12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 0.5rem;
}

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  min-height: 3.5rem;
  padding: 0.45rem 0.4rem;
  border: 1px solid var(--sp-border);
  border-radius: 0.5rem;
  background: var(--sp-surface);
  text-align: center;
}

/* The orchestration strip: same cards, laid out along the row rather than down
   it, so a second row costs about half the height of the first. */
.sub-grid .card {
  flex-direction: row;
  justify-content: flex-start;
  gap: 0.6rem;
  min-height: 0;
  padding: 0.4rem 0.8rem;
  text-align: left;
}

.card-consumer { border-color: var(--sp-accent); color: var(--sp-text); }
.card-lib { border-color: color-mix(in srgb, var(--sp-accent) 45%, var(--sp-border)); }
.card-rust {
  border-color: var(--sp-rust);
  background: color-mix(in srgb, var(--sp-rust) 12%, var(--sp-surface));
}
.card-orch {
  border-color: color-mix(in srgb, var(--sp-warn) 50%, var(--sp-border));
  background: color-mix(in srgb, var(--sp-warn) 6%, var(--sp-surface));
}
.card-source { background: var(--sp-surface-2); color: var(--sp-muted); }

.ico { font-size: 1.45rem; }
.card-consumer .ico { color: var(--sp-accent); }
.card-rust .ico { color: var(--sp-rust); }
.card-orch .ico { color: var(--sp-warn); font-size: 1.2rem; }
.card-source .ico { color: var(--sp-dim); }

.label { font-size: 0.9rem; font-weight: 600; line-height: 1.15; }

.edges { width: 100%; height: 1.1rem; flex: none; }
</style>
