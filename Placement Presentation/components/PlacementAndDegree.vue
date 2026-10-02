<script setup lang="ts">
// Two columns, Imperial always on the left, and three paired rows. The grid is
// symmetric on purpose: each row is one thing the degree gave and one thing the
// job added, at the same weight, rather than a scoreboard. Reveals alternate
// sides so the pairing is visible as it builds, six in total.
import { useSlideContext } from '@slidev/client'
import IconUsersRound from '~icons/lucide/users-round'
import IconHeartHandshake from '~icons/lucide/heart-handshake'
import IconBookOpen from '~icons/lucide/book-open'
import IconNetwork from '~icons/lucide/network'

const { $clicks } = useSlideContext()
const at = (n: number) => ($clicks.value ?? 0) >= n
</script>

<template>
  <div class="cmp">
    <div class="head">Imperial</div>
    <div class="head right">Squarepoint</div>

    <div class="sp-card rise" :class="{ on: at(1) }">
      <IconUsersRound class="ico" />
      <div class="sp-card-title">What We Learn</div>
      <div class="sp-card-sub">WACC, PintOS, DRP. VCS, MRs, CI, thin slices, ...</div>
    </div>

    <div class="sp-card warn rise" :class="{ on: at(2) }">
      <IconHeartHandshake class="ico" />
      <div class="sp-card-title">What We Do</div>
      <div class="sp-card-sub">Applied with less formality.</div>
    </div>

    <div class="sp-card rise" :class="{ on: at(3) }">
      <IconBookOpen class="ico" />
      <div class="sp-card-title">Lectures</div>
      <div class="sp-card-sub">Operating systems, concurrency, optimisation, software engineering design, ...</div>
    </div>

    <div class="sp-card warn rise" :class="{ on: at(4) }">
      <IconNetwork class="ico" />
      <div class="sp-card-title">Applied</div>
      <div class="sp-card-sub">Uses the <i>philosophy</i> of, plus distributed systems, async, ...</div>
    </div>

    <div class="sp-card quote rise" :class="{ on: at(5) }">
      <div class="sp-kicker">DRP mentor</div>
      <div class="sp-quote mt-1">"Should CI run on every commit, or only on merge requests?"</div>
    </div>

    <div class="sp-card quote warn rise" :class="{ on: at(6) }">
      <div class="sp-kicker">My manager</div>
      <div class="sp-quote mt-1">"Is MIG support worth a week?"</div>
    </div>

    <div class="note rise" :class="{ on: at(6) }">One is a natural extension of the other.</div>
  </div>
</template>

<style scoped>
.rise { opacity: 0; transform: translateY(8px); transition: opacity 320ms ease, transform 320ms ease; }
.rise.on { opacity: 1; transform: none; }

.cmp {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 2rem;
  row-gap: 0.6rem;
  /* Stretch, not start: the two cards in a row are the same claim from two
     sides, so they are the same size whatever their text does. */
  align-items: stretch;
  position: relative;
}

/* The divide is the slide's argument, so it is drawn rather than implied. */
.cmp::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 1em;
  border-left: 1px solid var(--sp-border);
}

.head {
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--sp-dim);
}
.head.right { color: var(--sp-warn); }

.cmp .sp-card { padding: 0.65rem 0.9rem; }
.cmp .sp-quote { font-size: 1.15rem; }
.ico { font-size: 1.4rem; color: var(--sp-accent); margin-bottom: 0.35rem; display: block; }

/* Right column keeps the warm border throughout, so colour reads as which side
   rather than as which one won. */
.warn { border-color: color-mix(in srgb, var(--sp-warn) 45%, var(--sp-border)); }
.warn .ico { color: var(--sp-warn); }

.note {
  grid-column: 1 / -1;
  margin-top: 0.1rem;
  text-align: center;
  font-size: 0.95rem;
  color: var(--sp-dim);
}
</style>
