import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import './MemberTransactionPage.css';

const API_BASE = 'http://localhost:8080/api/v1';
const CATEGORIES = ['ALL', 'IURAN KAS', 'KONSUMSI', 'ATK', 'KEGIATAN', 'LAINNYA'];

function MemberTransactionPage({ user, onLogout, onNavigate }) {
  const displayName = user?.name || "Memuat...";
  const displayRole = user?.role === 'ROLE_ADMIN' ? "BENDAHARA" : "SISWA";

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Data state
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Proof Modal state
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  useEffect(() => {
    fetchTransactions();
    fetchBalance();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error('Gagal memuat transaksi:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const res = await fetch(`${API_BASE}/transactions/balance`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBalance(data);
      }
    } catch (err) {
      console.error('Gagal memuat saldo:', err);
    }
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter(tx => {
    if (selectedCategory === 'ALL') return true;
    return (tx.category || 'LAINNYA') === selectedCategory;
  });

  return (
    <div className="dashboard-layout manga-theme">
      {/* OVERLAY */}
      {isSidebarOpen && <div className="sidebar-overlay desktop-hide" onClick={toggleSidebar}></div>}

      {/* --- SIDEBAR --- */}
      <aside className={`sidebar manga-panel ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-logo">
          <div className="logo-box"></div>
          <div className="logo-text">
            <h2>KASKITA</h2>
            <p>MANAGEMENT</p>
          </div>
        </div>

        <nav className="sidebar-menu">
          <div className="menu-item" onClick={() => onNavigate('dashboard')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            DASHBOARD
          </div>
          <div className="menu-item active">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            TRANSAKSI
          </div>
          <div className="menu-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><circle cx="8" cy="8" r="7"></circle><circle cx="16" cy="16" r="7"></circle></svg>
            IURAN KAS
          </div>
          <div className="menu-item" onClick={() => onNavigate('target')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle></svg>
            TARGET
          </div>
          <div className="menu-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
              <path d="M22 19H2V5h5l2 3h13v11z"></path>
            </svg>
            KATEGORI
          </div>
          <div className="menu-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
              <rect x="2" y="6" width="20" height="12"></rect>
              <path d="M18 10h4v4h-4z"></path>
            </svg>
            DOMPET
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
        <header className="top-header manga-panel">
          <div className="header-left">
            <button className="hamburger-btn" onClick={toggleSidebar}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="square"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <h1 className="page-title">CHAPTER 2: MANAJEMEN TRANSAKSI</h1>
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
          {/* Summary Card and Category Filter */}
          <div className="summary-row-member">
            <div className="summary-card balance manga-panel speed-lines-bg">
              <div className="card-info relative-z">
                <p className="card-label bg-white-highlight">TOTAL SALDO KAS KELAS</p>
                <h3 className="card-amount impact-text bg-white-highlight">Rp {balance.toLocaleString('id-ID')}</h3>
              </div>
            </div>

            <div className="filter-card manga-panel">
              <h3 className="filter-title">FILTER KATEGORI</h3>
              <select 
                className="filter-select manga-box"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Transactions List */}
          <div className="table-card manga-panel">
            <div className="table-header-container">
              <h3 className="transaction-title">LAPORAN KAS TRANSPARAN</h3>
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
                    <th>BUKTI</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                        MEMUAT LAPORAN TRANSAKSI...
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', fontWeight: 700 }}>
                        TIDAK ADA DATA TRANSAKSI
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(tx => (
                      <tr key={tx.id}>
                        <td className="col-date mono-text">
                          {tx.timestamp ? new Date(tx.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : '-'}
                        </td>
                        <td>
                          <span className={`type-badge manga-box ${tx.type === 'INCOME' ? 'manga-ink-bg' : 'manga-white-bg text-semantic-red'}`}>
                            {tx.type === 'INCOME' ? 'MASUK' : 'KELUAR'}
                          </span>
                        </td>
                        <td>
                          <span className="cat-badge-tx manga-box">
                            {tx.category || 'LAINNYA'}
                          </span>
                        </td>
                        <td className="col-desc">{(tx.description || '').toUpperCase()}</td>
                        <td className={`mono-text ${tx.type === 'INCOME' ? '' : 'text-semantic-red'}`}>
                          {tx.type === 'INCOME' ? '+RP ' : '-RP '}{(tx.amount || 0).toLocaleString('id-ID')}
                        </td>
                        <td>
                          {tx.evidenceUrl || tx.evidenceDesc ? (
                            <button 
                              className="btn-view-evidence manga-box"
                              onClick={() => setSelectedEvidence({ url: tx.evidenceUrl, desc: tx.evidenceDesc, title: tx.description })}
                            >
                              LIHAT BUKTI
                            </button>
                          ) : (
                            <span className="no-evidence">TIDAK ADA</span>
                          )}
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

      {/* --- EVIDENCE PREVIEW MODAL --- */}
      {selectedEvidence && (
        <div className="modal-overlay-custom" onClick={() => setSelectedEvidence(null)}>
          <div className="modal-box-evidence manga-panel" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title impact-text">BUKTI TRANSAKSI</h3>
            <p className="evidence-title-sub">{(selectedEvidence.title || '').toUpperCase()}</p>
            
            <div className="evidence-content-box">
              {selectedEvidence.url && (
                <div className="evidence-image-container manga-border">
                  <img src={selectedEvidence.url} alt="Kuitansi Bukti" className="evidence-image-preview" />
                </div>
              )}
              {selectedEvidence.desc && (
                <div className="evidence-desc-card manga-box">
                  <span className="desc-card-label">CATATAN BUKTI:</span>
                  <p className="desc-card-text">{selectedEvidence.desc}</p>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-modal-cancel manga-btn active" onClick={() => setSelectedEvidence(null)}>
                TUTUP
              </button>
            </div>
          </div>
        </div>
      )}

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

export default MemberTransactionPage;
