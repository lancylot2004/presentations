<script setup lang="ts">
// Four habits, one per click, and all four are the same habit: do the thing
// more often than feels necessary. Each is something the deck has already
// shown them rather than advice arriving from nowhere, and the subtitles
// keep the clipped style the VCS cards use.
import { useSlideContext } from '@slidev/client'
import IconCommit from '~icons/lucide/git-commit-horizontal'
import IconBranch from '~icons/lucide/git-branch'
import IconSync from '~icons/lucide/refresh-cw'
import IconMerge from '~icons/lucide/git-merge'

const { $clicks } = useSlideContext()
const at = (n: number) => ($clicks.value ?? 0) >= n

const cards = [
  { icon: IconCommit, title: 'Commit often', sub: 'Small; focused; easy to undo.' },
  { icon: IconBranch, title: 'Branch often', sub: 'Cheap; disposable; main stays working.' },
  { icon: IconSync, title: 'Sync often', sub: 'Pull early; push before you stop.' },
  { icon: IconMerge, title: 'Merge often', sub: 'Small merges; small conflicts.' },
]
</script>

<template>
  <div class="sp-cards practice">
    <div v-for="(c, i) in cards" :key="c.title" class="sp-card rise" :class="{ on: at(i + 1) }">
      <component :is="c.icon" class="ico" />
      <div class="sp-card-title">{{ c.title }}</div>
      <div class="sp-card-sub">{{ c.sub }}</div>
    </div>
  </div>
</template>

<style scoped>
.rise { opacity: 0; transform: translateY(8px); transition: opacity 320ms ease, transform 320ms ease; }
.rise.on { opacity: 1; transform: none; }

/* Stretch, so five cards of uneven text still read as one row. */
.practice { grid-template-columns: repeat(4, 1fr); align-items: stretch; margin-top: 1.4rem; }
.practice .sp-card { display: flex; flex-direction: column; padding: 0.9rem 1rem; }
.practice .ico { font-size: 1.5rem; margin-bottom: 0.5rem; }
.practice .sp-card-title { font-size: 1.05rem; }
.practice .sp-card-sub { font-size: 0.88rem; }
</style>
