# Updating the AIS Funder Bulletin

This doc is for anyone (human or AI agent) refreshing the funder bulletin at
https://manifund.org/ais-funder-bulletin. All content lives in one file:
`app/ais-funder-bulletin/page.tsx`. There is no database or CMS — edit the
file, open a PR, and merging deploys it.

## File map

- `LAST_UPDATED` (near the top) — display string like `'July 28, 2026'`.
  Bump it whenever you change any content.
- `AT_A_GLANCE: Row[]` — the summary table. Each row: `name`, `href`,
  `donated2025`, `grants2025`, `expected2026` (each a `Cell`), `fte`, and
  booleans `generalApps` / `openRfps` / `donations`.
- `NOTES` — the footnotes, rendered as an ordered list in the "Notes" section.
- `<Funder title="...">` sections — one collapsible profile per funder, each
  with the same nested-list structure: Website / Background / Thesis /
  By the numbers / Recent updates / Get involved.
- "Not included" section — funders deliberately excluded, with rationale.
- "Other resources" — external links.

## Gotchas

- **Footnote coupling:** a `Cell` is `{ v: string; n?: number }` where `n` is a
  **1-based index into `NOTES`** (rendered as `NOTES[n - 1]`). If you insert or
  remove a note, every later `n` in `AT_A_GLANCE` shifts — renumber them.
- **Duplicated note text:** each `NOTES` entry has both a JSX `node` (rendered
  in the Notes section) and a plain-text `text` (the hover tooltip on the
  superscript marker). Keep the two in sync when editing a note.
- **Conventions:** dollar figures are short strings like `'$400M'` / `'$1B'`;
  unknown values are `'—'`; always state years explicitly in prose (e.g.
  "in 2025", not "last year").

## Research checklist

For each funder, check their website (grants database / blog / careers page)
and search for news since `LAST_UPDATED`:

- Coefficient Giving — https://coefficientgiving.org/ (grants: https://coefficientgiving.org/funds)
(we look at only the Transformative AI and GCR Opportunities Funds)
- Longview Philanthropy — https://www.longview.org/
(see footnotes on how to estimate money moved to AI in 2026)
- OpenAI Foundation — https://openaifoundation.org/
- Macroscopic — https://macroscopic.org/
- Survival and Flourishing Fund (SFF) — https://survivalandflourishing.fund/
- Lightcone Commons — https://www.lightconecommons.com/
- Schmidt Sciences — https://www.schmidtsciences.org/focus-area-ai/
- AI Safety Tactical Opportunities Fund (AISTOF) — no website; search for news
- Manifund — https://manifund.org/
(you can get the exact funding numbers from https://manifund.org/about)
- BlueDot Impact — https://bluedot.org/
- Long-Term Future Fund (LTFF) — https://funds.effectivealtruism.org/funds/far-future

For each, look for changes to: donation/grant totals and expected giving,
staff count, whether general applications are open, open RFPs or calls for
proposals, notable recent grants or announcements ("Recent updates" bullets),
and job openings ("Get involved"). Also consider whether any funder in
"Not included" now belongs in the main list, or whether a significant new
funder has appeared.

Click all links to verify they still exist and say what is claimed.

If there are any time-sensitive opportunities on the page with a date in the past, use
the link or search them to confirm whether the deadline was extended, and either update
with a new deadline or delete.

Ensure any changes are consistently made in both the "at a glance" table and the funder
profiles if both apply.

## Editing rules

- Only change facts you can back with a citable source; put the source URL
  next to each change in the PR body.
- If you can't verify a figure, leave it alone. Never estimate or extrapolate
  numbers.
- Prefer small, conservative diffs — this page is a reference, not a blog.
- Update `LAST_UPDATED` if and only if you changed content.
- If nothing material has changed, make no edits and open no PR.

## Verification

`bun install && bun run build` must pass before opening a PR.
