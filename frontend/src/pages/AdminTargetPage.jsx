import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import './AdminTargetPage.css';
import { API_V1_BASE } from '../config';

const API_BASE = API_V1_BASE;

function AdminTargetPage({ user, onLogout, onNavigate, isSidebarOpen, toggleSidebar }) {
  const displayName = user?.name || "Memuat...";
  const displayRole = user?.role === 'ROLE_ADMIN' ? "BENDAHARA" : "SISWA";

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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Format file tidak didukung. Gunakan gambar JPG, PNG, WEBP, atau GIF.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal adalah 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, imageUrl: reader.result }));
    };
    reader.readAsDataURL(file);
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
            <div className="profile-wrapper manga-box" onClick={() => onNavigate('profile')} style={{ cursor: 'pointer', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div className="profile-text">
                <span className="profile-name">{displayName}</span>
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
                  <label className="form-label">GAMBAR TARGET (OPSIONAL)</label>
                  <input className="form-input" type="file" accept="image/*"
                    onChange={handleFileChange}
                    style={{ textTransform: 'none' }}
                  />
                  {formData.imageUrl && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          objectFit: 'cover', 
                          border: '2px solid var(--manga-ink)', 
                          borderRadius: '4px' 
                        }} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, imageUrl: ''})} 
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: 'var(--semantic-red)', 
                          cursor: 'pointer', 
                          fontWeight: '800',
                          fontSize: '0.8rem',
                          textDecoration: 'underline'
                        }}
                      >
                        HAPUS
                      </button>
                    </div>
                  )}
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

    </main>
  );
}

export default AdminTargetPage;
