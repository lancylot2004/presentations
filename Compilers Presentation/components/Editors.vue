<script setup lang="ts">
// Two cards, one click each. The split that matters on a lab machine is
// whether the editor needs a desktop, because half of their work will happen
// over SSH.
import { useSlideContext } from '@slidev/client'
import IconVim from '~icons/simple-icons/vim'
import IconNeovim from '~icons/simple-icons/neovim'
import IconEmacs from '~icons/simple-icons/gnuemacs'
import IconHelix from '~icons/simple-icons/helix'
import IconVscode from '~icons/simple-icons/visualstudiocode'
import IconIntellij from '~icons/simple-icons/intellijidea'
import IconZed from '~icons/simple-icons/zedindustries'
import IconSublime from '~icons/simple-icons/sublimetext'
import IconEclipse from '~icons/simple-icons/eclipseide'

const { $clicks } = useSlideContext()
const at = (n: number) => ($clicks.value ?? 0) >= n

const cards = [
  {
    at: 1,
    title: 'Textual / Terminal',
    tone: 'var(--sp-good)',
    // nano carries no logo: the simple-icons "nano" is a cryptocurrency.
    tools: [
      { n: 'vim', i: IconVim },
      { n: 'neovim', i: IconNeovim },
      { n: 'emacs', i: IconEmacs },
      { n: 'helix', i: IconHelix },
      { n: 'nano' },
    ],
    points: [
      ['+', 'Any* terminal, over SSH'],
      ['+', 'Highly customisable'],
      ['+', 'Extremely fast, once learned'],
      ['-', 'Steep learning curve'],
    ],
  },
  {
    at: 2,
    title: 'Graphical',
    tone: 'var(--sp-accent)',
    tools: [
      { n: 'VS Code', i: IconVscode },
      { n: 'IntelliJ IDEA', i: IconIntellij },
      { n: 'Zed', i: IconZed },
      { n: 'Sublime Text', i: IconSublime },
      { n: 'Eclipse', i: IconEclipse },
    ],
    points: [
      ['+', 'Features out of the box'],
      ['+', 'Extensions, one click'],
      ['-', 'Bloated, slow'],
      ['-', 'Needs a screen'],
    ],
  },
]
</script>

<template>
  <div class="cards">
    <div
      v-for="c in cards"
      :key="c.title"
      class="card"
      :class="{ on: at(c.at) }"
      :style="{ '--tone': c.tone }"
    >
      <div class="title">{{ c.title }}</div>
      <div class="tools">
        <span v-for="t in c.tools" :key="t.n" class="sp-chip tool">
          <component :is="t.i" v-if="t.i" class="ico" />{{ t.n }}
        </span>
      </div>
      <ul class="points">
        <li v-for="[sign, text] in c.points" :key="text">
          <span class="sign" :class="sign === '+' ? 'pro' : 'con'">{{ sign }}</span>{{ text }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.cards { display: grid; grid-template-columns: 1fr 1fr; gap: 1.6rem; align-items: start; margin-top: 0.8rem; }

.card {
  border: 1.5px solid color-mix(in srgb, var(--tone) 45%, var(--sp-border));
  border-radius: 0.7rem;
  background: color-mix(in srgb, var(--tone) 6%, var(--sp-surface));
  padding: 1.2rem 1.3rem;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 340ms ease, transform 340ms ease;
}
.card.on { opacity: 1; transform: none; }

.title { font-size: 1.5rem; font-weight: 700; color: var(--sp-text); }
.tools { margin-top: 1rem; display: flex; flex-wrap: wrap; gap: 0.5rem; }
.tool { font-size: 1rem; padding: 0.35rem 0.7rem; color: var(--sp-text); }
.tool .ico { color: var(--tone); }
.points { margin: 1.1rem 0 0; padding: 0; list-style: none; }
.points li { display: flex; gap: 0.6rem; font-size: 1rem; line-height: 1.95; color: var(--sp-muted); }
.sign { width: 0.8rem; font-weight: 700; flex: none; }
.sign.pro { color: var(--sp-good); }
.sign.con { color: var(--sp-rust); }
</style>
