<script setup lang="ts">
// Where kotlinc actually comes from. The nested Java boxes answer "what runs
// it"; without this one the slide names a compiler it never accounts for.
import { useSlideContext } from '@slidev/client'

const { $clicks } = useSlideContext()
const on = () => ($clicks.value ?? 0) >= 5

const parts = [
  ['kotlinc', 'compiles .kt to .class'],
  ['kotlin', 'runs the result'],
  ['kotlin-stdlib.jar', 'on the classpath at run time'],
]
</script>

<template>
  <div class="dist" :class="{ on: on() }">
    <div class="head">Kotlin <span class="what">a separate download</span></div>
    <div class="parts">
      <div v-for="[name, what] in parts" :key="name" class="part">
        <span class="sp-chip">{{ name }}</span>
        <span class="what-inline">{{ what }}</span>
      </div>
    </div>
    <div class="foot">kotlinc is itself a JVM program, so it needs a JDK to run.</div>
  </div>
</template>

<style scoped>
.dist {
  border: 1.5px solid color-mix(in srgb, var(--sp-rust) 50%, var(--sp-border));
  border-radius: 0.6rem;
  background: color-mix(in srgb, var(--sp-rust) 7%, var(--sp-surface));
  padding: 0.9rem;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 340ms ease, transform 340ms ease;
}
.dist.on { opacity: 1; transform: none; }

.head {
  font-family: var(--slidev-code-font-family, monospace);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--sp-text);
}
.what { margin-left: 0.6rem; font-size: 1.11rem; font-weight: 400; color: var(--sp-dim); }

.parts { margin-top: 0.7rem; display: flex; flex-direction: column; gap: 0.4rem; }
.part { display: flex; align-items: center; gap: 0.6rem; }
.part .sp-chip { font-size: 1.05rem; padding: 0.2rem 0.45rem; }
.what-inline { font-size: 1.08rem; color: var(--sp-dim); }

.foot { margin-top: 0.8rem; font-size: 1.08rem; color: var(--sp-dim); }
</style>
