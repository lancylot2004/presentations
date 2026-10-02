# Chart data

Every chart in the deck is drawn from real measurements taken on this machine.
No Squarepoint code, data or infrastructure was involved: the sampler is a
standalone script written for this deck, and all three workloads are synthetic.

## How it is collected

The sampler runs in a **sidecar container**, not in the container being
measured. This matters. A sampler polling at 1 kHz burns real CPU, and inside
the target that CPU is charged to the same cgroup, so it would appear in the
very usage figure it is meant to report. The sidecar gets its own cgroup and
reads the target's files through the host cgroupfs:

```console
$ docker run --rm --cgroupns=host -v /sys/fs/cgroup:/hostcg:ro ... \
    python3 sample.py /hostcg/docker/<container-id> out.csv 9.5
```

**The last 2 ms before every deadline are spun, never slept.** Measured inside
this container, `time.sleep(200us)` overshoots by a median of 2.8 ms, so a
sleep anywhere near the deadline destroys a 1 ms cadence outright. The four
`pread(fd, n, 0)` calls cost about 3.4 us together (`cpu.stat` 0.7,
`memory.current` 0.3, `memory.events` 0.4, `memory.stat` 2.0), so the loop
spins to an absolute deadline instead. Spinning costs a core, which is
affordable precisely because that core is charged to the sidecar.

At the default 1 ms the whole wait fits inside that spin budget and the loop
never sleeps at all. `--interval-ms` takes a coarser interval, and there the
loop sleeps through the bulk of the wait and spins only the tail: holding a
core for thirty seconds to land one sample would be absurd.

Achieved cadence, reported by the sampler itself:

| dataset | samples | mean gap | median | p99 | max |
|---|---|---|---|---|---|
| `spike` | 91986 | 1.0002 ms | 1.0000 | 1.0003 | 10.00 ms |
| `spike-coarse` | 4 | 30000.5 ms | 29997.7 | 30008.1 | 30008 ms |
| `memory` | 3976 | 1.0005 ms | 1.0000 | 1.0001 | 3.51 ms |
| `waste` | 7867 | 1.0000 ms | 1.0000 | 1.0000 | 1.01 ms |

Nothing in the CSVs is smoothed or derived. They hold the raw counters plus a
monotonic `t_ns`; the charts do all the arithmetic. Fixed limits for a run live
in the matching `.meta.csv` rather than being repeated on every row.

## Environment

| | |
|---|---|
| Runtime | OrbStack, Docker API server 29.4.0 |
| cgroup | v2, `cgroupfs` driver |
| Image | `python:3.12-slim`, digest `sha256:78387bc3881b8273120a12ebe6c1ab22b018ccc2c9adf565ae1ac9b536e184ea` |
| Python | 3.12, standard library only |
| Collected | 2026-09-18 |

## Reproducing

```console
$ bash data/scripts/run.sh
```

`loads.py` holds the four workloads and `sample.py` the sampler; neither needs
anything installed beyond the standard library.

## Deriving the two CPU quantities

**Instantaneous cores.** `cores = d(usage_usec) / dt`, straight from the
cumulative counter, with no smoothing. At a 1 ms cadence this is deliberately
bimodal, and that is the finding rather than noise.

**Throttled periods.** `throttled_usec` only advances when the kernel actually
freezes the group, and it does so once per CFS period, not once per sample. So
samples are bucketed into real 100 ms periods and a bucket counts as throttled
when the counter moved across it. Testing successive 1 ms samples instead would
mark only the single millisecond in which the counter happened to tick.

Note for the Q&A: cgroup **v2 exposes `throttled_usec`**, in microseconds.
`throttled_time` in nanoseconds was the cgroup v1 spelling.

## What each run shows

### `spike.csv` and `spike-coarse.csv`, `--cpus=1`, one burst in a quiet job

Two samplers, one workload, one timeline. Both sidecars read the same cgroup at
the same time; one at 1 ms and one at 30 s.

The workload holds about **0.24 cores** of background load for 92 s, and in the
middle of it four workers run for **10 s** against the same **1.00 core** quota.

What the 30 s poll reports, as deltas between its four samples:

| window | cores |
|---|---|
| 0 to 30 s | 0.24 |
| 30 to 60 s | **0.49** |
| 60 to 90 s | 0.24 |

What the 1 ms samples show in the same run: the group is pinned exactly on its
quota for ten seconds, **101 of its periods are throttled**, and inside each of
those periods the four workers sprint at four cores and are then frozen for the
rest of it.

Neither is wrong. The coarse poll reports a true thirty second average, and a
peak of half a core against a one core limit is not a number anyone
investigates. The resolution is what decides whether the ten seconds exist.

The same file feeds both CPU charts: the motivation slide plots all ninety
seconds at both intervals, and the results slide zooms into one second in the
middle of the burst.

### `memory.csv`, `--memory=512m`, page cache and then an anonymous climb

One run, deliberately, because the deck plots it twice: once on the motivation
slide as a job that gets killed, and once in the results with the rest of the
same run faded in underneath.

- `0.4 s` to `0.6 s`: page cache fills, `memory.current` **13 MB to 413 MB**.
- `0.6 s` to `2.1 s`: flat at **81%** of the limit. `anon` **25 MB**, `file`
  **388 MB**, `oom_kill` **0**. Nothing is at risk.
- `2.1 s` to `3.9 s`: `anon` climbs, the kernel reclaims the cache to pay for
  it, and `memory.current` sits pinned on **512 MB** the whole way.
- `3.94 s`: `oom_kill` **0 to 1**. The series ends there, because the cgroup
  stops existing.

The argument the chart makes is the flat stretch against the pinned stretch. A
single `memory.current` reading is the same in both, and it is safe in one and
fatal in the other; only the `anon` and `file` split separates them.

Swap is pinned to the memory limit (`--memory-swap=512m`). Docker's default is
twice the limit, and with swap available the climb stalls against the swap
device instead of ending in a kill.

### `waste.csv`, `--cpus=4 --memory=2g`, a part-time worker

- **0.235 cores** used of **4.00** reserved, which is **5.9%**.
- **75 MB** touched of **2048 MB** reserved, which is **3.7%**.
- `oom_kill` 0, no throttling at all.

Nothing fails here, which is exactly why it goes unnoticed. The job finishes,
and the unused reservation was unavailable to anything else for its whole run.
