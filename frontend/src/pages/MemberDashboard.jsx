import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const API_BASE = 'http://localhost:8080/api/v1';

function MemberDashboard({ user, page, onLogout, onNavigate, isSidebarOpen, toggleSidebar }) {
  const displayName = user?.name || "Siswa";
  const displayRole = "SISWA";

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // --- API DATA ---
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [activeTarget, setActiveTarget] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- KAS SISWA DATA ---
  const [bills, setBills] = useState([]);
  const [myArrears, setMyArrears] = useState(0);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Pie chart: kalkulasi pengeluaran per kategori dari data transaksi
  const CATEGORY_COLORS = [
    { fill: '#1A1A1A', stroke: '#1A1A1A', label: 'IURAN KAS' },
    { fill: '#888888', stroke: '#1A1A1A', label: 'KONSUMSI' },
    { fill: '#CCCCCC', stroke: '#1A1A1A', label: 'ATK' },
    { fill: '#444444', stroke: '#1A1A1A', label: 'KEGIATAN' },
    { fill: '#FFFFFF', stroke: '#1A1A1A', label: 'LAINNYA' },
  ];

  const categoryData = (() => {
    const expenseTxs = recentTransactions.filter(tx => tx.type === 'EXPENSE');
    const totals = {};
    expenseTxs.forEach(tx => {
      const cat = tx.category || 'LAINNYA';
      totals[cat] = (totals[cat] || 0) + (tx.amount || 0);
    });
    const totalExpense = Object.values(totals).reduce((a, b) => a + b, 0);
    return CATEGORY_COLORS
      .map(c => ({
        ...c,
        amount: totals[c.label] || 0,
        pct: totalExpense > 0 ? Math.round(((totals[c.label] || 0) / totalExpense) * 100) : 0
      }))
      .filter(c => c.amount > 0);
  })();

  // SVG Pie chart helper
  const buildPieSlices = (data) => {
    const SIZE = 140, R = 60, cx = SIZE / 2, cy = SIZE / 2;
    const total = data.reduce((s, d) => s + d.amount, 0);
    if (total === 0) return [];
    let startAngle = -Math.PI / 2;
    return data.map((d) => {
      const angle = (d.amount / total) * 2 * Math.PI;
      const x1 = cx + R * Math.cos(startAngle);
      const y1 = cy + R * Math.sin(startAngle);
      const endAngle = startAngle + angle;
      const x2 = cx + R * Math.cos(endAngle);
      const y2 = cy + R * Math.sin(endAngle);
      const largeArc = angle > Math.PI ? 1 : 0;
      const pathD = `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      startAngle = endAngle;
      return { ...d, pathD };
    });
  };
  const pieSlices = buildPieSlices(categoryData);
  const largestCat = categoryData.length > 0 ? categoryData.reduce((a, b) => a.amount > b.amount ? a : b) : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch balance
        const balanceRes = await fetch(`${API_BASE}/transactions/balance`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        if (balanceRes.ok) {
          const bal = await balanceRes.json();
          setBalance(bal);
        }

        // Fetch transactions
        const txRes = await fetch(`${API_BASE}/transactions`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        if (txRes.ok) {
          const txs = await txRes.json();
          let inc = 0;
          let exp = 0;
          txs.forEach(t => {
            if (t.type === 'INCOME') inc += t.amount || 0;
            else if (t.type === 'EXPENSE') exp += t.amount || 0;
          });
          setIncome(inc);
          setExpense(exp);
          setRecentTransactions(txs);
        }

        // Fetch active target
        const targetRes = await fetch(`${API_BASE}/targets/active`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        if (targetRes.ok) {
          const targets = await targetRes.json();
          if (targets && targets.length > 0) {
            setActiveTarget(targets[0]);
          }
        }

        // Fetch member bills
        const billsRes = await fetch(`${API_BASE}/bills/member/${user?.uid}`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        if (billsRes.ok) {
          const billsData = await billsRes.json();
          setBills(billsData);
          let arrears = 0;
          billsData.forEach(b => {
            if (b.status === 'UNPAID') arrears += b.amountDue;
          });
          setMyArrears(arrears);
        }
      } catch (err) {
        console.error("Gagal mengambil data dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchData();
    }
  }, [user]);

  const handlePaymentSubmit = async () => {
    if (!paymentAmount || isNaN(paymentAmount) || paymentAmount <= 0) return alert('Nominal harus valid');
    setPaymentLoading(true);
    try {
      const res = await fetch(`${API_BASE}/payments/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          memberUid: user?.uid,
          amount: parseFloat(paymentAmount)
        })
      });
      if (res.ok) {
        alert('Pengajuan pembayaran berhasil dikirim! Menunggu persetujuan Admin.');
        setPaymentAmount('');
      } else {
        alert('Gagal mengirim pengajuan.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengajukan pembayaran.');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="dashboard-layout manga-theme">

      {/* --- MAIN CONTENT --- */}
      <main className="main-content">
        
        {/* HEADER */}
        <header className="top-header manga-panel">
          <div className="header-left">
            <button className="hamburger-btn" onClick={toggleSidebar}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="square"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <h1 className="page-title">CHAPTER 1: DASHBOARD</h1>
          </div>
          
          <div className="header-controls">
            <div className="profile-wrapper manga-box" onClick={() => onNavigate('profile')} style={{ cursor: 'pointer' }}>
              <div className="profile-text">
                <span className="profile-name">{displayName.toUpperCase()}</span>
                <span className="profile-role">{displayRole}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="content-area">
          
          {/* BARIS 1: ASYMMETRIC GRID */}
          <div className="summary-cards-row">
            <div className="summary-card balance manga-panel speed-lines-bg">
              <div className="card-info relative-z">
                <p className="card-label bg-white-highlight">TOTAL SALDO</p>
                <h3 className="card-amount impact-text bg-white-highlight">Rp {balance.toLocaleString('id-ID')}</h3>
              </div>
            </div>

            <div className="summary-card income manga-panel">
              <div className="card-info">
                <p className="card-label">PEMASUKAN</p>
                <h3 className="card-amount">Rp {income.toLocaleString('id-ID')}</h3>
              </div>
            </div>

            <div className="summary-card expense manga-panel">
              <div className="card-info">
                <p className="card-label">TOTAL TAGIHAN SAYA</p>
                <h3 className="card-amount text-semantic-red">Rp {myArrears.toLocaleString('id-ID')}</h3>
              </div>
            </div>
          </div>

          {/* ROW 2: CHART & STATUS TARGET */}
          <div className="grid-row-2">
            
            {/* Kiri: Pie Chart Dinamis */}
            <div className="dashboard-card chart-card manga-panel screentone-bg">
              <h3 className="card-title-new bg-white-highlight inline-block">ALOKASI PENGELUARAN</h3>
              
              <div className="chart-placeholder-new bg-white-highlight border-box">
                {categoryData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', fontWeight: 800, width: '100%' }}>
                    BELUM ADA DATA PENGELUARAN
                  </div>
                ) : (
                  <>
                    <div className="donut-wrapper">
                      <svg width="140" height="140" viewBox="0 0 140 140" style={{ border: '2px solid #1A1A1A', borderRadius: '50%' }}>
                        {pieSlices.map((slice, i) => (
                          <path
                            key={i}
                            d={slice.pathD}
                            fill={slice.fill}
                            stroke={slice.stroke}
                            strokeWidth="1.5"
                          />
                        ))}
                        {/* Lingkaran tengah (donut hole) */}
                        <circle cx="70" cy="70" r="38" fill="white" stroke="#1A1A1A" strokeWidth="2" />
                        {largestCat && (
                          <>
                            <text x="70" y="65" textAnchor="middle" fontSize="7" fontWeight="800" fill="#1A1A1A" fontFamily="'Comic Neue', sans-serif">TERBESAR</text>
                            <text x="70" y="78" textAnchor="middle" fontSize="9" fontWeight="800" fill="#1A1A1A" fontFamily="'Comic Neue', sans-serif">{largestCat.label}</text>
                            <text x="70" y="90" textAnchor="middle" fontSize="10" fontWeight="800" fill="#1A1A1A" fontFamily="'JetBrains Mono', monospace">{largestCat.pct}%</text>
                          </>
                        )}
                      </svg>
                    </div>
                    
                    <div className="chart-legend-new">
                      {categoryData.map((cat, i) => (
                        <p key={i}>
                          <span className="dot" style={{ backgroundColor: cat.fill, border: `2px solid ${cat.stroke}` }}></span>
                          {cat.label} ({cat.pct}%)
                        </p>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Kanan: Form Pengajuan Pembayaran */}
            <div className="dashboard-card status-card manga-panel" style={{ display: 'flex', flexDirection: 'column', justifyItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
              <div className="status-header-new">
                <h3 className="card-title-new" style={{ textTransform: 'uppercase' }}>PENGAJUAN PEMBAYARAN</h3>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Masukkan nominal yang telah Anda bayarkan/transfer kepada Bendahara untuk dikonfirmasi.</p>
                <input 
                  type="number" 
                  value={paymentAmount} 
                  onChange={e => setPaymentAmount(e.target.value)} 
                  placeholder="Contoh: 10000" 
                  style={{ padding: '0.8rem', border: '2px solid #000', fontSize: '1rem', fontFamily: 'JetBrains Mono, monospace' }}
                />
                <button 
                  className="manga-btn primary" 
                  onClick={handlePaymentSubmit} 
                  disabled={paymentLoading || myArrears === 0} 
                  style={{ padding: '0.8rem', fontWeight: 'bold' }}
                >
                  {paymentLoading ? 'MENGIRIM...' : (myArrears === 0 ? 'TIDAK ADA TAGIHAN' : 'AJUKAN KONFIRMASI')}
                </button>
              </div>
            </div>
          </div>

          {/* ROW 3: RIWAYAT TRANSAKSI ATAU RIWAYAT IURAN */}
          <div className="table-card manga-panel">
            <div className="table-header-container">
              <h3 className="transaction-title">
                {page === 'kas-siswa' ? 'RIWAYAT IURAN' : 'RIWAYAT TRANSAKSI'}
              </h3>
            </div>
            
            <div className="table-responsive">
              {page === 'kas-siswa' ? (
                <table className="transaction-table">
                  <thead>
                    <tr>
                      <th>ID TAGIHAN</th>
                      <th>STATUS</th>
                      <th>JUMLAH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.length === 0 ? (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', fontWeight: 700 }}>
                          BELUM ADA TAGIHAN
                        </td>
                      </tr>
                    ) : (
                      bills.map(b => (
                        <tr key={b.id}>
                          <td className="col-desc mono-text">{b.id.substring(0, 8)}...</td>
                          <td>
                            <span className={`cat-badge manga-box ${b.status === 'PAID' ? 'manga-ink-bg' : 'manga-white-bg text-semantic-red'}`}>
                              {b.status === 'PAID' ? 'LUNAS' : 'BELUM LUNAS'}
                            </span>
                          </td>
                          <td className="mono-text">Rp {(b.amountDue || 0).toLocaleString('id-ID')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="transaction-table">
                  <thead>
                    <tr>
                      <th>TANGGAL</th>
                      <th>TIPE</th>
                      <th>KATEGORI</th>
                      <th>KETERANGAN</th>
                      <th>JUMLAH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', fontWeight: 700 }}>
                          BELUM ADA TRANSAKSI
                        </td>
                      </tr>
                    ) : (
                      recentTransactions.slice(0, 5).map(tx => (
                        <tr key={tx.id}>
                          <td className="col-date mono-text">
                            {tx.timestamp ? new Date(tx.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : '-'}
                          </td>
                          <td>
                            <span className={`cat-badge manga-box ${tx.type === 'INCOME' ? 'manga-ink-bg' : 'manga-white-bg text-semantic-red'}`}>
                              {tx.type === 'INCOME' ? 'PEMASUKAN' : 'PENGELUARAN'}
                            </span>
                          </td>
                          <td>
                            <span className="cat-badge manga-box">
                              {tx.category || 'LAINNYA'}
                            </span>
                          </td>
                          <td className="col-desc">{(tx.description || '').toUpperCase()}</td>
                          <td className={`mono-text ${tx.type === 'INCOME' ? '' : 'text-semantic-red'}`}>
                            {tx.type === 'INCOME' ? '+RP ' : '-RP '}{(tx.amount || 0).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default MemberDashboard;