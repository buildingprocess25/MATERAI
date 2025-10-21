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

      {/* FILTERS */}
      <div className="filtersGrid" style={{ marginBottom: 12 }}>
        <div className="field">
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

        <div className="field">
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

        <div className="field">
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

      {/* ACTIONS */}
      <div className="actions">
        <button onClick={applyFilters} disabled={loading} className="primary">
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

      {/* HASIL */}
      {searched && (
        <div className="card tableWrapper" style={{ position: "relative" }}>
          {/* Overlay loading */}
          {loading && (
            <div className="loadingOverlay">
              <div className="spinner" />
              <div style={{ marginTop: 10, fontWeight: 500 }}>Memuat data…</div>
            </div>
          )}

          {!loading && (
            <>
              {/* Tabel untuk layar lebar */}
              <table className="table desktopTable">
                <thead>
                  <tr>
                    <th>Waktu</th>
                    <th>Cabang</th>
                    <th>Nomor Ulok</th>
                    <th>Lingkup</th>
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
                        <td className="nowrap">
                          {new Date(
                            it.createdAt || Date.now()
                          ).toLocaleString()}
                        </td>
                        <td>{it.cabang}</td>
                        <td className="break">{it.ulok}</td>
                        <td>{it.lingkup}</td>
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

              {/* Kartu responsif untuk layar kecil */}
              <div className="mobileCards">
                {items.length === 0 ? (
                  <div className="empty">Tidak ada data.</div>
                ) : (
                  items.map((it) => (
                    <div key={it.id} className="mCard">
                      <div className="mRow">
                        <span className="mLabel">Waktu</span>
                        <span className="mValue">
                          {new Date(
                            it.createdAt || Date.now()
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="mRow">
                        <span className="mLabel">Cabang</span>
                        <span className="mValue">{it.cabang}</span>
                      </div>
                      <div className="mRow">
                        <span className="mLabel">Nomor Ulok</span>
                        <span className="mValue">{it.ulok}</span>
                      </div>
                      <div className="mRow">
                        <span className="mLabel">Lingkup</span>
                        <span className="mValue">{it.lingkup}</span>
                      </div>
                      <div className="mRow">
                      </div>
                      <div className="mActions">
                        {it.driveViewUrl ? (
                          <>
                            <a
                              className="link"
                              href={it.driveViewUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Preview
                            </a>
                            <a
                              className="link"
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
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* CSS spinner & overlay + RESPONSIVE */}
      <style>{`
        /* grid filter: 3 kolom di desktop, 1 kolom di mobile */
        .filtersGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        .field label {
          display: block;
          font-size: .9rem;
          margin-bottom: 6px;
          color: #555;
        }
        .field select {
          width: 100%;
        }

        .actions {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .actions .primary, .actions .ghost {
          min-width: 160px;
        }

        .tableWrapper { overflow-x: auto; }

        .table {
          width: 100%;
          border-collapse: collapse;
        }
        .table th, .table td {
          padding: 10px 12px;
          border-bottom: 1px solid #eee;
          vertical-align: top;
          text-align: left;
        }
        .table thead th {
          position: sticky;
          top: 0;
          background: #fff;
          z-index: 1;
        }
        .nowrap { white-space: nowrap; }
        .break { word-break: break-word; }

        /* Kartu mobile: default disembunyikan di desktop */
        .mobileCards { display: none; }
        .mCard {
          border: 1px solid #eee;
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 10px;
          background: #fff;
        }
        .mRow {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 8px;
          padding: 6px 0;
          border-bottom: 1px dashed #f0f0f0;
        }
        .mRow:last-child { border-bottom: 0; }
        .mLabel { color: #666; font-size: .9rem; }
        .mValue { font-weight: 500; }
        .mActions {
          display: flex;
          gap: 12px;
          padding-top: 8px;
        }
        .link { color: #e53935; text-decoration: none; }
        .link:hover { text-decoration: underline; }

        /* Spinner */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 40px; height: 40px;
          border: 4px solid #eee;
          border-top-color: #e53935;
          border-radius: 50%;
          animation: spin .9s linear infinite;
        }
        .btnSpinner {
          display:inline-block;
          width: 14px; height: 14px;
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
          background: rgba(255,255,255,.9);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          z-index: 2;
        }

        /* ====== BREAKPOINTS ====== */
        @media (max-width: 1024px) {
          .filtersGrid { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 640px) {
          /* Filter & tombol bertumpuk penuh */
          .filtersGrid { grid-template-columns: 1fr; }
          .actions { flex-direction: column; }
          .actions .primary, .actions .ghost { width: 100%; }

          /* Ganti tabel → kartu */
          .desktopTable { display: none; }
          .mobileCards { display: block; }
        }
      `}</style>
    </div>
  );
}
