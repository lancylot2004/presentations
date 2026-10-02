<script setup lang="ts">
// Keypoint on the left, detail after it, and anything in backticks rendered
// as code. A recap is scanned rather than read, so the lead phrase has to
// carry the point on its own.
//
// Everything is on screen at once: a recap gets talked over rather than
// clicked through.
withDefaults(defineProps<{ lecture: string; points: [string, string][]; tone?: string }>(), {
  tone: 'var(--sp-accent)',
})

// Split on backticks. Odd segments are code. Built as data rather than with
// v-html, so nothing in a slide can inject markup.
const parts = (text: string) =>
  text.split('`').map((t, i) => ({ t, code: i % 2 === 1 }))
</script>

<template>
  <div class="recap" :style="{ '--tone': tone }">
    <div class="sp-kicker num">{{ lecture }}</div>

    <dl class="points">
      <template v-for="[key, text] in points" :key="key">
        <dt>{{ key }}</dt>
        <dd>
          <template v-for="(p, i) in parts(text)" :key="i">
            <code v-if="p.code">{{ p.t }}</code><span v-else>{{ p.t }}</span>
          </template>
        </dd>
      </template>
    </dl>
  </div>
</template>

<style scoped>
.recap { margin-top: 0.4rem; }
.num { color: var(--tone); }

.points {
  margin: 1.4rem 0 0;
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 1.6rem;
  row-gap: 1rem;
  align-items: baseline;
}

dt {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--tone);
  white-space: nowrap;
}
dd {
  margin: 0;
  font-size: 1.3rem;
  line-height: 1.45;
  color: var(--sp-text);
}

/* Commands and paths look like commands and paths. */
dd code {
  font-family: var(--slidev-code-font-family, monospace);
  font-size: 0.92em;
  color: var(--sp-text);
  background: var(--sp-surface-2);
  border: 1px solid var(--sp-border);
  border-radius: 0.3rem;
  padding: 0.08em 0.36em;
  white-space: nowrap;
}
</style>
