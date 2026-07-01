import { useState, useEffect } from 'react';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../services/firebase';
import './Login.css';

export default function ResetPassword({ oobCode, onNavigateToLogin }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCodeValid, setIsCodeValid] = useState(true);
  const [verifyingCode, setVerifyingCode] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const hasMinLength = password.length >= 8;
  const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const isPasswordSecure = hasMinLength && hasMixedCase && hasNumber && hasSpecialChar;

  // Verifikasi apakah kode reset valid ketika halaman dimuat
  useEffect(() => {
    const checkCode = async () => {
      try {
        await verifyPasswordResetCode(auth, oobCode);
        setIsCodeValid(true);
      } catch (err) {
        console.error(err);
        setIsCodeValid(false);
        setError('Tautan reset kata sandi tidak valid atau telah kedaluwarsa. Silakan minta tautan baru.');
      } finally {
        setVerifyingCode(false);
      }
    };
    if (oobCode) {
      checkCode();
    } else {
      setIsCodeValid(false);
      setError('Kode reset tidak ditemukan.');
      setVerifyingCode(false);
    }
  }, [oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!isPasswordSecure) {
      setError('Kata sandi baru tidak memenuhi kriteria keamanan minimum.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      setLoading(false);
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess('Kata sandi Anda telah berhasil disetel ulang! Silakan masuk kembali dengan kata sandi baru Anda.');
      setPassword('');
      setConfirmPassword('');
      // Bersihkan url query params agar link tidak bisa digunakan kembali secara langsung di halaman
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      console.error(err);
      setError('Gagal menyetel ulang kata sandi. Pastikan tautan masih valid atau coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  if (verifyingCode) {
    return (
      <div className="login-page">
        <main className="login-main" style={{ justifyContent: 'center' }}>
          <div className="login-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="card-divider"></div>
            <p style={{ fontWeight: 'bold' }}>MEMVERIFIKASI TAUTAN...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="login-page">
      {/* Decorative Top Header */}
      <div className="login-header-bar">
        <span className="sfx-text">UBAR!</span>
      </div>

      {/* Main Content */}
      <main className="login-main">
        {/* App Title */}
        <div className="login-title-section">
          <h1 className="login-app-title">KAS KITA</h1>
          <div className="login-subtitle-wrapper">
            <p className="login-subtitle">Setel Ulang Kata Sandi</p>
            <div className="halftone-underline"></div>
          </div>
        </div>

        {/* Comic Panel Card */}
        <div className="login-card">
          <div className="card-divider"></div>

          {!isCodeValid ? (
            <div style={{ textAlign: 'center' }}>
              <div className="login-error" style={{ marginBottom: '1.5rem' }}>{error}</div>
              <button
                type="button"
                className="btn-ghost"
                onClick={onNavigateToLogin}
              >
                KEMBALI KE LOGIN
              </button>
            </div>
          ) : success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                backgroundColor: '#d1e7dd',
                border: '1.5px solid #0f5132',
                color: '#0f5132',
                fontSize: '0.875rem',
                padding: '1rem',
                borderRadius: '0.5rem',
                lineHeight: '1.4',
                marginBottom: '1.5rem',
                fontWeight: '500'
              }}>
                {success}
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={onNavigateToLogin}
              >
                MASUK SEKARANG
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="login-form">
              <p style={{ fontSize: '0.85rem', lineHeight: '1.4', margin: '0 0 0.5rem 0' }}>
                Masukkan kata sandi baru Anda di bawah ini untuk memperbarui keamanan akun Anda.
              </p>

              {/* Error message */}
              {error && (
                <div className="login-error">{error}</div>
              )}

              {/* Password */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">KATA SANDI BARU</label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Min. 8 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Sembunyi' : 'Lihat'}
                  </button>
                </div>

                {/* Password Policy Checklist */}
                {password.length > 0 && (
                  <ul className="password-requirements">
                    <li className={`requirement-item ${hasMinLength ? 'valid' : ''}`}>
                      <span className="requirement-icon">{hasMinLength ? '[✓]' : '[ ]'}</span>
                      <span>Minimal 8 karakter</span>
                    </li>
                    <li className={`requirement-item ${hasMixedCase ? 'valid' : ''}`}>
                      <span className="requirement-icon">{hasMixedCase ? '[✓]' : '[ ]'}</span>
                      <span>Kombinasi huruf besar & kecil</span>
                    </li>
                    <li className={`requirement-item ${hasNumber ? 'valid' : ''}`}>
                      <span className="requirement-icon">{hasNumber ? '[✓]' : '[ ]'}</span>
                      <span>Mengandung angka (0-9)</span>
                    </li>
                    <li className={`requirement-item ${hasSpecialChar ? 'valid' : ''}`}>
                      <span className="requirement-icon">{hasSpecialChar ? '[✓]' : '[ ]'}</span>
                      <span>Karakter khusus (simbol/tanda baca)</span>
                    </li>
                  </ul>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">KONFIRMASI KATA SANDI</label>
                <div className="password-input-wrapper">
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Ulangi kata sandi baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Sembunyi' : 'Lihat'}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'MEMUAT...' : 'SETEL ULANG KATA SANDI'}
              </button>

              <button
                type="button"
                className="btn-ghost"
                onClick={onNavigateToLogin}
                disabled={loading}
                style={{ marginTop: '0.25rem' }}
              >
                BATAL
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="login-footer">
        <p>&copy; 2024 KAS KITA. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}
