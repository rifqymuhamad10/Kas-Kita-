import React, { useState } from 'react';
import './Dashboard.css';

function MemberDashboard({ user, onLogout }) {
  const displayName = user?.name || "Siswa";
  const displayRole = "SISWA";

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // --- DUMMY DATA ---
  const [summaryData] = useState({
    balance: 1500000,
    income: 385000,
    expense: 132000
  });

  const [targetData] = useState({
    name: 'Beli Proyektor Kelas',
    collected: 1500000,
    goal: 2000000,
  });

  const [recentTransactions] = useState([
    { id: 'tx1', date: '2026-06-14', category: 'Uang Kas', type: 'INCOME', desc: 'Iuran Mingguan - Citra Lestari', amount: 20000 },
    { id: 'tx2', date: '2024-09-12', category: 'Uang Kas', type: 'INCOME', desc: 'Iuran Mingguan (8 Siswa)', amount: 160000 },
    { id: 'tx3', date: '2024-09-14', category: 'Konsumsi', type: 'EXPENSE', desc: 'Snack Rapat Kelas', amount: 45000 },
    { id: 'tx4', date: '2024-09-15', category: 'Administrasi', type: 'EXPENSE', desc: 'Fotocopy Modul', amount: 12000 },
    { id: 'tx5', date: '2024-09-18', category: 'Denda', type: 'INCOME', desc: 'Denda Keterlambatan', amount: 5000 },
  ]);

  // Hitung persentase target
  const targetPercentage = Math.round((targetData.collected / targetData.goal) * 100);

  return (
    <div className="dashboard-layout manga-theme">
      
      {/* OVERLAY & SIDEBAR */}
      {isSidebarOpen && <div className="sidebar-overlay desktop-hide" onClick={toggleSidebar}></div>}
      <aside className={`sidebar manga-panel ${isSidebarOpen ? 'open' : 'closed'}`}>
        
        <div className="sidebar-logo">
          <div className="logo-box"></div>
          <div className="logo-text">
            <h2>KASKITA</h2>
            <p>MANAGEMENT</p>
          </div>
        </div>
        
        <nav className="sidebar-menu">
          <div className="menu-item active">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            DASHBOARD
          </div>
          <div className="menu-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            TRANSAKSI
          </div>
          <div className="menu-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle></svg>
            TARGET KELAS
          </div>
          
          <div className="sidebar-bottom">
            <div className="sidebar-divider"></div>
            <div className="menu-item logout-btn" onClick={() => setShowLogoutModal(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              LOG OUT
            </div>
          </div>
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
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
                <h3 className="card-amount impact-text bg-white-highlight">Rp {summaryData.balance.toLocaleString('id-ID')}</h3>
              </div>
            </div>

            <div className="summary-card income manga-panel">
              <div className="card-info">
                <p className="card-label">PEMASUKAN</p>
                <h3 className="card-amount">Rp {summaryData.income.toLocaleString('id-ID')}</h3>
              </div>
            </div>

            <div className="summary-card expense manga-panel">
              <div className="card-info">
                <p className="card-label">PENGELUARAN</p>
                <h3 className="card-amount text-semantic-red">Rp {summaryData.expense.toLocaleString('id-ID')}</h3>
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
              <div className="status-header-new">
                <h3 className="card-title-new">TARGET KELAS: {targetData.name.toUpperCase()}</h3>
                <div className="ratio-text-new manga-box">
                  <span className="ratio-highlight" style={{ fontSize: '1.2rem' }}>{targetPercentage}%</span>
                </div>
              </div>
              
              <div className="progress-bar-container-new manga-border">
                <div className="progress-fill-new manga-ink-bg" style={{ width: `${targetPercentage}%` }}></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <div>
                  <p className="mono-text" style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>TERKUMPUL</p>
                  <h4 className="mono-text" style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: 800 }}>RP {targetData.collected.toLocaleString('id-ID')}</h4>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className="mono-text" style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>GOAL TARGET</p>
                  <h4 className="mono-text" style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: 800 }}>RP {targetData.goal.toLocaleString('id-ID')}</h4>
                </div>
              </div>
              
            </div>
          </div>

          {/* ROW 3: TRANSAKSI TERBARU */}
          <div className="table-card manga-panel">
            <div className="table-header-container">
              <h3 className="transaction-title">HISTORI TRANSAKSI</h3>
            </div>
            
            <div className="table-responsive">
              <table className="transaction-table">
                <thead>
                  <tr>
                    <th>TANGGAL</th>
                    <th>KATEGORI</th>
                    <th>KETERANGAN</th>
                    <th>JUMLAH</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map(tx => (
                    <tr key={tx.id}>
                      <td className="col-date mono-text">{tx.date}</td>
                      <td>
                        <span className="cat-badge manga-box">
                          {tx.category.toUpperCase()}
                        </span>
                      </td>
                      <td className="col-desc">{tx.desc.toUpperCase()}</td>
                      <td className={`mono-text ${tx.type === 'INCOME' ? '' : 'text-semantic-red'}`}>
                        {tx.type === 'INCOME' ? '+RP ' : '-RP '}{tx.amount.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      {/* --- POPUP KONFIRMASI LOGOUT --- */}
      {showLogoutModal && (
        <div className="modal-overlay-custom">
          <div className="modal-box manga-panel action-burst">
            <h3 className="modal-title impact-text">YAKIN MAU KELUAR?!</h3>
            <p className="modal-text">Kamu harus login lagi nanti!</p>
            <div className="modal-actions">
              <button className="btn-modal-cancel manga-btn" onClick={() => setShowLogoutModal(false)}>BATAL</button>
              <button className="btn-modal-confirm manga-btn active" onClick={onLogout}>YA, KELUAR!</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default MemberDashboard;