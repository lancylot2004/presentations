<script setup lang="ts">
// Three jobs that all get called "a manager", and they are not the same job.
// Each chip carries the language it belongs to, so the room can see that one
// language has several, and that the third row is almost entirely Python.
//   1 versions   2 libraries   3 both at once   4 the count
import { useSlideContext } from '@slidev/client'
import IconPython from '~icons/simple-icons/python'
import IconNode from '~icons/simple-icons/nodedotjs'
import IconRust from '~icons/simple-icons/rust'
import IconHaskell from '~icons/simple-icons/haskell'
import IconJava from '~icons/simple-icons/openjdk'

const { $clicks } = useSlideContext()
const at = (n: number) => ($clicks.value ?? 0) >= n

const PY = IconPython
const bands = [
  {
    at: 1,
    kind: 'Version manager',
    title: 'which version of the language',
    tone: 'var(--sp-warn)',
    tools: [
      { n: 'pyenv', i: PY },
      { n: 'nvm', i: IconNode },
      { n: 'rustup', i: IconRust },
      { n: 'ghcup', i: IconHaskell },
      { n: 'sdkman', i: IconJava },
    ],
  },
  {
    at: 2,
    kind: 'Package manager',
    title: 'which libraries, and which versions of those',
    tone: 'var(--sp-good)',
    tools: [
      { n: 'pip', i: PY },
      { n: 'npm', i: IconNode },
      { n: 'cargo', i: IconRust },
      { n: 'cabal', i: IconHaskell },
      { n: 'gradle', i: IconJava },
    ],
  },
  {
    at: 3,
    kind: 'Project manager',
    title: 'all of the above, in one place',
    tone: 'var(--sp-accent)',
    tools: [
      { n: 'conda', i: PY },
      { n: 'miniconda', i: PY },
      { n: 'uv', i: PY },
      { n: 'poetry', i: PY },
    ],
  },
]
</script>

<template>
  <div class="bands">
    <div
      v-for="b in bands"
      :key="b.title"
      class="band"
      :class="{ on: at(b.at) }"
      :style="{ '--tone': b.tone }"
    >
      <div class="sp-kicker title"><span class="kind">{{ b.kind }}</span>{{ b.title }}</div>
      <div class="tools">
        <span v-for="t in b.tools" :key="t.n" class="sp-chip tool" :title="t.note">
          <component :is="t.i" class="ico" />{{ t.n }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bands { display: flex; flex-direction: column; gap: 1.5rem; margin-top: 0.5rem; }

.band {
  border-left: 3px solid var(--tone);
  padding-left: 1rem;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 340ms ease, transform 340ms ease;
}
.band.on { opacity: 1; transform: none; }

.title { color: var(--sp-dim); }
.kind { color: var(--tone); font-weight: 700; margin-right: 0.6rem; }
.tools { margin-top: 0.6rem; display: flex; flex-wrap: wrap; gap: 0.5rem; }
.tool { font-size: 1rem; padding: 0.35rem 0.7rem; color: var(--sp-text); }
.tool .ico { color: var(--tone); }

.close {
  margin-top: 1.6rem;
  font-size: 1rem;
  color: var(--sp-dim);
  opacity: 0;
  transition: opacity 320ms ease;
}
.close.on { opacity: 1; }
</style>
