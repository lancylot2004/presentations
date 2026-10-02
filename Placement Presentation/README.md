# Industrial Placement presentation (COMP70012)

Sli.dev deck for the Imperial DoC industrial placement talk. Target is about
11:00 of speaking, then 3:00 of questions. The spec allows 15:00 in total and
says the cutoff is strict, so the plan leaves a minute of slack.

`docs/` holds the two source documents: `70012_1_spec.pdf` (the assessment) and
`Placement_Reflection.pdf` (the executive summary the content is drawn from).
The talk is judged on presentation skills rather than technical merit, and the
spec requires an introduction to the company and team, the projects framed as
goals, problems and outcomes rather than mechanisms, and a close that puts the
lessons in the context of the degree.

```bash
pnpm dev        # http://localhost:3030
pnpm export     # see the note below before using this
```

## Presenting

Present from the dev server. `placement-presentation.pdf` is the USB fallback
and is not committed.

Slides 23–28 are backup slides. They are reachable by number and are in the
PDF; they are kept out of the table of contents with `hideInToc`, because
`hide` is an alias for `disabled` and would remove them from the deck entirely.

| Slide | Backup topic |
|---|---|
| 24 | Why not eBPF, perf or Nsight |
| 25 | Overhead and sampling limits |
| 26 | cgroup v1 against v2, rootless runtimes |
| 27 | Platform integration |
| 28 | Scoping decisions |

## Exporting

Use the flags below rather than a bare `slidev export`:

```bash
npx slidev export --per-slide --wait 2500 --timeout 180000 \
  --output placement-presentation.pdf
```

UnoCSS serves its generated stylesheet asynchronously in dev, and the exporter
otherwise captures pages before it has applied, producing a PDF with missing
icons and unstyled text. `--per-slide` plus the wait gives each slide its own
load. Check the result page by page; it has regressed silently before.

For the same reason, icons are imported as components
(`import IconBox from '~icons/lucide/box'`, or `<lucide-box />` in markdown)
rather than written as `i-lucide-*` classes. Components are real inline SVG in
the module graph and are always present when the page is captured. Note that
the component-name resolver strips punctuation around digits, so
`<lucide-grid-3x3 />` resolves to a non-existent `grid3x3` and 500s the slide.

## Chart data

Both result charts read measured CSVs from `data/`, imported with Vite's `?raw`
at build time. `data/README.md` records the exact commands, the runtime
versions, and what each run shows, read it before answering a question about
the graphs. To re-measure:

```bash
docker run --rm --cpus=1 --memory=512m \
  -v "$PWD/data:/out" -v "$PWD/data/scripts:/scripts:ro" \
  python:3.12-slim python3 /scripts/collect.py cpu /out/cpu.csv 30
```

## Checks

```bash
node scripts/test-chart.mjs   # chart helpers, and that the CSVs still back the slides
node scripts/timing.mjs       # per-slide budget and word ceiling at 130 wpm
node scripts/shot.mjs <dir> 12 "12?clicks=2"   # screenshot slides from the dev server
```

`timing.mjs` counts the words in the **draft** speaker notes. Those notes are
guidance and alternatives rather than a script, so `trim to fit` means there is
more material than time, not that the talk is over. The section sums are the
timing signal; `words@130` is the ceiling for the spoken version.

## Before presenting

- The memory slide's notes flag the "half of all memory allocated on one
  internal platform was never used" figure. It is the strongest number in the
  reflection and it is an internal one: get it signed off before saying it.
- Backup slide 25 still needs real per-source overhead numbers, or leave them
  out and say so.
- Notes are drafts throughout and written in the second person. Rewrite them in
  your own words.

## Interactive charts

The three time-series charts pan and zoom: drag or scroll sideways to pan,
wheel or pinch to zoom, and hover the memory chart to read off the exact anon
and file split under the pointer. The CPU motivation chart also toggles between
the 1 ms series, the coarse poll and both.

`components/useTimeView.ts` holds the shared behaviour and keeps each chart's
view in Slidev's shared state, so serving the deck with

```console
$ npx slidev --remote <password>
```

lets a phone or tablet on `/presenter` drive the charts on the projector as
well as the slides. Add `--tunnel` if the network blocks one client reaching
another.
