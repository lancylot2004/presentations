<script setup lang="ts">
// The field, then the one we keep. Three tools arrive one at a time, then Git
// takes the slide over and unpacks its own design.
//   1 Mercurial   2 Git   3 jj   4 Git fills the slide, carrying its four cards
//
// Panel geometry is the sibling deck's: absolute panels in percentages, one
// duration and one curve, so nothing finishes early and pops. Every panel
// stays mounted, because unmounting one mid-move is what makes a collapse
// read as a snap.
//
// The four boxes are the ones the lecture has always used, so the rest of the
// course lands on the same four words. Each one is stated on its own: naming
// what Git is being compared against would introduce an idea the room does
// not have yet.
import { useSlideContext } from '@slidev/client'
import IconGitCommitHorizontal from '~icons/lucide/git-commit-horizontal'
import IconGitBranch from '~icons/lucide/git-branch'
import IconGitGraph from '~icons/lucide/git-graph'
import IconClock from '~icons/lucide/clock'
import IconUserCheck from '~icons/lucide/user-check'
import IconUsersRound from '~icons/lucide/users-round'
import IconBadgeCheck from '~icons/lucide/badge-check'

const { $clicks } = useSlideContext()

const tools = [
  {
    key: 'hg',
    name: 'Mercurial',
    year: '2005',
    icon: IconGitCommitHorizontal,
    tone: 'var(--sp-good)',
    // wiki.mercurial-scm.org and the phases mechanism: published history is
    // refused rather than rewritten.
    idea: 'Simple commands; published history is safe; built to scale.',
    // martinvonz, "Mercurial at Google (also known as Fig)", 2023.
    user: 'Google',
  },
  {
    key: 'git',
    name: 'Git',
    year: '2005',
    icon: IconGitBranch,
    tone: 'var(--sp-accent)',
    idea: 'Snapshots; everything local; history only grows.',
  },
  {
    key: 'jj',
    name: 'jj',
    year: '2019',
    icon: IconGitGraph,
    tone: 'var(--sp-warn)',
    idea: 'History as a graph; conflicts first-class; undo anytime.',
  },
]

const ideas = [
  { icon: IconClock, title: 'History', sub: 'Like a "time machine".' },
  { icon: IconUserCheck, title: 'Ownership', sub: 'Who broke production?' },
  { icon: IconUsersRound, title: 'Collaboration', sub: 'Code at the same time and merge later.' },
  { icon: IconBadgeCheck, title: 'Standard', sub: 'Most devs use it.' },
]

const collapsed = (i: number) => ({ left: `${i * (100 / 3)}%`, width: `${100 / 3}%` })
const expanded = { left: '0%', width: '100%' }

const open = (i: number) => ($clicks.value ?? 0) >= 4 && tools[i].key === 'git'
const shown = (i: number) => ($clicks.value ?? 0) >= i + 1
const gone = (i: number) => ($clicks.value ?? 0) >= 4 && tools[i].key !== 'git'
</script>

<template>
  <div class="stage">
    <div
      v-for="(t, i) in tools"
      :key="t.key"
      class="panel"
      :class="{ on: shown(i), open: open(i), gone: gone(i) }"
      :style="open(i) ? expanded : collapsed(i)"
    >
      <div class="inner" :style="{ '--tone': t.tone }">
        <div class="head">
          <component :is="t.icon" class="ico" />
          <div class="label">{{ t.name }}</div>
          <div class="year">{{ t.year }}</div>
        </div>

        <div class="idea">{{ t.idea }}</div>
        <div v-if="t.user" class="user">Used by {{ t.user }}</div>

        <div class="grow" :class="{ open: open(i) }">
          <div>
            <div class="ideas">
              <div v-for="d in ideas" :key="d.title" class="box">
                <component :is="d.icon" class="box-ico" />
                <div class="box-title">{{ d.title }}</div>
                <div class="box-sub">{{ d.sub }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stage {
  position: relative;
  flex: 1;
  width: 100%;
  min-height: 24rem;
  margin-bottom: 1.2rem;
}

.panel {
  --move: 460ms cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  top: 0;
  height: 100%;
  padding: 0 0.45rem;
  opacity: 0;
  transition: left var(--move), width var(--move), opacity var(--move);
}
.panel.on { opacity: 1; }
.panel.gone { opacity: 0; pointer-events: none; }

.inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.2rem 1.4rem;
  border: 1.5px solid var(--sp-border);
  border-radius: 0.7rem;
  background: var(--sp-surface);
  overflow: hidden;
  transition: border-color var(--move), background var(--move);
}
.panel.open .inner {
  border-color: var(--tone);
  background: color-mix(in srgb, var(--tone) 8%, var(--sp-surface));
}

.head { display: flex; align-items: baseline; gap: 0.9rem; flex: none; }
.ico { font-size: 2rem; color: var(--tone); align-self: center; }
.label { font-size: 1.5rem; font-weight: 700; transition: font-size var(--move); }
.panel.open .label { font-size: 1.9rem; }
.year { margin-left: auto; font-size: 1rem; color: var(--sp-dim); font-variant-numeric: tabular-nums; }

.idea { margin-top: 1rem; font-size: 1.15rem; line-height: 1.35; color: var(--sp-text); }
.panel.open .idea { font-size: 1.35rem; }
.user { margin-top: 0.7rem; font-size: 0.95rem; color: var(--sp-dim); }

.grow {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition: grid-template-rows 420ms cubic-bezier(0.4, 0, 0.2, 1), opacity 260ms ease;
}
.grow > * { overflow: hidden; min-height: 0; }
.grow.open { grid-template-rows: 1fr; opacity: 1; }

.ideas { margin-top: 1.4rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.8rem; }
.box {
  border: 1px solid var(--sp-border);
  border-radius: 0.5rem;
  background: var(--sp-surface-2);
  padding: 0.7rem 0.9rem;
}
.box-ico { font-size: 1.3rem; color: var(--tone); margin-bottom: 0.3rem; display: block; }
.box-title { font-size: 1.1rem; font-weight: 700; line-height: 1.2; }
.box-sub { margin-top: 0.25rem; font-size: 0.92rem; color: var(--sp-muted); line-height: 1.3; }
</style>
