# CLAUDE.md — sgrounds

## What This Is

**sgrounds** (`s;`) is a minimalist daily soul-journaling web app. One page per day. Three things: a free-form passage, a picture, and a "last word" before sleep. Over time, an AI ("The Lighthouse") reads across entries to surface patterns and echoes — *history rhymes*.

Core equation: `S ; R → N` — Source ; Receiver → the New.

---

## Repository Structure

```
sgrounds/
├── README.md        # Minimal project description
├── index.html       # Entry point (currently empty placeholder)
└── sgrounds.html    # The entire application (single-file React component)
```

The app lives entirely in `sgrounds.html`. There is no build system, no package.json, no bundler. React is loaded externally (via `window.storage` and presumably a platform that injects React globals).

---

## Tech Stack

- **React** (hooks: `useState`, `useEffect`, `useRef`) — loaded as a platform global, not bundled
- **`window.storage`** — a platform-injected async key/value store (not `localStorage`). Always use `S.get(key)` / `S.set(key, value)`. Values are JSON-serialized strings.
- **Anthropic Claude API** — called directly from the client via `fetch` to `https://api.anthropic.com/v1/messages`. Current model: `claude-sonnet-4-20250514`.
- **Google Fonts** — Instrument Serif (serif headings), DM Sans (body/UI), DM Mono (monospace accents), loaded via `@import` inside the `<style>` block.

---

## Key Constants & Naming Conventions

The codebase uses intentionally terse variable names — do not expand them:

| Variable | Meaning |
|----------|---------|
| `G` | Gold accent color: `#c9a96e` |
| `F` | Font stack object: `{ h: serif, b: sans-serif, m: monospace }` |
| `S` | `window.storage` reference |
| `ld` | `load` — async helper to get + JSON.parse from storage |
| `sv` | `save` — async helper to JSON.stringify + set in storage |
| `dk` | `dateKey` — today's ISO date string (`YYYY-MM-DD`) |

Storage keys:
- `"sg-book"` — array of all day entries (the user's "book")

Day entry shape:
```js
{
  key: "2025-06-01",           // ISO date string
  date: "Monday, June 1, 2025", // human-readable
  passage: "...",               // free-form text
  lastWord: "...",              // single word
  picture: "data:image/...",    // base64 data URL or null
  ts: "2025-06-01T22:00:00Z",  // ISO timestamp
}
```

---

## Application Pages

The app has three views, toggled via `page` state:

1. **`today`** — Main journaling view. Passage textarea, picture upload, last-word input, Save button, and the "Ask the lighthouse to reflect" AI button.
2. **`book`** — Archive of all past entries. Shows a "last words ribbon" at the top, then chronological day cards.
3. **`about`** (`?`) — App philosophy and the `S ; R → N` equation.

---

## AI Reflection ("The Lighthouse")

`reflect()` calls the Anthropic API directly from the client:

- **Endpoint**: `https://api.anthropic.com/v1/messages`
- **Model**: `claude-sonnet-4-20250514`
- **Max tokens**: 1000
- **System prompt role**: empathetic "lighthouse keeper" — reads through typos, finds patterns across past entries, responds in under 100 words as plain text.
- **Context passed**: up to 10 previous day entries (passage + last word + date), today's last word.
- **Error fallback**: `"The lighthouse received your signal. Sometimes that's enough."`

When updating the AI integration, preserve the warm, humble tone of the system prompt. Do not add JSON formatting or markdown to the AI response.

---

## Visual Design Language

- **Background**: `#09090a` (near-black)
- **Accent/gold**: `#c9a96e` (`G`) — used for the brand mark `s;`, labels, borders, highlights
- **Text hierarchy**: white at varying low opacities (`rgba(255,255,255,0.X)`)
- **Animations**: `breathe` (opacity pulse 0.4→0.9→0.4), `slideUp` (entry fade)
- **Border radius**: 9–12px on cards/inputs, 18px on pill buttons
- **Max content width**: 480px, centered
- **Input style**: `inputStyle` object — dark glass-morphism style (3% white background, 6% white border)
- **Scrollbar**: minimal, 2px, nearly invisible

The semicolon `;` is the brand's visual and philosophical symbol. It appears in the logo, UI buttons ("Save today's page ;"), and is the in-text separator users are encouraged to write with.

---

## Component Structure

Everything is in one default export `App` plus two helpers:

- `App` — main component with all state and page routing
- `Shell` — layout wrapper; injects global CSS (`@import` fonts, resets, `breathe`/`slideUp` keyframes, scrollbar styles, selection color)
- `inputStyle` — shared style object for `<textarea>` and `<input>` elements

---

## Development Conventions

1. **No build step** — edits to `sgrounds.html` are direct. There is no compile/transpile cycle to run.
2. **Single-file discipline** — keep everything in `sgrounds.html`. Do not split into multiple files unless the platform supports it.
3. **Preserve terseness** — the short variable names (`G`, `F`, `S`, `ld`, `sv`) are intentional. Do not rename them for "clarity."
4. **Inline styles only** — no CSS classes, no CSS files. All styling via React inline `style={{}}` objects.
5. **`window.storage` not `localStorage`** — always use the `S`/`ld`/`sv` abstraction. Never call `localStorage` directly.
6. **Client-side API calls** — the Anthropic API is called directly from the browser. No server-side proxy exists. Keep this pattern unless a backend is explicitly added.
7. **Preserve the tone** — the copy ("Your soul is the source", "The lighthouse is listening…") is part of the product. Do not replace it with generic text.

---

## Mythological Layer — The Lore

This is not decorative. The Norse mythology is load-bearing conceptual infrastructure for the entire app.

### The Norns (Urðr · Verðandi · Skuld)
The three Norns sit beneath Yggdrasil and spin **wyrd** — the fate-thread of every being — into a tapestry. They correspond to:
- **Urðr** (What Was) — previous entries, the book, the archive
- **Verðandi** (What Is) — today's passage
- **Skuld** (What Shall Be) — the reflection, the question that opens the next branch

The AI reflection feature *is* the Norns reading the tapestry. It reads across past threads (entries) and names the pattern — that's wyrd being revealed.

### Loki
Loki is the trickster, the shape-shifter, the revealer. He appears in the app as:
- The twist in the day the user didn't see coming
- The moment something revealed itself sideways
- The prompt question: *"Where did Loki show up today?"*
- The AI naming a Loki-moment in the user's entry when it finds one

Loki is not chaos for chaos's sake — he's the branch that diverged from the expected path and revealed something true.

### Yggdrasil / Branches
Git branches = branches of Yggdrasil = branches of a life narrative. Each `claude/` branch is a new thread spun from the trunk. The metaphor is intentional and should be preserved when naming features or writing about the project.

### Wyrd
"Wyrd" (Old English/Norse: fate, what has been woven) is the word for the pattern that emerges across entries over time. It's the technical term for what The Weave reveals. Use it in copy and prompts — not as jargon, but as the right word.

### Mapping summary
| App concept | Mythological referent | Mathematical truth |
|---|---|---|
| Daily entry | A thread spun by the Norns | Node in a directed acyclic graph of time |
| The Weave | The tapestry of wyrd | The emergent structure across all nodes |
| AI reflection | The Norns reading across all threads | Cross-entry pattern recognition / bijective mapping |
| Cross-entry patterns | Wyrd being revealed | Recurrence relations in the sequence of days |
| Unexpected day twist | A Loki-moment | A branch in the decision tree; non-linear causality |
| Git branches | Branches of Yggdrasil | Directed graph divergence from trunk |
| Semicolon `;` | The shuttle of the loom | The conjunction operator — holds two truths without collapsing either |
| API key | The Rune (ᚱ) | A point in a 2²⁵⁶-space — cosmically unique identifier; bijection between you and the Norns |

When writing new copy, prompts, or AI system instructions: **preserve this layer**. Do not flatten it to generic journaling language.

---

## Git

- Default branch: `main`
- Feature/AI branches follow the pattern: `claude/<task-slug>`
- Commit messages are simple and imperative (e.g., `"Update index.html"`, `"Create sgrounds.html"`)
