import { useState, useEffect } from 'react';
import './Dashboard.css';
import { API_V1_BASE } from '../config';

export default function Dashboard({ user, onLogout }) {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('INCOME'); // INCOME | EXPENSE
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Fetch data
  const fetchData = async () => {
    try {
      const token = user.token;
      
      // Ambil Balance
      const balanceRes = await fetch(`${API_V1_BASE}/transactions/balance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (balanceRes.ok) {
        const bal = await balanceRes.json();
        setBalance(bal);
      }

      // Ambil Daftar Transaksi
      const transRes = await fetch(`${API_V1_BASE}/transactions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (transRes.ok) {
        const list = await transRes.json();
        // Urutkan transaksi terbaru di atas
        setTransactions(list.reverse());
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

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      const token = user.token;
      const response = await fetch(`${API_V1_BASE}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          description,
          amount: parseFloat(amount),
          type,
          createdDate: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || "Gagal menyimpan transaksi.");
      }

      setActionSuccess("Transaksi berhasil ditambahkan! BANG!");
      setDescription('');
      setAmount('');
      fetchData(); // Reload data
    } catch (err) {
      setActionError(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

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
          <span className="brand-title">KAS KITA</span>
        </div>
        <div className="user-nav-actions">
          <span className="user-badge">{user?.name || user?.email}</span>
          <button className="btn-logout" onClick={onLogout}>KELUAR</button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="dashboard-grid">
        {/* Left Side: Overview & Transactions */}
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
              RIWAYAT TRANSAKSI <span className="panel-sfx">LOG!</span>
            </h2>
            <div className="transaction-list">
              {transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666666' }}>
                  Belum ada transaksi. Tambahkan sekarang di panel sebelah kanan!
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

        {/* Right Side: Action Form */}
        <div>
          <section className="comic-panel">
            <h2 className="panel-title">
              INPUT KAS BARU <span className="panel-sfx">CATAT!</span>
            </h2>
            
            {actionError && (
              <div className="dashboard-alert error">{actionError}</div>
            )}
            {actionSuccess && (
              <div className="dashboard-alert success">{actionSuccess}</div>
            )}

            <form onSubmit={handleAddTransaction} className="form-comic">
              <div className="form-row">
                <label className="form-label">DESKRIPSI TRANSAKSI</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Bayar Uang Kas Minggu 1"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <label className="form-label">JUMLAH (RUPIAH)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Contoh: 10000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                />
              </div>

              <div className="form-row">
                <label className="form-label">TIPE TRANSAKSI</label>
                <div className="form-radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="trans-type"
                      checked={type === 'INCOME'}
                      onChange={() => setType('INCOME')}
                    />
                    UANG MASUK
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="trans-type"
                      checked={type === 'EXPENSE'}
                      onChange={() => setType('EXPENSE')}
                    />
                    UANG KELUAR
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="btn-comic-submit"
                disabled={loading}
              >
                {loading ? 'MEMPROSES...' : 'SIMPAN TRANSAKSI'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
