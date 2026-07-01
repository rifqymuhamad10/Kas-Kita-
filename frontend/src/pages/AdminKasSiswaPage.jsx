import React from 'react';
import './Dashboard.css';

const API_BASE = 'http://localhost:8080/api';

function AdminKasSiswaPage({ user, onLogout, onNavigate, isSidebarOpen, toggleSidebar }) {
  const displayName = user?.name || "Memuat...";
  const displayRole = user?.role === 'ROLE_ADMIN' ? "BENDAHARA" : "SISWA";

  const [dues, setDues] = React.useState([]);
  const [newTitle, setNewTitle] = React.useState('');
  const [newAmount, setNewAmount] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [pendingPayments, setPendingPayments] = React.useState([]);
  const [members, setMembers] = React.useState([]);

  // State untuk sistem token
  const [generatedToken, setGeneratedToken] = React.useState(null);
  const [tokenLoading, setTokenLoading] = React.useState(false);
  const [tokenCopied, setTokenCopied] = React.useState(false);

  React.useEffect(() => {
    fetchDues();
    fetchPendingPayments();
    fetchMembers();
  }, []);

  const fetchDues = async () => {
    try {
      const res = await fetch(`${API_BASE}/duemasters`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDues(data);
      }
    } catch (err) {
      console.error("Gagal mengambil iuran:", err);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const res = await fetch(`${API_BASE}/payments/pending`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPendingPayments(data);
      }
    } catch (err) {
      console.error("Gagal mengambil pengajuan pembayaran:", err);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${API_BASE}/users/members`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (err) {
      console.error("Gagal mengambil data member:", err);
    }
  };

  const handleGenerateToken = async () => {
    setTokenLoading(true);
    setTokenCopied(false);
    try {
      const res = await fetch(`${API_BASE}/tokens/generate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedToken(data.token);
      } else {
        alert('Gagal membuat token undangan.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat membuat token.');
    } finally {
      setTokenLoading(false);
    }
  };

  const handleCopyToken = () => {
    if (!generatedToken) return;
    navigator.clipboard.writeText(generatedToken);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  const handleActionPayment = async (paymentId, action) => {
    // action: 'approve' or 'reject'
    const endpoint = `${API_BASE}/payments/${paymentId}/${action}`;
    const url = action === 'approve' ? `${endpoint}?adminUid=${user?.uid}` : endpoint;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (res.ok) {
        alert(`Pengajuan berhasil di-${action === 'approve' ? 'setujui' : 'tolak'}!`);
        fetchPendingPayments();
      } else {
        alert('Gagal memproses pengajuan.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan sistem.');
    }
  };

  const handleDeleteDue = async (id) => {
    if (!window.confirm("Yakin ingin menghapus iuran ini? Semua tagihan member yang terkait juga akan dihapus.")) return;
    try {
      const res = await fetch(`${API_BASE}/duemasters/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (res.ok) {
        setDues(dues.filter(d => d.id !== id));
        alert("Iuran berhasil dihapus!");
      } else {
        alert("Gagal menghapus iuran.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    }
  };

  const handleCreateDue = async () => {
    if (!newTitle || !newAmount) return alert('Judul dan Nominal harus diisi');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/duemasters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          adminUid: user?.uid,
          title: newTitle,
          amount: parseFloat(newAmount)
        })
      });
      if (res.ok) {
        alert('Iuran berhasil dibuat!');
        setNewTitle('');
        setNewAmount('');
        fetchDues();
      } else {
        alert('Gagal membuat iuran');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat membuat iuran');
    } finally {
      setLoading(false);
    }
  };

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
        <div className="dashboard-card manga-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontFamily: 'JetBrains Mono, monospace', marginBottom: '1rem' }}>MANAJEMEN IURAN (KAS SISWA)</h2>
          
          <div style={{ marginBottom: '2rem', padding: '1rem', border: '2px solid #000', backgroundColor: '#f9f9f9' }}>
            <h3 style={{ marginBottom: '1rem' }}>Buat Iuran Baru</h3>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input type="text" placeholder="Nama Iuran (cth: Kas Mingguan)" value={newTitle} onChange={e => setNewTitle(e.target.value)} style={{ flex: 1, padding: '0.5rem', border: '2px solid #000' }} />
              <input type="number" placeholder="Nominal (Rp)" value={newAmount} onChange={e => setNewAmount(e.target.value)} style={{ flex: 1, padding: '0.5rem', border: '2px solid #000' }} />
            </div>
            <button className="manga-btn primary" onClick={handleCreateDue} disabled={loading} style={{ width: '100%', padding: '0.75rem', fontWeight: 'bold' }}>
              {loading ? 'MEMPROSES...' : 'BUAT IURAN'}
            </button>
          </div>

          <div>
            <h3 style={{ marginBottom: '1rem' }}>Riwayat Iuran</h3>
            <table className="transaction-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginBottom: '2rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #000' }}>
                  <th style={{ padding: '0.5rem' }}>NAMA IURAN</th>
                  <th style={{ padding: '0.5rem' }}>NOMINAL</th>
                  <th style={{ padding: '0.5rem' }}>TANGGAL DIBUAT</th>
                  <th style={{ padding: '0.5rem' }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {dues.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>Belum ada data iuran.</td>
                  </tr>
                ) : (
                  dues.map(due => (
                    <tr key={due.id} style={{ borderBottom: '1px solid #ccc' }}>
                      <td style={{ padding: '0.5rem' }}>{due.title}</td>
                      <td style={{ padding: '0.5rem' }}>Rp {due.amount?.toLocaleString('id-ID')}</td>
                      <td style={{ padding: '0.5rem' }}>{due.createdAt ? new Date(due.createdAt).toLocaleDateString('id-ID') : '-'}</td>
                      <td style={{ padding: '0.5rem' }}>
                        <button onClick={() => handleDeleteDue(due.id)} style={{ background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', padding: '0.2rem 0.5rem', cursor: 'pointer' }}>HAPUS</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem', border: '2px solid #000', backgroundColor: '#fff' }}>
            <h3 style={{ marginBottom: '1rem' }}>Persetujuan Pembayaran (Pending)</h3>
            <table className="transaction-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #000' }}>
                  <th style={{ padding: '0.5rem' }}>ID MEMBER</th>
                  <th style={{ padding: '0.5rem' }}>NOMINAL DIBAYAR</th>
                  <th style={{ padding: '0.5rem' }}>TANGGAL AJUAN</th>
                  <th style={{ padding: '0.5rem' }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayments.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>Tidak ada pengajuan pembayaran.</td>
                  </tr>
                ) : (
                  pendingPayments.map(payment => (
                    <tr key={payment.id} style={{ borderBottom: '1px solid #ccc' }}>
                      <td style={{ padding: '0.5rem', fontFamily: 'monospace' }}>{payment.memberUid}</td>
                      <td style={{ padding: '0.5rem' }}>Rp {payment.amount?.toLocaleString('id-ID')}</td>
                      <td style={{ padding: '0.5rem' }}>{payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('id-ID') : '-'}</td>
                      <td style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleActionPayment(payment.id, 'approve')} style={{ background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb', padding: '0.2rem 0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>SETUJUI</button>
                        <button onClick={() => handleActionPayment(payment.id, 'reject')} style={{ background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', padding: '0.2rem 0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>TOLAK</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* === SISTEM TOKEN UNDANGAN === */}
          <div style={{ marginTop: '2rem', padding: '1.5rem', border: '3px solid #000', backgroundColor: '#f9f9f9' }}>
            <h3 style={{ marginBottom: '0.5rem', fontFamily: 'JetBrains Mono, monospace' }}>TOKEN UNDANGAN</h3>
            <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#555' }}>
              Generate token 6 karakter. Berikan token ini ke member agar mereka bisa mengaktifkan akses kas siswa di dashboard mereka.
            </p>

            <button
              className="manga-btn primary"
              onClick={handleGenerateToken}
              disabled={tokenLoading}
              style={{ padding: '0.75rem 1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}
            >
              {tokenLoading ? 'MEMBUAT TOKEN...' : '🔑 GENERATE TOKEN BARU'}
            </button>

            {generatedToken && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                padding: '1.5rem',
                border: '3px dashed #1a1a1a',
                backgroundColor: '#fff',
                borderRadius: '4px'
              }}>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>Token Undangan Baru:</p>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '3rem',
                  fontWeight: '900',
                  letterSpacing: '0.5rem',
                  color: '#1a1a1a',
                  textTransform: 'uppercase'
                }}>
                  {generatedToken}
                </span>
                <button
                  onClick={handleCopyToken}
                  style={{
                    background: tokenCopied ? '#155724' : '#1a1a1a',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1.5rem',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontFamily: 'JetBrains Mono, monospace',
                    transition: 'background 0.2s'
                  }}
                >
                  {tokenCopied ? '✓ TERSALIN!' : 'SALIN TOKEN'}
                </button>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Token hanya bisa digunakan <strong>sekali</strong>.</p>
              </div>
            )}
          </div>

          {/* === DAFTAR MEMBER === */}
          <div style={{ marginTop: '2rem', padding: '1rem', border: '2px solid #000', backgroundColor: '#fff' }}>
            <h3 style={{ marginBottom: '1rem' }}>Daftar Member</h3>
            <table className="transaction-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #000' }}>
                  <th style={{ padding: '0.5rem' }}>NAMA</th>
                  <th style={{ padding: '0.5rem' }}>EMAIL</th>
                  <th style={{ padding: '0.5rem' }}>STATUS AKSES</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '1rem' }}>Belum ada data member.</td>
                  </tr>
                ) : (
                  members.map(member => (
                    <tr key={member.uid} style={{ borderBottom: '1px solid #ccc' }}>
                      <td style={{ padding: '0.5rem' }}>{member.name}</td>
                      <td style={{ padding: '0.5rem' }}>{member.email}</td>
                      <td style={{ padding: '0.5rem' }}>
                        {member.invited ? (
                          <span style={{ color: '#155724', fontWeight: 'bold', background: '#d4edda', padding: '0.2rem 0.6rem', border: '1px solid #c3e6cb' }}>✓ AKTIF</span>
                        ) : (
                          <span style={{ color: '#721c24', fontWeight: 'bold', background: '#f8d7da', padding: '0.2rem 0.6rem', border: '1px solid #f5c6cb' }}>BELUM AKTIF</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </main>
  );
}

export default AdminKasSiswaPage;
