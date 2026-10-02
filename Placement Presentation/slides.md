---
theme: default
title: Industrial Placement
info: |
  Industrial Placement talk (COMP70012), Lancelot Liu, Squarepoint Capital.
  Technology / Internal Compute Frameworks / Services Core.
author: Lancelot Liu
colorSchema: dark
highlighter: shiki
mdc: true
transition: fade
exportFilename: placement-presentation
fonts:
  sans: Inter
  mono: JetBrains Mono
  weights: '300,400,600,800'
drawings:
  persist: false
class: text-left
---

<div class="sp-kicker">COMP70012</div>

# Industrial Placement

<div class="mt-10 text-3xl font-semibold">Lancelot Liu</div>

<div class="mt-3 text-xl" style="color: var(--sp-muted)">Squarepoint Capital</div>

<!--
- Industrial placement at Squarepoint.
- Concerns company, project, learnings / reflections; NOT tech deep dive.
- Invite for any questions during or after.
-->

---
clicks: 3
---

# Squarepoint Capital

<CompanyWords />

---
clicks: 3
---

# My Team

<OrgPath />

<!--
- Large organisation - 2800 when I left.
- Tech -> ICF, stop at Services Core.
- Why do we need ICF? We don't (really) use externals e.g. AWS for... reasons.
- E.g. soverignty, customisability.
- Mention NDA. Please bear in mind.
-->

---
clicks: 3
---

# Motivation

<ProblemModes />

<SyntheticTag />

<!--
- Own resources, massive resource allocation problem. 
- We use "containers" primarily, need to know how much resources our code needs.
- Go through problems quickly.
-->

---
clicks: 2
---

# Existing Solutions?

<ExistingSolutions />

<!--
- Ask if anyone has heard or used these tools before.
- Illustrate their power but limitation in this case.
- Outline the difficulty in honouring so many seemingly individualised constraints.
-->

---
clicks: 4
---

# Project ███

<Architecture />

<!--
- Library composed of highly modular components,
- Each of which deals with one kind of thing,
- The library can be consumed by tools I built, or by another platform.
-->

---

# Mock: CPU Spikes

<RunCommand metrics="cpu.stat,cpu.max@1ms" class="mb-3" />

<ThrottleChart />

<SyntheticTag />

---
clicks: 1
---

# Mock: Memory Limits

<RunCommand metrics="memory.current,memory.stat,memory.events@1ms" class="mb-3" />

<MemoryChart :reveal="$clicks" />

<SyntheticTag />

---
clicks: 3
---

# Learnings

<Learnings />

---
clicks: 6
---

# Placement and Degree

<PlacementAndDegree />

---
layout: center
---

