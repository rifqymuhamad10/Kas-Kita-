import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import AdminDashboard from './pages/AdminDashboard';
import MemberDashboard from './pages/MemberDashboard';
import AdminTargetPage from './pages/AdminTargetPage';
import MemberTargetPage from './pages/MemberTargetPage';
import AdminTransactionPage from './pages/AdminTransactionPage';
import MemberTransactionPage from './pages/MemberTransactionPage';
import AdminKasSiswaPage from './pages/AdminKasSiswaPage';
import ProfilePage from './pages/Profile';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './pages/Dashboard.css';

function App() {
  const [page, setPage] = useState('login'); // 'login' | 'register' | 'dashboard' | 'target'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Global Sidebar State to keep it persistent across page changes
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // State untuk form redeem token
  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [tokenLoading, setTokenLoading] = useState(false);

  const handleRedeemToken = async () => {
    if (tokenInput.trim().length !== 6) {
      setTokenError('Token harus 6 karakter.');
      return;
    }
    setTokenLoading(true);
    setTokenError('');
    try {
      const res = await fetch('http://localhost:8080/api/tokens/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          token: tokenInput.trim().toUpperCase(),
          memberUid: user?.uid
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Refresh user state agar invited = true
        setUser(prev => ({ ...prev, invited: true }));
        setTokenInput('');
      } else {
        setTokenError(data.message || 'Token tidak valid atau sudah pernah digunakan.');
      }
    } catch (err) {
      console.error(err);
      setTokenError('Gagal terhubung ke server. Pastikan server aktif.');
    } finally {
      setTokenLoading(false);
    }
  };

  // Monitor status auth Firebase secara real-time
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          
          // Jika email belum diverifikasi, arahkan ke halaman verifikasi email
          if (!currentUser.emailVerified) {
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              name: currentUser.displayName || currentUser.email.split('@')[0],
              token: token,
              role: null,
              emailVerified: false
            });
            setPage('verify-email');
            setLoading(false);
            return;
          }

          // Ambil detail role dari backend me endpoint
          const meRes = await fetch('http://localhost:8080/api/v1/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          let role = null;
          let displayName = currentUser.displayName || currentUser.email.split('@')[0];
          let invited = false;
          
          if (meRes.ok) {
            const profile = await meRes.json();
            role = profile.role;
            displayName = profile.name || displayName;
            invited = profile.invited || false;
            console.log("Profile fetched successfully from backend. Role:", role, "Invited:", invited);
          } else {
            throw new Error(`Gagal ambil profil. Status: ${meRes.status}`);
          }

          const userObj = {
            uid: currentUser.uid,
            email: currentUser.email,
            name: displayName,
            token: token,
            role: role,
            invited: invited,
            emailVerified: true
          };
          console.log("Setting user state to:", userObj);
          setUser(userObj);
          setPage('dashboard');
        } catch (err) {
          console.error("Gagal mendapatkan profil/token auth:", err);
          setUser(null);
          setPage('login');
        }
      } else {
        setUser(null);
        setPage('login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setPage('login');
    } catch (err) {
      console.error("Gagal logout:", err);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'JetBrains Mono, monospace',
        backgroundColor: '#FFFFFF',
        color: '#000000'
      }}>
        <div style={{
          border: '3px solid #000000',
          padding: '2rem',
          boxShadow: '6px 6px 0 #000000',
          fontWeight: 'bold',
          fontSize: '1.25rem'
        }}>
          MEMUAT KAS KITA...
        </div>
      </div>
    );
  }

  // View public pages outside layout
  if (page === 'login') {
    return (
      <Login
        onNavigateToRegister={() => setPage('register')}
        onLoginSuccess={async (userInfo) => {
          if (auth.currentUser && !auth.currentUser.emailVerified) {
            setUser({
              ...userInfo,
              role: null,
              emailVerified: false
            });
            setPage('verify-email');
            return;
          }
          try {
            const meRes = await fetch('http://localhost:8080/api/v1/auth/me', {
              headers: {
                'Authorization': `Bearer ${userInfo.token}`
              }
            });
            if (!meRes.ok) {
              throw new Error(`Status response: ${meRes.status}`);
            }
            const profile = await meRes.json();
            const loginUserObj = {
              ...userInfo,
              role: profile.role,
              invited: profile.invited || false,
              name: profile.name || userInfo.name,
              emailVerified: true
            };
            console.log("onLoginSuccess: Setting user state to:", loginUserObj);
            setUser(loginUserObj);
            setPage('dashboard');
          } catch (e) {
            console.error("Gagal fetch profile me:", e);
            alert("Gagal masuk: Gagal memuat profil pengguna dari server. Pastikan server aktif.");
          }
        }}
      />
    );
  }

  if (page === 'register') {
    return (
      <Register
        onNavigateToLogin={() => setPage('login')}
        onRegisterSuccess={(userInfo) => {
          setUser(userInfo);
          setPage('verify-email');
        }}
      />
    );
  }

  if (page === 'verify-email') {
    return (
      <VerifyEmail
        user={user}
        onVerificationSuccess={async () => {
          try {
            const token = await auth.currentUser.getIdToken(true); // paksa refresh token agar status emailVerified diperbarui
            const meRes = await fetch('http://localhost:8080/api/v1/auth/me', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (!meRes.ok) {
              throw new Error(`Status response: ${meRes.status}`);
            }
            const profile = await meRes.json();
            setUser({
              uid: auth.currentUser.uid,
              email: auth.currentUser.email,
              name: profile.name || auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
              token: token,
              role: profile.role,
              emailVerified: true
            });
            setPage('dashboard');
          } catch (e) {
            console.error("Gagal memuat profil setelah verifikasi:", e);
            alert("Email terverifikasi, tetapi gagal memuat profil dari server. Silakan hubungi admin.");
          }
        }}
        onLogout={() => {
          setUser(null);
          setPage('login');
        }}
      />
    );
  }

  const handleNavigate = (targetPage) => setPage(targetPage);
  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  // Render Sidebar
  const renderSidebar = () => {
    return (
      <>
        {isSidebarOpen && <div className="sidebar-overlay desktop-hide" onClick={toggleSidebar}></div>}
        <aside className={`sidebar manga-panel ${isSidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-logo">
            <div className="logo-box"></div>
            <div className="logo-text">
              <h2>KASKITA</h2>
              <p>MANAGEMENT</p>
            </div>
          </div>
          <nav className="sidebar-menu">
            {isAdmin ? (
              <>
                <div className={`menu-item ${page === 'dashboard' ? 'active' : ''}`} onClick={() => handleNavigate('dashboard')}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                  DASHBOARD
                </div>
                <div className={`menu-item ${page === 'transactions' ? 'active' : ''}`} onClick={() => handleNavigate('transactions')}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                  TRANSAKSI
                </div>
                <div className={`menu-item ${page === 'target' ? 'active' : ''}`} onClick={() => handleNavigate('target')}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle></svg>
                  TARGET
                </div>
                <div className={`menu-item ${page === 'kas-siswa' ? 'active' : ''}`} onClick={() => handleNavigate('kas-siswa')}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  KAS SISWA
                </div>
              </>
            ) : (
              <>
                <div className={`menu-item ${page === 'dashboard' ? 'active' : ''}`} onClick={() => handleNavigate('dashboard')}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                  DASHBOARD
                </div>
                <div className={`menu-item ${page === 'transactions' ? 'active' : ''}`} onClick={() => handleNavigate('transactions')}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                  TRANSAKSI
                </div>
                <div className={`menu-item ${page === 'target' ? 'active' : ''}`} onClick={() => handleNavigate('target')}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle></svg>
                  TARGET KELAS
                </div>
                <div className={`menu-item ${page === 'kas-siswa' ? 'active' : ''}`} onClick={() => handleNavigate('kas-siswa')}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  KAS SISWA
                </div>
              </>
            )}
            
            <div className="sidebar-bottom">
              <div className="sidebar-divider"></div>
              <div className="menu-item logout-btn" onClick={handleLogout}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                LOG OUT
              </div>
            </div>
          </nav>
        </aside>
      </>
    );
  };

  // Render Page Content
  const renderPageContent = () => {
    // LOCK SCREEN: Jika user adalah ROLE_MEMBER dan belum diundang (invited == false)
    if (user && user.role === 'ROLE_MEMBER' && !user.invited && page !== 'profile') {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f0f0f0',
          width: '100%',
          padding: '2rem'
        }}>
          <div className="manga-panel" style={{
            padding: '2.5rem',
            textAlign: 'center',
            maxWidth: '480px',
            width: '100%',
            border: '3px solid #1a1a1a',
            boxShadow: '8px 8px 0 #1a1a1a'
          }}>
            {/* Icon */}
            <div style={{ color: '#1a1a1a', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ border: '3px solid #1a1a1a', padding: '10px', backgroundColor: '#fff', boxShadow: '4px 4px 0 #1a1a1a' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>

            <h2 style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '1.75rem',
              marginBottom: '0.75rem',
              color: '#1a1a1a',
              textTransform: 'uppercase'
            }}>AKSES TERKUNCI</h2>

            <p style={{ fontSize: '1rem', marginBottom: '2rem', color: '#555', lineHeight: 1.6 }}>
              Masukkan <strong>token undangan 6 digit</strong> yang diberikan oleh Bendahara kelasmu untuk mengaktifkan akses Kas Siswa.
            </p>

            {/* Form Input Token */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                maxLength={6}
                value={tokenInput}
                onChange={e => {
                  setTokenInput(e.target.value.toUpperCase());
                  setTokenError('');
                }}
                placeholder="Contoh: AB3X9Z"
                style={{
                  padding: '1rem',
                  fontSize: '1.75rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: '900',
                  letterSpacing: '0.5rem',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  border: tokenError ? '3px solid #dc3545' : '3px solid #1a1a1a',
                  outline: 'none'
                }}
              />
              {tokenError && (
                <p style={{ color: '#dc3545', fontWeight: 600, margin: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#dc3545', flexShrink: 0 }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  {tokenError}
                </p>
              )}
              <button
                className="manga-btn primary"
                onClick={handleRedeemToken}
                disabled={tokenLoading || tokenInput.length < 6}
                style={{
                  padding: '0.9rem',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  opacity: tokenInput.length < 6 ? 0.6 : 1
                }}
              >
                {tokenLoading ? 'MEMVERIFIKASI...' : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', width: '100%' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    AKTIFKAN AKSES
                  </span>
                )}
              </button>
            </div>

            <div style={{ borderTop: '2px solid #ddd', paddingTop: '1rem' }}>
              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#888',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.85rem',
                  textDecoration: 'underline'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      );
    }
    if (page === 'kas-siswa' && isAdmin) {
      return (
        <AdminKasSiswaPage
          user={user}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
      );
    }

    if (page === 'target') {
      if (isAdmin) {
        return (
          <AdminTargetPage
            user={user}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
          />
        );
      }
      return (
        <MemberTargetPage
          user={user}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
      );
    }

    if (page === 'transactions') {
      if (isAdmin) {
        return (
          <AdminTransactionPage
            user={user}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
          />
        );
      }
      return (
        <MemberTransactionPage
          user={user}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
      );
    }

    if (page === 'profile') {
      return (
        <ProfilePage 
          user={user} 
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
      );
    }

    // Default to Dashboard
    if (isAdmin) {
      return (
        <AdminDashboard
          user={user}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
      );
    }
    return (
      <MemberDashboard
        user={user}
        page={page}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
    );
  };

  return (
    <div className="dashboard-layout manga-theme">
      {renderSidebar()}
      {renderPageContent()}
    </div>
  );
}

export default App;
