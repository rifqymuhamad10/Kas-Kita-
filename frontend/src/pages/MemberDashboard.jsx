import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const API_BASE = 'http://localhost:8080/api/v1';

function MemberDashboard({ user, onLogout, onNavigate, isSidebarOpen, toggleSidebar }) {
  const displayName = user?.name || "Siswa";
  const displayRole = "SISWA";

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // --- API DATA ---
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [activeTarget, setActiveTarget] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pie chart: kalkulasi pengeluaran per kategori dari data transaksi
  const CATEGORY_COLORS = [
    { fill: '#1A1A1A', stroke: '#1A1A1A', label: 'IURAN KAS' },
    { fill: '#888888', stroke: '#1A1A1A', label: 'KONSUMSI' },
    { fill: '#CCCCCC', stroke: '#1A1A1A', label: 'ATK' },
    { fill: '#444444', stroke: '#1A1A1A', label: 'KEGIATAN' },
    { fill: '#FFFFFF', stroke: '#1A1A1A', label: 'LAINNYA' },
  ];

  const categoryData = (() => {
    const expenseTxs = recentTransactions.filter(tx => tx.type === 'EXPENSE');
    const totals = {};
    expenseTxs.forEach(tx => {
      const cat = tx.category || 'LAINNYA';
      totals[cat] = (totals[cat] || 0) + (tx.amount || 0);
    });
    const totalExpense = Object.values(totals).reduce((a, b) => a + b, 0);
    return CATEGORY_COLORS
      .map(c => ({
        ...c,
        amount: totals[c.label] || 0,
        pct: totalExpense > 0 ? Math.round(((totals[c.label] || 0) / totalExpense) * 100) : 0
      }))
      .filter(c => c.amount > 0);
  })();

  // SVG Pie chart helper
  const buildPieSlices = (data) => {
    const SIZE = 140, R = 60, cx = SIZE / 2, cy = SIZE / 2;
    const total = data.reduce((s, d) => s + d.amount, 0);
    if (total === 0) return [];
    let startAngle = -Math.PI / 2;
    return data.map((d) => {
      const angle = (d.amount / total) * 2 * Math.PI;
      const x1 = cx + R * Math.cos(startAngle);
      const y1 = cy + R * Math.sin(startAngle);
      const endAngle = startAngle + angle;
      const x2 = cx + R * Math.cos(endAngle);
      const y2 = cy + R * Math.sin(endAngle);
      const largeArc = angle > Math.PI ? 1 : 0;
      const pathD = `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      startAngle = endAngle;
      return { ...d, pathD };
    });
  };
  const pieSlices = buildPieSlices(categoryData);
  const largestCat = categoryData.length > 0 ? categoryData.reduce((a, b) => a.amount > b.amount ? a : b) : null;

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
          <div className="menu-item" onClick={() => onNavigate('transactions')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            TRANSAKSI
          </div>
          <div className="menu-item" onClick={() => onNavigate('target')}>
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
            
            {/* Kiri: Pie Chart Dinamis */}
            <div className="dashboard-card chart-card manga-panel screentone-bg">
              <h3 className="card-title-new bg-white-highlight inline-block">ALOKASI PENGELUARAN</h3>
              
              <div className="chart-placeholder-new bg-white-highlight border-box">
                {categoryData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', fontWeight: 800, width: '100%' }}>
                    BELUM ADA DATA PENGELUARAN
                  </div>
                ) : (
                  <>
                    <div className="donut-wrapper">
                      <svg width="140" height="140" viewBox="0 0 140 140" style={{ border: '2px solid #1A1A1A', borderRadius: '50%' }}>
                        {pieSlices.map((slice, i) => (
                          <path
                            key={i}
                            d={slice.pathD}
                            fill={slice.fill}
                            stroke={slice.stroke}
                            strokeWidth="1.5"
                          />
                        ))}
                        {/* Lingkaran tengah (donut hole) */}
                        <circle cx="70" cy="70" r="38" fill="white" stroke="#1A1A1A" strokeWidth="2" />
                        {largestCat && (
                          <>
                            <text x="70" y="65" textAnchor="middle" fontSize="7" fontWeight="800" fill="#1A1A1A" fontFamily="'Comic Neue', sans-serif">TERBESAR</text>
                            <text x="70" y="78" textAnchor="middle" fontSize="9" fontWeight="800" fill="#1A1A1A" fontFamily="'Comic Neue', sans-serif">{largestCat.label}</text>
                            <text x="70" y="90" textAnchor="middle" fontSize="10" fontWeight="800" fill="#1A1A1A" fontFamily="'JetBrains Mono', monospace">{largestCat.pct}%</text>
                          </>
                        )}
                      </svg>
                    </div>
                    
                    <div className="chart-legend-new">
                      {categoryData.map((cat, i) => (
                        <p key={i}>
                          <span className="dot" style={{ backgroundColor: cat.fill, border: `2px solid ${cat.stroke}` }}></span>
                          {cat.label} ({cat.pct}%)
                        </p>
                      ))}
                    </div>
                  </>
                )}
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

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                    <div>
                      <p className="mono-text" style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>TERKUMPUL</p>
                      <h4 className="mono-text" style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: 800 }}>RP {balance.toLocaleString('id-ID')}</h4>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p className="mono-text" style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>GOAL TARGET</p>
                      <h4 className="mono-text" style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: 800 }}>RP {activeTarget.targetAmount.toLocaleString('id-ID')}</h4>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <h3 className="card-title-new" style={{ margin: '0 0 10px 0' }}>TARGET KELAS</h3>
                  <div className="manga-box" style={{ padding: '1rem', background: 'var(--screentone)', backgroundSize: '5px 5px', border: '2px solid var(--manga-ink)' }}>
                    <p style={{ fontWeight: 800, margin: 0 }}>BELUM ADA TARGET AKTIF</p>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, margin: '5px 0 0 0' }}>Cek kembali nanti saat Bendahara menambahkan target baru.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ROW 3: RIWAYAT TRANSAKSI */}
          <div className="table-card manga-panel">
            <div className="table-header-container">
              <h3 className="transaction-title">RIWAYAT TRANSAKSI</h3>
            </div>
            
            <div className="table-responsive">
              <table className="transaction-table">
                <thead>
                  <tr>
                    <th>TANGGAL</th>
                    <th>TIPE</th>
                    <th>KATEGORI</th>
                    <th>KETERANGAN</th>
                    <th>JUMLAH</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', fontWeight: 700 }}>
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
                          <span className={`cat-badge manga-box ${tx.type === 'INCOME' ? 'manga-ink-bg' : 'manga-white-bg text-semantic-red'}`}>
                            {tx.type === 'INCOME' ? 'PEMASUKAN' : 'PENGELUARAN'}
                          </span>
                        </td>
                        <td>
                          <span className="cat-badge manga-box">
                            {tx.category || 'LAINNYA'}
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