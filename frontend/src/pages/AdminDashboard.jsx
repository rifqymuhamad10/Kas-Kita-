import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { API_V1_BASE, API_BASE as CENTRAL_API_BASE } from '../config';

const API_BASE = API_V1_BASE;

function AdminDashboard({ user, onLogout, onNavigate, isSidebarOpen, toggleSidebar }) {
  const displayName = user?.name || "Memuat...";
  const displayRole = user?.role === 'ROLE_ADMIN' ? "BENDAHARA" : "SISWA";

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // --- API DATA ---
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const [studentStatus, setStudentStatus] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [paidStudents, setPaidStudents] = useState(0);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Fetch all members
        const membersRes = await fetch(`${CENTRAL_API_BASE}/users/members`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        // Fetch all bills
        const billsRes = await fetch(`${CENTRAL_API_BASE}/bills`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });

        if (membersRes.ok && billsRes.ok) {
          const members = await membersRes.json();
          const bills = await billsRes.json();

          // Filter only invited members
          const invitedMembers = members.filter(m => m.invited);
          setTotalStudents(invitedMembers.length);

          // Calculate status for each member
          let lunasCount = 0;
          const statusList = invitedMembers.map(member => {
            const memberBills = bills.filter(b => b.memberUid === member.uid);
            const hasUnpaid = memberBills.some(b => b.status === 'UNPAID');
            const status = hasUnpaid ? 'BELUM' : 'LUNAS';
            if (status === 'LUNAS') lunasCount++;
            return {
              id: member.uid,
              name: member.name,
              status: status,
              photoUrl: member.photoUrl || null
            };
          });

          setPaidStudents(lunasCount);
          setStudentStatus(statusList);
        }
      } catch (err) {
        console.error("Gagal mengambil status iuran:", err);
      }
    };
    if (user?.token) fetchStatus();
  }, [user]);

  const progressPct = totalStudents > 0 ? (paidStudents / totalStudents) * 100 : 0;

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
            <div className="profile-wrapper manga-box" onClick={() => onNavigate('profile')} style={{ cursor: 'pointer', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div className="profile-text">
                <span className="profile-name">{displayName}</span>
                <span className="profile-role">{displayRole}</span>
              </div>
              {user?.photoUrl ? (
                <img 
                  src={user.photoUrl} 
                  alt="Avatar" 
                  style={{ 
                    width: '36px', 
                    height: '36px', 
                    objectFit: 'cover', 
                    border: '2px solid var(--manga-ink)',
                    borderRadius: '4px',
                    backgroundColor: '#fff'
                  }} 
                />
              ) : (
                <div 
                  style={{ 
                    width: '36px', 
                    height: '36px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    backgroundColor: '#1a1a1a', 
                    color: '#fff', 
                    fontWeight: 'bold', 
                    fontSize: '1rem',
                    border: '2px solid var(--manga-ink)',
                    borderRadius: '4px'
                  }}
                >
                  {(displayName || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content-area">
          
          {/* BARIS 1: ASYMMETRIC GRID (KARENA DILARANG 3 KOLOM SAMA RATA) */}
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
                <p className="card-label">PENGELUARAN</p>
                <h3 className="card-amount text-semantic-red">Rp {expense.toLocaleString('id-ID')}</h3>
              </div>
            </div>
          </div>

          {/* ROW 2: CHART & STATUS KAS */}
          <div className="grid-row-2">
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

            <div className="dashboard-card status-card manga-panel">
              <div className="status-header-new">
                <h3 className="card-title-new">STATUS IURAN KAS</h3>
                <div className="ratio-text-new manga-box">
                  <span>{paidStudents} / {totalStudents} SISWA</span>
                </div>
              </div>
              
              <div className="progress-bar-container-new manga-border">
                <div className="progress-fill-new manga-ink-bg" style={{ width: `${progressPct}%` }}></div>
              </div>

              <div className="student-grid">
                {studentStatus.slice(0, 5).map(student => (
                  <div className="student-card-new manga-box" key={student.id}>
                    {student.photoUrl ? (
                      <img 
                        src={student.photoUrl} 
                        alt={student.name} 
                        className="student-avatar-initial manga-border" 
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          objectFit: 'cover',
                          backgroundColor: '#fff'
                        }} 
                      />
                    ) : (
                      <div className="student-avatar-initial manga-border">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="student-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.name}</span>
                    <span className={`badge-new ${student.status === 'LUNAS' ? 'manga-ink-bg' : 'manga-white-bg text-semantic-red'}`}>
                      {student.status}
                    </span>
                  </div>
                ))}
                {studentStatus.length > 5 && (
                  <div className="student-card-new see-all-card manga-box" onClick={() => onNavigate('kas-siswa')} style={{ cursor: 'pointer' }}>
                    <span className="see-all-text">LIHAT SEMUA ➔</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ROW 3: RIWAYAT TRANSAKSI */}
          <div className="table-card manga-panel">
            <div className="table-header-container">
              <h3 className="transaction-title">RIWAYAT TRANSAKSI</h3>
            </div>
            
            <div className="table-responsive">
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
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;