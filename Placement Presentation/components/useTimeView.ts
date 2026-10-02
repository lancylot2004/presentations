// Pan and zoom over a time axis, shared by every chart in the deck that has one.
//
// The view lives in Slidev's shared state under a key per chart. Slidev deep
// watches that object and copies unknown keys straight in, so a key of our own
// rides the same websocket as the page and click state: served with
// `slidev --remote`, a phone scrubbing a chart moves the projector's copy of it.
import { computed, ref, watch } from 'vue'
import { sharedState } from '@slidev/client'

export interface TimeView {
  t0: number
  t1: number
  /** Time under the pointer, for charts that draw a readout. */
  c?: number
  /** A chart's own mode, when it has one. */
  m?: string
}

export interface TimeViewOptions {
  /** Plot geometry in viewBox units, so a client x can be turned into a time. */
  plot: { left: number, right: number, width: number }
  minSpan?: number
  maxSpan?: number
  initial?: [number, number]
  defaultMode?: string
}

export function useTimeView(key: string, [T0, T1]: [number, number], opts: TimeViewOptions) {
  const minSpan = opts.minSpan ?? 0.05
  const maxSpan = Math.min(opts.maxSpan ?? T1 - T0, T1 - T0)
  const home: TimeView = opts.initial
    ? { t0: opts.initial[0], t1: opts.initial[1] }
    : { t0: T0, t1: T0 + maxSpan }

  const store = sharedState as unknown as Record<string, TimeView | undefined>
  const view = ref<TimeView>({ ...home })
  const svg = ref<SVGSVGElement>()

  // Read the shared key reactively rather than through onSharedUpdate. With a
  // dev server, Slidev's shared state IS the server-backed reactive object and
  // incoming patches are applied to it directly; onSharedUpdate is only wired
  // up for the serverless BroadcastChannel path, so a callback there never
  // fires in remote mode and the chart would publish without ever receiving.
  // Slidev's own laser pointer reads sharedState.cursor the same way.
  watch(
    () => store[key],
    (v) => {
      if (v && (v.t0 !== view.value.t0 || v.t1 !== view.value.t1 || v.c !== view.value.c || v.m !== view.value.m))
        view.value = { ...v }
    },
    { deep: true },
  )

  let published = 0
  function publish(force = false) {
    const now = Date.now()
    if (!force && now - published < 60)
      return
    published = now
    store[key] = { ...view.value }
  }

  function setView(t0: number, t1: number, c = view.value.c) {
    const span = Math.min(maxSpan, Math.max(minSpan, t1 - t0))
    const a = Math.max(T0, Math.min(T1 - span, t0))
    view.value = { t0: a, t1: a + span, c, m: view.value.m }
  }
  function reset() {
    setView(home.t0, home.t1, undefined)
    publish(true)
  }

  /** A chart's own mode, carried in the same shared object as the view. */
  const mode = computed(() => view.value.m ?? opts.defaultMode)
  function setMode(m: string) {
    view.value = { ...view.value, m }
    publish(true)
  }
  const zoomed = computed(() =>
    Math.abs(view.value.t0 - home.t0) > 1e-3 || Math.abs(view.value.t1 - home.t1) > 1e-3)

  // Pointer events cover mouse, trackpad and touch in one path.
  const pointers = new Map<number, number>()
  let drag: { x: number, t0: number, t1: number } | null = null
  let pinch: { dist: number, t0: number, t1: number, frac: number } | null = null

  function frac(clientX: number) {
    const r = svg.value!.getBoundingClientRect()
    const px = ((clientX - r.left) / r.width) * opts.plot.width
    return Math.max(0, Math.min(1, (px - opts.plot.left) / (opts.plot.width - opts.plot.right - opts.plot.left)))
  }
  function plotPx() {
    const r = svg.value!.getBoundingClientRect()
    return (r.width * (opts.plot.width - opts.plot.right - opts.plot.left)) / opts.plot.width
  }
  function timeAt(clientX: number) {
    return view.value.t0 + frac(clientX) * (view.value.t1 - view.value.t0)
  }
  function zoomAt(f: number, factor: number, from: TimeView = view.value) {
    const span = from.t1 - from.t0
    const anchor = from.t0 + f * span
    const next = Math.min(maxSpan, Math.max(minSpan, span * factor))
    setView(anchor - f * next, anchor - f * next + next)
  }

  const bind = {
    onWheel(e: WheelEvent) {
      e.preventDefault()
      e.stopPropagation()
      if (!e.ctrlKey && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        const span = view.value.t1 - view.value.t0
        const dt = (e.deltaX / plotPx()) * span
        setView(view.value.t0 + dt, view.value.t1 + dt)
      }
      else {
        zoomAt(frac(e.clientX), Math.exp(e.deltaY * (e.ctrlKey ? 0.01 : 0.0025)))
      }
      publish()
    },
    onPointerdown(e: PointerEvent) {
      e.stopPropagation()
      ;(e.target as Element).setPointerCapture?.(e.pointerId)
      pointers.set(e.pointerId, e.clientX)
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        pinch = { dist: Math.abs(a - b) || 1, t0: view.value.t0, t1: view.value.t1, frac: frac((a + b) / 2) }
        drag = null
      }
      else {
        drag = { x: e.clientX, t0: view.value.t0, t1: view.value.t1 }
      }
    },
    onPointermove(e: PointerEvent) {
      e.stopPropagation()
      if (!pointers.size) {
        // Hovering, not dragging: just move the readout.
        setView(view.value.t0, view.value.t1, timeAt(e.clientX))
        publish()
        return
      }
      pointers.set(e.pointerId, e.clientX)
      if (pinch && pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        zoomAt(pinch.frac, pinch.dist / (Math.abs(a - b) || 1), pinch)
      }
      else if (drag) {
        const span = drag.t1 - drag.t0
        const dt = ((drag.x - e.clientX) / plotPx()) * span
        setView(drag.t0 + dt, drag.t1 + dt)
      }
      publish()
    },
    onPointerup(e: PointerEvent) {
      e.stopPropagation()
      pointers.delete(e.pointerId)
      if (pointers.size < 2)
        pinch = null
      if (!pointers.size)
        drag = null
      publish(true)
    },
    onPointercancel(e: PointerEvent) {
      bind.onPointerup(e)
    },
    onPointerleave() {
      pointers.clear()
      drag = pinch = null
      setView(view.value.t0, view.value.t1, undefined)
      publish(true)
    },
  }

  return { view, svg, bind, setView, reset, zoomed, publish, mode, setMode }
}
