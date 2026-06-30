import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import './MemberTransactionPage.css';

const API_BASE = 'http://localhost:8080/api/v1';
const CATEGORIES = ['ALL', 'IURAN KAS', 'KONSUMSI', 'ATK', 'KEGIATAN', 'LAINNYA'];

function MemberTransactionPage({ user, onLogout, onNavigate, isSidebarOpen, toggleSidebar }) {
  const displayName = user?.name || "Memuat...";
  const displayRole = user?.role === 'ROLE_ADMIN' ? "BENDAHARA" : "SISWA";

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

    </main>
  );
}

export default MemberTransactionPage;
