#!/usr/bin/env python3
"""Synthetic workloads, run inside the container being measured.

One per failure mode on the problem slide. Standard library only, so the stock
python:3.12-slim image needs nothing installed.

    python3 loads.py throttle <seconds>
    python3 loads.py waste <seconds>
    python3 loads.py memory <seconds>
    python3 loads.py spike <seconds>
"""
from __future__ import annotations

import os
import sys
import time
from multiprocessing import Process


def spin(deadline: float) -> None:
    """CPU-bound: integer arithmetic, no syscalls, no sleeping."""
    x = 0
    while time.monotonic() < deadline:
        for _ in range(200_000):
            x = (x * 1_103_515_245 + 12_345) & 0x7FFFFFFF


def throttle(seconds: float) -> None:
    """Four workers against a one-core quota, so the cgroup is always throttled."""
    deadline = time.monotonic() + seconds
    procs = [Process(target=spin, args=(deadline,)) for _ in range(4)]
    for p in procs:
        p.start()
    for p in procs:
        p.join()


def waste(seconds: float) -> None:
    """Reserve a lot, use a little: one part-time worker and a small heap.

    This is the quiet failure. Nothing crashes, nothing is throttled, and the
    job finishes; the reservation was simply far larger than the need.
    """
    held = bytearray(64 * 1024 * 1024)
    for i in range(0, len(held), 4096):
        held[i] = 1

    deadline = time.monotonic() + seconds
    # ~25% of a single core, against whatever quota the container was given.
    while time.monotonic() < deadline:
        busy_until = time.monotonic() + 0.025
        x = 0
        while time.monotonic() < busy_until:
            for _ in range(20_000):
                x = (x * 1_103_515_245 + 12_345) & 0x7FFFFFFF
        time.sleep(0.075)
    del held


def memory(seconds: float) -> None:
    """One run that covers both readings of a memory graph.

    Phase one fills the limit with reclaimable page cache: memory.current runs
    up to memory.max with nothing whatsoever at risk. Phase two climbs the
    anonymous heap. The kernel hands the cache back as fast as it is asked for,
    so memory.current stays pinned on the limit the whole way and the single
    number never moves, even as the run goes from perfectly safe to dead. The
    kill lands when anon alone no longer fits.

    The opening sleep is a head start for the sampler, which starts a second
    container and so is always late; without it the cache is already built by
    the time the first sample lands and the climb is missing from the plot.
    """
    time.sleep(0.4)

    sink = "/tmp/cache-sink"
    os.makedirs(sink, exist_ok=True)
    chunk = os.urandom(8 * 1024 * 1024)

    files = []
    for n in range(6):  # 64 MB each, enough to run the cgroup up to its limit
        f = f"{sink}/blob{n}.bin"
        with open(f, "wb") as fh:
            for _ in range(8):
                fh.write(chunk)
            fh.flush()
            os.fsync(fh.fileno())
        files.append(f)

    deadline = time.monotonic() + seconds / 4
    while time.monotonic() < deadline:  # keep re-reading so the cache stays hot
        for f in files:
            with open(f, "rb") as fh:
                while fh.read(8 * 1024 * 1024):
                    pass
            if time.monotonic() >= deadline:
                break

    # The files stay on disk, so their cache is still charged here and has to be
    # reclaimed to make room for every step below. Being killed is the point.
    step = 8 * 1024 * 1024
    held = []
    while True:
        block = bytearray(step)
        for i in range(0, step, 4096):
            block[i] = 1
        held.append(block)
        time.sleep(0.03)


def duty(deadline: float, frac: float) -> None:
    """Burn a fixed fraction of one core until the deadline."""
    on = 0.02
    off = on * (1 - frac) / frac
    while time.monotonic() < deadline:
        busy_until = time.monotonic() + on
        x = 0
        while time.monotonic() < busy_until:
            for _ in range(20_000):
                x = (x * 1_103_515_245 + 12_345) & 0x7FFFFFFF
        time.sleep(off)


def spike(seconds: float) -> None:
    """A quiet job with one ten second burst in the middle.

    The background is about a quarter of a core, which is what a job nobody is
    worried about looks like. The burst puts four workers against the same one
    core quota, so the kernel throttles the group flat out for its whole
    duration. That contrast is the point: averaged over a coarse poll the burst
    is a mild bump well under the limit, and at 1 ms it is ten seconds of a job
    being repeatedly stopped.
    """
    time.sleep(0.5)
    end = time.monotonic() + seconds
    background = Process(target=duty, args=(end, 0.25))
    background.start()

    time.sleep(35.0)
    burst_end = time.monotonic() + 10.0
    workers = [Process(target=spin, args=(burst_end,)) for _ in range(4)]
    for p in workers:
        p.start()
    for p in workers:
        p.join()

    background.join()


def main() -> int:
    what = sys.argv[1]
    secs = float(sys.argv[2]) if len(sys.argv) > 2 else 10.0
    if what == "throttle":
        throttle(secs)
    elif what == "waste":
        waste(secs)
    elif what == "memory":
        memory(secs)
    elif what == "spike":
        spike(secs)
    else:
        print(f"unknown load {what!r}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
