import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import './AdminTargetPage.css';

const API_BASE = 'http://localhost:8080/api/v1';

function AdminTargetPage({ user, onLogout, onNavigate }) {
  const displayName = user?.name || "Memuat...";
  const displayRole = user?.role === 'ROLE_ADMIN' ? "BENDAHARA" : "SISWA";

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Target state
  const [targets, setTargets] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingTarget, setEditingTarget] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '', description: '', targetAmount: '', imageUrl: '', deadline: '', priority: 'MEDIUM'
  });

  // Fetch targets & balance
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

  // Open form modal
  const openAddForm = () => {
    setEditingTarget(null);
    setFormData({ name: '', description: '', targetAmount: '', imageUrl: '', deadline: '', priority: 'MEDIUM' });
    setShowFormModal(true);
  };

  const openEditForm = (target) => {
    setEditingTarget(target);
    setFormData({
      name: target.name || '',
      description: target.description || '',
      targetAmount: target.targetAmount || '',
      imageUrl: target.imageUrl || '',
      deadline: target.deadline ? new Date(target.deadline).toISOString().split('T')[0] : '',
      priority: target.priority || 'MEDIUM'
    });
    setShowFormModal(true);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      description: formData.description,
      targetAmount: parseFloat(formData.targetAmount),
      imageUrl: formData.imageUrl || null,
      deadline: formData.deadline ? new Date(formData.deadline).getTime() : null,
      priority: formData.priority
    };

    try {
      const url = editingTarget ? `${API_BASE}/targets/${editingTarget.id}` : `${API_BASE}/targets`;
      const method = editingTarget ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowFormModal(false);
        fetchTargets();
      } else {
        console.error('Gagal menyimpan target');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // Handle status change
  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/targets/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchTargets();
    } catch (err) {
      console.error('Error update status:', err);
    }
  };

  // Handle delete
  const confirmDelete = (id) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_BASE}/targets/${deleteTargetId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (res.ok) {
        setShowDeleteModal(false);
        setDeleteTargetId(null);
        fetchTargets();
      }
    } catch (err) {
      console.error('Error delete:', err);
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
          <div className="menu-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            TRANSAKSI
          </div>
          <div className="menu-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><circle cx="8" cy="8" r="7"></circle><circle cx="16" cy="16" r="7"></circle></svg>
            IURAN KAS
          </div>
          <div className="menu-item active">
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
        
        {/* HEADER */}
        <header className="top-header manga-panel">
          <div className="header-left">
            <button className="hamburger-btn" onClick={toggleSidebar}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="square"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <h1 className="page-title">TARGET</h1>
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
          
          {/* PAGE HEADER WITH ADD BUTTON */}
          <div className="target-page-header">
            <h2 className="target-page-title">DAFTAR TARGET KELAS</h2>
            <button className="btn-add-target" onClick={openAddForm}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              TAMBAH TARGET
            </button>
          </div>

          {/* TARGET CARDS */}
          {loading ? (
            <div className="target-empty-state">
              <p className="target-empty-text">MEMUAT DATA...</p>
            </div>
          ) : targets.length === 0 ? (
            <div className="target-empty-state">
              <div className="target-empty-icon">◎</div>
              <p className="target-empty-text">BELUM ADA TARGET</p>
              <p className="target-empty-sub">Klik tombol "Tambah Target" untuk membuat target baru</p>
            </div>
          ) : (
            <div className="target-cards-grid">
              {targets.map(target => {
                const progress = getProgress(target.targetAmount);
                return (
                  <div className="target-card manga-panel" key={target.id}>
                    
                    {/* Image */}
                    <div className="target-card-image">
                      {target.imageUrl ? (
                        <img src={target.imageUrl} alt={target.name} />
                      ) : (
                        <div className="target-card-image-placeholder">◎</div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="target-card-body">
                      <div className="target-card-top">
                        <h3 className="target-card-name">{target.name}</h3>
                      </div>

                      {target.description && (
                        <p className="target-card-desc">{target.description}</p>
                      )}

                      <div className="target-badges">
                        <span className={`badge-status ${target.status?.toLowerCase()}`}>
                          {statusLabel[target.status] || target.status}
                        </span>
                        <span className={`badge-priority ${target.priority?.toLowerCase()}`}>
                          {priorityLabel[target.priority] || target.priority}
                        </span>
                      </div>

                      {/* Progress */}
                      {target.status === 'ACTIVE' && (
                        <>
                          <div className="target-progress-container">
                            <div className="target-progress-fill" style={{ width: `${progress}%` }}></div>
                          </div>
                          <p className="target-progress-text">{progress}% — {formatRupiah(balance)} / {formatRupiah(target.targetAmount)}</p>
                        </>
                      )}

                      {/* Info */}
                      <div className="target-card-info">
                        <div className="target-info-block">
                          <p className="target-info-label">HARGA TARGET</p>
                          <p className="target-info-value">{formatRupiah(target.targetAmount)}</p>
                        </div>
                        <div className="target-info-block" style={{ textAlign: 'right' }}>
                          <p className="target-info-label">DEADLINE</p>
                          <p className="target-info-value small">{formatDate(target.deadline)}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="target-card-actions">
                        <button className="btn-target-action" onClick={() => openEditForm(target)}>EDIT</button>
                        <select
                          className="status-select"
                          value={target.status}
                          onChange={(e) => handleStatusChange(target.id, e.target.value)}
                        >
                          <option value="ACTIVE">AKTIF</option>
                          <option value="ACHIEVED">TERCAPAI</option>
                          <option value="CANCELLED">DIBATALKAN</option>
                        </select>
                        <button className="btn-target-action danger" onClick={() => confirmDelete(target.id)}>HAPUS</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>

      {/* --- FORM MODAL --- */}
      {showFormModal && (
        <div className="target-modal-overlay" onClick={() => setShowFormModal(false)}>
          <div className="target-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="target-modal-title">
              {editingTarget ? 'EDIT TARGET' : 'TAMBAH TARGET BARU'}
            </h3>
            <form className="target-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">NAMA TARGET</label>
                <input className="form-input" type="text" required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="contoh: Proyektor Kelas"
                />
              </div>
              <div className="form-group">
                <label className="form-label">DESKRIPSI</label>
                <textarea className="form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Deskripsi detail tentang target ini..."
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">HARGA TARGET (RP)</label>
                  <input className="form-input" type="number" required min="0"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                    placeholder="2000000"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">PRIORITAS</label>
                  <select className="form-select"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="HIGH">TINGGI</option>
                    <option value="MEDIUM">SEDANG</option>
                    <option value="LOW">RENDAH</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">DEADLINE</label>
                  <input className="form-input" type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">URL GAMBAR (OPSIONAL)</label>
                  <input className="form-input" type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="target-modal-actions">
                <button type="button" className="btn-modal secondary" onClick={() => setShowFormModal(false)}>BATAL</button>
                <button type="submit" className="btn-modal primary">{editingTarget ? 'SIMPAN' : 'TAMBAH'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRM MODAL --- */}
      {showDeleteModal && (
        <div className="modal-overlay-custom">
          <div className="modal-box manga-panel action-burst">
            <h3 className="modal-title impact-text">HAPUS TARGET?!</h3>
            <p className="modal-text">Data target ini akan hilang selamanya!</p>
            <div className="modal-actions">
              <button className="btn-modal-cancel manga-btn" onClick={() => setShowDeleteModal(false)}>BATAL</button>
              <button className="btn-modal-confirm manga-btn active" onClick={handleDelete}>YA, HAPUS!</button>
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

export default AdminTargetPage;
