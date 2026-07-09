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
