<script setup lang="ts">
// The one command that produced the plot underneath it.
//
// The tool name, the image and the workload file are blocked out with literal
// block characters rather than hidden text, so the real strings are not in the
// DOM or the exported PDF for anyone to select. What is left is the whole
// point: one command, no privileges, no change to the workload.
defineProps<{ metrics: string }>()
</script>

<template>
  <div class="cmd">
    <div class="line">
      <span class="sigil">$</span> <span class="redact">█████</span> <span class="lit">run</span> <span class="cont">\</span>
    </div>
    <div class="line indent">
      <span class="flag">--image</span> <span class="redact">███████████████</span> <span class="cont">\</span>
    </div>
    <div class="line indent">
      <span class="flag">--metrics</span> <span class="lit">{{ metrics }}</span> <span class="cont">\</span>
    </div>
    <div class="line indent">
      <span class="flag">--load</span> <span class="redact">██████</span><span class="lit">.py</span>
    </div>
  </div>
</template>

<style scoped>
.cmd {
  display: inline-block;
  font-family: var(--slidev-code-font-family, 'JetBrains Mono', monospace);
  font-size: 0.95rem;
  line-height: 1.6;
  padding: 0.4rem 1.1rem;
  border-left: 3px solid var(--sp-accent);
  background: var(--sp-surface);
  border-radius: 0 0.4rem 0.4rem 0;
  white-space: nowrap;
}
.indent { padding-left: 2.5ch; }
.sigil, .cont { color: var(--sp-dim); }
.flag { color: var(--sp-accent); }
.lit { color: var(--sp-text); }
.redact { color: var(--sp-border); letter-spacing: -0.06em; }
</style>
