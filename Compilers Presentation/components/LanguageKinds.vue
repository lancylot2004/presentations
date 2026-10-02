<script setup lang="ts">
// Three ways a language gets run, each taking the slide in turn. The chips
// are the categorisation: the room should be able to place a language they
// know before any of the bullets arrive.
//   0 all three, named    1 ahead of time    2 bytecode    3 interpreted
//   4 the caveat
//
// The caveat matters more than the taxonomy. "Compiled" and "interpreted"
// are properties of an implementation, and the same language can have both:
// GHC compiles Haskell to a binary and GHCi interprets it, which is the next
// slide. Three categories rather than two is the smallest split that does
// not lie about Java and Kotlin.
import { useSlideContext } from '@slidev/client'
import IconRust from '~icons/simple-icons/rust'
import IconC from '~icons/simple-icons/c'
import IconCpp from '~icons/simple-icons/cplusplus'
import IconGo from '~icons/simple-icons/go'
import IconSwift from '~icons/simple-icons/swift'
import IconJava from '~icons/simple-icons/openjdk'
import IconKotlin from '~icons/simple-icons/kotlin'
import IconScala from '~icons/simple-icons/scala'
import IconCSharp from '~icons/simple-icons/csharp'
import IconPython from '~icons/simple-icons/python'
import IconRuby from '~icons/simple-icons/ruby'
import IconJs from '~icons/simple-icons/javascript'
import IconLua from '~icons/simple-icons/lua'
import IconZig from '~icons/simple-icons/zig'
import IconHaskell from '~icons/simple-icons/haskell'
import IconClojure from '~icons/simple-icons/clojure'
import IconElixir from '~icons/simple-icons/elixir'
import IconPhp from '~icons/simple-icons/php'
import IconR from '~icons/simple-icons/r'

const { $clicks } = useSlideContext()
const c = () => $clicks.value ?? 0

const kinds = [
  {
    key: 'aot',
    name: 'Compiled to machine code',
    term: 'ahead-of-time, or AOT',
    tone: 'var(--sp-warn)',
    langs: [
      { name: 'Rust', icon: IconRust },
      { name: 'C', icon: IconC },
      { name: 'C++', icon: IconCpp },
      { name: 'Go', icon: IconGo },
      { name: 'Swift', icon: IconSwift },
      { name: 'Zig', icon: IconZig },
      { name: 'Haskell', icon: IconHaskell },
    ],
    points: [
      'A compiler turns the whole program into machine code before it runs.',
    ],
  },
  {
    key: 'vm',
    name: 'Compiled to bytecode',
    term: 'run on a virtual machine',
    tone: 'var(--sp-accent)',
    langs: [
      { name: 'Java', icon: IconJava },
      { name: 'Kotlin', icon: IconKotlin },
      { name: 'Scala', icon: IconScala },
      { name: 'C#', icon: IconCSharp },
      { name: 'Clojure', icon: IconClojure },
      { name: 'Elixir', icon: IconElixir },
    ],
    points: [
      'A compiler produces bytecode, then run by a virtual machine.',
    ],
  },
  {
    key: 'int',
    name: 'Interpreted',
    term: 'run straight from source',
    tone: 'var(--sp-good)',
    langs: [
      { name: 'Python', icon: IconPython },
      { name: 'Ruby', icon: IconRuby },
      { name: 'JavaScript', icon: IconJs },
      { name: 'Lua', icon: IconLua },
      { name: 'PHP', icon: IconPhp },
      { name: 'R', icon: IconR },
      { name: 'Haskell', icon: IconHaskell },
    ],
    points: [
      'Another program reads your source and runs it, with no build step.',
    ],
  },
]

const collapsed = (i: number) => ({ left: `${i * (100 / 3)}%`, width: `${100 / 3}%` })
const expanded = { left: '0%', width: '100%' }

const active = () => (c() >= 1 && c() <= 3 ? c() - 1 : c() >= 4 ? 2 : -1)
const open = (i: number) => active() === i
const gone = (i: number) => active() >= 0 && active() !== i
</script>

<template>
  <div class="stage">
    <div
      v-for="(k, i) in kinds"
      :key="k.key"
      class="panel"
      :class="{ open: open(i), gone: gone(i) }"
      :style="open(i) ? expanded : collapsed(i)"
    >
      <div class="inner" :style="{ '--tone': k.tone }">
        <div class="label">{{ k.name }}</div>
        <div class="term">{{ k.term }}</div>

        <div class="chips">
          <span v-for="l in k.langs" :key="l.name" class="sp-chip lang">
            <component :is="l.icon" class="lang-ico" />{{ l.name }}
          </span>
        </div>

        <div class="grow" :class="{ open: open(i) }">
          <div>
            <ul class="points">
              <li v-for="p in k.points" :key="p">{{ p }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="caveat" :class="{ on: c() >= 4 }">
    Haskell is in two boxes on purpose. GHC compiles it to a binary; GHCi
    reads the same file and runs it. The box belongs to the tool, and a
    language can ship more than one.
  </div>
</template>

<style scoped>
.stage {
  position: relative;
  flex: 1;
  width: 100%;
  min-height: 19.5rem;
}

.panel {
  --move: 460ms cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  top: 0;
  height: 100%;
  padding: 0 0.45rem;
  transition: left var(--move), width var(--move), opacity var(--move);
}
.panel.open { z-index: 2; }
.panel.gone { opacity: 0; pointer-events: none; }

.inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.1rem 1.3rem;
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

.label { font-size: 1.25rem; font-weight: 700; flex: none; line-height: 1.2; transition: font-size var(--move); }
.panel.open .label { font-size: 1.9rem; }
.term { margin-top: 0.2rem; font-size: 1.11rem; color: var(--sp-dim); flex: none; transition: font-size var(--move); }
.panel.open .term { font-size: 1rem; }
.panel.open .label { font-size: 1.9rem; }

/* The categorisation itself: a language the room already knows, sitting in
   the box it belongs to, before any prose arrives. */
.chips { margin-top: 0.7rem; display: flex; flex-wrap: wrap; gap: 0.4rem; }
.lang { transition: font-size var(--move), padding var(--move); }
.panel.open .lang { font-size: 1rem; padding: 0.35rem 0.7rem; }
.lang-ico { font-size: 1em; color: var(--tone); }

.grow {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition: grid-template-rows 420ms cubic-bezier(0.4, 0, 0.2, 1), opacity 260ms ease;
}
.grow > * { overflow: hidden; min-height: 0; }
.grow.open { grid-template-rows: 1fr; opacity: 1; }

.points { margin: 1.3rem 0 0; padding-left: 1.1rem; }
.points li { font-size: 1.2rem; line-height: 1.4; color: var(--sp-text); }
.points li + li { margin-top: 0.6rem; }

.caveat {
  flex: none;
  margin-top: 1rem;
  font-size: 1rem;
  color: var(--sp-dim);
  opacity: 0;
  transition: opacity 320ms ease;
}
.caveat.on { opacity: 1; }
</style>
