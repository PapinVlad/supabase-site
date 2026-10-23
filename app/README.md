# Example app (as shown in the presentation)

The "Supabase Live Lab" our group used for the screenshots and the recorded demo.
It is a slightly larger version of what you build in the [tutorial](../tutorial.html):
the same tables and policies, plus extra handling for several open tabs.

## Files

| File | Purpose |
|---|---|
| `setup.sql` | Tables, constraints, grants, RLS policies and two seed projects. Run once in a new project. |
| `enable_realtime.sql` | Adds `demo_tasks` to the `supabase_realtime` publication. Safe to run again. |
| `config.example.js` | Copy to `config.js` and add your project URL and **publishable** key. |
| `index.html`, `app.js` | The page. supabase-js is pinned to 2.117.2. |

## Run it

1. Create a new Supabase project and run `setup.sql`, then `enable_realtime.sql`, in the SQL Editor.
2. Create two confirmed test users in Authentication → Users, and turn off "Allow new users to sign up".
3. Copy `config.example.js` to `config.js` and fill in both values.
4. Serve this folder: `python3 -m http.server 8000`, then open http://localhost:8000.

Never commit `config.js`, passwords or a secret key.

## Scope

Realtime listens for INSERT only; edits or deletes made in the dashboard need "Refresh tasks".
The page has no edit or delete controls, and there is no UPDATE or DELETE grant.
