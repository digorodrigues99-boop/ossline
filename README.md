# Ossline 🥋

A training log and journal for Brazilian Jiu Jitsu athletes. Track your mat
time, drill history, sparring stats, and belt progression — all stored locally
in your browser (localStorage), no account needed.

## Features

- **Dashboard** — total sessions, mat hours, rounds, weekly streak, submissions
  landed vs. conceded, a 12-week training frequency chart, gi/no-gi split, and
  your most-drilled techniques.
- **Training log** — log each session with date, gi or no-gi, class type
  (class, open mat, private, drilling, competition, seminar), duration, rounds
  sparred, submission counts, techniques drilled, training partners, energy
  level, and free-form notes. Edit or delete past sessions.
- **Build Lab** — spend 25 skill points across four RPG-style trees
  (Takedowns & Wrestling, Top Game, Guard, Submissions — armbars, triangles,
  heel hooks, and more) and generate a character archetype for your build:
  class name, epithet, lore-style description, stat bars, strengths,
  weaknesses, and signature techniques. Archetypes come from a built-in
  engine by default; add an Anthropic API key in AI settings and they are
  written fresh by Claude for your exact point spread (the key is stored
  only in your browser and sent only to Anthropic). Save, reload, and
  compare builds.
- **Journal** — dated entries with a title, mood, and free-form reflection.
- **Profile** — name, academy, weekly training goal, current belt and stripes
  (with a rendered belt graphic), and a full promotion history timeline.

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # typecheck + production build
npm run lint     # oxlint
```

Built with React 19, TypeScript, and Vite. All data persists in
`localStorage` under the `ossline:` key prefix.
