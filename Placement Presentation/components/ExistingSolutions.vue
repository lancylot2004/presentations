<script setup lang="ts">
// Three tools anyone who has done this work would reach for, then the six
// requirements that ruled all three out, then the two of those six that pull
// against each other.
//
// The pictures are drawn rather than fetched: a logo says nothing to a room
// that has not met these tools, and each of these shows what the tool does.
// Click state is read straight off the slide rather than through v-click, so
// the order of the reveals cannot depend on where the directives happen to
// register.
import { useSlideContext } from '@slidev/client'
import IconLock from '~icons/lucide/lock'
import IconEyeOff from '~icons/lucide/eye-off'
import IconUser from '~icons/lucide/user'
import IconTimer from '~icons/lucide/timer'
import IconBoxes from '~icons/lucide/boxes'
import IconLightbulb from '~icons/lucide/lightbulb'

const { $clicks } = useSlideContext()
const at = (n: number) => ($clicks.value ?? 0) >= n

// The two that fight: every step towards resolution narrows what it runs on.
const requirements = [
  { label: 'User-level permissions', icon: IconLock },
  { label: 'No code access', icon: IconEyeOff },
  { label: 'One user, locally', icon: IconUser },
  { label: 'Millisecond resolution', icon: IconTimer, pull: true },
  { label: 'Any machine', icon: IconBoxes, pull: true },
  { label: 'An insight', icon: IconLightbulb },
]
</script>

<template>
  <div class="sol-row" :class="{ out: at(1) }">
    <div class="sol">
      <svg class="sol-art" viewBox="0 0 120 64">
        <rect x="2" y="2" width="116" height="22" rx="3" fill="none" stroke="var(--sp-border)" stroke-width="1.5" stroke-dasharray="4 3" />
        <circle cx="24" cy="13" r="3.5" fill="var(--sp-muted)" />
        <circle cx="60" cy="13" r="3.5" fill="var(--sp-muted)" />
        <circle cx="96" cy="13" r="3.5" fill="var(--sp-muted)" />
        <path d="M24 17v18M60 17v18M96 17v18" stroke="var(--sp-accent)" stroke-width="1.5" stroke-dasharray="3 3" />
        <rect x="2" y="36" width="116" height="26" rx="3" fill="var(--sp-surface-2)" stroke="var(--sp-border)" stroke-width="1.5" />
        <rect x="44" y="41" width="32" height="16" rx="3" fill="var(--sp-accent)" fill-opacity="0.3" stroke="var(--sp-accent)" stroke-width="1.5" />
        <path d="M38 45h6M38 53h6M76 45h6M76 53h6" stroke="var(--sp-accent)" stroke-width="1.5" />
      </svg>
      <div class="sol-name">eBPF</div>
      <div class="sol-what">Sandboxed code, inside the kernel</div>
    </div>

    <div class="sol">
      <svg class="sol-art" viewBox="0 0 120 64">
        <g fill-opacity="0.85">
          <rect x="2" y="52" width="116" height="9" rx="1.5" fill="var(--sp-rust)" />
          <rect x="2" y="41" width="70" height="9" rx="1.5" fill="var(--sp-warn)" />
          <rect x="75" y="41" width="43" height="9" rx="1.5" fill="var(--sp-warn)" />
          <rect x="6" y="30" width="40" height="9" rx="1.5" fill="var(--sp-rust)" />
          <rect x="49" y="30" width="20" height="9" rx="1.5" fill="var(--sp-rust)" />
          <rect x="79" y="30" width="30" height="9" rx="1.5" fill="var(--sp-rust)" />
          <rect x="10" y="19" width="22" height="9" rx="1.5" fill="var(--sp-warn)" />
          <rect x="83" y="19" width="14" height="9" rx="1.5" fill="var(--sp-warn)" />
          <rect x="13" y="8" width="11" height="9" rx="1.5" fill="var(--sp-rust)" />
        </g>
      </svg>
      <div class="sol-name">perf</div>
      <div class="sol-what">CPU hardware counters</div>
    </div>

    <div class="sol">
      <svg class="sol-art" viewBox="0 0 120 64">
        <path d="M2 11h116M2 7v8M31 8v6M60 7v8M89 8v6M117 7v8" stroke="var(--sp-border)" stroke-width="1.2" />
        <g fill-opacity="0.85">
          <rect x="2" y="19" width="46" height="9" rx="2" fill="var(--sp-good)" />
          <rect x="54" y="19" width="28" height="9" rx="2" fill="var(--sp-good)" />
          <rect x="12" y="32" width="70" height="9" rx="2" fill="var(--sp-accent)" />
          <rect x="88" y="32" width="24" height="9" rx="2" fill="var(--sp-accent)" />
          <rect x="6" y="45" width="18" height="9" rx="2" fill="var(--sp-warn)" />
          <rect x="30" y="45" width="52" height="9" rx="2" fill="var(--sp-warn)" />
          <rect x="90" y="45" width="14" height="9" rx="2" fill="var(--sp-warn)" />
        </g>
      </svg>
      <div class="sol-name">Nsight</div>
      <div class="sol-what">The NVIDIA driver's GPU timeline</div>
    </div>
  </div>

  <div class="reqs sp-cards rise" :class="{ on: at(1) }">
    <div
      v-for="r in requirements" :key="r.label"
      class="sp-card" :class="{ pull: r.pull && at(2) }"
    >
      <component :is="r.icon" class="ico" />
      <div class="sp-card-title">{{ r.label }}</div>
    </div>
  </div>

  <div class="pull-note rise" :class="{ on: at(2) }">Resolution and reach pull against each other.</div>
</template>

<style scoped>
.sol-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.2rem;
  transition: opacity 400ms ease, filter 400ms ease;
}
.sol-row.out { opacity: 0.45; filter: grayscale(1); }
.sol {
  border: 1px solid var(--sp-border);
  border-radius: 0.6rem;
  background: var(--sp-surface);
  padding: 0.7rem 0.9rem;
}
.sol-art { width: 100%; height: 3.9rem; display: block; }
.sol-name { margin-top: 0.4rem; font-size: 1.5rem; font-weight: 800; line-height: 1.5; }
.sol-row.out .sol-name {
  color: var(--sp-muted);
  text-decoration: line-through;
  text-decoration-thickness: 3px;
  text-decoration-color: var(--sp-warn);
}
.sol-what { font-size: 0.92rem; color: var(--sp-muted); line-height: 1.3; }

.rise { opacity: 0; transform: translateY(8px); transition: opacity 320ms ease, transform 320ms ease; }
.rise.on { opacity: 1; transform: none; }

.reqs { grid-template-columns: repeat(3, 1fr); gap: 0.7rem; margin-top: 1rem; }
.reqs .sp-card { padding: 0.6rem 0.9rem; transition: border-color 300ms ease; }
.reqs .ico { font-size: 1.4rem; color: var(--sp-accent); margin-bottom: 0.35rem; display: block; }
.reqs .sp-card-title { font-size: 1.05rem; }
.reqs .pull { border-color: var(--sp-warn); }
.pull-note { margin-top: 0.6rem; font-size: 1.15rem; font-weight: 600; color: var(--sp-warn); }
</style>
