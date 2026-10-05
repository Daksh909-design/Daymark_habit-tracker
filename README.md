# Daymark — Habit Tracker

A responsive habit tracker built with **HTML, CSS, and vanilla JavaScript** for the NSUT society recruitment task. Each habit can have 1–5 daily checkpoints. The app shows daily progress, a seven-day chart, and streaks.

## Features

- Create, edit, and delete habits with custom icons, colors, and checkpoints.
- Check off steps for today or a past day by using the date strip.
- See today's completion percentage, checkpoint count, and best active streak.
- Keep your data in the same browser with `localStorage`.
- Use the layout on phones, tablets, and desktops.
- Three editable example habits appear the first time you open the app.

## Run locally

Open `index.html` in a browser. No install, account, package manager, or build command is required. Internet access is only used for the optional Google Fonts; system fonts are the fallback.

## Project files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure, buttons, stats, form dialog, and script/style links. |
| `style.css` | Colors, spacing, typography, responsive layout, and interaction states. |
| `script.js` | Habit data, checkpoint actions, date logic, rendering, and browser storage. |
| `LEARN.md` | Beginner walkthrough and study path. |
| `.nojekyll` | Tells GitHub Pages to serve the static files directly. |

## How the data works

Each habit is an object with an `id`, `name`, `icon`, `color`, an array of checkpoints, and a `history` object. Each history key is a date such as `2026-10-05`; its value is an array of completed checkpoint IDs. Changing a checkpoint label keeps its ID, so completed history stays connected to that step.

The app saves the whole habits array under the key `daymark-habits-v1` in `localStorage`. That means data stays on that device and browser. A different browser or a cleared browser storage starts fresh. There is no online account or sync.
