import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import MemberDashboard from './pages/MemberDashboard';
import AdminTargetPage from './pages/AdminTargetPage';
import MemberTargetPage from './pages/MemberTargetPage';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function App() {
  const [page, setPage] = useState('login'); // 'login' | 'register' | 'dashboard' | 'target'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Monitor status auth Firebase secara real-time
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          
          // Ambil detail role dari backend me endpoint
          const meRes = await fetch('http://localhost:8080/api/v1/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          let role = null;
          let displayName = currentUser.displayName || currentUser.email.split('@')[0];
          
          if (meRes.ok) {
            const profile = await meRes.json();
            role = profile.role;
            displayName = profile.name || displayName;
            console.log("Profile fetched successfully from backend. Role:", role);
          } else {
            throw new Error(`Gagal ambil profil. Status: ${meRes.status}`);
          }

          const userObj = {
            uid: currentUser.uid,
            email: currentUser.email,
            name: displayName,
            token: token,
            role: role
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

  if (page === 'login') {
    return (
      <Login
        onNavigateToRegister={() => setPage('register')}
        onLoginSuccess={async (userInfo) => {
          // Ambil detail profil dari backend setelah login sukses
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
              name: profile.name || userInfo.name
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
          setPage('dashboard');
        }}
      />
    );
  }

  // Helper navigasi halaman
  const handleNavigate = (targetPage) => setPage(targetPage);
  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  // Halaman Target
  if (page === 'target') {
    if (isAdmin) {
      return (
        <AdminTargetPage
          user={user}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      );
    }
    return (
      <MemberTargetPage
        user={user}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />
    );
  }

  // Arahkan ke dashboard spesifik berdasarkan Role
  if (isAdmin) {
    return (
      <AdminDashboard
        user={user}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />
    );
  }

  return (
    <MemberDashboard
      user={user}
      onLogout={handleLogout}
      onNavigate={handleNavigate}
    />
  );
}

export default App;
