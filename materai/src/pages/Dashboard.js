import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="card">


      <div className="grid">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Masukan Dokumen TerMaterai</h3>
          <p>
            Buat dokumen menjadi TerMaterai dan simpan kedalam database
          </p>
          <Link to="/buat-dokumen">
            <button>Buka Form</button>
          </Link>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Melihat Hasil Dokumen Termaterai</h3>
          <p>
            Cari berdasarkan Cabang, Nomor Ulok, dan Lingkup Kerja, lalu
            lihat/unduh file.
          </p>
          <Link to="/hasil-dokumen">
            <button className="secondary">Lihat Hasil</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
