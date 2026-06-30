import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const API_BASE = 'http://localhost:8080/api/v1';

function AdminDashboard({ user, onLogout, onNavigate, isSidebarOpen, toggleSidebar }) {
  const displayName = user?.name || "Memuat...";
  const displayRole = user?.role === 'ROLE_ADMIN' ? "BENDAHARA" : "SISWA";

  // --- API DATA ---
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch balance
        const balanceRes = await fetch(`${API_BASE}/transactions/balance`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        if (balanceRes.ok) {
          const bal = await balanceRes.json();
          setBalance(bal);
        }

        // Fetch transactions
        const txRes = await fetch(`${API_BASE}/transactions`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        if (txRes.ok) {
          const txs = await txRes.json();
          let inc = 0;
          let exp = 0;
          txs.forEach(t => {
            if (t.type === 'INCOME') inc += t.amount || 0;
            else if (t.type === 'EXPENSE') exp += t.amount || 0;
          });
          setIncome(inc);
          setExpense(exp);
          setRecentTransactions(txs);
        }
      } catch (err) {
        console.error("Gagal mengambil data dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchData();
    }
  }, [user]);

  const [studentStatus] = useState([
    { id: 's1', name: 'Ahmad', status: 'LUNAS', seed: 'Jack' },
    { id: 's2', name: 'Budi', status: 'LUNAS', seed: 'Felix' },
    { id: 's3', name: 'Citra', status: 'BELUM', seed: 'Jocelyn' },
    { id: 's4', name: 'Dewi', status: 'LUNAS', seed: 'Avery' },
  ]);

  return (
    <main className="main-content">
      
      {/* HEADER */}
      <header className="top-header manga-panel">
        <div className="header-left">
          <button className="hamburger-btn" onClick={toggleSidebar}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="square"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <h1 className="page-title">CHAPTER 1: DASHBOARD</h1>
        </div>
        
        <div className="header-controls">
          <div className="profile-wrapper manga-box">
            <div className="profile-text">
              <span className="profile-name">{displayName}</span>
              <span className="profile-role">{displayRole}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="content-area">
        
        {/* BARIS 1: ASYMMETRIC GRID (KARENA DILARANG 3 KOLOM SAMA RATA) */}
        <div className="summary-cards-row">
          <div className="summary-card balance manga-panel speed-lines-bg">
            <div className="card-info relative-z">
              <p className="card-label bg-white-highlight">TOTAL SALDO</p>
              <h3 className="card-amount impact-text bg-white-highlight">Rp {balance.toLocaleString('id-ID')}</h3>
            </div>
          </div>

          <div className="summary-card income manga-panel">
            <div className="card-info">
              <p className="card-label">PEMASUKAN</p>
              <h3 className="card-amount">Rp {income.toLocaleString('id-ID')}</h3>
            </div>
          </div>

          <div className="summary-card expense manga-panel">
            <div className="card-info">
              <p className="card-label">PENGELUARAN</p>
              <h3 className="card-amount text-semantic-red">Rp {expense.toLocaleString('id-ID')}</h3>
            </div>
          </div>
        </div>

        {/* ROW 2: CHART & STATUS KAS */}
        <div className="grid-row-2">
          <div className="dashboard-card chart-card manga-panel screentone-bg">
            <h3 className="card-title-new bg-white-highlight inline-block">ALOKASI PENGELUARAN</h3>
            
            <div className="chart-placeholder-new bg-white-highlight border-box">
              <div className="donut-wrapper">
                <div className="donut-chart-css manga-donut"></div>
                <div className="donut-inner-text">
                  <span className="donut-label">TERBESAR</span>
                  <span className="donut-value">KONSUMSI</span>
                </div>
              </div>
              
              <div className="chart-legend-new">
                <p><span className="dot fill-black"></span> KONSUMSI (27%)</p>
                <p><span className="dot fill-grey"></span> ADMIN (23%)</p>
                <p><span className="dot fill-stripe"></span> DEKOR (44%)</p>
                <p><span className="dot border-only"></span> LAINNYA (6%)</p>
              </div>
            </div>
          </div>

          <div className="dashboard-card status-card manga-panel">
            <h3 className="card-title-new">DAFTAR KAS SISWA</h3>
            
            <div className="status-grid-new">
              {studentStatus.map(s => (
                <div className="student-row-new manga-box" key={s.id}>
                  <div className="student-profile-new">
                    <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${s.seed}`} alt="avatar" />
                    <span className="student-name-new">{s.name}</span>
                  </div>
                  <span className={`status-badge-new ${s.status === 'LUNAS' ? 'lunas-tag' : 'belum-tag'}`}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROW 3: TRANSAKSI TERAKHIR */}
        <div className="dashboard-card recent-tx-card manga-panel" style={{ marginTop: '1.5rem' }}>
          <h3 className="card-title-new bg-white-highlight inline-block">RIWAYAT TRANSAKSI TERAKHIR</h3>
          
          <div className="manga-table-wrapper" style={{ marginTop: '1rem' }}>
            <table className="manga-table">
              <thead>
                <tr>
                  <th>TANGGAL</th>
                  <th>KATEGORI</th>
                  <th>TIPE</th>
                  <th>NOMINAL</th>
                  <th>KETERANGAN</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>Belum ada data transaksi.</td>
                  </tr>
                ) : (
                  recentTransactions.slice(0, 5).map((t) => (
                    <tr key={t.id}>
                      <td className="mono-text">{new Date(t.timestamp).toLocaleDateString('id-ID')}</td>
                      <td className="bold-text">{t.category || "LAINNYA"}</td>
                      <td>
                        <span className={`type-badge ${t.type === 'INCOME' ? 'masuk' : 'keluar'}`}>
                          {t.type === 'INCOME' ? 'MASUK' : 'KELUAR'}
                        </span>
                      </td>
                      <td className={`mono-text ${t.type === 'EXPENSE' ? 'text-semantic-red' : ''}`}>
                        Rp {t.amount?.toLocaleString('id-ID')}
                      </td>
                      <td className="desc-cell">{t.description}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}

export default AdminDashboard;