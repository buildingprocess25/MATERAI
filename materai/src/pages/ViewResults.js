"use client";
import { useEffect, useState } from "react";
import {
  getCabangOptions,
  getUlokOptions,
  getLingkupOptions,
  listDocuments,
} from "../services/googleSheets";

export default function ViewResults() {
  // filter berantai
  const [filters, setFilters] = useState({ cabang: "", ulok: "", lingkup: "" });

  // state ui
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false); // sembunyikan tabel sebelum cari
  const [items, setItems] = useState([]);

  // opsi dropdown
  const [optCabang, setOptCabang] = useState([]);
  const [optUlok, setOptUlok] = useState([]);
  const [optLingkup, setOptLingkup] = useState([]);

  // load CABANG saat mount (tanpa auto-search)
  useEffect(() => {
    getCabangOptions()
      .then(setOptCabang)
      .catch((e) => alert(e.message || "Gagal memuat cabang"));
  }, []);

  // saat CABANG dipilih → reset ULOK & LINGKUP dan load ULOK
  useEffect(() => {
    if (!filters.cabang) {
      setOptUlok([]);
      setOptLingkup([]);
      setFilters((s) => ({ ...s, ulok: "", lingkup: "" }));
      return;
    }
    getUlokOptions(filters.cabang)
      .then(setOptUlok)
      .catch((e) => alert(e.message || "Gagal memuat nomor ulok"));
    setFilters((s) => ({ ...s, ulok: "", lingkup: "" }));
    setOptLingkup([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.cabang]);

  // saat ULOK dipilih → reset LINGKUP dan load LINGKUP
  useEffect(() => {
    if (!filters.cabang || !filters.ulok) {
      setOptLingkup([]);
      setFilters((s) => ({ ...s, lingkup: "" }));
      return;
    }
    getLingkupOptions(filters.cabang, filters.ulok)
      .then(setOptLingkup)
      .catch((e) => alert(e.message || "Gagal memuat lingkup"));
    setFilters((s) => ({ ...s, lingkup: "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.ulok]);

  async function applyFilters() {
    setSearched(true);

    // jika semua kosong → jangan tampilkan data apa pun
    if (!filters.cabang && !filters.ulok && !filters.lingkup) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const res = await listDocuments({
        cabang: filters.cabang || undefined,
        ulok: filters.ulok || undefined,
        lingkup: filters.lingkup || undefined,
      });
      setItems(res);
    } catch (e) {
      alert(e.message || "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }

  function resetAll() {
    setFilters({ cabang: "", ulok: "", lingkup: "" });
    setOptUlok([]);
    setOptLingkup([]);
    setItems([]);
    setSearched(false); // sembunyikan tabel lagi
  }

  return (
    <div className="card">
      <h1 className="page-title">Hasil Dokumen Termaterai</h1>
      <p className="page-subtitle">
        Gunakan filter di bawah untuk mencari dokumen.
      </p>

      <div className="row" style={{ marginBottom: 12 }}>
        <div className="col">
          <label>Pilih Cabang</label>
          <select
            value={filters.cabang}
            onChange={(e) =>
              setFilters((s) => ({ ...s, cabang: e.target.value }))
            }
          >
            <option value="">Semua</option>
            {optCabang.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="col">
          <label>Pilih Nomor Ulok</label>
          <select
            value={filters.ulok}
            disabled={!filters.cabang} // dikunci sampai cabang dipilih
            onChange={(e) =>
              setFilters((s) => ({ ...s, ulok: e.target.value }))
            }
          >
            <option value="">Semua</option>
            {optUlok.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="col">
          <label>Pilih Lingkup Kerja</label>
          <select
            value={filters.lingkup}
            disabled={!filters.cabang || !filters.ulok} // dikunci sampai ulok dipilih
            onChange={(e) =>
              setFilters((s) => ({ ...s, lingkup: e.target.value }))
            }
          >
            <option value="">Semua</option>
            {optLingkup.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={applyFilters} disabled={loading}>
          {loading ? (
            <>
              <span className="btnSpinner" /> Memuat…
            </>
          ) : (
            "Terapkan Filter"
          )}
        </button>
        <button className="ghost" onClick={resetAll} disabled={loading}>
          Reset
        </button>
      </div>

      {/* TABEL hanya muncul setelah user klik "Terapkan Filter" */}
      {searched && (
        <div
          className="card"
          style={{ overflowX: "auto", position: "relative" }}
        >
          {/* Overlay loading */}
          {loading && (
            <div className="loadingOverlay">
              <div className="spinner" />
              <div style={{ marginTop: 10, fontWeight: 500 }}>Memuat data…</div>
            </div>
          )}

          {!loading && (
            <table className="table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Cabang</th>
                  <th>Nomor Ulok</th>
                  <th>Lingkup</th>
                  <th>File</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="6">Tidak ada data.</td>
                  </tr>
                ) : (
                  items.map((it) => (
                    <tr key={it.id}>
                      <td>
                        {new Date(it.createdAt || Date.now()).toLocaleString()}
                      </td>
                      <td>{it.cabang}</td>
                      <td>{it.ulok}</td>
                      <td>{it.lingkup}</td>
                      <td>{it.file?.name || "-"}</td>
                      <td>
                        {it.driveViewUrl ? (
                          <>
                            <a
                              href={it.driveViewUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Preview
                            </a>
                            {" | "}
                            <a
                              href={it.driveDownloadUrl || it.driveViewUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Download
                            </a>
                          </>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* CSS spinner & overlay */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #eee;
          border-top-color: #e53935; /* merah selaras theme */
          border-radius: 50%;
          animation: spin .9s linear infinite;
        }
        .btnSpinner {
          display:inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid #fff;
          border-right-color: transparent;
          border-radius: 50%;
          margin-right: 6px;
          vertical-align: -2px;
          animation: spin .8s linear infinite;
        }
        .loadingOverlay {
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,.85);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          z-index: 1;
        }
      `}</style>
    </div>
  );
}
