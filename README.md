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

## Publish on GitHub and GitHub Pages

1. Sign in to [GitHub](https://github.com/) and create a **public** repository named `habit-tracker`. Leave “Add a README” unchecked because this project already includes one.
2. In the new repository, choose **Add file → Upload files**. Open the `habit-tracker` folder and upload its files so `index.html` is at the repository's top level, not nested inside another folder. Commit the upload.
3. Open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select `main`, select `/(root)`, then save.
4. After GitHub finishes deploying, the URL should be `https://YOUR-USERNAME.github.io/habit-tracker/`. Open it and test a checkpoint.
5. Submit both that live URL and `https://github.com/YOUR-USERNAME/habit-tracker` in the recruitment form.

If GitHub's upload screen does not show the hidden `.nojekyll` file, create it using **Add file → Create new file**, name it `.nojekyll`, and commit it. The site can usually still work without this file, but including it makes static publishing explicit.

### Git command alternative

Run these commands **inside this folder** after creating the empty repository on GitHub. Replace `YOUR-USERNAME` with your GitHub username.

```bash
git init
git add .
git commit -m "Build Daymark habit tracker"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/habit-tracker.git
git push -u origin main
```

Then complete step 3 above. Git may ask you to sign in through your browser. If you already initialized the folder, skip `git init`.

### Netlify alternative

At [Netlify Drop](https://app.netlify.com/drop), drag the entire `habit-tracker` folder into the drop area. Netlify will provide a live `netlify.app` URL. Keep the GitHub repository as the source-code link for submission. The GitHub Pages route above keeps both links tied to the same repo.

## Notes for your demo

Show the recruiter one habit from start to finish: create it, add two checkpoints, tick one, and explain that `localStorage` keeps it after refresh. Then show the date strip, seven-day chart, and responsive phone layout. See [LEARN.md](LEARN.md) for the code explanation.
