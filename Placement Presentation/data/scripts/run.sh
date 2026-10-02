#!/usr/bin/env bash
# Collect every dataset the deck plots. Run from the repository root:
#   bash data/scripts/run.sh
#
# Each scenario starts the workload in one container and samples it from a
# second one. The sampler needs --cgroupns=host and the host cgroupfs so it can
# read the target's cgroup from outside it; sampling from inside would charge
# the sampler's own CPU to the cgroup being measured.
set -euo pipefail

IMG=python:3.12-slim
OUT="$PWD/data"
SCRIPTS="$PWD/data/scripts"

run_scenario() {
  local name=$1 seconds=$2 load=$3 mem_detail=$4
  shift 4
  local cid
  cid=$(docker run -d --rm --cgroupns=host \
        -v "$SCRIPTS:/scripts:ro" "$@" \
        "$IMG" python3 /scripts/loads.py "$load" "$seconds")

  # Sample a little past the workload so the tail of the run is visible.
  docker run --rm --cgroupns=host \
    -v /sys/fs/cgroup:/hostcg:ro \
    -v "$SCRIPTS:/scripts:ro" -v "$OUT:/out" --cpus=2 \
    "$IMG" python3 /scripts/sample.py \
      "/hostcg/docker/$cid" "/out/$name.csv" "$(echo "$seconds + 1.5" | bc)" $mem_detail

  docker kill "$cid" >/dev/null 2>&1 || true
}

# Throttling, at two intervals at once. The point of this run is the contrast
# between what a coarse poll reports and what 1 ms sampling sees, so the two
# samplers have to watch the same workload over the same span.
spike() {
  local cid
  cid=$(docker run -d --rm --cgroupns=host -v "$SCRIPTS:/scripts:ro" \
        --cpus=1 --memory=512m "$IMG" python3 /scripts/loads.py spike 95)
  docker run -d --rm --cgroupns=host -v /sys/fs/cgroup:/hostcg:ro \
    -v "$SCRIPTS:/scripts:ro" -v "$OUT:/out" --cpus=2 \
    "$IMG" python3 /scripts/sample.py "/hostcg/docker/$cid" /out/spike.csv 92 >/dev/null
  docker run --rm --cgroupns=host -v /sys/fs/cgroup:/hostcg:ro \
    -v "$SCRIPTS:/scripts:ro" -v "$OUT:/out" --cpus=1 \
    "$IMG" python3 /scripts/sample.py "/hostcg/docker/$cid" /out/spike-coarse.csv 92 --interval-ms 30000
  docker kill "$cid" >/dev/null 2>&1 || true
}
spike

# Memory: page cache up to the limit, then an anonymous climb that kills it.
# One run, because the deck shows the same plot twice and reveals the split the
# second time. Swap is pinned to the memory limit so the kill is not deferred.
run_scenario memory 6 memory --mem-detail --memory=512m --memory-swap=512m --cpus=2

# Waste: a large reservation barely touched.
run_scenario waste 8 waste --mem-detail --cpus=4 --memory=2g

echo
echo "wrote:"
ls -la "$OUT"/*.csv
