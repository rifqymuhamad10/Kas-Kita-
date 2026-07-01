import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import './MemberTargetPage.css';

const API_BASE = 'http://localhost:8080/api/v1';

function MemberTargetPage({ user, onLogout, onNavigate, isSidebarOpen, toggleSidebar }) {
  const displayName = user?.name || "Siswa";
  const displayRole = "SISWA";

  // Data state
  const [targets, setTargets] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchTargets();
    fetchBalance();
  }, []);

  const fetchTargets = async () => {
    try {
      const res = await fetch(`${API_BASE}/targets`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTargets(data);
      }
    } catch (err) {
      console.error('Gagal memuat target:', err);
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

  // Format helpers
  const formatRupiah = (n) => n != null ? `RP ${Number(n).toLocaleString('id-ID')}` : 'RP 0';
  const formatDate = (ts) => ts ? new Date(ts).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : '-';
  const getProgress = (targetAmount) => {
    if (!targetAmount || targetAmount <= 0) return 0;
    return Math.min(Math.round((balance / targetAmount) * 100), 100);
  };

  const priorityLabel = { HIGH: 'TINGGI', MEDIUM: 'SEDANG', LOW: 'RENDAH' };
  const statusLabel = { ACTIVE: 'AKTIF', ACHIEVED: 'TERCAPAI', CANCELLED: 'DIBATALKAN' };

  return (
    <main className="main-content">
        
        {/* HEADER */}
        <header className="top-header manga-panel">
          <div className="header-left">
            <button className="hamburger-btn" onClick={toggleSidebar}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="square"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <h1 className="page-title">CHAPTER 3: TARGET KELAS</h1>
          </div>
          
          <div className="header-controls">
            <div className="profile-wrapper manga-box" onClick={() => onNavigate('profile')} style={{ cursor: 'pointer', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div className="profile-text">
                <span className="profile-name">{displayName.toUpperCase()}</span>
                <span className="profile-role">{displayRole}</span>
              </div>
              {user?.photoUrl ? (
                <img 
                  src={user.photoUrl} 
                  alt="Avatar" 
                  style={{ 
                    width: '36px', 
                    height: '36px', 
                    objectFit: 'cover', 
                    border: '2px solid var(--manga-ink)',
                    borderRadius: '4px',
                    backgroundColor: '#fff'
                  }} 
                />
              ) : (
                <div 
                  style={{ 
                    width: '36px', 
                    height: '36px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    backgroundColor: '#1a1a1a', 
                    color: '#fff', 
                    fontWeight: 'bold', 
                    fontSize: '1rem',
                    border: '2px solid var(--manga-ink)',
                    borderRadius: '4px'
                  }}
                >
                  {(displayName || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content-area">

          <div className="member-target-header">
            <h2 className="member-target-title">DAFTAR TARGET KELAS</h2>
          </div>

          {/* TARGET CARDS */}
          {loading ? (
            <div className="member-target-empty">
              <p className="member-target-empty-text">MEMUAT DATA...</p>
            </div>
          ) : targets.length === 0 ? (
            <div className="member-target-empty">
              <div className="member-target-empty-icon">◎</div>
              <p className="member-target-empty-text">BELUM ADA TARGET</p>
              <p className="member-target-empty-sub">Bendahara belum membuat target kelas. Cek kembali nanti!</p>
            </div>
          ) : (
            <div className="member-target-grid">
              {targets.map(target => {
                const progress = getProgress(target.targetAmount);
                const isExpanded = expandedId === target.id;
                return (
                  <div className="member-target-card manga-panel" key={target.id}>
                    
                    {/* Image */}
                    <div className="member-card-image">
                      {target.imageUrl ? (
                        <img src={target.imageUrl} alt={target.name} />
                      ) : (
                        <div className="member-card-image-placeholder">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                        </div>
                      )}
                      <span className={`member-priority-ribbon ${target.priority?.toLowerCase()}`}>
                        {priorityLabel[target.priority] || target.priority}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="member-card-body">
                      <div className="member-card-title-row">
                        <h3 className="member-card-name">{target.name}</h3>
                        <span className={`member-badge-status ${target.status?.toLowerCase()}`}>
                          {statusLabel[target.status] || target.status}
                        </span>
                      </div>

                      {/* Description - toggle expand */}
                      {isExpanded && target.description && (
                        <p className="member-card-desc">{target.description}</p>
                      )}

                      {/* Progress */}
                      {target.status === 'ACTIVE' && (
                        <div className="member-progress-section">
                          <div className="member-progress-header">
                            <p className="member-progress-label">PROGRESS</p>
                            <p className="member-progress-percent">{progress}%</p>
                          </div>
                          <div className="member-progress-bar">
                            <div 
                              className={`member-progress-bar-fill ${progress >= 100 ? 'achieved' : ''}`} 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Amount */}
                      <div className="member-amount-row">
                        <div className="member-amount-block">
                          <p className="member-amount-label">SALDO TERKUMPUL</p>
                          <p className="member-amount-value">{formatRupiah(balance)}</p>
                        </div>
                        <div className="member-amount-block" style={{ textAlign: 'right' }}>
                          <p className="member-amount-label">HARGA TARGET</p>
                          <p className="member-amount-value">{formatRupiah(target.targetAmount)}</p>
                        </div>
                      </div>

                      {/* Deadline */}
                      {target.deadline && (
                        <div className="member-deadline-row">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                          DEADLINE: {formatDate(target.deadline)}
                        </div>
                      )}

                      {/* Detail Toggle */}
                      {target.description && (
                        <button className="member-detail-toggle" onClick={() => setExpandedId(isExpanded ? null : target.id)}>
                          {isExpanded ? 'SEMBUNYIKAN DETAIL ▲' : 'LIHAT DETAIL ▼'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>
  );
}

export default MemberTargetPage;
