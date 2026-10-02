---
theme: default
title: Introduction to Programming Utilities
info: |
  Lecture 3: Compilers and IDEs. DoCSoc, first-year Computing.
author: Lancelot Liu
colorSchema: dark
highlighter: shiki
mdc: true
transition: fade
exportFilename: compilers-presentation
fonts:
  sans: Inter
  mono: JetBrains Mono
  weights: '300,400,600,800'
drawings:
  persist: false
class: text-left title-slide
---

# Introduction to Programming Utilities

<div class="mt-8 text-3xl font-semibold">Lecture 3: Compilers and IDEs</div>

<!--
- Welcome to our third and final lecture!
- Setup Menti please.
- I'm Lancelot, DoCSoc webmaster
- Covering compilers / types of languages and IDEs, with some tangents.
- Did you all have lecture one and two last two days? (Solicit nods or hand raise)
- Ask question or interrupt anytime - welcome to stay behind too, unrelated welcome.
-->

---
clicks: 4
---

# Kinds of language

<LanguageKinds />

<!--
- Broadly three kinds - ignore markdown (md, html), data (SQL), etc.
- We're talking about _execution_, not the programming itself.
- [CLICK] Code 100% transformed into binary first. Directly executed by processor.
- Highly efficient, compiler needs to know about all types (architectures) of processors.
- You'll notice all the low-level and traditionally fast languages live here.
- [CLICK] Compiled to something logically similar to binary, but designed per language.
- Idea is instructions similar to binary but not quite, only need to write virtual machine per architecture.
- Shout out arctic lake / not necessarily slow but oftentimes is much slower.
- [CLICK] Generally slowest but also most flexible kind. Write interpreter per architecture, but often on top of another language. E.g. CPython, written in (asterisk) C.
- [CLICK] Notice Haskell appears twice - it can be compiled or interpreted. Other languages similar - just depends on tooling. Language not necessarily locked into one category.
- Weird and wonderful world of optimisations in between, blurring the lines. Research if want.
-->

---
clicks: 2
---

# Haskell

<div class="grid grid-cols-2 gap-10 mt-2">
  <Rail
    label="Like Rust, it compiles"
    :label-at="1"
    :tracks="[
      { name: 'Haskell', icon: 'haskell', tone: 'var(--sp-good)', at: 1,
        stops: [{ t: 'Main.hs' }, { via: 'ghc', t: './main', sub: 'native binary' }] },
      { name: 'Rust', icon: 'rust', tone: 'var(--sp-warn)', at: 1,
        stops: [{ t: 'main.rs' }, { via: 'rustc', t: './main', sub: 'native binary' }] },
    ]"
  />

  <Rail
    label="Like Python, it has a prompt"
    :label-at="2"
    :tracks="[
      { name: 'Haskell', icon: 'haskell', tone: 'var(--sp-good)', at: 2,
        stops: [{ t: 'Main.hs' }, { via: 'ghci', t: 'λ>', sub: 'nothing on disk' }] },
      { name: 'Python', icon: 'python', tone: 'var(--sp-accent)', at: 2,
        stops: [{ t: 'main.py' }, { via: 'python', t: '>>>', sub: 'nothing on disk' }] },
    ]"
  />
</div>

<!--
- Reiterate
-->

---
clicks: 5
---

# Kotlin

<Rail
  class="mt-2"
  :tracks="[
    { name: 'Kotlin', icon: 'kotlin', tone: 'var(--sp-accent)', at: 1,
      stops: [
        { t: 'Main.kt' },
        { via: 'kotlinc', t: 'Main.class', sub: 'bytecode' },
        { via: 'java', t: 'JVM', sub: 'runs it' },
      ] },
  ]"
/>

<div class="pair">
  <KotlinDist />
  <JavaStack />
</div>

<style scoped>
.pair {
  margin-top: 2rem;
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  gap: 2rem;
  align-items: start;
}
</style>

<!--
- [CLICK] Kotlin is quite complex. It's almost entirely (asterisk) based on Java,
- you'll use from term 2 onwards
- Compiles to bytecode, [CLICK] executed by J(ava) V(irtual) M(achine)
- To use Java, you'll need a virtual machine to run bytecode, above that [CLICK] a set of libraries that are core to the language, and [CLICK] above that development kit with tools that compile (and link) to bytecode.
- Kotlin needs more tooling on top of that - think of it as a wrapper. a nice one. 
-->

---
clicks: 4
---

# The same picture elsewhere

<Rail
  :tracks="[
    { name: 'Rust', icon: 'rust', tone: 'var(--sp-warn)', at: 1,
      stops: [{ t: 'main.rs' }, { via: 'rustc', t: 'binary' }, { via: 'run', t: 'machine code' }],
      note: 'One step, because cargo hides the linker.' },
    { name: 'C', icon: 'c', tone: 'var(--sp-good)', at: 2,
      stops: [{ t: 'main.c' }, { via: 'cc -c', t: 'main.o' }, { via: 'ld', t: 'binary' }, { via: 'run', t: 'machine code' }],
      note: 'Compile and link are separate, and you can see both.' },
    { name: 'TypeScript', icon: 'typescript', tone: 'var(--sp-accent)', at: 3,
      stops: [{ t: 'app.ts' }, { via: 'tsc', t: 'app.js' }, { via: 'node', t: 'interpreted' }],
      note: 'Compiles to another language, and the types are gone by then.' },
    { name: 'Go', icon: 'go', tone: 'var(--sp-rust)', at: 4,
      stops: [{ t: 'main.go' }, { via: 'go build', t: 'static binary' }, { via: 'copy anywhere', t: 'machine code' }],
      note: 'Everything is linked in, so the binary carries no dependencies.' },
  ]"
/>

<!--
- Each language functions differently, but they generally (asterisk) fit into these boxes.
- [CLICK] Rust - special because of its ability to target so many architectures with one tool
- [CLICK] C - special for its high level of control. Encourage research into linker if interested.
- [CLICK] Typescript - you can compile into another language, sometimes called transpiling.
- [CLICK] Go - special for its dependency-less compilation.
-->

---
clicks: 4
---

# Managers

<ManagerKinds />

<!--
- With great power comes great responsibility.
- You need a bunch of tools! They're all versioned too! (Cuz you know, software keeps improving).
- Depends on mood, raise hand if played Minecraft? JRE 1.8 vs 22 vs 26 ..
- [CLICK] Some manage the version of the language
- [CLICK] Some manage and version libraries (usually 3rd party)
- [CLICK] Some do both, and more!
-->

---
clicks: 3
---

# asdf

<Asdf />

<!--
- Lemme introduce you to my little friend.
- [CLICK] This is a suggestion! We'll walk you through it today, but it's an easy to way to version manage all sorts of things.
- [CLICK] YOu can even commit to source control so people on same project have same environment.
-->

---
layout: center
---

# Demo

<!--
- Navigate to asdf, download and install.
- Talk through the dangers of installing random things like this - be careful.
- Acknowledge platform limitation - sudo-less / constrained installs not in scope here.
- Welcome to ask questions!
- Use asdf to add ghc and kotlin plugins.
- Use asdf to list versions
- Use asdf to install latest and set (global) for each.
- Use ghci and type a... idk fibs = 0 : 1 : zipWith (+) fibs (tail fibs) or something
-->

---
clicks: 2
---

# Editors

<Editors />

<!--
- Broadly, two kinds of editors.
- [CLICK] Terminal editors. VERY steep learning curve, but extremely customisable and fast at the end. 
- [CLICK] Graphical editors. Loads of features, 3rd party extensions easy to install. Can get bloated and slow.
- Personally, I use both in different situations.
- At the very least, learn how to exit vim please.
-->

---
layout: center
---

# Demo

<!--
- Open some zellij panes, nvim into a file, write some python code,
- TEACH HOW TO EXIT.
- Open intellij, write some kotlin, execute it, debug it, code coverage it, commit it.
-->

---

# Linux and the command line

<Recap
  lecture="Lecture 1 of 3"
  tone="var(--sp-good)"
  :points="[
    ['Kernel & Distro', 'Linux is the kernel. Distros like Ubuntu and Debian add the shell, tools, package manager, ...'],
    ['Where you run', 'Lab machines are Ubuntu. At home, macOS ~= Linux, `WSL 2` on Windows'],
    ['Paths', '`/` is the root, `~` is your home, `.` is here, `..` is up one.'],
    ['Common Commands', '`ls` `cd` `cp` `mv` `rm` `grep` `chmod` ...; `man` for help'],
    ['Plumbing', '`|` and `>` chain commands. `ssh` and `scp` reach `shell[1-5].doc.ic.ac.uk`.'],
  ]"
/>

<!--
- For next three slides, acknowledge breadth of teaching.
- Want concept, not memorisation.
- Encourage questions.
- Bunch of UTAs in labs 2 - 4
-->

---

# Git and GitLab

<Recap
  lecture="Lecture 2 of 3"
  tone="var(--sp-warn)"
  :points="[
    ['Concepts', 'Working tree, staging area, local repository, remote.'],
    ['Steps', '`git add` picks changes. `git commit` records picked changes.'],
    ['Branches', 'Branch points to commit. `git checkout` moves `HEAD` to it.'],
    ['Syncing', '`git pull` before `git push`. A merge commit has two parents.'],
    ['', 'Git runs on your machine. GitLab is one of several places to keep it.'],
  ]"
/>

<!--

-->

---

# Compilers and IDEs

<Recap
  lecture="Lecture 3 of 3"
  tone="var(--sp-accent)"
  :points="[
    ['Execution Kinds', 'Machine code, bytecode on a VM, or interpreted.'],
    ['Not Always Same', '`ghc` builds a binary. `ghci` reads the same file and runs it.'],
    ['Java layers', '`JDK` contains `JRE` contains `JVM`.'],
    ['Managers', 'Helps you manage versions, packages, ...'],
    ['Editors', 'Terminal or graphical, differing pros and cons.'],
  ]"
/>

<!--

-->
