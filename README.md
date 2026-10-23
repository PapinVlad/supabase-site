# Supabase · COMP10020 Coursework 1 · Group B

Learning site for our Supabase presentation: reference guide, one-hour tutorial, cheat sheet, slides with notes and references.

**Website:** https://papinvlad.github.io/supabase-site/

## What is here

| Path | Contents |
|---|---|
| `index.html` | Home page |
| `guide.html` | Reference notes: platform, PostgreSQL and the Data API, Auth and RLS, Realtime, evaluation |
| `tutorial.html` | One-hour lab: build a live task board from a new Supabase project |
| `cheatsheet.html` | One printable page of SQL, supabase-js calls, keys and error codes |
| `slides.html`, `slides/` | The presentation, slide by slide with speaker notes, plus a PDF |
| `references.html` | All sources (Harvard style) |
| `tutorial/solution/` | Finished tutorial code |
| `app/` | The example app used in the presentation |
| `assets/` | Shared CSS and JavaScript |

The site is plain HTML, CSS and JavaScript with no build step. GitHub Pages serves it from the root of `main`.

## Running the example code

Both `app/` and `tutorial/solution/` need your own Supabase project. Copy `config.example.js` to `config.js`, paste your project URL and **publishable** key, and serve the folder with `python3 -m http.server 8000`. Never commit `config.js`, passwords, or a secret / service_role key.

## Team

Vladyslav Papin · [Name 2] · [Name 3] · Stanley Khumalo · [Name 5]

COMP10020 Internet Technologies, University of the West of Scotland, 2026.
