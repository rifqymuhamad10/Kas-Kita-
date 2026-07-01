import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { auth } from '../services/firebase';
import './Login.css'; // Kita sharing file css yang sama karena strukturnya mirip komik panel
import { API_V1_BASE } from '../config';

export default function Register({ onNavigateToLogin, onRegisterSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const role = 'ROLE_MEMBER';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      setLoading(false);
      return;
    }

    try {
      // 1. Buat user di Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Update display name di Firebase Auth
      await updateProfile(user, { displayName: name });
      
      const token = await user.getIdToken();

      // 3. Daftarkan detail user ke Database Backend (Spring Boot + Firestore)
      const response = await fetch(`${API_V1_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uid: user.uid,
          name: name,
          email: email,
          role: role
        })
      });

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || "Gagal mendaftarkan user ke backend database.");
      }

      const backendUser = await response.json();

      // 4. Kirim email verifikasi
      await sendEmailVerification(user);

      // 5. Callback sukses masuk ke Dashboard
      if (onRegisterSuccess) {
        onRegisterSuccess({
          uid: user.uid,
          email: user.email,
          name: name,
          token: token,
          role: backendUser.role,
          emailVerified: false
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Pendaftaran gagal. Pastikan email belum terdaftar & password minimal 6 karakter.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Decorative Top Header */}
      <div className="login-header-bar">
        <span className="sfx-text">DAFTAR!</span>
      </div>

      {/* Main Content */}
      <main className="login-main">
        {/* App Title */}
        <div className="login-title-section">
          <h1 className="login-app-title">KAS KITA</h1>
          <div className="login-subtitle-wrapper">
            <p className="login-subtitle">Pendaftaran Akun Kas Kelas</p>
            <div className="halftone-underline"></div>
          </div>
        </div>

        {/* Comic Panel Form */}
        <div className="login-card">
          <div className="card-divider"></div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Error message */}
            {error && (
              <div className="login-error">{error}</div>
            )}

            {/* Nama Lengkap */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">NAMA LENGKAP</label>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="Masukkan nama lengkap Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">EMAIL</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="nama@sekolah.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">PASSWORD</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Min. 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Konfirmasi Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">KONFIRMASI PASSWORD</label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                placeholder="Ulangi password Anda"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'MENDAFTAR...' : 'DAFTAR SEKARANG'}
            </button>
          </form>

          {/* Divider */}
          <div className="divider-atau">
            <div className="divider-line"></div>
            <span className="divider-text">atau</span>
            <div className="divider-line"></div>
          </div>

          {/* Login button */}
          <button
            type="button"
            className="btn-ghost"
            onClick={onNavigateToLogin}
          >
            SUDAH PUNYA AKUN? MASUK
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="login-footer">
        <p>&copy; 2024 KAS KITA. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}
