<script setup lang="ts">
// One rail per path: source on the left, something running on the right, a
// stop for every artefact that actually exists along the way and the tool
// that produced it on the segment leading into it.
//
// This is the only diagram in the deck. Boxes and arrows said the same thing
// with more furniture, and two idioms for one idea made the slides look
// unrelated to each other.
import { useSlideContext } from '@slidev/client'
import IconRust from '~icons/simple-icons/rust'
import IconC from '~icons/simple-icons/c'
import IconTs from '~icons/simple-icons/typescript'
import IconGo from '~icons/simple-icons/go'
import IconHaskell from '~icons/simple-icons/haskell'
import IconPython from '~icons/simple-icons/python'
import IconKotlin from '~icons/simple-icons/kotlin'

// Named rather than passed, because a slide written in markdown cannot
// import a component.
const ICONS: Record<string, unknown> = {
  rust: IconRust,
  c: IconC,
  typescript: IconTs,
  go: IconGo,
  haskell: IconHaskell,
  python: IconPython,
  kotlin: IconKotlin,
}

interface Stop { t: string; sub?: string; via?: string }
interface Track { name?: string; icon?: string; tone?: string; at: number; stops: Stop[]; note?: string }

const props = withDefaults(
  defineProps<{ tracks: Track[]; label?: string; labelAt?: number }>(),
  { label: '', labelAt: 1 },
)

const { $clicks } = useSlideContext()
const at = (n: number) => ($clicks.value ?? 0) >= n
// The name column only exists if something is in it.
const named = () => props.tracks.some((t) => t.name)
</script>

<template>
  <div class="rails">
    <div v-if="label" class="sp-kicker head" :class="{ on: at(labelAt) }">{{ label }}</div>

    <div
      v-for="(t, ti) in tracks"
      :key="ti"
      class="track"
      :class="{ on: at(t.at), named: named() }"
      :style="{ '--tone': t.tone ?? 'var(--sp-accent)' }"
    >
      <div v-if="named()" class="who">
        <component :is="ICONS[t.icon ?? '']" v-if="t.icon" class="ico" />
        <span class="name">{{ t.name }}</span>
      </div>

      <div class="rail">
        <template v-for="(s, i) in t.stops" :key="i">
          <div v-if="i" class="seg">
            <div class="via">{{ s.via }}</div>
            <div class="line" />
          </div>
          <div class="stop">
            <div class="dot" />
            <div class="stop-label">{{ s.t }}</div>
            <div v-if="s.sub" class="stop-sub">{{ s.sub }}</div>
          </div>
        </template>
      </div>

      <div v-if="t.note" class="note">{{ t.note }}</div>
    </div>
  </div>
</template>

<style scoped>
.rails { display: flex; flex-direction: column; gap: 1.15rem; }
.head { opacity: 0; transition: opacity 320ms ease; }
.head.on { opacity: 1; }

.track {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas: 'rail' 'note';
  align-items: center;
  column-gap: 1rem;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 340ms ease, transform 340ms ease;
}
.track.named { grid-template-columns: auto 1fr; grid-template-areas: 'who rail' 'who note'; }
.track.on { opacity: 1; transform: none; }

.who { grid-area: who; align-self: start; display: flex; align-items: center; gap: 0.5rem; min-width: 6rem; }
.who .ico { font-size: 1.25rem; color: var(--tone); margin: 0; flex: none; }
.name { font-size: 1rem; font-weight: 700; white-space: nowrap; }

.rail { grid-area: rail; display: flex; align-items: flex-start; }

.stop { display: flex; flex-direction: column; align-items: center; flex: none; }
.dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  border: 2px solid var(--tone);
  background: color-mix(in srgb, var(--tone) 28%, var(--sp-surface));
}
.stop-label {
  margin-top: 0.3rem;
  font-family: var(--slidev-code-font-family, monospace);
  font-size: 1.11rem;
  color: var(--sp-text);
  white-space: nowrap;
}
.stop-sub { margin-top: 0.1rem; font-size: 0.97rem; color: var(--sp-dim); white-space: nowrap; }

.seg { flex: 1; min-width: 3rem; display: flex; flex-direction: column; align-items: center; margin-top: -1.05rem; }
.via {
  font-family: var(--slidev-code-font-family, monospace);
  font-size: 1.01rem;
  color: var(--sp-accent);
  white-space: nowrap;
  margin-bottom: 0.18rem;
}
.line { width: calc(100% - 0.6rem); height: 1.5px; background: var(--sp-dim); }

.note { grid-area: note; margin-top: 0.55rem; font-size: 1.11rem; color: var(--sp-dim); }
</style>
