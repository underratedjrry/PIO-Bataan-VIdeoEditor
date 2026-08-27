# PIO Bataan - VE PMIS

Project management for video editing tasks: create/track tasks by segment,
output type, priority, and due date; email notifications; CSV export;
data-driven performance insights; editorial approval workflow (Checked By);
a per-editor performance dashboard; a calendar Dashboard of deliverables by
due date; a per-user Weather Dashboard; and Admin/Editor/Viewer roles.

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind CSS 4)
- Supabase (Postgres, Auth, Row-Level Security)
- Resend (email notifications)
- Vercel Cron (daily due/overdue digest)
- Open-Meteo (weather data + geocoding, no API key required)

## 1. Create the Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run these migrations **in order**:
   `0001_init.sql`, `0002_editorial_workflow.sql`, `0003_user_management.sql`,
   `0004_output_link.sql`, `0005_checked_by_writer.sql`,
   `0006_task_timing.sql`, `0007_segments_lookup.sql`, `0008_lookup_colors.sql`,
   `0009_sheet_sync_tracking.sql`, `0010_weather_location.sql`, then
   `0011_short_links.sql` (all under `supabase/migrations/`). Together
   these create all tables, RLS policies,
   seed data (default Output Types and Segments), and a trigger that
   auto-provisions a `profiles` row on signup - **the first user to sign up
   becomes `admin`**, everyone after that defaults to `editor`.
3. In **Authentication -> Providers -> Email**, disable "Confirm email" for
   the simplest local/demo flow (or leave it on and users will be prompted
   to confirm before their first sign-in).
4. Copy the Project URL, anon key, and service_role key from
   **Project Settings -> API**.

## 2. Create a Resend account

1. Sign up at [resend.com](https://resend.com) and create an API key.
2. Verify a sending domain (or use their `onboarding@resend.dev` test
   address for local development - it only delivers to your own verified
   account email).
3. On Vercel, Resend is also available as a native Marketplace integration
   if you'd rather provision it from the Vercel dashboard.
4. Email is optional - if you skip `RESEND_API_KEY`, the app still works,
   it just logs a warning instead of sending.

## 3b. (Optional) Set up Google Sheets sync

Automatically logs work into the "PIO Daily Accomplishments" Google Sheet,
on the tab matching the assignee's (or creator's, if unassigned) full name:

- **On task creation**, only if a **start date** was set - logged under
  that start date.
- **On a segment change** (e.g. Rough Cut -> Fine Cut), logged under
  today's date - but at most once per PH calendar day per task, so
  re-editing the segment (or anything else) again later the same day
  doesn't add a duplicate row. Editing tomorrow (or any later day) logs
  again.

1. Open the target spreadsheet -> **Extensions > Apps Script**.
2. Paste in the contents of `scripts/google-apps-script.js` (this repo),
   replacing any starter code.
3. Set `SHARED_SECRET` in that script to a random string
   (e.g. `openssl rand -hex 32`) - this becomes `GOOGLE_SHEETS_WEBHOOK_SECRET`.
4. **Deploy > New deployment**, type "Web app", execute as **Me**, access
   **Anyone**. Copy the Web app URL into `GOOGLE_SHEETS_WEBHOOK_URL`.
5. Whenever the script is edited, create a **new deployment version**
   (Deploy > Manage deployments > edit > New version) - saving alone
   doesn't republish it.

Each user's `full_name` in Settings must exactly match a tab name in the
sheet (case-sensitive) for the sync to find where to write. Leave the two
env vars unset to disable this feature entirely - task creation still works
normally either way.

## 4. Configure environment variables

Copy `.env.example` to `.env.local` and fill in every value:

```bash
cp .env.example .env.local
```

`CRON_SECRET` can be anything random, e.g. `openssl rand -hex 32`.

## 5. Run locally

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000), sign up (first
account becomes admin), and start creating tasks.

## 6. Deploy to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. Add all the variables from `.env.example` as Vercel Environment
   Variables (Production + Preview).
3. Set `NEXT_PUBLIC_APP_URL` to your production URL (used to build links in
   emails).
4. `vercel.json` already defines a daily cron
   (`0 0 * * *` UTC) hitting `/api/cron/notifications`; Vercel automatically
   sends the `Authorization: Bearer $CRON_SECRET` header for cron-triggered
   requests as long as `CRON_SECRET` is set as an environment variable, so
   no extra wiring is needed. Adjust the schedule/timezone in `vercel.json`
   if you'd like the digest to land at a different local time.

## Roles

- **admin** - full access to all tasks, plus `/settings` to manage user
  roles/accounts, Output Types, and Writers.
- **editor** - can create tasks, edit/delete tasks they created or are
  assigned to, and log "Checked By" entries.
- **viewer** - read-only access to all tasks, CSV export, and their own
  insights page.

Enforced both via Postgres Row-Level Security (`supabase/migrations/`)
and hidden/disabled in the UI for the current role.

## Settings (`/settings`, admin-only)

- **Users** - add a new user account directly (no self-signup needed;
  creates a real Supabase Auth login with a temporary password), view full
  details/edit a user's display name/change their role/delete their account
  outright in a modal (revokes their Supabase Auth login; tasks they
  created or were assigned keep existing, just with no creator/assignee).
- **Output Types** and **Writers** - admin-managed lookup lists with full
  create/rename/deactivate/delete. Active entries show up in the task
  form's dropdowns; deleting one just clears the reference on any tasks
  that used it (no data loss).

## Editorial workflow

**Checked By** on a task's detail page is an append-only approval log
(Draft Checking / Revision Checking / Final Approval, each with a status of
For Revision / Approved / Disapproved and optional remarks). Admins and
editors can add entries, picking who's credited as the checker from a
**Writer** dropdown (not necessarily the person who's logged in - who
actually submitted the entry is still recorded in the task's Activity feed).
Nothing can be edited or deleted once logged.

## Video Editors page (`/editors`)

Cards per editor/admin user showing total assigned tasks, a
completed/ongoing/upcoming breakdown, completion rate, and average editing
duration. Duration is measured from `started_editing_at` (set the first time
a task moves to In Progress) to `completed_at` (set the first time it moves
to Done) - both tracked separately from `created_at`/`updated_at` so the
number reflects actual editing time, not time since the record was made or
last touched.

## Weather Dashboard (`/weather`)

Current conditions + 5-day forecast for the signed-in user's own location
(defaults to Balanga City, Bataan; each user can search and set their own via
Open-Meteo's free geocoding API, stored on their profile). Both are
interactive cards, not static text: click **Right now** to toggle &deg;C/&deg;F,
click a forecast day to expand rain total / max wind / UV index / sunrise /
sunset. Also embeds Windy (rain radar) and PANaHON - PAGASA's own
satellite/radar system at panahon.gov.ph (not pagasa.dost.gov.ph itself,
which sends `X-Frame-Options: SAMEORIGIN` and refuses to render in any
iframe) - for that same location, each with an "Open full view" link as a
fallback if an embed ever gets blocked.

**PAGASA has no public data API** - there's nothing to integrate with
programmatically, so live figures come from Open-Meteo (a comparable open
weather model) instead. If PAGASA ever publishes one, swap the fetch in
`src/lib/weather.ts`.

## Notes

- Sort/filter/pagination state lives in the URL
  (`?priority=&segmentId=&status=&outputTypeId=&sort=&dir=&page=&pageSize=`),
  so a given view is shareable/bookmarkable; CSV export re-applies the same
  filters as whatever's on screen (across all pages, not just the current one).
  **Default sort is most-recently-created task first** (`created_at` desc) -
  picking a different field from the Sort by dropdown without also setting a
  direction falls back to that field's own ascending default instead.
- **Segments** (like Output Types and Writers) are an admin-editable lookup
  managed from Settings, not a fixed list - add/rename/deactivate/delete from
  the Settings > Segments tab. Segments and Output Types can each be assigned
  a badge color from Settings (click the color dot next to an item), shown
  wherever that task field is displayed (task view, task list).
- A task's **Task created** date/time is an editable field on the task form
  (defaults to the current date/time for new tasks), so it can be backdated
  to when work actually started instead of when the record was entered.
- All displayed and editable timestamps (task dates, activity/check logs,
  user "joined" date, calendar day grouping, emails) are pinned to
  **Philippine Standard Time (Asia/Manila, UTC+8)** via `src/lib/ph-time.ts`,
  regardless of the viewing device's or the server's own local timezone -
  the database itself still stores UTC (`timestamptz`), only display/input
  is PH-fixed.
- Clicking a task in the list opens it in a modal (view/edit/delete, plus
  Checked By) via a Next.js intercepting route - the same URL
  (`/tasks/[id]`) also works as a normal full page on direct load/refresh.
  It opens **read-only** by default (Output Link renders as a clickable
  link) - the pencil icon or `?mode=edit` switches it into the editable
  form.
- **Share** (link icon, next to Edit/Delete on the task list and task view)
  opens a modal with a public link (`/share/tasks/[id]`) to a read-only copy
  of that task - title, status/priority/segment/output type, dates,
  assignee, writer, output link, Checked By history, and Activity log.
  This link needs **no login** - it's outside the auth-gated `(dashboard)`
  route group and served via the service-role Supabase client, gated only
  by the task's own unguessable UUID (the same trust model as any
  "anyone with the link" share URL). Anyone with the link can view it, so
  only share task links with people who should see that task's details.
  The copyable link is a short `/s/[code]` redirect (`short_links` table +
  a public redirect route) rather than the full `/share/tasks/[id]` URL - a
  self-hosted shortener, not a third-party API, reused on repeat Share
  clicks for the same task instead of minting a new code every time.
- **Dashboard** (`/dashboard`) opens with a row of quick-action tiles (New
  Task, Tasks, Video Editors, Insights, Weather, and Settings for admins),
  then a month calendar of all tasks by due date below (a booking-calendar
  style view, not scoped to the signed-in user). Clicking a date with tasks
  opens a modal listing them, each linking into the normal task view.
- A **notification bell** in the header (both desktop and mobile) shows the
  signed-in user's own overdue and due-soon-within-3-days tasks, computed
  live on every page load - same recipient logic as the email digest
  (assigned, falling back to the task's creator if unassigned).
- Tasks can carry an **Output Link** (a pasted URL to the finished
  deliverable), shown on the task detail view/CSV export.
- The Insights page computes each signed-in user's own performance
  (completion rate, overdue count, turnaround time, breakdown by
  segment/priority/status) and writes a plain-language analysis with a
  deterministic rules engine (`src/lib/tasks/narrative.ts`) - no external AI
  call, no API key required. Cached in `insights_cache`, refreshed on demand
  via "Regenerate insights".
- The daily cron dedupes against `notification_log` so re-runs within the
  same ~20 hours won't re-send the same due/overdue email for a task.
- The sidebar collapses into a hamburger-triggered drawer below the `md`
  breakpoint; the desktop layout is unchanged. The footer shows an
  online/offline indicator (`navigator.onLine` + the `online`/`offline`
  window events), and a blocking "Connection to server lost" modal appears
  app-wide whenever the browser goes offline, clearing itself once back online.
- Toast notifications (via `sonner`) confirm success/failure on most
  mutations; actions that `redirect()` on success (create/update/delete
  task) tag the destination URL with `?toast=...` since a toast can't fire
  before the navigation happens - see `src/components/ToastFromSearchParams.tsx`.
