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
    <div className="dashboard-layout">
      
      {/* OVERLAY & SIDEBAR */}
      {isSidebarOpen && <div className="sidebar-overlay desktop-hide" onClick={toggleSidebar}></div>}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        
        <div className="sidebar-logo">
          <div className="logo-box"></div>
          <div className="logo-text">
            <h2>KasKita</h2>
            <p>MANAGEMENT KAS</p>
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
        <header className="top-header">
          <div className="header-left">
            <button className="hamburger-btn" onClick={toggleSidebar}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <h1 className="page-title">Dashboard</h1>
          </div>
          
          <div className="header-controls">
            <div className="icon-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <div className="header-divider"></div>
            <div className="profile-wrapper">
              <div className="header-avatar">
                <img src={`https://ui-avatars.com/api/?name=${displayName}&background=f4f7fe&color=4318FF&bold=true`} alt="Profile" />
              </div>
              <div className="profile-text">
                <span className="profile-name">{displayName}</span>
                <span className="profile-role">{displayRole}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="content-area">
          
          {/* BARIS 1: SUMMARY CARDS */}
          <div className="summary-cards-row">
            <div className="summary-card balance">
              <div className="card-info">
                <p className="card-label">Total Saldo</p>
                <h3 className="card-amount">Rp {summaryData.balance.toLocaleString('id-ID')}</h3>
              </div>
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
              </div>
            </div>

            <div className="summary-card income">
              <div className="card-info">
                <p className="card-label">Pemasukan (Bulan Ini)</p>
                <h3 className="card-amount">+Rp {summaryData.income.toLocaleString('id-ID')}</h3>
              </div>
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
              </div>
            </div>

            <div className="summary-card expense">
              <div className="card-info">
                <p className="card-label">Pengeluaran (Bulan Ini)</p>
                <h3 className="card-amount">-Rp {summaryData.expense.toLocaleString('id-ID')}</h3>
              </div>
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
              </div>
            </div>
          </div>

          {/* ROW 2: CHART & STATUS TARGET */}
          <div className="grid-row-2">
            
            {/* Kiri: Chart Donut */}
            <div className="dashboard-card chart-card">
              <div className="card-header-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4318FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
                <h3 className="card-title-new">ALOKASI PENGELUARAN</h3>
              </div>
              
              <div className="chart-placeholder-new">
                <div className="donut-wrapper">
                  <div className="donut-chart-css"></div>
                  <div className="donut-inner-text">
                    <span className="donut-label">Terbesar</span>
                    <span className="donut-value">Konsumsi</span>
                  </div>
                </div>
                
                <div className="chart-legend-new">
                  <p><span className="dot purple"></span> Konsumsi (27%)</p>
                  <p><span className="dot green"></span> Admin (23%)</p>
                  <p><span className="dot orange"></span> Dekor (44%)</p>
                  <p><span className="dot pink"></span> Lainnya (6%)</p>
                </div>
              </div>
            </div>

            {/* Kanan: Status Target Kelas */}
            <div className="dashboard-card status-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="status-header-new" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header-icon" style={{ marginBottom: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                  <h3 className="card-title-new">TARGET KELAS: {targetData.name.toUpperCase()}</h3>
                </div>
                <div className="ratio-text-new">
                  <span className="ratio-highlight" style={{ color: '#059669', fontSize: '1.3rem' }}>{targetPercentage}%</span>
                </div>
              </div>
              
              <div className="progress-bar-container-new" style={{ height: '12px', marginBottom: '1.5rem' }}>
                <div className="progress-fill-new" style={{ width: `${targetPercentage}%`, backgroundColor: '#10b981' }}></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Terkumpul</p>
                  <h4 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', color: '#1e293b', fontWeight: 800 }}>Rp {targetData.collected.toLocaleString('id-ID')}</h4>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Goal Target</p>
                  <h4 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', color: '#059669', fontWeight: 800 }}>Rp {targetData.goal.toLocaleString('id-ID')}</h4>
                </div>
              </div>
              
            </div>
          </div>

          {/* ROW 3: TRANSAKSI TERBARU */}
          <div className="table-card">
            <div className="table-header-container">
              <h3 className="transaction-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4318FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Transaksi Terbaru
              </h3>
              <button className="btn-see-all">Lihat Semua <span>›</span></button>
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
                      <td className="col-date">{tx.date}</td>
                      <td>
                        <span className={`cat-badge ${
                          tx.category === 'Uang Kas' ? 'blue' : 
                          tx.category === 'Konsumsi' ? 'yellow' : 
                          tx.category === 'Administrasi' ? 'purple' : 'red-bg'
                        }`}>
                          {tx.category}
                        </span>
                      </td>
                      <td className="col-desc">{tx.desc}</td>
                      <td className={tx.type === 'INCOME' ? 'text-green' : 'text-red'}>
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
          <div className="modal-box">
            <div className="modal-icon-warning">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </div>
            <h3 className="modal-title">Konfirmasi Keluar</h3>
            <p className="modal-text">Apakah Anda yakin ingin keluar dari aplikasi KasKita?</p>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setShowLogoutModal(false)}>Batal</button>
              <button className="btn-modal-confirm" onClick={onLogout}>Ya, Keluar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default MemberDashboard;