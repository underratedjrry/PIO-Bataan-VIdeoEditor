# PIO Bataan - VE PMIS

Project management for video editing tasks: create/track tasks by segment,
output type, priority, and due date; email notifications; CSV export;
data-driven performance insights; editorial approval workflow (Checked By);
a per-editor performance dashboard; a calendar Dashboard of deliverables by
due date; an AI Assist chat page; and Admin/Editor/Viewer roles.

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind CSS 4)
- Supabase (Postgres, Auth, Row-Level Security)
- Resend (email notifications)
- Vercel Cron (daily due/overdue digest)
- Anthropic Claude API (AI Assist chat page only - optional)

## 1. Create the Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run these migrations **in order**:
   `0001_init.sql`, `0002_editorial_workflow.sql`, `0003_user_management.sql`,
   `0004_output_link.sql`, `0005_checked_by_writer.sql`,
   `0006_task_timing.sql`, `0007_segments_lookup.sql`, then
   `0008_lookup_colors.sql` (all under `supabase/migrations/`). Together
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

## 3. (Optional) Get an Anthropic API key

Only needed for the **AI Assist** chat page. Create a key at
[console.anthropic.com](https://console.anthropic.com). Without it, the page
still loads but replies with a message saying the feature is unavailable.

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

## AI Assist (`/ai-assist`)

A simple chat page backed by the Claude API (see step 3 above) for drafting
task descriptions, captions, summaries, etc. Conversation history is
in-memory only (not persisted) - refreshing the page starts a new chat.

## Notes

- Sort/filter/pagination state lives in the URL
  (`?priority=&segmentId=&status=&outputTypeId=&sort=&dir=&page=&pageSize=`),
  so a given view is shareable/bookmarkable; CSV export re-applies the same
  filters as whatever's on screen (across all pages, not just the current one).
- **Segments** (like Output Types and Writers) are an admin-editable lookup
  managed from Settings, not a fixed list - add/rename/deactivate/delete from
  the Settings > Segments tab. Segments and Output Types can each be assigned
  a badge color from Settings (click the color dot next to an item), shown
  wherever that task field is displayed (task view, task list).
- A task's **Task created** date/time is an editable field on the task form
  (defaults to the current date/time for new tasks), so it can be backdated
  to when work actually started instead of when the record was entered.
- Clicking a task in the list opens it in a modal (view/edit/delete, plus
  Checked By) via a Next.js intercepting route - the same URL
  (`/tasks/[id]`) also works as a normal full page on direct load/refresh.
  It opens **read-only** by default (Output Link renders as a clickable
  link) - the pencil icon or `?mode=edit` switches it into the editable
  form.
- **Dashboard** (`/dashboard`) is a month calendar of all tasks by due
  date (a booking-calendar style view, not scoped to the signed-in user).
  Clicking a date with tasks opens a modal listing them, each linking into
  the normal task view.
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
