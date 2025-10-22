import { SHEETS_WEB_APP_URL } from "../utils/constants";


const LOCAL_KEY = "materai_docs";

function saveLocal(doc) {
  const arr = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  arr.unshift(doc);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(arr));
  return doc;
}

function listLocal() {
  return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
}
const SESSION_KEY = "MATERAI_USER";
function getSessionCabang() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return String(obj?.cabang || "").trim();
  } catch {
    return "";
  }
}
export async function createDocument(payload) {
  // payload: { cabang, ulok, lingkup, file: { name, mimeType, size, base64, extension } }
  if (!SHEETS_WEB_APP_URL) {
    const doc = {
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      ...payload,
      // Simpan dataUrl untuk preview lokal
      previewUrl: `data:${payload.file.mimeType};base64,${payload.file.base64}`,
      downloadUrl: `data:${payload.file.mimeType};base64,${payload.file.base64}`,
      source: "local",
    };
    return saveLocal(doc);
  }

const res = await fetch(SHEETS_WEB_APP_URL, {
  method: "POST",
  headers: { "Content-Type": "text/plain;charset=utf-8" }, // ✅ ubah di sini
  body: JSON.stringify({ action: "create", data: payload }),
});

  if (!res.ok) throw new Error("Gagal mengirim ke Google Apps Script");
  const json = await res.json();
  if (!json?.ok) throw new Error(json?.message || "Gagal menyimpan data");
  return json.data;
}

export async function listDocuments(filters = {}) {
  const sessionCabang = getSessionCabang();
  if (!sessionCabang) throw new Error("Cabang belum diinput untuk akun ini.");

  const url = new URL(SHEETS_WEB_APP_URL);
  url.searchParams.set("action", "list");
  url.searchParams.set("cabang", sessionCabang);
  if (filters.ulok) url.searchParams.set("ulok", filters.ulok);
  if (filters.lingkup) url.searchParams.set("lingkup", filters.lingkup);

  const res = await fetch(url.toString());
  const json = await res.json();
  if (!json.ok) throw new Error(json.message || "Gagal memuat dokumen");
  return json.data;
}




export async function getCabangOptions() {
  const sessionCabang = getSessionCabang();
  if (!sessionCabang) throw new Error("Cabang belum diinput untuk akun ini.");
  return [sessionCabang];
}

export async function getUlokOptions() {
  const sessionCabang = getSessionCabang();
  if (!sessionCabang) throw new Error("Cabang belum diinput untuk akun ini.");

  const url = new URL(SHEETS_WEB_APP_URL);
  url.searchParams.set("action", "options");
  url.searchParams.set("mode", "ulok");
  url.searchParams.set("cabang", sessionCabang);
  const res = await fetch(url.toString());
  const json = await res.json();
  if (!json.ok) throw new Error(json.message || "Gagal ambil ulok");
  return json.data;
}

export async function getLingkupOptions(ulok) {
  const sessionCabang = getSessionCabang();
  if (!sessionCabang) throw new Error("Cabang belum diinput untuk akun ini.");

  const url = new URL(SHEETS_WEB_APP_URL);
  url.searchParams.set("action", "options");
  url.searchParams.set("mode", "lingkup");
  url.searchParams.set("cabang", sessionCabang);
  url.searchParams.set("ulok", ulok);
  const res = await fetch(url.toString());
  const json = await res.json();
  if (!json.ok) throw new Error(json.message || "Gagal ambil lingkup");
  return json.data;
}

