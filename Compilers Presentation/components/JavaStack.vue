<script setup lang="ts">
// JDK contains JRE contains JVM, drawn as exactly that. Each click wraps
// another layer around the one inside, because each one is the layer inside
// plus more, and a row of three boxes would say the opposite.
import { useSlideContext } from '@slidev/client'

const { $clicks } = useSlideContext()
const at = (n: number) => ($clicks.value ?? 0) >= n
</script>

<template>
  <div class="layer jdk" :class="{ on: at(4) }">
    <div class="head">JDK <span class="what">adds the build tools</span></div>
    <div class="tools">
      <span class="sp-chip">javac</span>
      <span class="sp-chip">jar</span>
      <span class="sp-chip">javadoc</span>
      <span class="sp-chip">jlink</span>
    </div>

    <div class="layer jre" :class="{ on: at(3) }">
      <div class="head">JRE <span class="what">adds the class library</span></div>
      <div class="tools">
        <span class="sp-chip">java.lang</span>
        <span class="sp-chip">java.util</span>
        <span class="sp-chip">java.io</span>
      </div>

      <div class="layer jvm" :class="{ on: at(2) }">
        <div class="head">JVM <span class="what">executes bytecode</span></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.layer {
  --pad: 0.9rem;
  border: 1.5px solid transparent;
  border-radius: 0.6rem;
  padding: 0;
  transition: padding 420ms cubic-bezier(0.4, 0, 0.2, 1), border-color 420ms ease, background 420ms ease;
}
.layer.on { padding: var(--pad); }

.jdk.on { border-color: color-mix(in srgb, var(--sp-accent) 55%, var(--sp-border)); background: color-mix(in srgb, var(--sp-accent) 7%, var(--sp-surface)); }
.jre.on { border-color: color-mix(in srgb, var(--sp-good) 55%, var(--sp-border)); background: color-mix(in srgb, var(--sp-good) 7%, var(--sp-surface)); }
.jvm.on { border-color: color-mix(in srgb, var(--sp-warn) 60%, var(--sp-border)); background: color-mix(in srgb, var(--sp-warn) 10%, var(--sp-surface)); }

.head {
  font-family: var(--slidev-code-font-family, monospace);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--sp-text);
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height 380ms ease, opacity 300ms ease;
}
.layer.on > .head { max-height: 2rem; opacity: 1; }
.what { margin-left: 0.6rem; font-family: inherit; font-size: 1.11rem; font-weight: 400; color: var(--sp-dim); }

.tools {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height 380ms ease, opacity 300ms ease, margin 380ms ease;
  margin: 0;
}
.layer.on > .tools { max-height: 3rem; opacity: 1; margin: 0.5rem 0 0.7rem; }
.tools .sp-chip { font-size: 1.05rem; padding: 0.2rem 0.45rem; }
</style>
