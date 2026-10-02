<script setup lang="ts">
// Three places to keep a repository, then the one the room will actually use.
// Same shape as the VCS slide on purpose: the pairing is the lesson. Git is
// the tool, these are websites built around it, and a repository on any of
// them is the same repository.
//   1 GitHub   2 GitLab   3 Bitbucket   4 GitLab fills the slide with its own
//
// Dates and claims, checked rather than remembered:
//   GitHub launched April 2008, bought by Microsoft in 2018.
//   GitLab first public release 13 October 2011, Zaporozhets and Sizov.
//   Bitbucket launched 2008 Mercurial-only, and dropped Mercurial on
//   1 July 2020, which is the other half of the Mercurial card earlier.
import { useSlideContext } from '@slidev/client'
import IconGithub from '~icons/lucide/github'
import IconGitlab from '~icons/lucide/gitlab'
import IconBox from '~icons/lucide/box'
import IconServer from '~icons/lucide/server'
import IconPullRequest from '~icons/lucide/git-pull-request'
import IconPlay from '~icons/lucide/play'
import IconChecks from '~icons/lucide/list-checks'

const { $clicks } = useSlideContext()

const forges = [
  {
    key: 'gh',
    name: 'GitHub',
    year: '2008',
    icon: IconGithub,
    tone: 'var(--sp-good)',
    idea: 'Biggest; Microsoft-owned; where open source lives.',
  },
  {
    key: 'gl',
    name: 'GitLab',
    year: '2011',
    icon: IconGitlab,
    tone: 'var(--sp-accent)',
    idea: 'Self-hostable; CI built in; what DoC runs.',
  },
  {
    key: 'bb',
    name: 'Bitbucket',
    year: '2008',
    icon: IconBox,
    tone: 'var(--sp-warn)',
    idea: 'Atlassian; Mercurial-only until 2020.',
  },
]

const extras = [
  { icon: IconServer, title: 'Self-hosting', sub: 'We run our own in DoC' },
  { icon: IconPullRequest, title: 'Merge requests', sub: 'Same as pull requests' },
  { icon: IconPlay, title: 'CI/CD', sub: 'Run automated tasks on code' },
  { icon: IconChecks, title: 'Issues and boards', sub: 'Tickets; milestones; wiki; ...' },
]

const collapsed = (i: number) => ({ left: `${i * (100 / 3)}%`, width: `${100 / 3}%` })
const expanded = { left: '0%', width: '100%' }

const open = (i: number) => ($clicks.value ?? 0) >= 4 && forges[i].key === 'gl'
const shown = (i: number) => ($clicks.value ?? 0) >= i + 1
const gone = (i: number) => ($clicks.value ?? 0) >= 4 && forges[i].key !== 'gl'
</script>

<template>
  <div class="sp-kicker kick">Git != GitHub != ...</div>

  <div class="stage">
    <div
      v-for="(f, i) in forges"
      :key="f.key"
      class="panel"
      :class="{ on: shown(i), open: open(i), gone: gone(i) }"
      :style="open(i) ? expanded : collapsed(i)"
    >
      <div class="inner" :style="{ '--tone': f.tone }">
        <div class="head">
          <component :is="f.icon" class="ico" />
          <div class="label">{{ f.name }}</div>
          <div class="year">{{ f.year }}</div>
        </div>

        <div class="idea">{{ f.idea }}</div>

        <div class="grow" :class="{ open: open(i) }">
          <div>
            <div class="ideas">
              <div v-for="d in extras" :key="d.title" class="box">
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
.kick { margin-bottom: 0.7rem; }

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
