# Daymark — Habit Tracker

**Build better days, one checkpoint at a time.**

Daymark is a responsive habit tracker for turning daily goals into clear, achievable steps. It gives each habit its own checkpoints and keeps progress visible through a daily dashboard, streaks, and a seven-day activity chart.

## Features

- Create, edit, and delete habits with custom icons, colors, and up to five checkpoints.
- Mark checkpoints complete for today or revisit a previous day.
- Track daily completion, completed steps, and active streaks.
- Review the last seven days in a simple progress chart.
- Keep progress across refreshes with browser `localStorage`.
- Use the same interface on desktop and mobile screens.

## Built with

- HTML5 for the page structure and accessible form controls
- CSS3 for layout, styling, and responsive breakpoints
- Vanilla JavaScript for habit logic, rendering, and browser storage

No framework, package installation, or build process is required.

## Run locally

Download or clone the repository, then open `index.html` in a modern browser. Three example habits are provided on the first visit so the dashboard can be explored immediately; they can be edited or deleted.

## Project structure

```text
habit-tracker/
├── index.html    # Page structure and habit form
├── style.css     # Visual design and responsive layout
├── script.js     # Habit state, date logic, and interactions
└── .nojekyll     # Static publishing on GitHub Pages
```

## How it works

Each habit has a unique ID, a set of checkpoint IDs, and a history of completed checkpoints by date. When a checkpoint is toggled, Daymark updates the habit data, saves it to `localStorage`, and redraws the dashboard. Editing a checkpoint label keeps its ID, preserving its completion history.

Data is stored in the current browser on the current device. Daymark does not use accounts or cloud sync, so clearing site data will reset progress.

## Deployment

Daymark is a static site. To publish it with GitHub Pages, open the repository's **Settings → Pages**, choose **Deploy from a branch**, and select the `main` branch with `/(root)` as the folder. The repository root must contain `index.html`.

## License

No open-source license is granted. The source is available for viewing; all rights are reserved by the repository owner.
