<script setup lang="ts">
// The folder everyone in the room already has, against the same work with a
// history. The right-hand side names who did it and which files moved, so
// "version control" reads as something that happens to files rather than an
// abstraction. Two reveals.
import { useSlideContext } from '@slidev/client'

const { $clicks } = useSlideContext()
const at = (n: number) => ($clicks.value ?? 0) >= n

const soup = [
  'lexer.rs',
  'lexer-v2.rs',
  'lexer-lucia.rs',
  'lexer-final.rs',
  'lexer-final-USE-THIS-ONE.rs',
]

// A added, M modified, R renamed: the same letters git status prints.
const history = [
  {
    id: 'a3f19c2',
    who: 'Lancy',
    msg: 'Add the lexer',
    files: [['A', 'src/lexer.rs'], ['M', 'src/main.rs']],
  },
  {
    id: '7b04e5d',
    who: 'Lucia',
    msg: 'Rename Parser to SyntaxTree',
    files: [['R', 'src/parser.rs -> src/syntax_tree.rs'], ['M', 'src/main.rs']],
  },
  {
    id: 'c81aa30',
    who: 'Lancy',
    msg: 'Handle the empty input case',
    files: [['M', 'src/lexer.rs'], ['A', 'tests/empty.rs']],
  },
]
</script>

<template>
  <div class="cmp">
    <div class="side rise" :class="{ on: at(1) }">
      <div class="sp-kicker">Without</div>
      <div class="sp-card mt-2">
        <div v-for="f in soup" :key="f" class="file">{{ f }}</div>
      </div>
    </div>

    <div class="side rise" :class="{ on: at(2) }">
      <div class="sp-kicker good">With</div>
      <div class="sp-card good-card mt-2">
        <div v-for="c in history" :key="c.id" class="commit">
          <div class="line">
            <span class="id">{{ c.id }}</span>
            <span class="msg">{{ c.msg }}</span>
            <span class="who">{{ c.who }}</span>
          </div>
          <div v-for="[st, name] in c.files" :key="name" class="file-row">
            <span class="sp-st" :class="st">{{ st }}</span>
            <span class="name">{{ name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rise { opacity: 0; transform: translateY(8px); transition: opacity 320ms ease, transform 320ms ease; }
.rise.on { opacity: 1; transform: none; }

.cmp { display: grid; grid-template-columns: 1fr 1.25fr; gap: 2rem; align-items: start; }
.sp-kicker.good { color: var(--sp-good); }
.good-card { border-color: color-mix(in srgb, var(--sp-good) 45%, var(--sp-border)); }

.file {
  font-family: var(--slidev-code-font-family, monospace);
  font-size: 1.05rem;
  line-height: 2.1;
  color: var(--sp-muted);
}
.file:last-child { color: var(--sp-warn); }

.commit + .commit { margin-top: 0.9rem; padding-top: 0.9rem; border-top: 1px solid var(--sp-border); }

.line { display: grid; grid-template-columns: auto 1fr auto; gap: 0.8rem; align-items: baseline; }
.id { font-family: var(--slidev-code-font-family, monospace); font-size: 0.95rem; color: var(--sp-accent); }
.msg { font-size: 1.05rem; font-weight: 600; }
.who { font-size: 0.9rem; color: var(--sp-dim); }

.file-row {
  display: flex;
  gap: 0.7rem;
  margin-top: 0.25rem;
  padding-left: 0.2rem;
  font-family: var(--slidev-code-font-family, monospace);
  font-size: 0.92rem;
  color: var(--sp-muted);
}
</style>
