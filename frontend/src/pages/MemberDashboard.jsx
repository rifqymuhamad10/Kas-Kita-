import { useState, useEffect } from 'react';
import './Dashboard.css';

export default function MemberDashboard({ user, onLogout }) {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);

  // Fetch data
  const fetchData = async () => {
    try {
      const token = user.token;
      
      // Ambil Balance
      const balanceRes = await fetch('http://localhost:8080/api/v1/transactions/balance', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (balanceRes.ok) {
        const bal = await balanceRes.json();
        setBalance(bal);
      }

      // Ambil Daftar Transaksi
      const transRes = await fetch('http://localhost:8080/api/v1/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (transRes.ok) {
        const list = await transRes.json();
        setTransactions(list.reverse()); // Urutkan transaksi terbaru di atas
      }
    } catch (err) {
      console.error("Gagal mengambil data dari server:", err);
    }
  };

  useEffect(() => {
    if (user && user.token) {
      fetchData();
    }
  }, [user]);

  // Format IDR Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  return (
    <div className="dashboard-page">
      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="brand-section">
          <div className="brand-logo">KAS</div>
          <span className="brand-title">KAS KITA (SISWA)</span>
        </div>
        <div className="user-nav-actions">
          <span className="user-badge" style={{ backgroundColor: '#EEE' }}>👩‍🎓 {user?.name || user?.email}</span>
          <button className="btn-logout" onClick={onLogout}>KELUAR</button>
        </div>
      </header>

      {/* Main Grid Layout (Single Column for Members - Clean view-only layout) */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Overview Panel */}
          <section className="comic-panel">
            <h2 className="panel-title">
              IKHTISAR KAS <span className="panel-sfx">STATUS!</span>
            </h2>
            <div className="overview-stats">
              <div className="stat-box highlight">
                <p className="stat-label">SALDO SEKARANG</p>
                <p className="stat-value">{formatRupiah(balance)}</p>
              </div>
              <div className="stat-box">
                <p className="stat-label">TOTAL TRANSAKSI</p>
                <p className="stat-value">{transactions.length} Item</p>
              </div>
            </div>
          </section>

          {/* Transactions Panel */}
          <section className="comic-panel">
            <h2 className="panel-title">
              RIWAYAT TRANSAKSI KELAS <span className="panel-sfx">LOG!</span>
            </h2>
            <div className="transaction-list" style={{ maxHeight: 'none' }}>
              {transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#666666' }}>
                  Belum ada transaksi uang kas kelas yang tercatat.
                </div>
              ) : (
                transactions.map((tx, idx) => (
                  <div key={idx} className="transaction-item">
                    <div className="trans-info">
                      <span className="trans-desc">{tx.description}</span>
                      <span className="trans-date">
                        {tx.createdDate ? new Date(tx.createdDate).toLocaleDateString('id-ID') : '-'}
                      </span>
                    </div>
                    <span className={`trans-amount ${tx.type === 'INCOME' ? 'income' : 'expense'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'} {formatRupiah(tx.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
