<script setup lang="ts">
// The firm in four words, spotlit a group at a time. Quantitative and
// Systematic light together because they are one idea, not two.
import { useSlideContext } from '@slidev/client'

const { $clicks } = useSlideContext()

// step = which click lights this word. Shared step = lit together.
const words = [
  { label: 'Multi-national', step: 1 },
  { label: 'Quantitative', step: 2 },
  { label: 'Systematic', step: 2 },
  { label: 'Hedge fund', step: 3 },
]
</script>

<template>
  <div class="words">
    <div
      v-for="w in words"
      :key="w.label"
      class="word"
      :class="{ on: $clicks === w.step }"
    >
      {{ w.label }}
    </div>
  </div>
</template>

<style scoped>
.words { display: flex; flex-direction: column; gap: 0.1rem; }

/* Deliberately below the slide title in weight and size: the title is the
   fixed landmark on every slide, and this is its content. */
.word {
  font-size: 2.6rem;
  font-weight: 600;
  line-height: 1.25;
  color: var(--sp-muted);
  transition: color 250ms ease, text-shadow 250ms ease;
}

.word.on {
  color: var(--sp-accent);
  text-shadow: 0 0 30px color-mix(in srgb, var(--sp-accent) 40%, transparent);
}
</style>
