<script setup lang="ts">
// asdf does the first row of the previous slide, for every language at once.
// The last click is the honest caveat: it is not a package manager, so it
// replaces five tools and none of the other five.
import { useSlideContext } from '@slidev/client'

const { $clicks } = useSlideContext()
const at = (n: number) => ($clicks.value ?? 0) >= n

const plugins = ['haskell', 'java', 'kotlin', 'nodejs', 'python', 'rust', 'and ~800 more']

// Straight out of this repository, which is the point: it is checked in.
const pinned = [
  ['haskell', '9.14.1', ''],
  ['java', 'temurin-27.0.0+35', ''],
  ['nodejs', '26.10.0', ''],
  ['python', '3.14.8t', ''],
  ['rust', '1.99.0', ''],
]
</script>

<template>
  <div class="cmp">
    <div class="side rise" :class="{ on: at(1) }">
      <div class="sp-kicker accent">One tool, every language</div>
      <div class="sp-card accent-card mt-2">
        <div class="name">asdf</div>
        <div class="chips">
          <span v-for="p in plugins" :key="p" class="sp-chip">{{ p }}</span>
        </div>
        <div class="cmds">
          <div><span class="sigil">$</span> asdf plugin add haskell</div>
          <div><span class="sigil">$</span> asdf install</div>
        </div>
      </div>
    </div>

    <div class="side rise" :class="{ on: at(2) }">
      <div class="sp-kicker">.tool-versions</div>
      <div class="sp-card mt-2">
        <div v-for="[tool, ver, note] in pinned" :key="tool" class="pin">
          <span class="pin-tool">{{ tool }}</span><span class="pin-ver">{{ ver }}</span>
          <span v-if="note" class="pin-note">{{ note }}</span>
        </div>
        <div class="foot">Committed with the code, so everyone gets the same ones.</div>
      </div>
    </div>
  </div>

  <div class="close rise" :class="{ on: at(3) }">
    It handles versions only. Your libraries are still pip, cargo, npm, ...
  </div>
</template>

<style scoped>
.rise { opacity: 0; transform: translateY(8px); transition: opacity 320ms ease, transform 320ms ease; }
.rise.on { opacity: 1; transform: none; }

.cmp { display: grid; grid-template-columns: 1.1fr 1fr; gap: 1.6rem; align-items: start; }
.sp-kicker.accent { color: var(--sp-accent); }
.accent-card { border-color: color-mix(in srgb, var(--sp-accent) 50%, var(--sp-border)); }

.name { font-family: var(--slidev-code-font-family, monospace); font-size: 1.5rem; font-weight: 700; color: var(--sp-accent); }
.chips { margin-top: 0.7rem; display: flex; flex-wrap: wrap; gap: 0.35rem; }
.chips .sp-chip { font-size: 1.11rem; }
.cmds {
  margin-top: 0.9rem;
  font-family: var(--slidev-code-font-family, monospace);
  font-size: 1.24rem;
  line-height: 1.85;
  color: var(--sp-text);
}
.sigil { color: var(--sp-dim); margin-right: 0.5rem; }

.pin { display: flex; font-family: var(--slidev-code-font-family, monospace); font-size: 1.22rem; line-height: 1.75; }
.pin-tool { min-width: 5rem; color: var(--sp-accent); }
.pin-ver { color: var(--sp-muted); }
.pin-note { margin-left: 0.9rem; font-family: var(--slidev-sans-font, inherit); font-size: 1.05rem; color: var(--sp-dim); }
.foot { margin-top: 0.7rem; font-size: 1.15rem; color: var(--sp-dim); }

.close { margin-top: 1.4rem; font-size: 1rem; color: var(--sp-dim); }
</style>
