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
            <h2 className="impact-text" style={{ fontSize: '1.5rem' }}>KasKita</h2>
            <p className="mono-text">MANAGEMENT KAS</p>
          </div>
        </div>
        
        <nav className="sidebar-menu">
          <div className="menu-item active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Dashboard
          </div>
          <div className="menu-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Transaksi
          </div>
          <div className="menu-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
            Target Kelas
          </div>
          
          <div className="sidebar-bottom">
            <div className="sidebar-divider"></div>
            <div className="menu-item logout-btn" onClick={() => setShowLogoutModal(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Log Out
            </div>
          </div>
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="main-content">
        
        {/* HEADER */}
        <header className="top-header manga-white-bg">
          <div className="header-left">
            <button className="hamburger-btn" onClick={toggleSidebar}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <h1 className="page-title">Dashboard</h1>
          </div>
          
          <div className="header-controls">
            <div className="icon-btn manga-border" style={{ padding: '0.5rem', borderRadius: '4px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <div className="header-divider"></div>
            <div className="profile-wrapper manga-border" style={{ borderRadius: '4px' }}>
              <div className="header-avatar manga-border" style={{ borderRadius: '50%', overflow: 'hidden' }}>
                <img src={`https://ui-avatars.com/api/?name=${displayName}&background=CCCCCC&color=1A1A1A&bold=true`} alt="Profile" />
              </div>
              <div className="profile-text">
                <span className="profile-name">{displayName}</span>
                <span className="profile-role mono-text">{displayRole}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="content-area">
          
          {/* BARIS 1: SUMMARY CARDS */}
          <div className="summary-cards-row">
            <div className="summary-card balance manga-panel manga-ink-bg speed-lines-bg">
              <div className="card-info relative-z">
                <p className="card-label">Total Saldo</p>
                <h3 className="card-amount mono-text">Rp {summaryData.balance.toLocaleString('id-ID')}</h3>
              </div>
              <div className="card-icon relative-z">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
              </div>
            </div>

            <div className="summary-card income manga-panel">
              <div className="card-info">
                <p className="card-label">Pemasukan (Bulan Ini)</p>
                <h3 className="card-amount mono-text">+Rp {summaryData.income.toLocaleString('id-ID')}</h3>
              </div>
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
              </div>
            </div>

            <div className="summary-card expense manga-panel">
              <div className="card-info">
                <p className="card-label">Pengeluaran (Bulan Ini)</p>
                <h3 className="card-amount mono-text text-semantic-red">-Rp {summaryData.expense.toLocaleString('id-ID')}</h3>
              </div>
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
              </div>
            </div>
          </div>

          {/* ROW 2: CHART & STATUS TARGET */}
          <div className="grid-row-2">
            
            {/* Kiri: Chart Donut */}
            <div className="dashboard-card chart-card manga-panel">
              <div className="card-header-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
                <h3 className="card-title-new">ALOKASI PENGELUARAN</h3>
              </div>
              
              <div className="chart-placeholder-new">
                <div className="donut-wrapper">
                  <div className="manga-donut"></div>
                  <div className="donut-inner-text">
                    <span className="donut-label">Terbesar</span>
                    <span className="donut-value">Konsumsi</span>
                  </div>
                </div>
                
                <div className="chart-legend-new">
                  <p><span className="dot fill-black"></span> Konsumsi (27%)</p>
                  <p><span className="dot fill-grey"></span> Admin (23%)</p>
                  <p><span className="dot fill-stripe"></span> Dekor (44%)</p>
                  <p><span className="dot border-only"></span> Lainnya (6%)</p>
                </div>
              </div>
            </div>

            {/* Kanan: Status Target Kelas */}
            <div className="dashboard-card status-card manga-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="status-header-new" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header-icon" style={{ marginBottom: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                  <h3 className="card-title-new">TARGET KELAS: {targetData.name.toUpperCase()}</h3>
                </div>
                <div className="ratio-text-new manga-border mono-text">
                  <span className="ratio-highlight" style={{ fontSize: '1.3rem' }}>{targetPercentage}%</span>
                </div>
              </div>
              
              <div className="progress-bar-container-new manga-border">
                <div className="progress-fill-new" style={{ width: `${targetPercentage}%`, backgroundColor: '#1A1A1A' }}></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <div>
                  <p className="mono-text" style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700 }}>Terkumpul</p>
                  <h4 className="mono-text" style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: 800 }}>Rp {targetData.collected.toLocaleString('id-ID')}</h4>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className="mono-text" style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700 }}>Goal Target</p>
                  <h4 className="mono-text" style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: 800 }}>Rp {targetData.goal.toLocaleString('id-ID')}</h4>
                </div>
              </div>
              
            </div>
          </div>

          {/* ROW 3: TRANSAKSI TERBARU */}
          <div className="table-card manga-panel">
            <div className="table-header-container">
              <h3 className="transaction-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Transaksi Terbaru
              </h3>
              <button className="btn-see-all manga-btn" style={{ flex: 'none', boxShadow: 'none', fontSize: '0.9rem', padding: '0.5rem 1rem' }}>Lihat Semua <span>›</span></button>
            </div>
            
            <div className="table-responsive">
              <table className="transaction-table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Kategori</th>
                    <th>Keterangan</th>
                    <th>Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map(tx => (
                    <tr key={tx.id}>
                      <td className="col-date mono-text">{tx.date}</td>
                      <td>
                        <span className={`cat-badge ${
                          tx.category === 'Uang Kas' ? 'fill-black manga-ink-bg' : 
                          tx.category === 'Konsumsi' ? 'fill-grey' : 
                          tx.category === 'Administrasi' ? 'fill-stripe' : 'border-only'
                        }`}>
                          {tx.category}
                        </span>
                      </td>
                      <td className="col-desc">{tx.desc}</td>
                      <td className={tx.type === 'INCOME' ? 'mono-text' : 'mono-text text-semantic-red'}>
                        {tx.type === 'INCOME' ? '+Rp ' : '-Rp '}{tx.amount.toLocaleString('id-ID')}
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
          <div className="modal-box manga-panel action-burst manga-white-bg">
            <div className="modal-icon-warning text-semantic-red">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </div>
            <h3 className="modal-title impact-text" style={{ fontSize: '1.4rem' }}>Konfirmasi Keluar</h3>
            <p className="modal-text">Apakah Anda yakin ingin keluar dari aplikasi KasKita?</p>
            <div className="modal-actions">
              <button className="btn-modal-cancel manga-btn" onClick={() => setShowLogoutModal(false)}>Batal</button>
              <button className="btn-modal-confirm manga-btn active" onClick={onLogout}>Ya, Keluar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default MemberDashboard;