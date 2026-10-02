<script setup lang="ts">
// Where I sat, as one sequence rather than three slides of boxes:
//   click 1  Technology lights up out of the firm's two halves
//   click 2  Technology opens into its teams
//   click 3  ICF opens into my team
// Names only, what each one does gets spoken.
import { useSlideContext } from '@slidev/client'

const { $clicks } = useSlideContext()

// Column spans in the 12-column grid the SVG strips share.
const teams = [
  { label: 'Platform', span: '1 / 4' },
  { label: 'Internal Compute Frameworks', span: '4 / 7', mine: true },
  { label: 'Data Infrastructure', span: '7 / 10' },
  { label: '', span: '10 / 13', faint: true },
]
const teamCentres = [1.5, 4.5, 7.5, 10.5]
</script>

<template>
  <div class="org">
    <div class="tier1">
      <div class="box small" :class="{ dim: $clicks >= 1 }">Corporate</div>
      <div class="box" :class="{ dim: $clicks >= 1 }">Investment</div>
      <div class="box" :class="{ on: $clicks >= 1 }">Technology</div>
    </div>

    <svg v-click="2" class="strip" viewBox="0 0 12 1" preserveAspectRatio="none">
      <g stroke="var(--sp-accent)" stroke-width="1.5" fill="none">
        <line x1="9.64" y1="0" x2="9.64" y2="0.45" vector-effect="non-scaling-stroke" />
        <line x1="1.5" y1="0.45" x2="10.5" y2="0.45" vector-effect="non-scaling-stroke" />
        <line
          v-for="c in teamCentres" :key="c"
          :x1="c" y1="0.45" :x2="c" y2="1" vector-effect="non-scaling-stroke"
        />
      </g>
    </svg>

    <div v-click="2" class="grid12">
      <div
        v-for="t in teams" :key="t.label"
        class="box team"
        :class="{ on: t.mine, faint: t.faint }"
        :style="{ gridColumn: t.span }"
      >
        {{ t.label }}
      </div>
    </div>

    <svg v-click="3" class="strip" viewBox="0 0 12 1" preserveAspectRatio="none">
      <g stroke="var(--sp-accent)" stroke-width="1.5" fill="none">
        <line x1="4.5" y1="0" x2="4.5" y2="0.45" vector-effect="non-scaling-stroke" />
        <line x1="1.5" y1="0.45" x2="10.5" y2="0.45" vector-effect="non-scaling-stroke" />
        <line
          v-for="c in teamCentres" :key="`s${c}`"
          :x1="c" y1="0.45" :x2="c" y2="1" vector-effect="non-scaling-stroke"
        />
      </g>
    </svg>

    <div v-click="3" class="grid12">
      <div class="box team faint" style="grid-column: 1 / 4" />
      <div class="box team on" style="grid-column: 4 / 7">Services Core</div>
      <div class="box team faint" style="grid-column: 7 / 10" />
      <div class="box team faint" style="grid-column: 10 / 13" />
    </div>
  </div>
</template>

<style scoped>
.org { display: flex; flex-direction: column; width: 100%; }

.grid12 { display: grid; grid-template-columns: repeat(12, 1fr); gap: 0.6rem; }

/* Corporate Services is deliberately the small one: 1 : 2 : 2. */
.tier1 { display: grid; grid-template-columns: 1fr 2fr 2fr; gap: 0.6rem; }

.box {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 4.4rem;
  padding: 0.8rem 0.6rem;
  border: 1.5px solid var(--sp-border);
  border-radius: 0.7rem;
  background: var(--sp-surface);
  font-size: 1.35rem;
  font-weight: 600;
  text-align: center;
  transition: all 350ms ease;
}

.box.team { font-size: 1.05rem; min-height: 3.6rem; }
.box.small { font-size: 1.05rem; }

.box.on {
  border-color: var(--sp-accent);
  background: color-mix(in srgb, var(--sp-accent) 12%, var(--sp-surface));
  box-shadow: 0 0 0 1px var(--sp-accent), 0 0 28px -4px var(--sp-accent);
}

.box.dim { border-color: var(--sp-border); color: var(--sp-dim); background: transparent; }
.box.faint { color: var(--sp-dim); border-style: dashed; }

.strip { width: 100%; height: 2.4rem; flex: none; }
</style>
