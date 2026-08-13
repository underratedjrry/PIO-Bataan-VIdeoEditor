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
 * What it does: given a target tab name, a date, and a line of text, finds
 * that date's month section on that tab (matching a "MONTH, YEAR" header in
 * column A, e.g. "AUGUST, 2026") and fills the next empty row there with
 * the date (column A) and text (column B). If the month section doesn't
 * exist yet, it's created at the bottom of the tab in the same style as the
 * existing ones.
 */

var SPREADSHEET_ID = "1x8Nl6RkVMr2YJPL3G0O_4IUrfn8hYJYbZoDNZhLguD4";
var SHARED_SECRET = "REPLACE_WITH_A_RANDOM_SECRET";
var TIME_ZONE = "Asia/Manila";
var MONTH_HEADER_PATTERN = /^[A-Z]+,\s*\d{4}$/;
var HEADER_ROW_VALUES = ["DATE", "WHAT HAS TRANSPIRED", "PPA (IPCR_CODE)", "EMPLOYEE_NO", "REFERENCE", "REMARKS"];

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
  var monthLabel = Utilities.formatDate(dateObj, TIME_ZONE, "MMMM, yyyy").toUpperCase();
  var dateLabel = Utilities.formatDate(dateObj, TIME_ZONE, "MMMM d, yyyy");

  var data = sheet.getDataRange().getValues();
  var monthHeaderRow = -1; // 0-indexed
  var nextHeaderRow = -1;

  for (var i = 0; i < data.length; i++) {
    var cellA = String(data[i][0]).trim().toUpperCase();
    if (monthHeaderRow === -1 && cellA === monthLabel) {
      monthHeaderRow = i;
    } else if (monthHeaderRow !== -1 && i > monthHeaderRow && MONTH_HEADER_PATTERN.test(cellA)) {
      nextHeaderRow = i;
      break;
    }
  }

  if (monthHeaderRow === -1) {
    return appendNewMonthSection(sheet, monthLabel, dateLabel, body.text);
  }

  var searchStart = monthHeaderRow + 2; // skip month bar + column-title row
  var searchEnd = nextHeaderRow === -1 ? data.length : nextHeaderRow;
  var targetIndex = -1;
  for (var r = searchStart; r < searchEnd; r++) {
    if (!data[r] || !data[r][0]) {
      targetIndex = r;
      break;
    }
  }

  var targetRow;
  if (targetIndex === -1) {
    // Section is full - insert a fresh row right before the next header
    // (or at the end of the sheet if this was the last month present).
    targetRow = (nextHeaderRow === -1 ? data.length : nextHeaderRow) + 1; // 1-indexed
    sheet.insertRowBefore(targetRow);
  } else {
    targetRow = targetIndex + 1; // 1-indexed
  }

  sheet.getRange(targetRow, 1).setValue(dateLabel);
  sheet.getRange(targetRow, 2).setValue(body.text);
  return { ok: true, row: targetRow, section: "existing" };
}

function appendNewMonthSection(sheet, monthLabel, dateLabel, text) {
  var lastRow = sheet.getLastRow();
  var headerBarRow = lastRow > 0 ? lastRow + 2 : 1;
  var columnRow = headerBarRow + 1;
  var dataRow = columnRow + 1;

  sheet
    .getRange(headerBarRow, 1, 1, HEADER_ROW_VALUES.length)
    .merge()
    .setValue(monthLabel)
    .setBackground("#990000")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");

  sheet
    .getRange(columnRow, 1, 1, HEADER_ROW_VALUES.length)
    .setValues([HEADER_ROW_VALUES])
    .setBackground("#1155cc")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");

  sheet.getRange(dataRow, 1).setValue(dateLabel);
  sheet.getRange(dataRow, 2).setValue(text);

  return { ok: true, row: dataRow, section: "new" };
}
