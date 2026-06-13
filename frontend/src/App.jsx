import React, { useState } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('overview');

  const folders = {
    backend: [
      { path: 'com.kaskita.config', desc: 'Firebase, Security, & CORS Configuration' },
      { path: 'com.kaskita.controller', desc: 'REST API Controllers' },
      { path: 'com.kaskita.service', desc: 'Business Logic & Services' },
      { path: 'com.kaskita.repository', desc: 'Database & Firestore Access' },
      { path: 'com.kaskita.model', desc: 'DTOs & Entities' },
      { path: 'com.kaskita.exception', desc: 'Global Exception Handling' },
      { path: 'com.kaskita.util', desc: 'Helper Utilities' }
    ],
    frontend: [
      { path: 'src/components', desc: 'Reusable UI Components' },
      { path: 'src/pages', desc: 'Dashboard, Transactions, Billings, etc.' },
      { path: 'src/hooks', desc: 'Custom React Hooks' },
      { path: 'src/services', desc: 'Firebase & API Service Integrations' },
      { path: 'src/context', desc: 'Authentication & Notification Contexts' },
      { path: 'src/utils', desc: 'Helper Functions' },
      { path: 'src/assets', desc: 'Static Assets (Images, Icons)' }
    ]
  };

  return (
    <div className="app-container">
      {/* Background decoration */}
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>

      <header className="header">
        <div className="brand">
          <div className="brand-logo">KK</div>
          <div>
            <h1>Kas Kita</h1>
            <p className="brand-tagline">Boilerplate Monorepo - PWA & Spring Boot</p>
          </div>
        </div>
        <div className="status-badge">
          <span className="status-dot"></span>
          Ready to Develop
        </div>
      </header>

      <main className="main-content">
        <section className="card stats-card">
          <h2>Simulasi Ringkasan Kas Kelas</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Saldo Kas</span>
              <span className="stat-value text-gradient">Rp 1.250.000</span>
              <span className="stat-trend positive">↑ 12% bulan ini</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pengeluaran Bulan Ini</span>
              <span className="stat-value">Rp 350.000</span>
              <span className="stat-sub">5 Transaksi</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Anggota Lunas</span>
              <span className="stat-value">28 / 32</span>
              <span className="stat-sub">Sisa 4 orang menunggak</span>
            </div>
          </div>
        </section>

        <section className="card workspace-card">
          <div className="tabs-header">
            <h2>Struktur Workspace Monorepo</h2>
            <div className="tab-buttons">
              <button 
                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`tab-btn ${activeTab === 'backend' ? 'active' : ''}`}
                onClick={() => setActiveTab('backend')}
              >
                Backend Packages
              </button>
              <button 
                className={`tab-btn ${activeTab === 'frontend' ? 'active' : ''}`}
                onClick={() => setActiveTab('frontend')}
              >
                Frontend Folders
              </button>
            </div>
          </div>

          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <p>Proyek telah berhasil diinisialisasi dengan konfigurasi dependency lengkap:</p>
                <div className="tech-stack-list">
                  <div className="tech-pill">
                    <span className="tech-icon spring-icon">🍃</span>
                    <div>
                      <strong>Spring Boot 3.3.0</strong>
                      <span>Spring Web, Security, Validation, Firebase Admin SDK</span>
                    </div>
                  </div>
                  <div className="tech-pill">
                    <span className="tech-icon react-icon">⚛️</span>
                    <div>
                      <strong>React PWA (Vite)</strong>
                      <span>React 18, Vite PWA, Firebase Client SDK</span>
                    </div>
                  </div>
                </div>
                <div className="monorepo-tree">
                  <div className="tree-item root">📂 kas-kita</div>
                  <div className="tree-item child">📂 backend/ (Spring Boot App)</div>
                  <div className="tree-item child-deep">📄 pom.xml</div>
                  <div className="tree-item child">📂 frontend/ (React PWA App)</div>
                  <div className="tree-item child-deep">📄 package.json</div>
                  <div className="tree-item child-deep">📄 vite.config.js</div>
                </div>
              </div>
            )}

            {activeTab === 'backend' && (
              <div className="folder-list">
                <h3>Package Layered Architecture (<code>com.kaskita</code>)</h3>
                <ul>
                  {folders.backend.map((folder, index) => (
                    <li key={index} className="folder-item">
                      <span className="folder-icon">📂</span>
                      <div className="folder-details">
                        <strong>{folder.path}</strong>
                        <span>{folder.desc}</span>
                      </div>
                      <span className="checked-badge">✓</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'frontend' && (
              <div className="folder-list">
                <h3>Struktur Folder Frontend (<code>src/</code>)</h3>
                <ul>
                  {folders.frontend.map((folder, index) => (
                    <li key={index} className="folder-item">
                      <span className="folder-icon">📂</span>
                      <div className="folder-details">
                        <strong>{folder.path}</strong>
                        <span>{folder.desc}</span>
                      </div>
                      <span className="checked-badge">✓</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>&copy; 2026 Kas Kita Project. All Boilerplate structures initialized successfully.</p>
      </footer>
    </div>
  );
}

export default App;
