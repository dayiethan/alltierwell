# All Tier Well — Revised MVP Spec

## Product Summary
All Tier Well is a web app where Taylor Swift fans sign in with Google, build a song tier list, and compare their music taste with other users. The first release should focus on the simplest compelling loop: **make your tier list, get a public profile, and compare it with someone else’s**. This keeps the product fun and shareable without turning the first version into a full social platform.

## Core MVP Goal
The MVP should answer one question well:

**Can users quickly create a Taylor Swift tier list and enjoy comparing it with other people?**

If that works, later versions can add stronger social and ranking features.

## MVP Scope

### Included in MVP
1. **Google sign-in**
2. **Username onboarding**
3. **Song tier list builder**
4. **Public profile page**
5. **Comparison page**
6. **Basic profile stats**
7. **Save progress / partial completion**

### Explicitly Not in MVP
1. Follow system
2. Friends page
3. Username search directory
4. Head-to-head battles
5. Full within-tier ordering
6. Community-wide analytics beyond very basic summaries
7. Notifications, feeds, comments, or messaging

## Product Philosophy

### 1. Partial tier lists are valid
Users should **not** be expected to rank every song before getting value from the app. A user can rank 20 songs or 200 songs; both should feel acceptable. Progress should always be visible, and comparison should only rely on overlapping ranked songs.

### 2. Comparison is the core social mechanic
The first release should center on:
- building a taste profile
- sharing that profile
- comparing with someone else

This is more important than building a follow graph at launch. The compare experience is the fun payoff.

### 3. Keep interaction simple before making it fancy
For launch, prioritize a reliable and smooth ranking workflow over advanced UI behaviors.

## Tech Stack
- **Frontend:** Next.js
- **Styling:** Tailwind CSS
- **Database/Auth:** Supabase
- **OAuth:** Google via Supabase Auth
- **Hosting:** Vercel
- **Language:** TypeScript

## Revised Data Model

### `songs`
Fields:
- `id`
- `title`
- `album`
- `album_order`
- `track_number`
- `is_vault`

Use one canonical song list: album tracks plus deluxe/vault tracks, without remixes or features-only songs.

### `users`
Recommended fields:
- `id`
- `username`
- `display_name`
- `avatar_url`
- `created_at`
- `is_public` (default true)

Note: For MVP, all profiles default to public. No privacy toggle UI is needed yet — the column exists so it can be activated in a future release without a migration.

### `tier_entries`
Recommended fields:
- `user_id`
- `song_id`
- `tier`
- `updated_at`

Use a unique constraint or composite primary key on `(user_id, song_id)`.

### Removed from MVP tables
Do not build these yet:
- `follows`
- `battles`
- `song_ratings`

## Revised MVP Features

### 1. Authentication
Users sign in with Google through Supabase Auth.

Flow:
1. User lands on homepage
2. Clicks “Sign in with Google”
3. On first login, chooses a unique username
4. App creates or updates their user row
5. User is taken to their ranking page

Pages:
- `/` — landing page
- `/onboarding` — username setup
- `/rank` — ranking interface

### 2. Tier List Builder
This is the core feature and should be the most polished part of the app.

#### Ranking model
Users place songs into fixed tiers:
- S
- A
- B
- C
- D
- F

Songs can also remain **unranked**.

#### UX rules
- The song pool should be filterable by album
- Users should be able to rank songs gradually
- Progress should be shown clearly, such as `58 / 231 songs ranked`
- Auto-save should be enabled
- Users should be able to move songs between tiers and back to unranked

#### Interaction recommendation
For launch:
- **Use click-to-assign on both desktop and mobile**
- On mobile, keep a bottom-sheet or action-sheet assignment flow
- On desktop, add drag-and-drop later if desired

#### Visual design
- Show songs as compact chips or cards
- Include a subtle album color indicator
- Keep the overall UI clean and neutral
- Do not overcomplicate the color system initially

### 3. Public Profile Page
Each user should have a shareable public profile.

URL:
- `/user/[username]`

Profile content:
- display name
- avatar
- songs ranked count
- count per tier
- favorite album
- favorite era or album grouping summary
- visible tier list grouped by S/A/B/C/D/F
- button to compare with this user
- button to copy or share profile link
- edit button if viewing your own profile

#### Stats to include in MVP
Include:
- total songs ranked
- songs per tier
- favorite album
- favorite era

Eras map directly to albums (each album is its own era). No separate era grouping logic is needed — “favorite era” and “favorite album” use the same underlying calculation.

Do **not** include “most controversial pick” yet.

#### Rendering
Server-side rendering for public profiles is a good choice so shared links look nice.

### 4. Comparison View
This should be treated as a core feature, not an extra.

URLs:
- `/compare` — dedicated compare landing page where a signed-in user can enter or paste another username or profile URL to start a comparison
- `/compare/[username1]/[username2]` — the results page showing the actual comparison

Ways to access:
- "Compare" link in the main navigation (goes to `/compare`)
- "Compare" button on another user's profile page (goes directly to `/compare/[you]/[them]`)
- Sharing a `/compare/[username1]/[username2]` URL directly

#### Comparison logic
Only compare songs that **both users have ranked**.

Show:
- compatibility score
- number of shared ranked songs
- songs placed in the same tier
- biggest disagreements
- album-level alignment summary

#### Important display rule
Always show:
- **compatibility score**
- **shared songs count**

Example:
- `82% compatible across 94 shared songs`

## What Is Deferred to Phase 2

### Social features
- follow / unfollow
- followers / following pages
- username search directory

### Ranking refinement
- head-to-head battles
- Elo or seeded rating logic
- within-tier ordering
- ranked list view

## Revised Build Order
1. Project setup
2. Supabase auth
3. Username onboarding
4. Songs seed script
5. Tier list builder
6. Auto-save and progress tracking
7. Public profile page
8. Comparison page
9. Mobile polish and error handling
10. Deploy

Only after that:
11. Follow system
12. Search or discovery
13. Head-to-head battle mode

## Revised MVP Success Criteria
The MVP is successful if a new user can:
1. sign in with Google
2. choose a username
3. rank at least some songs easily
4. view a polished public profile
5. compare with another user
6. want to share the result

That is enough to validate the concept.

## Concise Revised Spec
> All Tier Well is a web app where Taylor Swift fans sign in with Google, create song tier lists, and compare their music taste with other users. The MVP should focus only on the core loop: authentication, username onboarding, a tier list builder with auto-save and partial progress, a public profile page, and a comparison page based on overlapping ranked songs. The app should treat incomplete rankings as normal, allow users to rank gradually, and compute simple profile stats such as songs ranked, songs per tier, and favorite album. Social features like follows, search, and feeds should be deferred until after launch, and ranking-refinement systems like head-to-head battles should be saved for Phase 2. The goal of the first version is to validate that users enjoy building a Swift taste profile and comparing it with others.
