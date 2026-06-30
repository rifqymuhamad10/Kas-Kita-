import React from 'react';
import './Dashboard.css';

function AdminKasSiswaPage({ user, onLogout, onNavigate, isSidebarOpen, toggleSidebar }) {
  const displayName = user?.name || "Memuat...";
  const displayRole = user?.role === 'ROLE_ADMIN' ? "BENDAHARA" : "SISWA";

  return (
    <main className="main-content">

      {/* HEADER */}
      <header className="top-header manga-panel">
        <div className="header-left">
          <button className="hamburger-btn" onClick={toggleSidebar}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="square">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <h1 className="page-title">KAS SISWA</h1>
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
        <div className="dashboard-card manga-panel" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          gap: '1.5rem',
          textAlign: 'center',
        }}>
          {/* Ikon placeholder */}
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="square">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>

          <div>
            <h2 style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: '900',
              fontSize: '1.5rem',
              letterSpacing: '0.05em',
              marginBottom: '0.5rem'
            }}>
              FITUR DALAM PENGEMBANGAN
            </h2>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.875rem',
              color: '#555',
              maxWidth: '360px',
              lineHeight: '1.6'
            }}>
              Halaman daftar kas siswa sedang disiapkan.<br />
              Akan segera hadir!
            </p>
          </div>

          <div style={{
            border: '2px solid #000',
            padding: '0.5rem 1.5rem',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: '700',
            fontSize: '0.8rem',
            letterSpacing: '0.1em',
            boxShadow: '3px 3px 0 #000',
            backgroundColor: '#f5f5f5'
          }}>
            COMING SOON
          </div>
        </div>
      </div>

    </main>
  );
}

export default AdminKasSiswaPage;
