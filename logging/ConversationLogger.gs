// Jackson Bot — Conversation Logger
//
// SETUP (do this once):
// 1. Paste this into script.google.com → New project
// 2. Run testLog() first (click Run) — accept the permissions popup
// 3. Deploy → New deployment → Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 4. Copy the deployment URL → add to Cloudflare as secret LOGGING_WEBHOOK

const SHEET_NAME = 'Conversations';

function getOrCreateSpreadsheet() {
  // If bound to a sheet (opened via Extensions → Apps Script), use that
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) return ss;
  } catch (e) {}

  // Otherwise look for an existing one we created before, or make a new one
  const files = DriveApp.getFilesByName('Jackson Bot Conversations');
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }
  return SpreadsheetApp.create('Jackson Bot Conversations');
}

function getSheet() {
  const ss = getOrCreateSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'IP', 'User Message', 'Bot Response']);
    sheet.setFrozenRows(1);

    const header = sheet.getRange(1, 1, 1, 4);
    header.setFontWeight('bold');
    header.setBackground('#0F172A');
    header.setFontColor('#FFFFFF');

    sheet.setColumnWidth(1, 180);
    sheet.setColumnWidth(2, 120);
    sheet.setColumnWidth(3, 380);
    sheet.setColumnWidth(4, 500);
  }

  return sheet;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getSheet();

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.ip || 'unknown',
      data.userMessage || '',
      data.botResponse || ''
    ]);

    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, 4).setWrap(true).setVerticalAlignment('top');

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Run this manually first to authorize + verify the sheet is created
function testLog() {
  const sheet = getSheet();
  sheet.appendRow([
    new Date().toISOString(),
    '192.168.1.xxx',
    'What kind of roles are you looking for?',
    'Senior Ecommerce or Marketplace Manager roles, ideally remote...'
  ]);
  Logger.log('Done — check your sheet: ' + SpreadsheetApp.openById(sheet.getParent().getId()).getUrl());
}
