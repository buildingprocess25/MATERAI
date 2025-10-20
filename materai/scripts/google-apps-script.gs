/**
 * Google Apps Script - Web App backend untuk Google Spreadsheet + Drive.
 * 
 * Cara pakai:
 * 1) Buat Spreadsheet baru, simpan Sheet pertama (nama mis. 'Data').
 *    Header baris 1: id, createdAt, cabang, ulok, lingkup, fileName, mimeType, size, driveFileId, driveViewUrl, driveDownloadUrl
 * 2) Buat Folder di Google Drive untuk menyimpan file upload, ambil Folder ID-nya.
 * 3) Buka https://script.google.com -> New Project -> tempel kode ini.
 * 4) Setel variabel di atas sesuai: SPREADSHEET_ID dan DRIVE_FOLDER_ID.
 * 5) Deploy > New deployment > type "Web app":
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    Setelah deploy, salin URL Web App sebagai SHEETS_WEB_APP_URL di aplikasi React.
 */

const SPREADSHEET_ID = "GANTI_DENGAN_SPREADSHEET_ID";
const DRIVE_FOLDER_ID = "GANTI_DENGAN_FOLDER_ID";
const SHEET_NAME = "Data";

function doGet(e) {
  const action = (e.parameter.action || "").toLowerCase();
  if (action === "list") {
    return _list(e);
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: true, message: "Web App aktif" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    const action = (body.action || "").toLowerCase();
    if (action === "create") {
      return _create(body.data);
    }
    return _json({ ok: false, message: "Aksi tidak dikenal." });
  } catch (err) {
    return _json({ ok: false, message: "Error: " + err });
  }
}

function _create(data) {
  if (!data) return _json({ ok: false, message: "Data kosong." });
  const { cabang, ulok, lingkup, file } = data;
  if (!file || !file.base64) return _json({ ok: false, message: "File tidak ada." });

  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const blob = Utilities.newBlob(Utilities.base64Decode(file.base64), file.mimeType, file.name);
  const gfile = folder.createFile(blob);
  // Set sharing agar dapat diakses link
  gfile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  const driveFileId = gfile.getId();
  const driveViewUrl = "https://drive.google.com/file/d/" + driveFileId + "/view";
  const driveDownloadUrl = "https://drive.google.com/uc?export=download&id=" + driveFileId;

  const now = new Date().toISOString();
  const id = String(new Date().getTime());
  const row = [id, now, cabang, ulok, lingkup, file.name, file.mimeType, file.size, driveFileId, driveViewUrl, driveDownloadUrl];

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(["id","createdAt","cabang","ulok","lingkup","fileName","mimeType","size","driveFileId","driveViewUrl","driveDownloadUrl"]);
  }
  sh.appendRow(row);

  return _json({
    ok: true,
    data: {
      id, createdAt: now, cabang, ulok, lingkup,
      file: { name: file.name, mimeType: file.mimeType, size: file.size },
      driveFileId, driveViewUrl, driveDownloadUrl,
      source: "sheets"
    }
  });
}

function _list(e) {
  const cabang = e.parameter.cabang || "";
  const ulok = e.parameter.ulok || "";
  const lingkup = e.parameter.lingkup || "";

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) return _json({ ok: true, data: [] });

  const data = sh.getDataRange().getValues();
  const header = data.shift();
  const idx = {};
  header.forEach((h, i) => idx[h] = i);

  const rows = data.map(r => ({
    id: r[idx["id"]],
    createdAt: r[idx["createdAt"]],
    cabang: r[idx["cabang"]],
    ulok: r[idx["ulok"]],
    lingkup: r[idx["lingkup"]],
    file: { name: r[idx["fileName"]], mimeType: r[idx["mimeType"]], size: r[idx["size"]] },
    driveFileId: r[idx["driveFileId"]],
    driveViewUrl: r[idx["driveViewUrl"]],
    driveDownloadUrl: r[idx["driveDownloadUrl"]],
    source: "sheets"
  })).filter(it => {
    if (cabang && it.cabang !== cabang) return false;
    if (ulok && it.ulok !== ulok) return false;
    if (lingkup && it.lingkup !== lingkup) return false;
    return true;
  }).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  return _json({ ok: true, data: rows });
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
