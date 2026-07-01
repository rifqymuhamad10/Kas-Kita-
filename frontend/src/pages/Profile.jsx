import React, { useState, useRef } from 'react';
import './Dashboard.css';
import './Profile.css';
import { API_V1_BASE } from '../config';

const API_BASE = API_V1_BASE;

// Tipe gambar yang diizinkan untuk foto profil. Video (mp4, dll) selalu ditolak.
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

function Profile({ user, onLogout, onNavigate, onUserUpdate }) {
  const displayName = user?.name || 'Pengguna';
  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';
  const displayRole = isAdmin ? 'BENDAHARA' : 'SISWA';

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [photoPreview, setPhotoPreview] = useState(user?.photoUrl || null);
  const [photoChanged, setPhotoChanged] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    setError('');
    setSuccess('');
    if (!file) return;

    // Tolak secara eksplisit jika file adalah video (mp4 dan format video lainnya)
    if (file.type.startsWith('video/')) {
      setError('File video (contoh: MP4) tidak diperbolehkan untuk foto profil. Silakan pilih file gambar (JPG/PNG/WEBP/GIF).');
      e.target.value = '';
      return;
    }

    // Hanya izinkan tipe gambar yang didukung
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Format file tidak didukung. Gunakan gambar JPG, PNG, WEBP, atau GIF saja.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('Ukuran foto maksimal 2MB. Silakan pilih file yang lebih kecil.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result);
      setPhotoChanged(true);
    };
    reader.onerror = () => {
      setError('Gagal membaca file. Silakan coba lagi.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoChanged(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Nama tidak boleh kosong.');
      return;
    }

    setSaving(true);
    try {
      const body = { name: name.trim() };
      if (photoChanged) {
        body.photoUrl = photoPreview || '';
      }

      const res = await fetch(`${API_BASE}/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Gagal menyimpan profil.');
      }

      const updated = await res.json();
      setSuccess('Profil berhasil diperbarui!');
      setPhotoChanged(false);
      if (onUserUpdate) {
        onUserUpdate({
          ...user,
          name: updated.name,
          role: updated.role,
          photoUrl: updated.photoUrl,
        });
      }
    } catch (err) {
      console.error('Gagal update profil:', err);
      setError(err.message || 'Gagal menyimpan profil. Pastikan server aktif.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-layout manga-theme">
      <main className="main-content">

        <header className="top-header manga-panel">
          <div className="header-left">
            <button className="hamburger-btn" onClick={toggleSidebar}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="square"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <h1 className="page-title">PROFIL</h1>
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
          <div className="profile-content">

            <div className="profile-card manga-panel">

              <div className="profile-avatar-wrapper">
                {photoPreview ? (
                  <img src={photoPreview} alt="Foto profil" className="profile-avatar-img manga-border" />
                ) : (
                  <div className="profile-avatar-fallback manga-border">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <label className="profile-avatar-edit-btn" title="Ganti foto profil">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><path d="M14.5 2.5a2.121 2.121 0 0 1 3 3L7 16l-4 1 1-4Z"></path></svg>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/gif"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>

              {photoPreview && (
                <button 
                  type="button" 
                  onClick={handleRemovePhoto} 
                  className="manga-btn"
                  style={{ 
                    marginTop: '0.5rem', 
                    fontSize: '0.85rem', 
                    fontWeight: '800',
                    padding: '0.3rem 0.8rem', 
                    backgroundColor: '#fff', 
                    color: 'var(--semantic-red)', 
                    borderColor: 'var(--semantic-red)',
                    boxShadow: '2px 2px 0 var(--semantic-red)',
                    width: 'auto',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    transition: 'all 0.1s'
                  }}
                >
                  HAPUS FOTO
                </button>
              )}

              <p className="profile-hint">Format: JPG, PNG, WEBP, GIF. Maks 2MB. File video (MP4) tidak diizinkan.</p>

              {error && <div className="profile-error-box">{error}</div>}
              {success && <div className="profile-success-box">{success}</div>}

              <div className="profile-field-group">
                <span className="profile-field-label">NAMA LENGKAP</span>
                <input
                  className="profile-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div className="profile-field-group">
                <span className="profile-field-label">EMAIL</span>
                <input className="profile-input" type="email" value={user?.email || ''} disabled />
              </div>

              <div className="profile-field-group">
                <span className="profile-field-label">PERAN</span>
                <span className="profile-role-badge manga-box">{displayRole}</span>
              </div>

              <button className="manga-btn profile-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
              </button>

            </div>

          </div>
        </div>
      </main>

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

export default Profile;
