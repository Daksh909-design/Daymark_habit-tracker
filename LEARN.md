# Learn Daymark from zero

This guide starts with the three languages used in the project, then follows one click from the screen to storage. Read it beside the actual files. Change small things and refresh the browser after each change.

## 1. How a web page works

A browser reads **HTML** to create a document tree, applies **CSS** to decide how it looks, and runs **JavaScript** to respond to actions. In this project:

```html
<link rel="stylesheet" href="style.css">
<script src="script.js" defer></script>
```

The first line loads the CSS. The second loads JavaScript. `defer` tells the browser to run the script after the HTML is parsed, so our code can find the buttons and form that appear later in the file.

Open `index.html` first. It has the structure: sidebar, header, welcome panel, statistic cards, habit list, chart, footer, and a `<dialog>` containing the habit form. The empty `<div id="habit-list">` is filled by JavaScript.

## 2. HTML fundamentals

An **element** is written with tags: `<h1>Hello</h1>`. `h1` is a heading. Most elements have an opening tag, content, and a closing tag. An **attribute** adds information, such as `id="habit-list"` or `type="button"`.

Useful elements here:

| Element | What it means |
| --- | --- |
| `<main>` | The page's main content. |
| `<section>` | A themed part of the page. |
| `<h1>`, `<h2>`, `<h3>` | Headings in descending order. |
| `<button>` | An action you can click or activate with a keyboard. |
| `<form>` | A group of inputs submitted together. |
| `<label>` | Text that describes an input; its `for` matches the input's `id`. |
| `<input>` | A place for the user to type. |
| `<select>` | A dropdown menu. |
| `<dialog>` | A built-in modal window. |

**Why not use a `<div>` for every click?** A real button already supports keyboard focus and the Enter/Space keys. Semantic elements make the page easier to understand for people and assistive technology.

Try this: change the main heading in `index.html`, save, and refresh. Then find the `id` of the number shown in the first stat card. JavaScript uses that exact `id` to update the number.

## 3. CSS fundamentals

A CSS rule has a **selector** and a group of **declarations**:

```css
.primary-button {
  background: #272724;
  color: white;
  border-radius: 11px;
}
```

`.primary-button` selects elements with that class. Each declaration is a property and a value. The browser combines rules from top to bottom. A more specific selector can override a less specific one.

At the top of `style.css`, `:root` defines reusable **custom properties** (variables). For example, `--orange` stores the accent color. `var(--orange)` uses it in a later rule. Change that value once to update many parts of the site.

The dashboard uses two main layout tools:

- **Flexbox** arranges items along one direction. `.app-shell` places the sidebar next to the main area; `.habit-top` aligns the icon, title, progress, and menu.
- **Grid** makes rows and columns. `.stats-grid` creates three statistic columns and `.date-list` makes seven equal day columns.

`padding` is space *inside* an element. `margin` is space *outside* it. `border` outlines it. `border-radius` rounds its corners. `width`, `height`, and `max-width` control size. `box-sizing: border-box` makes width calculations include padding and borders, which simplifies layout.

At the end of `style.css`, `@media` rules change the design at narrower screen widths. For example, the sidebar becomes a compact top navigation on phones. This is **responsive design**: one site adapts to different screens.

Try this: change `--bg`, then reduce your browser width. Find the `@media(max-width:520px)` rule and change one mobile padding value. Inspect the result.

## 4. JavaScript fundamentals

JavaScript uses **variables** to remember values:

```js
const STORAGE_KEY = 'daymark-habits-v1';
let selectedDate = new Date(today);
```

`const` means the variable binding will not be reassigned. `let` allows reassignment. Strings are text, numbers are numeric values, booleans are `true` or `false`, arrays are ordered lists, and objects group named values.

An example object in this app looks like:

```js
{
  id: 'unique-habit-id',
  name: 'Read a little',
  icon: '📚',
  color: 'purple',
  checkpoints: [
    { id: 'step-1', label: 'Read 10 pages' },
    { id: 'step-2', label: 'Write down one idea' }
  ],
  history: {
    '2026-10-05': ['step-1']
  }
}
```

The `history` entry says that on October 5, the first step was completed. IDs distinguish two steps even if they have the same label. They also let a step keep its completed history when its text changes.

A **function** is a named piece of reusable code. It can receive inputs and return an output:

```js
function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

The browser's `Date` uses month numbers starting at zero, so we add 1. `padStart` makes `5` become `05`. The template literal (backticks with `${...}`) combines values into one string. Using the local date parts avoids accidental day changes from UTC conversion.

Other syntax to notice: `if` makes a decision; `for` and `forEach` repeat work; `map` transforms an array; `filter` keeps matching entries; `reduce` combines entries into one result. The `? :` operator chooses between two values. `?.` safely accesses a value that might not exist.

## 5. Follow one checkpoint click

The program starts at the bottom of `script.js`, where event listeners are attached and `render()` is called. An **event listener** waits for something like a click or form submission.

`renderHabits()` creates each habit card using `document.createElement()`. It also creates each checkpoint button and attaches this listener:

```js
button.addEventListener('click', () => toggleCheckpoint(habit.id, step.id));
```

When you click:

1. `toggleCheckpoint()` finds the habit by ID.
2. It gets the selected date's completed step IDs.
3. If the clicked step is already present, `filter()` removes it. Otherwise, `[...done, stepId]` creates an array with the new ID added.
4. `saveHabits()` turns the habits array into a JSON string and puts it in `localStorage`.
5. `render()` updates the cards, stats, date strip, and chart from the new data.

That is the central pattern of the app: **user action → update data → save data → redraw screen**.

## 6. The browser storage calls

```js
localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
```

`localStorage` only stores strings. `JSON.stringify()` converts JavaScript data to a string, and `JSON.parse()` converts it back. `try`/`catch` around storage means the app can recover if storage is blocked or contains bad JSON. This storage is local to the browser and website origin. It is not a database, account system, or cloud sync.

To inspect it in Chrome or Edge: open the site, press **F12**, select **Application**, then **Local Storage**, then the site's origin. The key is `daymark-habits-v1`. Do not clear it unless you want to reset your data.

## 7. How each feature is implemented

| Feature | Main code |
| --- | --- |
| Add habit | `openDialog()` opens the form; its `submit` listener reads inputs and pushes a new habit. |
| Edit habit | `openDialog(id)` fills the form; submit updates the matching habit. |
| Delete habit | The card menu asks for confirmation, filters the habit out, then saves. |
| Select day | `renderDates()` creates seven day buttons; clicking one updates `selectedDate`. |
| Previous/next week | Arrow listeners change `weekOffset` and choose a visible date. |
| Today's stats | `progressFor(today)` counts finished and total checkpoints; `renderStats()` writes the values. |
| Streak | `activeStreak()` walks backward one day at a time while every checkpoint was done. |
| Seven-day chart | `renderChart()` creates seven columns and sizes each bar from that day's percentage. |
| Responsive layout | The `@media` sections in `style.css`. |

## 8. Things to explain honestly in an interview

**Why plain HTML, CSS, and JS?** The task requested the basics, and this project has no server needs. It also makes every behavior easy to trace.

**Why `localStorage`?** It saves data across refreshes without needing a backend. The tradeoff is that data does not sync between devices and can disappear if browser data is cleared.

**How is a streak calculated?** A habit counts as complete for a day only when *all* its checkpoints are checked. If today is unfinished, the code starts checking from yesterday, because the current day is still in progress.

**How does editing preserve history?** Each checkpoint input carries its existing step ID in `data-step-id`. Saving keeps that ID even when the text changes. A new step gets a new ID.

**What would you improve next?** A backend and login for syncing, custom repeat schedules, export/import, stronger validation for data loaded from storage, and automated browser tests.

## 9. A path toward deeper mastery

Building one site is a good start; mastery comes from making changes without copying a solution. Work through these in order:

1. **HTML foundations:** elements, attributes, nesting, forms, labels, links, images, semantic landmarks, accessibility. Rebuild the welcome panel from a blank file.
2. **CSS foundations:** selectors, cascade, specificity, box model, colors, units, typography. Recreate one card without looking at `style.css`.
3. **Layout:** Flexbox, Grid, positioning, responsive media queries. Make the stats switch from three columns to one at a width you choose.
4. **JavaScript foundations:** variables, data types, operators, conditionals, loops, arrays, objects, functions, scope. Write a function that counts completed checkpoints without using `reduce`.
5. **Browser JavaScript:** DOM selection and creation, events, forms, validation, dates, `localStorage`, JSON. Add a “clear today” button yourself.
6. **More advanced JavaScript:** closures, modules, promises, `async`/`await`, `fetch`, error handling, testing. Split `script.js` into modules and build an export/import feature.
7. **Web quality:** keyboard use, screen readers, performance, browser DevTools, debugging, and deployment. Test every action using only a keyboard.

For practice, do not just read: predict what a line will do, change it, refresh, and compare the result. Use DevTools' **Console** to inspect `habits` and **Elements** to see how the HTML changes after a click.

### Small exercises with answers to check yourself

1. Change the site accent from orange to blue. **Hint:** start at `--orange` in `style.css`.
2. Add a “Music practice” icon option. **Hint:** add an `<option>` in `index.html`; the form already reads its value.
3. Make the chart show 14 days. **Hint:** change the loop in `renderChart()` and the grid columns in `.week-chart`.
4. Add a button that jumps back to today. **Hint:** set `selectedDate = new Date(today)`, `weekOffset = 0`, then call `render()`.
5. Explain why `saveHabits()` runs before `render()` in the checkpoint function. **Answer:** saving makes the new data survive a refresh; rendering then shows the new state immediately.

### Useful references

- [MDN: Learn web development](https://developer.mozilla.org/en-US/docs/Learn_web_development)
- [MDN: HTML](https://developer.mozilla.org/en-US/docs/Web/HTML)
- [MDN: CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [MDN: JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
