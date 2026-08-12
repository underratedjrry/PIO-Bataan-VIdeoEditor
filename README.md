# PIO Bataan - VE PMIS

Project management for video editing tasks: create/track tasks by segment,
output type, priority, and due date; email notifications; CSV export;
data-driven performance insights; editorial approval workflow (Checked By);
and Admin/Editor/Viewer roles.

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind CSS 4)
- Supabase (Postgres, Auth, Row-Level Security)
- Resend (email notifications)
- Vercel Cron (daily due/overdue digest)

## 1. Create the Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run these migrations **in order**:
   `supabase/migrations/0001_init.sql`, `0002_editorial_workflow.sql`,
   `0003_user_management.sql`, then `0004_output_link.sql`. Together these
   create all tables, RLS policies, seed data (default Output Types), and a
   trigger that auto-provisions a `profiles` row on signup - **the first
   user to sign up becomes `admin`**, everyone after that defaults to
   `editor`.
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

## 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in every value:

```bash
cp .env.example .env.local
```

`CRON_SECRET` can be anything random, e.g. `openssl rand -hex 32`.

## 4. Run locally

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000), sign up (first
account becomes admin), and start creating tasks.

## 5. Deploy to Vercel

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

- **Users** - edit a user's display name, change their role, or delete
  their account outright (revokes their Supabase Auth login; tasks they
  created or were assigned keep existing, just with no creator/assignee).
- **Output Types** and **Writers** - admin-managed lookup lists with full
  create/rename/deactivate/delete. Active entries show up in the task
  form's dropdowns; deleting one just clears the reference on any tasks
  that used it (no data loss).

## Editorial workflow

**Checked By** on a task's detail page is an append-only approval log
(Draft Checking / Revision Checking / Final Approval, each with a status of
For Revision / Approved / Disapproved and optional remarks). Admins and
editors can add entries; nothing can be edited or deleted once logged.

## Notes

- Sort/filter/pagination state lives in the URL
  (`?priority=&segment=&status=&outputTypeId=&sort=&dir=&page=&pageSize=`),
  so a given view is shareable/bookmarkable; CSV export re-applies the same
  filters as whatever's on screen (across all pages, not just the current one).
- Clicking a task in the list opens it in a modal (view/edit/delete, plus
  Checked By) via a Next.js intercepting route - the same URL
  (`/tasks/[id]`) also works as a normal full page on direct load/refresh.
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
