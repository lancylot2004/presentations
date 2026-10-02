<script setup lang="ts">
// Two repositories and the commands that move commits between them. The
// working tree and the staging area are gone: nothing here is about which
// version of a file you picked, and the previous slide already owns that.
//   1 clone   2 you commit   3 Lucia pushes   4 your push is rejected
//   5 pull, which merges     6 push, which now works
//
// The rejection is the point of the slide. Without it a merge looks like
// something you choose to do, when in practice it is what Git makes you do
// before it will let you push.
//
// Each side lays its own rows out. The two repositories hold the same
// commits by the end, but they came by them in a different order, and
// git log --graph is topological rather than chronological, so the lanes
// legitimately differ between the panes.
import { useSlideContext } from '@slidev/client'
import CommitGraph from './CommitGraph.vue'

const { $clicks } = useSlideContext()
const c = () => $clicks.value ?? 0
const at = (n: number) => c() >= n

const ME = 'lancy <me@lancy.dev>'
const LUCIA = 'Lucia <lucia@lancy.dev>'

const steps = [
  { cmd: 'git clone git@gitlab.doc.ic.ac.uk:lab/lexer.git', arrow: 'clone', dir: 'left' },
  { cmd: 'git commit -m "Reject empty input"', arrow: '', dir: '' },
  { cmd: '# meanwhile, Lucia pushes her own work', arrow: '', dir: '', comment: true },
  { cmd: 'git push', arrow: 'push', dir: 'right', blocked: true, out: '! [rejected]  main -> main (fetch first)' },
  { cmd: 'git pull', arrow: 'pull', dir: 'left' },
  { cmd: 'git push', arrow: 'push', dir: 'right' },
]
const step = () => (c() === 0 ? null : steps[Math.min(steps.length, c()) - 1])

// One commit, described once, laid out per repository below.
const C = {
  a3f: { id: 'a3f19c2', tone: 'var(--sp-accent)', who: ME, time: '14:02', msg: 'Add the lexer' },
  b7b: { id: '7b04e5d', tone: 'var(--sp-accent)', who: ME, time: '14:19', msg: 'Speed up the lookup' },
  e4e: { id: '4e7d92b', tone: 'var(--sp-accent)', who: ME, time: '15:07', msg: 'Fix the off-by-one' },
  d8d: { id: '8d3e1a0', tone: 'var(--sp-good)', who: ME, time: '16:04', msg: 'Reject empty input' },
  c2c: { id: '2c9b7f1', tone: 'var(--sp-warn)', who: LUCIA, time: '16:10', msg: 'Add a README' },
  f41: { id: 'f41c8d2', tone: 'var(--sp-accent)', who: ME, time: '16:15', msg: "Merge branch 'main' of origin" },
}

// Your side: you are on main, so your commit keeps lane 0 and Lucia's
// arrives alongside it when you pull.
const localNodes = () => [
  { ...C.a3f, lane: 0, row: 0, on: at(1) },
  { ...C.b7b, lane: 0, row: 1, on: at(1) },
  { ...C.e4e, lane: 0, row: 2, on: at(1) },
  { ...C.d8d, lane: 0, row: 3, on: at(2) },
  { ...C.c2c, lane: 1, row: 4, on: at(5) },
  { ...C.f41, lane: 0, row: 5, on: at(5) },
]
const localEdges = () => [
  { from: C.a3f.id, to: C.b7b.id, on: at(1) },
  { from: C.b7b.id, to: C.e4e.id, on: at(1) },
  { from: C.e4e.id, to: C.d8d.id, on: at(2) },
  { from: C.e4e.id, to: C.c2c.id, on: at(5) },
  { from: C.d8d.id, to: C.f41.id, on: at(5) },
  { from: C.c2c.id, to: C.f41.id, on: at(5) },
]
const localMain = () => (at(5) ? C.f41.id : at(2) ? C.d8d.id : C.e4e.id)
const localRefs = () =>
  at(1)
    ? [
        { label: 'HEAD', at: localMain(), kind: 'head', active: true },
        { label: 'main', at: localMain(), kind: 'main', active: true },
      ]
    : []

// The remote's side: Lucia's commit landed there first, so on the server it
// is main's line and yours is the one that arrives alongside.
const remoteNodes = () => [
  { ...C.a3f, lane: 0, row: 0, on: true },
  { ...C.b7b, lane: 0, row: 1, on: true },
  { ...C.e4e, lane: 0, row: 2, on: true },
  { ...C.c2c, lane: 0, row: 3, on: at(3) },
  { ...C.d8d, lane: 1, row: 4, on: at(6) },
  { ...C.f41, lane: 0, row: 5, on: at(6) },
]
const remoteEdges = () => [
  { from: C.a3f.id, to: C.b7b.id, on: true },
  { from: C.b7b.id, to: C.e4e.id, on: true },
  { from: C.e4e.id, to: C.c2c.id, on: at(3) },
  { from: C.e4e.id, to: C.d8d.id, on: at(6) },
  { from: C.c2c.id, to: C.f41.id, on: at(6) },
  { from: C.d8d.id, to: C.f41.id, on: at(6) },
]
const remoteMain = () => (at(6) ? C.f41.id : at(3) ? C.c2c.id : C.e4e.id)
const remoteRefs = () => [{ label: 'main', at: remoteMain(), kind: 'main', active: true }]
</script>

<template>
  <div class="wrap">
    <div class="cmdline">
      <span class="sigil">$</span>
      <span class="cmd" :class="{ comment: step()?.comment }">{{ step()?.cmd }}</span>
      <span v-if="step()?.out" class="out">{{ step()?.out }}</span>
    </div>

    <div class="zones">
      <div class="zone">
        <div class="zone-label">Your machine</div>
        <div v-if="!at(1)" class="chips"><span class="empty">nothing yet</span></div>
        <CommitGraph v-else class="mt" :nodes="localNodes()" :edges="localEdges()" :refs="localRefs()" :rows="6" />
      </div>

      <div class="arrow" :class="{ lit: !!step()?.arrow, blocked: step()?.blocked }">
        <div class="arrow-cmd">{{ step()?.arrow }}</div>
        <div class="arrow-line" :class="{ rev: step()?.dir === 'left' }" />
      </div>

      <div class="zone">
        <div class="zone-label">Remote</div>
        <CommitGraph class="mt" :nodes="remoteNodes()" :edges="remoteEdges()" :refs="remoteRefs()" :rows="6" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrap { display: flex; flex-direction: column; flex: 1; min-height: 0; }

.cmdline {
  display: flex;
  align-items: baseline;
  gap: 0.9rem;
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
.cmd.comment { color: var(--sp-dim); font-weight: 400; }
/* Git's own words, not a gloss on them. */
.out { margin-left: auto; font-family: var(--slidev-code-font-family, monospace); font-size: 0.85rem; color: var(--sp-rust); }

.zones {
  margin-top: 0.9rem;
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0.5rem;
  align-items: stretch;
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
.chips { margin-top: 0.45rem; }
.empty { font-size: 0.85rem; color: var(--sp-dim); font-style: italic; }

.arrow {
  align-self: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  width: 2.8rem;
  opacity: 0.32;
  transition: opacity 320ms ease;
}
.arrow.lit { opacity: 1; }
.arrow-cmd {
  font-family: var(--slidev-code-font-family, monospace);
  font-size: 0.7rem;
  color: var(--sp-accent);
  white-space: nowrap;
  min-height: 0.9rem;
}
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
/* clone and pull travel the other way. */
.arrow-line.rev::after {
  right: auto;
  left: -1px;
  border-left: 0;
  border-right: 7px solid var(--sp-dim);
}
.arrow.lit .arrow-line { background: var(--sp-accent); }
.arrow.lit .arrow-line::after { border-left-color: var(--sp-accent); border-right-color: var(--sp-accent); }
.arrow.blocked .arrow-cmd { color: var(--sp-rust); }
.arrow.blocked .arrow-line { background: var(--sp-rust); }
.arrow.blocked .arrow-line::after { border-left-color: var(--sp-rust); border-right-color: var(--sp-rust); }
</style>
