// Jackson Bot — Conversation Logger
// Deploy this as a Google Apps Script Web App (see README below)
//
// Setup:
// 1. Go to script.google.com → New project → paste this file
// 2. Click Deploy → New deployment → Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 3. Copy the deployment URL
// 4. In Cloudflare dashboard → jackson-bot → Settings → Variables and Secrets
//    Add secret: LOGGING_WEBHOOK = <your deployment URL>
//
// The sheet will be created automatically on first log.

const SHEET_NAME = 'Conversations';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(['Timestamp', 'IP', 'User Message', 'Bot Response']);
      sheet.setFrozenRows(1);

      // Format header row
      const header = sheet.getRange(1, 1, 1, 4);
      header.setFontWeight('bold');
      header.setBackground('#0F172A');
      header.setFontColor('#FFFFFF');

      // Set column widths
      sheet.setColumnWidth(1, 160); // Timestamp
      sheet.setColumnWidth(2, 110); // IP
      sheet.setColumnWidth(3, 380); // User Message
      sheet.setColumnWidth(4, 500); // Bot Response
    }

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.ip || 'unknown',
      data.userMessage || '',
      data.botResponse || ''
    ]);

    // Wrap text in the last row
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

// Test function — run this manually in Apps Script to verify the sheet works
function testLog() {
  doPost({
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toISOString(),
        ip: '192.168.1.xxx',
        userMessage: 'What kind of roles are you looking for?',
        botResponse: 'Senior Ecommerce or Marketplace Manager roles, ideally remote...'
      })
    }
  });
}
