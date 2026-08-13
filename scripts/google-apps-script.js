/**
 * NOT part of the Next.js app - this runs inside Google Apps Script, bound
 * to the "2026 PIO Daily Accomplishments" spreadsheet.
 *
 * Setup:
 * 1. Open the spreadsheet -> Extensions > Apps Script.
 * 2. Delete any starter code and paste this whole file in.
 * 3. Set SHARED_SECRET below to a random string (must match
 *    GOOGLE_SHEETS_WEBHOOK_SECRET in the app's Vercel env vars).
 * 4. Authorize the script BEFORE deploying: in the toolbar, pick
 *    "testAuth" from the function dropdown (next to the Run button) and
 *    click Run. A permissions dialog will appear - choose your account,
 *    click "Advanced" -> "Go to ... (unsafe)" (this warning is normal for
 *    a script you wrote yourself), then Allow. Deploying without doing
 *    this first is the most common cause of a permission error at the
 *    deploy step.
 * 5. Deploy > New deployment > type "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 *    Copy the resulting Web app URL into GOOGLE_SHEETS_WEBHOOK_URL.
 * 6. Whenever you edit this script, you must create a new deployment
 *    version (Deploy > Manage deployments > edit > New version) for the
 *    change to take effect - saving alone isn't enough.
 *
 * What it does: given a target tab name, a date, and a line of text, writes
 * them into the row right after the last used row on that tab (column A =
 * date, column B = text) - i.e. if row 35 is the last row with content, the
 * new entry goes into row 36. This doesn't try to find/organize by month
 * section - it just appends at the true end of the tab. Simpler and more
 * reliable than matching "MONTH, YEAR" headers, at the cost of not
 * auto-sorting entries into pre-built month blocks; if a new month's
 * entries land past the last existing block, add that month's header row
 * manually and future syncs will keep appending after it.
 */

var SPREADSHEET_ID = "1x8Nl6RkVMr2YJPL3G0O_4IUrfn8hYJYbZoDNZhLguD4";
var SHARED_SECRET = "REPLACE_WITH_A_RANDOM_SECRET";
var TIME_ZONE = "Asia/Manila";

// Run this once from the editor (Run button, with this selected in the
// function dropdown) to trigger the permissions prompt before your first
// deployment - see step 4 above.
function testAuth() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  Logger.log("Access OK: " + ss.getName());
}

function doPost(e) {
  var result;
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.secret !== SHARED_SECRET) {
      result = { ok: false, error: "unauthorized" };
    } else {
      result = handleSync(body);
    }
  } catch (err) {
    result = { ok: false, error: String(err) };
  }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function handleSync(body) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(body.tab);
  if (!sheet) {
    return { ok: false, error: "tab not found: " + body.tab };
  }

  var dateObj = new Date(body.date);
  var dateLabel = Utilities.formatDate(dateObj, TIME_ZONE, "MMMM d, yyyy");

  var targetRow = sheet.getLastRow() + 1;
  sheet.getRange(targetRow, 1).setValue(dateLabel);
  sheet.getRange(targetRow, 2).setValue(body.text);

  return { ok: true, row: targetRow };
}
