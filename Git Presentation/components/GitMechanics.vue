<script setup lang="ts">
// The four places a change can be, left to right, with the command that moves
// it between them drawn on the arrow. Both repositories are the same
// CommitGraph, because they hold the same kind of thing.
//   1 init and two new files   2 add          3 commit        4 commit
//   5 checkout -b feature      6 commit       7 checkout main
//   8 commit                   9 checkout -b bugfix          10 commit
//  11 checkout main           12 remote add  13 push
//
// The remote is added rather than assumed. push.default has been `simple`
// since Git 2.0, and that mode "requires that the remote repository to be
// pushed to is known", so a bare `git push` straight after `git init` fails
// with "No configured push destination". -u sets the upstream the mode wants.
// https://git-scm.com/docs/git-push
//
// Two branches, not one, so the room sees two names growing off the same
// commit and HEAD visiting each of them in turn.
//
// Two things are deliberately absent. Remote-tracking refs (origin/main) are
// a fifth place and the room has four to learn first. Merging gets its own
// slide, so nothing here has two parents, and HEAD only ever sits on a
// branch: a detached HEAD is a later problem.
import { useSlideContext } from '@slidev/client'
import CommitGraph from './CommitGraph.vue'

const { $clicks } = useSlideContext()
const c = () => $clicks.value ?? 0
const at = (n: number) => c() >= n

const steps = [
  { cmd: 'git init', arrow: '' },
  { cmd: 'git add .', arrow: 'add' },
  { cmd: 'git commit -m "Add the lexer"', arrow: 'commit' },
  { cmd: 'git commit -m "Speed up the lookup"', arrow: 'commit' },
  { cmd: 'git checkout -b feature', arrow: '' },
  { cmd: 'git commit -m "Try a faster table"', arrow: 'commit' },
  { cmd: 'git checkout main', arrow: '' },
  { cmd: 'git commit -m "Fix the off-by-one"', arrow: 'commit' },
  { cmd: 'git checkout -b bugfix', arrow: '' },
  { cmd: 'git commit -m "Reject empty input"', arrow: 'commit' },
  { cmd: 'git checkout main', arrow: '' },
  { cmd: 'git remote add origin git@gitlab.doc.ic.ac.uk:lab/lexer.git', arrow: '' },
  { cmd: 'git push -u origin main', arrow: 'push' },
]
const step = () => (c() === 0 ? null : steps[Math.min(steps.length, c()) - 1])

const wd = () => (c() === 1 ? [['A', 'src/lexer.rs'], ['M', 'src/main.rs']] : [])
const idx = () => (c() === 2 ? [['A', 'src/lexer.rs'], ['M', 'src/main.rs']] : [])

const ME = 'lancy <me@lancy.dev>'
const LUCIA = 'Lucia <lucia@lancy.dev>'

// feature and main both continue from 7b04e5d, which is what makes them two
// lines rather than one. bugfix comes off where main has actually got to, and
// since main gains nothing after that, its commit stays in main's lane: a
// commit only earns a lane of its own where its parent has two children.
const commits = [
  { id: 'a3f19c2', lane: 0, row: 0, at: 3, tone: 'var(--sp-accent)', who: ME, time: '14:02', msg: 'Add the lexer' },
  { id: '7b04e5d', lane: 0, row: 1, at: 4, tone: 'var(--sp-accent)', who: ME, time: '14:19', msg: 'Speed up the lookup' },
  { id: 'c81aa30', lane: 1, row: 2, at: 6, tone: 'var(--sp-warn)', who: ME, time: '14:41', msg: 'Try a faster table' },
  { id: '4e7d92b', lane: 0, row: 3, at: 8, tone: 'var(--sp-accent)', who: ME, time: '15:07', msg: 'Fix the off-by-one' },
  { id: '9b1f5c4', lane: 0, row: 4, at: 10, tone: 'var(--sp-good)', who: LUCIA, time: '15:26', msg: 'Reject empty input' },
]
const links = [
  { from: 'a3f19c2', to: '7b04e5d', at: 4 },
  { from: '7b04e5d', to: 'c81aa30', at: 6 },
  { from: '7b04e5d', to: '4e7d92b', at: 8 },
  { from: '4e7d92b', to: '9b1f5c4', at: 10 },
]

// Branches are names for commits, and HEAD is a name for a branch, so all
// four ride on the row of whatever commit they currently point at.
const mainOn = () => (at(8) ? '4e7d92b' : at(4) ? '7b04e5d' : 'a3f19c2')
const featureOn = () => (at(6) ? 'c81aa30' : '7b04e5d')
const bugfixOn = () => (at(10) ? '9b1f5c4' : '4e7d92b')
const branch = () => (c() === 5 || c() === 6 ? 'feature' : c() === 9 || c() === 10 ? 'bugfix' : 'main')
const headOn = () =>
  branch() === 'feature' ? featureOn() : branch() === 'bugfix' ? bugfixOn() : mainOn()

const localNodes = () => commits.map((n) => ({ ...n, on: at(n.at) }))
const localEdges = () => links.map((e) => ({ ...e, on: at(e.at) }))
const localRefs = () => {
  const out = []
  if (at(3)) out.push({ label: 'HEAD', at: headOn(), kind: 'head', active: true })
  if (at(3)) out.push({ label: 'main', at: mainOn(), kind: 'main', active: branch() === 'main' })
  if (at(5)) out.push({ label: 'feature', at: featureOn(), kind: 'feature', active: branch() === 'feature' })
  if (at(9)) out.push({ label: 'bugfix', at: bugfixOn(), kind: 'bugfix', active: branch() === 'bugfix' })
  return out
}

// Only main was pushed, so only the commits on main's line go up. They are
// re-laid onto consecutive rows, because the remote has no feature commit to
// leave a gap for.
const MAIN_LINE = ['a3f19c2', '7b04e5d', '4e7d92b']
const remoteNodes = () =>
  commits.filter((n) => MAIN_LINE.includes(n.id)).map((n, i) => ({ ...n, lane: 0, row: i, on: true }))
const remoteEdges = () =>
  remoteNodes().slice(1).map((n, i) => ({ from: remoteNodes()[i].id, to: n.id, on: true }))
const remoteRefs = () => [
  { label: 'main', at: MAIN_LINE[MAIN_LINE.length - 1], kind: 'main', active: true },
]

// The four zones are not equally interesting at every step, so the row gives
// its width to whichever one the current command acts on. Track count stays
// the same, so the grid template animates.
const LAYOUT = {
  files: '1.5fr auto 1.5fr auto 1.1fr auto 0.7fr',
  repo: '0.62fr auto 0.62fr auto 3.4fr auto 0.72fr',
  push: '0.62fr auto 0.62fr auto 2fr auto 2fr',
}
const columns = () => (c() <= 2 ? LAYOUT.files : c() >= 12 ? LAYOUT.push : LAYOUT.repo)
</script>

<template>
  <div class="wrap">
    <div class="cmdline">
      <span class="sigil">$</span>
      <span class="cmd">{{ step()?.cmd }}</span>
    </div>

    <div class="zones" :style="{ gridTemplateColumns: columns() }">
      <div class="zone">
        <div class="zone-label">Working tree</div>
        <div class="chips">
          <div v-for="[st, f] in wd()" :key="f" class="chip">
            <span class="sp-st" :class="st">{{ st }}</span>{{ f }}
          </div>
          <div v-if="!wd().length" class="empty">clean</div>
        </div>
      </div>

      <div class="arrow" :class="{ lit: step()?.arrow === 'add' }">
        <div class="arrow-cmd">add</div>
        <div class="arrow-line" />
      </div>

      <div class="zone">
        <div class="zone-label">Staging area</div>
        <div class="chips">
          <div v-for="[st, f] in idx()" :key="f" class="chip">
            <span class="sp-st" :class="st">{{ st }}</span>{{ f }}
          </div>
          <div v-if="!idx().length" class="empty">empty</div>
        </div>
      </div>

      <div class="arrow" :class="{ lit: step()?.arrow === 'commit' }">
        <div class="arrow-cmd">commit</div>
        <div class="arrow-line" />
      </div>

      <div class="zone">
        <div class="zone-label">Local repository</div>
        <CommitGraph class="mt" :nodes="localNodes()" :edges="localEdges()" :refs="localRefs()" />
      </div>

      <div class="arrow" :class="{ lit: step()?.arrow === 'push' }">
        <div class="arrow-cmd">push</div>
        <div class="arrow-line" />
      </div>

      <div class="zone">
        <div class="zone-label">Remote</div>
        <div v-if="!at(13)" class="chips"><span class="empty">empty</span></div>
        <CommitGraph v-else class="mt" :nodes="remoteNodes()" :edges="remoteEdges()" :refs="remoteRefs()" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrap { display: flex; flex-direction: column; flex: 1; min-height: 0; }

.cmdline {
  display: flex;
  align-items: baseline;
  gap: 0.7rem;
  padding: 0.5rem 0.9rem;
  border: 1px solid var(--sp-border);
  border-radius: 0.5rem;
  background: var(--sp-surface);
  font-size: 1rem;
  flex: none;
  min-height: 2.1rem;
}
.sigil { color: var(--sp-dim); font-family: var(--slidev-code-font-family, monospace); }
.cmd { font-family: var(--slidev-code-font-family, monospace); color: var(--sp-accent); font-weight: 600; }

.zones {
  margin-top: 0.9rem;
  flex: 1;
  min-height: 0;
  display: grid;
  gap: 0.5rem;
  align-items: stretch;
  transition: grid-template-columns 460ms cubic-bezier(0.4, 0, 0.2, 1);
}

.zone {
  display: flex;
  flex-direction: column;
  min-width: 0;
  border: 1px solid var(--sp-border);
  border-radius: 0.55rem;
  background: var(--sp-surface);
  padding: 0.5rem 0.5rem 0.4rem;
  overflow: hidden;
}
.zone-label {
  font-size: 0.6rem;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--sp-dim);
  line-height: 1.3;
  flex: none;
}
.mt { margin-top: 0.45rem; }

.chips { margin-top: 0.45rem; display: flex; flex-direction: column; gap: 0.3rem; }
.chip {
  display: flex;
  gap: 0.5rem;
  font-family: var(--slidev-code-font-family, monospace);
  font-size: 0.82rem;
  color: var(--sp-muted);
}
.empty { font-size: 0.85rem; color: var(--sp-dim); font-style: italic; }

.arrow {
  align-self: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  width: 2.5rem;
  opacity: 0.32;
  transition: opacity 320ms ease;
}
.arrow.lit { opacity: 1; }
.arrow-cmd {
  font-family: var(--slidev-code-font-family, monospace);
  font-size: 0.7rem;
  color: var(--sp-accent);
  white-space: nowrap;
}
/* Drawn rather than set as a glyph: a rule plus a head stays one pixel thick
   at any length. */
.arrow-line { position: relative; width: 100%; height: 1.5px; background: var(--sp-dim); }
.arrow-line::after {
  content: '';
  position: absolute;
  right: -1px;
  top: 50%;
  transform: translateY(-50%);
  border-left: 7px solid var(--sp-dim);
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
}
.arrow.lit .arrow-line { background: var(--sp-accent); }
.arrow.lit .arrow-line::after { border-left-color: var(--sp-accent); }
</style>
