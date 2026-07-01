import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import './Login.css';

export default function ForgotPassword({ onNavigateToLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const actionCodeSettings = {
        url: window.location.origin,
        handleCodeInApp: true,
      };
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      setSuccess('Tautan reset kata sandi telah dikirim ke email Anda! Silakan periksa inbox/spam Anda.');
      setEmail('');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/unauthorized-continue-uri') {
        // Fallback jika domain belum terdaftar di Firebase Console
        try {
          await sendPasswordResetEmail(auth, email);
          setSuccess('Tautan reset kata sandi telah dikirim ke email Anda (menggunakan halaman default Firebase).');
          setEmail('');
        } catch (fallbackErr) {
          console.error(fallbackErr);
          if (fallbackErr.code === 'auth/user-not-found') {
            setError('Email tidak terdaftar di sistem kami.');
          } else if (fallbackErr.code === 'auth/invalid-email') {
            setError('Format email tidak valid.');
          } else {
            setError(`Gagal mengirim email reset kata sandi: ${fallbackErr.code || fallbackErr.message}`);
          }
        }
      } else if (err.code === 'auth/user-not-found') {
        setError('Email tidak terdaftar di sistem kami.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Format email tidak valid.');
      } else {
        setError(`Gagal mengirim email reset kata sandi: ${err.code || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Decorative Top Header */}
      <div className="login-header-bar">
        <span className="sfx-text">RESET!</span>
      </div>

      {/* Main Content */}
      <main className="login-main">
        {/* App Title */}
        <div className="login-title-section">
          <h1 className="login-app-title">KAS KITA</h1>
          <div className="login-subtitle-wrapper">
            <p className="login-subtitle">Lupa Kata Sandi</p>
            <div className="halftone-underline"></div>
          </div>
        </div>

        {/* Comic Panel Card */}
        <div className="login-card">
          <div className="card-divider"></div>

          <form onSubmit={handleSubmit} className="login-form">
            <p style={{ fontSize: '0.85rem', lineHeight: '1.4', margin: '0 0 0.5rem 0' }}>
              Masukkan alamat email Anda untuk menerima tautan guna menyetel ulang kata sandi akun Anda.
            </p>

            {/* Error message */}
            {error && (
              <div className="login-error">{error}</div>
            )}

            {/* Success message */}
            {success && (
              <div style={{
                backgroundColor: '#d1e7dd',
                border: '1.5px solid #0f5132',
                color: '#0f5132',
                fontSize: '0.875rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                lineHeight: '1.4',
                fontFamily: 'inherit'
              }}>
                {success}
              </div>
            )}

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
                disabled={loading}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'MEMUAT...' : 'KIRIM LINK RESET'}
            </button>
          </form>

          {/* Divider */}
          <div className="divider-atau">
            <div className="divider-line"></div>
            <span className="divider-text">atau</span>
            <div className="divider-line"></div>
          </div>

          {/* Back to Login button */}
          <button
            type="button"
            className="btn-ghost"
            onClick={onNavigateToLogin}
            disabled={loading}
          >
            KEMBALI KE LOGIN
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
