#!/usr/bin/env python3
"""Sample another container's cgroup v2 files, by default at 1 ms.

Runs in a *sidecar* container, not in the container being measured. That
matters: a sampler polling at 1 kHz burns real CPU, and inside the target it
would be charged to the same cgroup and show up in the very usage figure it is
supposed to be reporting. The sidecar gets its own cgroup, so the target's
numbers are only the workload.

    docker run --rm --cgroupns=host -v /sys/fs/cgroup:/hostcg:ro ... \
        python3 sample.py /hostcg/docker/<id> out.csv 12

Nothing here is smoothed or derived; the CSV holds the raw counters and a
monotonic timestamp, and the charts do the arithmetic.
"""
from __future__ import annotations

import csv
import os
import sys
import time

INTERVAL_NS = 1_000_000  # 1 ms, unless --interval-ms says otherwise

# The last 2 ms before every deadline are spun, never slept. Measured inside
# this container, time.sleep(200us) overshoots by a median of 2.8 ms, so a
# sleep anywhere near the deadline destroys a 1 ms cadence outright; the four
# reads together cost about 3.4 us. Spinning burns a core, which is affordable
# exactly because the sampler is a sidecar: that core is charged to the
# sampler's own cgroup, not to the workload being measured. At a 1 ms interval
# the whole wait is inside the spin budget and the loop never sleeps at all;
# at a coarse interval it sleeps through the bulk and spins only the tail,
# because holding a core for thirty seconds to land one sample is absurd.
SPIN_NS = 2_000_000

FIELDS = [
    "t_ns",
    "usage_usec",
    "nr_periods",
    "nr_throttled",
    "throttled_usec",
    "memory_current",
    "anon",
    "file",
    "oom_kill",
    "oom_group_kill",
]


def read_at(fd: int) -> bytes:
    """Re-read an already-open sysfs file from offset 0."""
    return os.pread(fd, 4096, 0)


def kv(buf: bytes, key: bytes) -> int:
    """Pull one `key value` pair out of a flat cgroup file. -1 if absent."""
    i = buf.find(key)
    if i < 0:
        return -1
    j = i + len(key)
    end = buf.find(b"\n", j)
    return int(buf[j:end if end >= 0 else len(buf)])


def single(buf: bytes) -> int:
    """A single-value file. `max` (no limit) becomes -1."""
    s = buf.strip()
    return -1 if s == b"max" else int(s)


def main() -> int:
    cg, out, seconds = sys.argv[1], sys.argv[2], float(sys.argv[3])
    want_mem = "--mem-detail" in sys.argv
    interval_ns = INTERVAL_NS
    if "--interval-ms" in sys.argv:
        interval_ns = int(float(sys.argv[sys.argv.index("--interval-ms") + 1]) * 1e6)

    paths = {
        "cpu": f"{cg}/cpu.stat",
        "mem_cur": f"{cg}/memory.current",
        "mem_ev": f"{cg}/memory.events",
    }
    if want_mem:
        paths["mem_stat"] = f"{cg}/memory.stat"

    fds = {k: os.open(p, os.O_RDONLY) for k, p in paths.items()}

    # Limits are fixed for the run, so they go in a sidecar file rather than
    # being repeated on all ten thousand rows.
    with open(f"{cg}/cpu.max", "rb") as fh:
        quota_raw, period_raw = fh.read().split()
    with open(f"{cg}/memory.max", "rb") as fh:
        mem_max = single(fh.read())
    meta = {
        "cpu_quota_usec": -1 if quota_raw == b"max" else int(quota_raw),
        "cpu_period_usec": int(period_raw),
        "memory_max": mem_max,
        "interval_ns": interval_ns,
    }

    rows: list[tuple] = []
    append = rows.append
    clock = time.monotonic_ns

    t0 = clock()
    end = t0 + int(seconds * 1e9)
    died = False
    k = 0

    while True:
        # Absolute grid, so timing error cannot accumulate. A missed tick steps
        # to the next future slot instead of firing back-to-back to catch up,
        # which would show up as a burst of sub-millisecond gaps.
        target = t0 + k * interval_ns
        now = clock()
        # k == 0 is due immediately; catching it up would throw away the
        # baseline sample, which a coarse interval cannot afford to lose.
        if now > target and k > 0:
            k = (now - t0) // interval_ns + 1
            target = t0 + k * interval_ns
        k += 1
        while True:
            left = target - clock()
            if left <= 0:
                break
            if left > SPIN_NS:
                time.sleep((left - SPIN_NS) / 1e9)

        now = clock()
        if now >= end:
            break
        try:
            cpu = read_at(fds["cpu"])
            mem_cur = single(read_at(fds["mem_cur"]))
            ev = read_at(fds["mem_ev"])
            anon = fil = -1
            if want_mem:
                ms = read_at(fds["mem_stat"])
                anon, fil = kv(ms, b"anon "), kv(ms, b"file ")
        except OSError:
            # The cgroup went away: the workload was killed or exited.
            died = True
            break

        append((
            now - t0,
            kv(cpu, b"usage_usec "),
            kv(cpu, b"nr_periods "),
            kv(cpu, b"nr_throttled "),
            kv(cpu, b"throttled_usec "),
            mem_cur,
            anon,
            fil,
            kv(ev, b"oom_kill "),
            kv(ev, b"oom_group_kill "),
        ))

    for fd in fds.values():
        os.close(fd)

    with open(out, "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(FIELDS)
        w.writerows(rows)
    with open(out.replace(".csv", ".meta.csv"), "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(list(meta) + ["rows", "cgroup_vanished"])
        w.writerow(list(meta.values()) + [len(rows), int(died)])

    # Achieved cadence, so the write-up can state it rather than assume it.
    if len(rows) > 1:
        gaps = [rows[i + 1][0] - rows[i][0] for i in range(len(rows) - 1)]
        mean = sum(gaps) / len(gaps)
        gaps.sort()
        span = rows[-1][0] / 1e9
        print(
            f"{out}: {len(rows)} samples over {span:.2f}s, "
            f"mean {mean / 1e6:.4f}ms, median {gaps[len(gaps) // 2] / 1e6:.4f}ms, "
            f"p99 {gaps[int(len(gaps) * 0.99)] / 1e6:.4f}ms, "
            f"max {gaps[-1] / 1e6:.3f}ms, vanished={died}"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
