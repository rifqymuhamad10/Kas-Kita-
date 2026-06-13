import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import './Login.css';

export default function Login({ onNavigateToRegister, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();
      
      // Kirim user info ke App.jsx
      if (onLoginSuccess) {
        onLoginSuccess({
          uid: user.uid,
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          token: token
        });
      }
    } catch (err) {
      console.error(err);
      setError('Email atau password salah. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Decorative Top Header */}
      <div className="login-header-bar">
        <span className="sfx-text">KLIK!</span>
      </div>

      {/* Main Content */}
      <main className="login-main">

        {/* App Title */}
        <div className="login-title-section">
          <h1 className="login-app-title">KAS KITA</h1>
          <div className="login-subtitle-wrapper">
            <p className="login-subtitle">Pencatatan Kas Kelas</p>
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="forgot-password-row">
                <a href="#" className="forgot-password-link">Lupa kata sandi?</a>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'MEMUAT...' : 'MASUK'}
            </button>
          </form>

          {/* Divider */}
          <div className="divider-atau">
            <div className="divider-line"></div>
            <span className="divider-text">atau</span>
            <div className="divider-line"></div>
          </div>

          {/* Register button */}
          <button
            type="button"
            className="btn-ghost"
            onClick={onNavigateToRegister}
          >
            DAFTAR AKUN BARU
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
