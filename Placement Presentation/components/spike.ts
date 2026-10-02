// One measured run, shared by both charts that draw it.
//
// The CSV is 92k rows, so it is parsed once here at module scope rather than
// once per component: the motivation slide plots the whole 90 seconds and the
// results slide zooms into one second of the same run.
import raw from '../data/spike.csv?raw'
import metaRaw from '../data/spike.meta.csv?raw'
import coarseRaw from '../data/spike-coarse.csv?raw'
import coarseMetaRaw from '../data/spike-coarse.meta.csv?raw'
import { cores, meta, parseCsv, throttledPeriods } from './chart'

export const fine = parseCsv(raw)
export const fineMeta = meta(metaRaw)
export const coarse = parseCsv(coarseRaw)
export const coarseMeta = meta(coarseMetaRaw)

export const quota = fineMeta.cpu_quota_usec / fineMeta.cpu_period_usec
export const periodUsec = fineMeta.cpu_period_usec
export const coarseSeconds = coarseMeta.interval_ns / 1e9

/** Seconds into the run at which the kernel first throttled the group. */
export const firstThrottleS = (() => {
  const i = fine.findIndex((r) => r.nr_throttled > fine[0].nr_throttled)
  return i < 0 ? 0 : fine[i].t_ns / 1e9
})()

/** Instantaneous cores from the 1 ms samples. Derived once; the chart pans and
 *  zooms over this array rather than recomputing 92k deltas per frame. */
export const fineCores = cores(fine, 1)

/** Every CFS period the kernel actually froze the group in. */
export const throttled = throttledPeriods(fine, periodUsec)

/** What the coarse poll reports: one average per gap between its samples. */
export const coarseSteps = coarse.slice(1).map((r, i) => ({
  t0: coarse[i].t_ns / 1e9,
  t1: r.t_ns / 1e9,
  cores: (r.usage_usec - coarse[i].usage_usec) / 1e6 / ((r.t_ns - coarse[i].t_ns) / 1e9),
}))
