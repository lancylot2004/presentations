// Timing pass: per-slide budget against the plan, and how many spoken words
// each slide affords at 130 wpm.  Run: node scripts/timing.mjs
import { load } from '@slidev/parser/fs'

const WPM = 130

// Budgets from the deck plan in CLAUDE.md, in seconds.
const PLAN = [
  ['Title', 15],
  ['1, Squarepoint and team', 105],
  ['2, Problem and constraints', 120],
  ['3, The work', 135],
  ['4, Results', 150],
  ['5, Learnings', 135],
]

const deck = await load(process.cwd(), `${process.cwd()}/slides.md`)

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`

// Strip the note's own meta-instructions before counting: lines that are
// stage directions to the presenter, not words that get said out loud.
const spokenWords = (note) =>
  (note ?? '')
    .split('\n')
    .filter((l) => !/^\s*(DRAFT NOTES|TODO for you|\d{2}\s)/.test(l))
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length

let group = -1
const rows = deck.slides.map((s, i) => {
  const isSection = s.frontmatter.layout === 'section'
  const backup = s.frontmatter.hideInToc === true
  if (i === 0) group = 0
  else if (isSection && !backup) group += 1
  const m = /target\s+(\d+):(\d{2})/.exec(s.note ?? '')
  return {
    n: i + 1,
    title: (s.title ?? '(untitled)').slice(0, 34),
    group: backup ? -1 : group,
    target: m ? Number(m[1]) * 60 + Number(m[2]) : 0,
    words: spokenWords(s.note),
    backup,
  }
})

console.log('  #  slide                                budget   words@130   note   note vs budget')
for (const r of rows) {
  const budget = r.target ? r.words / WPM * 60 : 0
  const allow = Math.round((r.target / 60) * WPM)
  let status = ''
  if (r.backup) status = 'backup'
  else if (!r.target) status = 'marker'
  // These compare the DRAFT NOTE against the budget, not the talk against the
  // clock: the notes carry reference material and alternatives, so a long note
  // means there is more to cut from than time to say it.
  else if (budget > r.target * 1.15) status = `trim to fit (note is ${fmt(budget)})`
  else if (budget < r.target * 0.6) status = 'under-scripted'
  else status = 'about right'
  console.log(
    `${String(r.n).padStart(3)}  ${r.title.padEnd(36)}` +
    `${(r.target ? fmt(r.target) : ', ').padStart(6)}` +
    `${(r.target ? String(allow) : ', ').padStart(11)}` +
    `${String(r.words).padStart(8)}   ${status}`,
  )
}

console.log('\nsection                          planned   sum of slide targets')
let total = 0
PLAN.forEach(([name, planned], g) => {
  const sum = rows.filter((r) => r.group === g).reduce((a, r) => a + r.target, 0)
  total += sum
  const flag = Math.abs(sum - planned) > 15 ? `  <- off by ${fmt(Math.abs(sum - planned))}` : ''
  console.log(`${name.padEnd(32)}${fmt(planned).padStart(7)}${fmt(sum).padStart(10)}${flag}`)
})
console.log(`${'TOTAL'.padEnd(32)}${fmt(PLAN.reduce((a, [, p]) => a + p, 0)).padStart(7)}${fmt(total).padStart(10)}`)
console.log(`\nThe section sums are the timing signal. The per-slide column compares the`)
console.log(`DRAFT NOTES against the budget: those notes are guidance and options, not a`)
console.log(`script, so "trim to fit" means there is more material than time, which is the`)
console.log(`right problem to have. words@130 is the ceiling for the spoken version.`)
console.log(`\nSpec: 15:00 total including 3:00 of questions, strictly enforced.`)
console.log(`The plan targets about 11:00 to leave room.`)
