import React, { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase';
import './Dashboard.css';
import './AdminTransactionPage.css';
import { API_V1_BASE } from '../config';

const API_BASE = API_V1_BASE;
const CATEGORIES = ['IURAN KAS', 'KONSUMSI', 'ATK', 'KEGIATAN', 'LAINNYA'];

function AdminTransactionPage({ user, onLogout, onNavigate, isSidebarOpen, toggleSidebar }) {
  const displayName = user?.name || "Memuat...";
  const displayRole = user?.role === 'ROLE_ADMIN' ? "BENDAHARA" : "SISWA";

  // Data state
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteTransactionId, setDeleteTransactionId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    type: 'INCOME', // INCOME or EXPENSE
    category: 'IURAN KAS',
    description: '',
    evidenceDesc: '',
    evidenceUrl: ''
  });
  
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

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

  // Handle file upload to Firebase Storage
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const storageRef = ref(storage, `receipts/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setFormData(prev => ({ ...prev, evidenceUrl: url }));
      setUploadSuccess('Foto bukti berhasil diunggah!');
    } catch (err) {
      console.error('Error upload file:', err);
      setUploadError('Gagal mengunggah gambar bukti.');
    } finally {
      setUploading(false);
    }
  };

  // Open Form Modals
  const openAddForm = () => {
    setEditingTransaction(null);
    setFormData({
      amount: '',
      type: 'INCOME',
      category: 'IURAN KAS',
      description: '',
      evidenceDesc: '',
      evidenceUrl: ''
    });
    setUploadError('');
    setUploadSuccess('');
    setShowFormModal(true);
  };

  const openEditForm = (tx) => {
    setEditingTransaction(tx);
    setFormData({
      amount: tx.amount || '',
      type: tx.type || 'INCOME',
      category: tx.category || 'IURAN KAS',
      description: tx.description || '',
      evidenceDesc: tx.evidenceDesc || '',
      evidenceUrl: tx.evidenceUrl || ''
    });
    setUploadError('');
    setUploadSuccess('');
    setShowFormModal(true);
  };

  const openDeleteConfirm = (id) => {
    setDeleteTransactionId(id);
    setShowDeleteModal(true);
  };

  // Handle submit form (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      description: formData.description,
      evidenceDesc: formData.evidenceDesc || null,
      evidenceUrl: formData.evidenceUrl || null,
      createdByUid: user?.uid
    };

    try {
      const url = editingTransaction ? `${API_BASE}/transactions/${editingTransaction.id}` : `${API_BASE}/transactions`;
      const method = editingTransaction ? 'PUT' : 'POST';

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
        fetchTransactions();
        fetchBalance();
      } else {
        const errorText = await res.text();
        alert('Gagal menyimpan transaksi: ' + errorText);
      }
    } catch (err) {
      console.error('Error saat menyimpan transaksi:', err);
    }
  };

  // Handle Delete Action
  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_BASE}/transactions/${deleteTransactionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });

      if (res.ok) {
        setShowDeleteModal(false);
        fetchTransactions();
        fetchBalance();
      } else {
        alert('Gagal menghapus transaksi.');
      }
    } catch (err) {
      console.error('Error saat menghapus transaksi:', err);
    }
  };

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
          {/* Summary Row */}
          <div className="summary-row-transactions">
            <div className="summary-card balance manga-panel speed-lines-bg">
              <div className="card-info relative-z">
                <p className="card-label bg-white-highlight">SALDO KAS SAAT INI</p>
                <h3 className="card-amount impact-text bg-white-highlight">Rp {balance.toLocaleString('id-ID')}</h3>
              </div>
            </div>
            
            <button className="btn-action-add-tx manga-panel action-burst" onClick={openAddForm}>
              + TRANSAKSI BARU!
            </button>
          </div>

          {/* Transactions List */}
          <div className="table-card manga-panel">
            <div className="table-header-container">
              <h3 className="transaction-title">DAFTAR SELURUH TRANSAKSI</h3>
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
                    <th>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                        MEMUAT DATA TRANSAKSI...
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', fontWeight: 700 }}>
                        BELUM ADA DATA TRANSAKSI
                      </td>
                    </tr>
                  ) : (
                    transactions.map(tx => (
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
                        <td className="col-evidence">
                          {tx.evidenceUrl ? (
                            <a href={tx.evidenceUrl} target="_blank" rel="noopener noreferrer" className="btn-view-evidence manga-box">
                              FOTO
                            </a>
                          ) : tx.evidenceDesc ? (
                            <span className="evidence-tooltip-trigger" title={tx.evidenceDesc}>
                              CATATAN
                            </span>
                          ) : (
                            <span className="no-evidence">-</span>
                          )}
                        </td>
                        <td className="col-actions">
                          <button className="btn-action-edit manga-box" onClick={() => openEditForm(tx)}>
                            EDIT
                          </button>
                          <button className="btn-action-delete manga-box text-semantic-red" onClick={() => openDeleteConfirm(tx.id)}>
                            HAPUS
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      {/* --- FORM MODAL (ADD & EDIT) --- */}
      {showFormModal && (
        <div className="modal-overlay-custom">
          <div className="modal-box-tx manga-panel">
            <h3 className="modal-title-tx impact-text">
              {editingTransaction ? 'EDIT TRANSAKSI!' : 'INPUT TRANSAKSI BARU!'}
            </h3>
            
            <form onSubmit={handleSubmit} className="form-tx">
              <div className="form-grid-tx">
                <div className="form-group-tx">
                  <label className="form-label-tx">TIPE TRANSAKSI</label>
                  <select 
                    className="form-input-tx"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="INCOME">PEMASUKAN (UANG MASUK)</option>
                    <option value="EXPENSE">PENGELUARAN (UANG KELUAR)</option>
                  </select>
                </div>

                <div className="form-group-tx">
                  <label className="form-label-tx">KATEGORI</label>
                  <select 
                    className="form-input-tx"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group-tx">
                <label className="form-label-tx">JUMLAH (RUPIAH)</label>
                <input 
                  type="number"
                  className="form-input-tx"
                  required
                  placeholder="Contoh: 15000"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>

              <div className="form-group-tx">
                <label className="form-label-tx">DESKRIPSI / KETERANGAN</label>
                <input 
                  type="text"
                  className="form-input-tx"
                  required
                  placeholder="Contoh: Pembelian spidol kelas"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="form-divider-tx">BUKTI TRANSAKSI (OPSIONAL)</div>

              <div className="form-group-tx">
                <label className="form-label-tx">UPLOAD FOTO KUITANSI</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="form-file-tx"
                />
                {uploading && <div className="status-uploading">Mengunggah ke Firebase Storage...</div>}
                {uploadError && <div className="status-error-tx">{uploadError}</div>}
                {uploadSuccess && <div className="status-success-tx">{uploadSuccess}</div>}
                {formData.evidenceUrl && (
                  <div className="preview-url-tx">
                    <a href={formData.evidenceUrl} target="_blank" rel="noopener noreferrer">Lihat Foto Terupload ➔</a>
                  </div>
                )}
              </div>

              <div className="form-group-tx">
                <label className="form-label-tx">CATATAN BUKTI (TEKS)</label>
                <textarea 
                  className="form-textarea-tx"
                  placeholder="Gunakan jika tidak ada foto bukti kuitansi (Contoh: Nota hilang, dibeli langsung di koperasi sekolah)"
                  value={formData.evidenceDesc}
                  onChange={(e) => setFormData(prev => ({ ...prev, evidenceDesc: e.target.value }))}
                />
              </div>

              <div className="modal-actions-tx">
                <button type="button" className="btn-tx-cancel manga-btn" onClick={() => setShowFormModal(false)}>
                  BATAL
                </button>
                <button type="submit" className="btn-tx-save manga-btn active" disabled={uploading}>
                  {editingTransaction ? 'SIMPAN PERUBAHAN' : 'TAMBAHKAN!'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CONFIRM DELETE MODAL --- */}
      {showDeleteModal && (
        <div className="modal-overlay-custom">
          <div className="modal-box manga-panel action-burst">
            <h3 className="modal-title impact-text text-semantic-red">HAPUS TRANSAKSI?!</h3>
            <p className="modal-text">Tindakan ini tidak bisa dibatalkan. Saldo kas kelas akan terupdate kembali!</p>
            <div className="modal-actions">
              <button className="btn-modal-cancel manga-btn" onClick={() => setShowDeleteModal(false)}>BATAL</button>
              <button className="btn-modal-confirm manga-btn active text-semantic-red" onClick={handleDelete}>YA, HAPUS!</button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}

export default AdminTransactionPage;
