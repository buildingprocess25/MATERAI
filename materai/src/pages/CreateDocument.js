import { useEffect, useState } from "react";
import { fileToBase64 } from "../utils/file";
import { createDocument } from "../services/googleSheets";
import {
  getCabangOptions,
  getUlokOptions,
  getLingkupOptions,
} from "../services/googleSheets";

const initial = { cabang: "", ulok: "", lingkup: "" };

export default function CreateDocument() {
  const [form, setForm] = useState(initial);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // state opsi
  const [cabangOps, setCabangOps] = useState([]);
  const [ulokOps, setUlokOps] = useState([]);
  const [lingkupOps, setLingkupOps] = useState([]);

  // load cabang saat halaman dibuka
  useEffect(() => {
    (async () => {
      try {
        const ops = await getCabangOptions();
        setCabangOps(ops);
      } catch (e) {
        console.error(e);
        setError("Gagal memuat opsi cabang.");
      }
    })();
  }, []);

  // ketika cabang berubah → reset ulok & lingkup, lalu ambil opsi ulok
  useEffect(() => {
    if (!form.cabang) {
      setUlokOps([]);
      setLingkupOps([]);
      setForm((s) => ({ ...s, ulok: "", lingkup: "" }));
      return;
    }
    (async () => {
      try {
        const ops = await getUlokOptions(form.cabang);
        setUlokOps(ops);
        setLingkupOps([]);
        setForm((s) => ({ ...s, ulok: "", lingkup: "" }));
      } catch (e) {
        console.error(e);
        setError("Gagal memuat nomor ulok.");
      }
    })();
  }, [form.cabang]);

  // ketika ulok berubah → reset lingkup, lalu ambil opsi lingkup
  useEffect(() => {
    if (!form.cabang || !form.ulok) {
      setLingkupOps([]);
      setForm((s) => ({ ...s, lingkup: "" }));
      return;
    }
    (async () => {
      try {
        const ops = await getLingkupOptions(form.cabang, form.ulok);
        setLingkupOps(ops);
        setForm((s) => ({ ...s, lingkup: "" }));
      } catch (e) {
        console.error(e);
        setError("Gagal memuat lingkup kerja.");
      }
    })();
  }, [form.ulok]);

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!form.cabang || !form.ulok || !form.lingkup || !file) {
      setError("Lengkapi semua field dan pilih file.");
      return;
    }
    try {
      setSubmitting(true);
      const f = await fileToBase64(file);
      const payload = {
        cabang: form.cabang.trim(),
        ulok: form.ulok.trim(),
        lingkup: form.lingkup.trim(),
        file: {
          name: f.name,
          mimeType: f.mimeType,
          size: f.size,
          base64: f.base64,
          extension: f.extension,
        },
      };
      const saved = await createDocument(payload);
      setResult(saved);
      setForm(initial);
      setFile(null);
      setSubmitting(false);
    } catch (err) {
      setSubmitting(false);
      setError(err.message || "Terjadi kesalahan saat menyimpan.");
    }
  };

  return (
    <div className="card">
      {/* ... header & notice tetap ... */}
      <div
        className="p-3 rounded border"
        style={{ background: "#fff8e1", marginBottom: "1.5rem" }}
      >
        <strong>Materaikan dokumen</strong> menggunakan link{" "}
        <a
          href="https://e-meterai.co.id/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          https://e-meterai.co.id/
        </a>
        , lalu unggah hasilnya melalui form di bawah.
      </div>

      <form onSubmit={onSubmit}>
        <div className="row">
          <div className="col">
            <label>Cabang</label>
            <select
              value={form.cabang}
              onChange={(e) =>
                setForm((s) => ({ ...s, cabang: e.target.value }))
              }
              required
            >
              <option value="">Pilih cabang…</option>
              {cabangOps.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="col">
            <label>Nomor Ulok</label>
            <select
              value={form.ulok}
              onChange={(e) => setForm((s) => ({ ...s, ulok: e.target.value }))}
              disabled={!form.cabang || ulokOps.length === 0}
              required
            >
              <option value="">Pilih nomor ulok…</option>
              {ulokOps.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div className="col">
            <label>Lingkup Kerja</label>
            <select
              value={form.lingkup}
              onChange={(e) =>
                setForm((s) => ({ ...s, lingkup: e.target.value }))
              }
              disabled={!form.ulok || lingkupOps.length === 0}
              required
            >
              <option value="">Pilih lingkup…</option>
              {lingkupOps.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* upload & submit tetap */}
        {/* Upload file yang sudah ditempel e-meterai */}
        <div className="mt-5 mb-3">
          <label
            style={{
              fontWeight: 600,
              display: "block",
              marginBottom: "8px",
            }}
          >
            Upload File (PDF / Gambar)
          </label>

          <input
            type="file"
            accept=".pdf,image/*"
            onChange={onFileChange}
            required
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "10px",
            }}
          />

          <small
            style={{
              display: "block",
              marginTop: "6px",
              color: "#666",
            }}
          >
            Unggah dokumen yang sudah termeterai.
          </small>
        </div>

        {/* Error / info */}
        {error && (
          <div
            className="mt-3 p-2 rounded"
            style={{ background: "#fdecea", color: "#b00020" }}
          >
            {error}
          </div>
        )}
        {result && (
          <div
            className="mt-3 p-2 rounded"
            style={{ background: "#e8f5e9", color: "#1b5e20" }}
          >
            Dokumen berhasil disimpan.
          </div>
        )}

        {/* Tombol submit */}
        <div
          style={{
            marginTop: "10px", // jarak lebih rapat
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          <button
            type="submit"
            disabled={submitting}
            style={{
              backgroundColor: "#d32f2f",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 24px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {submitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
