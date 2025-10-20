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
  // filters: { cabang?, ulok?, lingkup? }
  if (!SHEETS_WEB_APP_URL) {
    let items = listLocal();
    if (filters.cabang)
      items = items.filter((i) => i.cabang === filters.cabang);
    if (filters.ulok) items = items.filter((i) => i.ulok === filters.ulok);
    if (filters.lingkup)
      items = items.filter((i) => i.lingkup === filters.lingkup);
    return items;
  }

  const url = new URL(SHEETS_WEB_APP_URL);
  url.searchParams.set("action", "list");
  if (filters.cabang) url.searchParams.set("cabang", filters.cabang);
  if (filters.ulok) url.searchParams.set("ulok", filters.ulok);
  if (filters.lingkup) url.searchParams.set("lingkup", filters.lingkup);

  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) throw new Error("Gagal mengambil data dari Google Apps Script");
  const json = await res.json();
  if (!json?.ok) throw new Error(json?.message || "Gagal membaca data");
  return json.data || [];
}

export async function getCabangOptions() {
  const url = new URL(SHEETS_WEB_APP_URL);
  url.searchParams.set("action", "options");
  url.searchParams.set("mode", "cabang");
  url.searchParams.set("source", "dokumen");
  const res = await fetch(url.toString());
  const json = await res.json();
  if (!json?.ok) throw new Error(json?.message || "Gagal ambil cabang");
  return json.data || [];
}

export async function getUlokOptions(cabang) {
  const url = new URL(SHEETS_WEB_APP_URL);
  url.searchParams.set("action", "options");
  url.searchParams.set("mode", "ulok");
  url.searchParams.set("source", "dokumen");
  url.searchParams.set("cabang", cabang);
  const res = await fetch(url.toString());
  const json = await res.json();
  if (!json?.ok) throw new Error(json?.message || "Gagal ambil ulok");
  return json.data || [];
}

export async function getLingkupOptions(cabang, ulok) {
  const url = new URL(SHEETS_WEB_APP_URL);
  url.searchParams.set("action", "options");
  url.searchParams.set("mode", "lingkup");
  url.searchParams.set("source", "dokumen");
  url.searchParams.set("cabang", cabang);
  url.searchParams.set("ulok", ulok);
  const res = await fetch(url.toString());
  const json = await res.json();
  if (!json?.ok) throw new Error(json?.message || "Gagal ambil lingkup");
  return json.data || [];
}
