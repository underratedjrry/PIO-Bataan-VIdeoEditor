# Video Editing PMIS

Project management for video editing tasks: create/track tasks by segment,
priority, and due date; email notifications; CSV export; AI-generated
performance insights; and Admin/Editor/Viewer roles.

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind CSS 4)
- Supabase (Postgres, Auth, Row-Level Security)
- Resend (email notifications)
- Vercel Cron (daily due/overdue digest)
- Anthropic Claude API (performance insights)

## 1. Create the Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run `supabase/migrations/0001_init.sql`, then
   `supabase/migrations/0002_editorial_workflow.sql` (in that order). Together
   these create all tables, RLS policies, seed data (default Output Types),
   and a trigger that auto-provisions a `profiles` row on signup - **the
   first user to sign up becomes `admin`**, everyone after that defaults to
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

## 3. Get an Anthropic API key

Create a key at [console.anthropic.com](https://console.anthropic.com) -
this powers the "Regenerate insights" narrative on the Insights page.

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

- **admin** - full access to all tasks, plus `/admin/users` to promote or
  demote other users.
- **editor** - can create tasks, and edit/delete tasks they created or are
  assigned to.
- **viewer** - read-only access to all tasks, CSV export, and their own
  insights page.

Enforced both via Postgres Row-Level Security (`supabase/migrations/0001_init.sql`,
`0002_editorial_workflow.sql`) and hidden/disabled in the UI for the current role.

## Editorial workflow

- **Output Type** and **Writer** are admin-managed lookup lists
  (`/admin/output-types`, `/admin/writers`) - add or deactivate entries there;
  active ones show up in the task form's dropdowns.
- **Checked By** on a task's detail page is an append-only approval log
  (Draft Checking / Revision Checking / Final Approval, each with a status
  of For Revision / Approved / Disapproved and optional remarks). Admins and
  editors can add entries; nothing can be edited or deleted once logged.

## Notes

- Sort/filter state lives in the URL (`?priority=&segment=&status=&sort=&dir=`),
  so filtered views are shareable/bookmarkable, and CSV export re-applies the
  same filters as whatever's currently on screen.
- The Insights page shows AI analysis for the **signed-in user's own**
  assigned tasks (completion rate, overdue count, turnaround time, and a
  breakdown by segment/priority/status), cached in `insights_cache` and
  refreshed on demand via the "Regenerate insights" button.
- The daily cron dedupes against `notification_log` so re-runs within the
  same ~20 hours won't re-send the same due/overdue email for a task.
