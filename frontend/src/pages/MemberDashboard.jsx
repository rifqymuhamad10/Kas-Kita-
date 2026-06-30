import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const API_BASE = 'http://localhost:8080/api/v1';

function MemberDashboard({ user, onLogout, onNavigate, isSidebarOpen, toggleSidebar }) {
  const displayName = user?.name || "Siswa";
  const displayRole = "SISWA";

  // --- API DATA ---
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [activeTarget, setActiveTarget] = useState(null);
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

        // Fetch active target
        const targetRes = await fetch(`${API_BASE}/targets/active`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        if (targetRes.ok) {
          const targets = await targetRes.json();
          if (targets && targets.length > 0) {
            setActiveTarget(targets[0]);
          }
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
              <span className="profile-name">{displayName.toUpperCase()}</span>
              <span className="profile-role">{displayRole}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="content-area">
        
        {/* BARIS 1: ASYMMETRIC GRID */}
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

        {/* ROW 2: CHART & STATUS TARGET */}
        <div className="grid-row-2">
          
          {/* Kiri: Chart Donut */}
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

          {/* Kanan: Status Target Kelas */}
          <div className="dashboard-card status-card manga-panel" style={{ display: 'flex', flexDirection: 'column', justifyItems: 'center', justifyContent: 'center' }}>
            {activeTarget ? (
              <>
                <div className="status-header-new">
                  <h3 className="card-title-new" style={{ textTransform: 'uppercase' }}>TARGET KELAS: {activeTarget.name}</h3>
                  <div className="ratio-text-new manga-box">
                    <span className="ratio-highlight" style={{ fontSize: '1.2rem' }}>
                      {Math.min(Math.round((balance / activeTarget.targetAmount) * 100), 100)}%
                    </span>
                  </div>
                </div>
                
                <div className="progress-bar-container-new manga-border">
                  <div className="progress-fill-new manga-ink-bg" style={{ width: `${Math.min(Math.round((balance / activeTarget.targetAmount) * 100), 100)}%` }}></div>
                </div>

                <div className="target-details-manga" style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                  <p>TARGET DANA: <strong>RP {activeTarget.targetAmount?.toLocaleString('id-ID')}</strong></p>
                  <p>TENGGAT WAKTU: <strong>{activeTarget.deadline ? new Date(activeTarget.deadline).toLocaleDateString('id-ID', { dateStyle: 'long' }).toUpperCase() : '-'}</strong></p>
                </div>
              </>
            ) : (
              <div className="no-target-msg" style={{ textAlign: 'center', padding: '2rem' }}>
                <p className="bold-text">BELUM ADA TARGET KELAS AKTIF</p>
                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>Cek kembali nanti saat Bendahara membuat target baru.</p>
              </div>
            )}
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
                  <th>KETERANGAN</th>
                  <th>JUMLAH</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', fontWeight: 700 }}>
                      BELUM ADA TRANSAKSI
                    </td>
                  </tr>
                ) : (
                  recentTransactions.slice(0, 5).map(tx => (
                    <tr key={tx.id}>
                      <td className="col-date mono-text">
                        {tx.timestamp ? new Date(tx.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : '-'}
                      </td>
                      <td>
                        <span className="cat-badge manga-box">
                          {tx.type || 'MASUK'}
                        </span>
                      </td>
                      <td className="col-desc">{(tx.description || '').toUpperCase()}</td>
                      <td className={`mono-text ${tx.type === 'INCOME' ? '' : 'text-semantic-red'}`}>
                        {tx.type === 'INCOME' ? '+RP ' : '-RP '}{(tx.amount || 0).toLocaleString('id-ID')}
                      </td>
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

export default MemberDashboard;