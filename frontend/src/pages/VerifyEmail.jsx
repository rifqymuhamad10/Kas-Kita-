import { useState, useEffect } from 'react';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import './Login.css';

export default function VerifyEmail({ user, onVerificationSuccess, onLogout }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleCheckVerification = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          setSuccess('Email berhasil diverifikasi! Mengalihkan...');
          if (onVerificationSuccess) {
            onVerificationSuccess();
          }
        } else {
          setError('Email Anda belum terverifikasi. Silakan periksa inbox/spam email Anda.');
        }
      } else {
        setError('Sesi telah berakhir. Silakan login kembali.');
      }
    } catch (err) {
      console.error(err);
      setError('Gagal memeriksa status verifikasi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (countdown > 0) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setSuccess('Tautan verifikasi baru telah dikirim ke email Anda.');
        setCountdown(60); // 60 detik cooldown
      } else {
        setError('Sesi telah berakhir. Silakan login kembali.');
      }
    } catch (err) {
      console.error(err);
      setError('Gagal mengirim ulang email verifikasi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      if (onLogout) {
        onLogout();
      }
    } catch (err) {
      console.error(err);
      setError('Gagal logout: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Decorative Top Header */}
      <div className="login-header-bar">
        <span className="sfx-text">VERIFIKASI!</span>
      </div>

      {/* Main Content */}
      <main className="login-main">
        {/* App Title */}
        <div className="login-title-section">
          <h1 className="login-app-title">KAS KITA</h1>
          <div className="login-subtitle-wrapper">
            <p className="login-subtitle">Verifikasi Akun Kas</p>
            <div className="halftone-underline"></div>
          </div>
        </div>

        {/* Comic Panel Card */}
        <div className="login-card">
          <div className="card-divider"></div>

          <div className="login-form">
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ 
                border: '2px solid #000', 
                background: '#FFF8E7', 
                padding: '1rem', 
                boxShadow: '3px 3px 0px #CCCCCC',
                marginBottom: '1rem',
                fontSize: '0.875rem',
                lineHeight: '1.4',
                color: '#000'
              }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  SURAT VERIFIKASI TERKIRIM!
                </strong>
                Kami telah mengirimkan tautan verifikasi ke email:
                <br />
                <strong style={{ textDecoration: 'underline' }}>{user?.email || auth.currentUser?.email}</strong>
                <br />
                <span style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem', display: 'block' }}>
                  Silakan periksa kotak masuk atau folder spam email Anda untuk mengaktifkan akun.
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="login-error" style={{ marginBottom: '0.5rem' }}>{error}</div>
            )}

            {/* Success Message */}
            {success && (
              <div className="login-error" style={{ 
                backgroundColor: '#e8f5e9', 
                borderColor: '#2e7d32', 
                color: '#2e7d32', 
                marginBottom: '0.5rem' 
              }}>{success}</div>
            )}

            {/* Check Verification Status */}
            <button
              type="button"
              className="btn-primary"
              onClick={handleCheckVerification}
              disabled={loading}
            >
              {loading ? 'MEMERIKSA...' : 'SAYA SUDAH VERIFIKASI'}
            </button>

            {/* Resend Link */}
            <button
              type="button"
              className="btn-ghost"
              onClick={handleResendEmail}
              disabled={loading || countdown > 0}
            >
              {countdown > 0 ? `KIRIM ULANG (${countdown}s)` : 'KIRIM ULANG TAUTAN'}
            </button>

            {/* Divider */}
            <div className="divider-atau">
              <div className="divider-line"></div>
              <span className="divider-text">atau</span>
              <div className="divider-line"></div>
            </div>

            {/* Sign Out / Back to login */}
            <button
              type="button"
              className="btn-ghost"
              onClick={handleSignOut}
              disabled={loading}
              style={{ borderColor: '#ba1a1a', color: '#ba1a1a' }}
            >
              KEMBALI KE LOGIN
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="login-footer">
        <p>&copy; 2024 KAS KITA. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}
