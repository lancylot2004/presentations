<script setup lang="ts">
// A commit graph, drawn the way jj logs one: a node on the rail, an
// identifying line, and the description under it.
//
// The caller owns the story and says what is visible; this component owns
// only the geometry. Lanes and rows are indices rather than coordinates, so
// a second graph elsewhere in the deck lines up with this one by default.
//
// Oldest at the top, and arrowheads run with time, from a commit to the one
// made after it. Git's own pointers run the other way, which is a merge-slide
// problem.
interface Node {
  id: string
  lane: number
  row: number
  tone: string
  who: string
  time: string
  msg: string
  on?: boolean
}
interface Edge { from: string; to: string; on?: boolean }
interface Ref { label: string; at: string; kind: string; active?: boolean }

const props = withDefaults(
  defineProps<{ nodes: Node[]; edges?: Edge[]; refs?: Ref[]; rows?: number }>(),
  { edges: () => [], refs: () => [], rows: 5 },
)

const R = 5
const ROW = 38
// The first lane clears the stroke's outer edge, which was being cut off by
// the viewBox when the rail sat on the origin.
const LANE0 = 12
const LANE_STEP = 16
const X = { hash: 42, who: 86, time: 214, chip: 250, msg: 42 }
const W = 372

const y = (n: Node) => 16 + n.row * ROW
const lane = (n: Node) => LANE0 + n.lane * LANE_STEP
const byId = (id: string) => props.nodes.find((n) => n.id === id)!
const height = () => 16 + Math.max(props.rows, props.nodes.length) * ROW

// Two shapes of lane change, which is what makes a merge read as a merge.
// A fork turns out of the parent straight away and then runs down its own
// lane. A merge does the opposite: it stays in the parent's lane and turns in
// just above the child. Turning early on a merge would drive the rail through
// whatever sits between the two rows.
const incoming = (id: string) => props.edges.filter((e) => e.to === id).length
const path = (e: Edge) => {
  const a = byId(e.from)
  const b = byId(e.to)
  if (a.lane === b.lane) return `M${lane(a)} ${y(a) + R} V${y(b) - R}`
  if (incoming(b.id) > 1) {
    const t = y(b) - R - 16
    return `M${lane(a)} ${y(a) + R} V${t} C${lane(a)} ${t + 8}, ${lane(b)} ${t + 8}, ${lane(b)} ${y(b) - R}`
  }
  const turn = y(a) + R + 12
  return `M${lane(a)} ${y(a) + R} C${lane(a)} ${turn}, ${lane(b)} ${turn}, ${lane(b)} ${y(b) - R}`
}

// Pill width follows the label, so a caller can invent a branch name without
// also having to measure it.
const wide = (label: string) => Math.round(11 + label.length * 5.6)
const chipsFor = (id: string) => {
  let x = X.chip
  return props.refs
    .filter((r) => r.at === id)
    .map((r) => {
      const w = wide(r.label)
      const left = x
      x += w + 4
      return { ...r, x: left, w }
    })
}

// Each instance needs its own marker id, or a second graph on the same slide
// silently reuses the first one's.
const markerId = `cg-arrow-${Math.random().toString(36).slice(2, 8)}`
</script>

<template>
  <svg class="graph" :viewBox="`0 0 ${W} ${height()}`" preserveAspectRatio="xMinYMin meet">
    <defs>
      <marker :id="markerId" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto">
        <path d="M0 0 L8 4 L0 8 z" fill="var(--sp-dim)" />
      </marker>
    </defs>

    <path
      v-for="e in edges"
      :key="e.from + e.to"
      class="edge"
      :class="{ on: e.on !== false }"
      :d="path(e)"
      :marker-end="`url(#${markerId})`"
    />

    <g v-for="n in nodes" :key="n.id" class="row" :class="{ on: n.on !== false }">
      <circle
        :cx="lane(n)"
        :cy="y(n)"
        :r="R"
        :fill="`color-mix(in srgb, ${n.tone} 28%, var(--sp-surface))`"
        :stroke="n.tone"
        stroke-width="1.8"
      />
      <text :x="X.hash" :y="y(n) + 3" class="hash">{{ n.id }}</text>
      <text :x="X.who" :y="y(n) + 3" class="meta">{{ n.who }}</text>
      <text :x="X.time" :y="y(n) + 3" class="meta">{{ n.time }}</text>
      <text :x="X.msg" :y="y(n) + 14" class="msg">{{ n.msg }}</text>

      <g v-for="c in chipsFor(n.id)" :key="c.label" class="ref" :class="[c.kind, { active: c.active }]">
        <rect :x="c.x" :y="y(n) - 7" :width="c.w" height="14" rx="3" />
        <text :x="c.x + c.w / 2" :y="y(n) + 3">{{ c.label }}</text>
      </g>
    </g>
  </svg>
</template>

<style scoped>
.graph { flex: 1; min-height: 0; width: 100%; }

.edge { fill: none; stroke: var(--sp-dim); stroke-width: 1.6; opacity: 0; transition: opacity 360ms ease; }
.edge.on { opacity: 1; }
.row { opacity: 0; transition: opacity 360ms ease; }
.row.on { opacity: 1; }

.hash { font-family: var(--slidev-code-font-family, monospace); font-size: 9px; fill: var(--sp-accent); }
.meta { font-family: var(--slidev-code-font-family, monospace); font-size: 9px; fill: var(--sp-dim); }
.msg { font-size: 10px; fill: var(--sp-text); }

/* A branch keeps its colour wherever it is pointing, and the one HEAD is on
   is the filled one. */
.ref rect { fill: var(--sp-surface-2); stroke: var(--sp-border); }
.ref text { text-anchor: middle; font-size: 9px; font-weight: 700; fill: var(--sp-muted); }
.ref.main rect { stroke: color-mix(in srgb, var(--sp-accent) 60%, var(--sp-border)); }
.ref.feature rect { stroke: color-mix(in srgb, var(--sp-warn) 60%, var(--sp-border)); }
.ref.bugfix rect { stroke: color-mix(in srgb, var(--sp-good) 60%, var(--sp-border)); }
.ref.active text { fill: var(--sp-text); }
.ref.main.active rect { stroke: var(--sp-accent); fill: color-mix(in srgb, var(--sp-accent) 18%, var(--sp-surface-2)); }
.ref.feature.active rect { stroke: var(--sp-warn); fill: color-mix(in srgb, var(--sp-warn) 18%, var(--sp-surface-2)); }
.ref.bugfix.active rect { stroke: var(--sp-good); fill: color-mix(in srgb, var(--sp-good) 18%, var(--sp-surface-2)); }
.ref.head rect { fill: var(--sp-bg); stroke: var(--sp-text); }
.ref.head text { fill: var(--sp-text); }
</style>
