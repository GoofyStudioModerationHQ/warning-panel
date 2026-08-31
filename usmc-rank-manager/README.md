# USMC Rank Manager

Public GitHub Pages frontend backed by a private Supabase database and Edge Function.

## Access model

- Guests: no sign-in; read-only roster and timers.
- HQ leadership: personal code; can add personnel and set ranks.
- Owner HQ: personal code; also controls timers, removals, and HQ codes.

The browser receives only the Supabase publishable key. Database tables have RLS enabled and no public policies; all mutations are checked inside `rank-api`.
