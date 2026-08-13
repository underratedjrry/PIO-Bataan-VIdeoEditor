const WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
const WEBHOOK_SECRET = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;

// Fire-and-forget sync to the PIO Daily Accomplishments Google Sheet via a
// Google Apps Script web app (see scripts/google-apps-script.js) - the
// script itself finds the row matching the given date's month section on
// the named tab and fills in Date / What Has Transpired. Never throws:
// a Sheets outage or misconfiguration should never block task creation,
// same posture as the Resend email sends.
export async function syncTaskToSheet(params: { tab: string; date: string; text: string }) {
  if (!WEBHOOK_URL || !WEBHOOK_SECRET) {
    console.warn("[google-sheets] webhook not configured - skipped sync");
    return;
  }
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: WEBHOOK_SECRET,
        tab: params.tab,
        date: params.date,
        text: params.text,
      }),
    });
    if (!res.ok) {
      console.error("[google-sheets] sync failed", res.status, await res.text());
    }
  } catch (err) {
    console.error("[google-sheets] sync failed", err);
  }
}

export function formatAccomplishmentText(outputTypeName: string | null, title: string) {
  const project = outputTypeName ?? "General";
  return `VIDEO EDITING | ${project} - ${title}`;
}
