<script setup lang="ts">
// What the year actually taught, in the reflection's own two halves: the
// engineering, and the part that is harder to put on a CV. Three reveals.
import { useSlideContext } from '@slidev/client'
import IconFileCode from '~icons/lucide/file-code'
import IconCog from '~icons/lucide/cog'
import IconRepeat from '~icons/lucide/repeat'
import IconContainer from '~icons/lucide/container'
import IconActivity from '~icons/lucide/activity'
import IconUsers from '~icons/lucide/users'
import IconHeartHandshake from '~icons/lucide/heart-handshake'
import IconMessageCircleQuestion from '~icons/lucide/message-circle-question'
import IconRefreshCw from '~icons/lucide/refresh-cw'
import IconScale from '~icons/lucide/scale'
import IconSparkles from '~icons/lucide/sparkles'

const { $clicks } = useSlideContext()
const at = (n: number) => ($clicks.value ?? 0) >= n

const engineering = [
  { label: 'Python', icon: IconFileCode },
  { label: 'Rust', icon: IconCog, accent: true },
  { label: 'Async runtimes', icon: IconRepeat },
  { label: 'Containers', icon: IconContainer },
  { label: 'Profiling', icon: IconActivity },
]

// Straight out of the reflection: collaboration, building for real users, and
// the three things colleagues pushed on.
const soft = [
  { label: 'Collaboration', icon: IconUsers },
  { label: 'Building for real users', icon: IconHeartHandshake },
  { label: 'Asking questions', icon: IconMessageCircleQuestion },
  { label: 'Rethinking decisions', icon: IconRefreshCw },
  { label: 'Value against effort', icon: IconScale },
]
</script>

<template>
  <div class="row rise" :class="{ on: at(1) }">
    <div class="row-label">Engineering</div>
    <div class="cards">
      <div v-for="c in engineering" :key="c.label" class="sp-card" :class="{ rust: c.accent }">
        <component :is="c.icon" class="ico" />
        <div class="sp-card-title">{{ c.label }}</div>
      </div>
    </div>
  </div>

  <div class="row rise mt-5" :class="{ on: at(2) }">
    <div class="row-label soft">Everything else</div>
    <div class="cards">
      <div v-for="c in soft" :key="c.label" class="sp-card soft-card">
        <component :is="c.icon" class="ico" />
        <div class="sp-card-title">{{ c.label }}</div>
      </div>
    </div>
  </div>

  <div class="aside rise" :class="{ on: at(3) }">
    <IconSparkles class="spark" />
    <span>Try <code>jj</code> :)</span>
  </div>
</template>

<style scoped>
.rise { opacity: 0; transform: translateY(8px); transition: opacity 320ms ease, transform 320ms ease; }
.rise.on { opacity: 1; transform: none; }

.row { display: flex; flex-direction: column; gap: 0.4rem; }
.row-label {
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--sp-dim);
}
.row-label.soft { color: var(--sp-good); }

.cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.8rem; }
.cards .ico { font-size: 1.5rem; color: var(--sp-accent); margin-bottom: 0.4rem; display: block; }
.cards .sp-card { padding: 0.8rem 0.9rem; }
.cards .sp-card-title { font-size: 1.05rem; }

.rust { border-color: var(--sp-rust); }
.rust .ico { color: var(--sp-rust); }
.soft-card { border-color: color-mix(in srgb, var(--sp-good) 40%, var(--sp-border)); }
.soft-card .ico { color: var(--sp-good); }

.aside {
  margin-top: 1.6rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.05rem;
  color: var(--sp-muted);
}
.spark { font-size: 1.2rem; color: var(--sp-warn); flex: none; }
.aside code { color: var(--sp-accent); font-weight: 700; }
</style>
