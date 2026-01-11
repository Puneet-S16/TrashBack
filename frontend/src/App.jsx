import React, { useState, useEffect } from 'react';

const API_URL = 'http://127.0.0.1:8000';
const USER_ID = 1; // Demo User

function App() {
  const [view, setView] = useState('home'); // home, scan, result, history, admin
  const [user, setUser] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUser();
  }, [view]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/user/${USER_ID}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (err) {
      console.error("Failed to fetch user", err);
    }
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!inputCode) return;

    setLoading(true);
    setError('');

    try {
      // Simulate scan delay for effect
      await new Promise(r => setTimeout(r, 1500));

      const res = await fetch(`${API_URL}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: USER_ID, code: inputCode.toUpperCase() })
      });

      const data = await res.json();

      if (res.ok) {
        setScanResult({ success: true, ...data });
        setView('result');
        setInputCode('');
        fetchUser(); // update points
      } else {
        throw new Error(data.detail || 'Scan failed');
      }
    } catch (err) {
      setScanResult({ success: false, message: err.message });
      setView('result');
    } finally {
      setLoading(false);
    }
  };

  const renderHome = () => (
    <div className="glass-panel" style={{ textAlign: 'center' }}>
      <h1 className="title">TrashBack</h1>
      <p className="subtitle">Dispose Responsibly, Earn Rewards.</p>

      {user && (
        <div className="stat-card">
          <div className="stat-value">{user.points}</div>
          <div className="stat-label">Your Points</div>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <button className="btn" onClick={() => setView('scan')}>
          Scan Item
        </button>
        <div style={{ height: '1rem' }}></div>
        <button className="btn btn-secondary" onClick={() => setView('history')}>
          My History
        </button>
      </div>

      <div style={{ marginTop: '2rem', fontSize: '0.8rem', opacity: 0.5 }}>
        <span onClick={() => setView('admin')} style={{ cursor: 'pointer' }}>For Demo: Admin Dashboard</span>
      </div>
    </div>
  );

  const renderScan = () => (
    <div className="glass-panel">
      <h2 className="title" style={{ fontSize: '1.5rem' }}>Scan Object</h2>
      <p className="subtitle">Locate the code on your packaging</p>

      <div className="scan-area">
        <div className="scan-line"></div>
        <span style={{ color: '#fff', zIndex: 1, opacity: 0.5 }}>CAMERA FEED SIMULATION</span>
      </div>

      <form onSubmit={handleScan}>
        <input
          type="text"
          className="input-field"
          placeholder="Enter Code (e.g. A1B2C3)"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          autoFocus
        />

        <button className="btn" disabled={loading}>
          {loading ? 'Verifying...' : 'Confirm Dispose'}
        </button>

        {!loading && (
          <button type="button" className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => setView('home')}>
            Cancel
          </button>
        )}
      </form>
    </div>
  );

  const renderResult = () => (
    <div className="glass-panel" style={{ textAlign: 'center' }}>
      {scanResult?.success ? (
        <>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h2 className="title" style={{ color: 'var(--primary)' }}>Success!</h2>
          <p className="subtitle">You earned {scanResult.points_awarded} points.</p>
          <div className="stat-card">
            <div className="stat-label">New Balance</div>
            <div className="stat-value">{scanResult.new_total}</div>
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
          <h2 className="title" style={{ color: 'var(--danger)' }}>Error</h2>
          <p className="subtitle">{scanResult?.message}</p>
        </>
      )}

      <button className="btn" onClick={() => setView('home')} style={{ marginTop: '2rem' }}>
        Done
      </button>
    </div>
  );

  const renderHistory = () => (
    <div className="glass-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="title" style={{ fontSize: '1.5rem', marginBottom: 0 }}>History</h2>
        <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'view' }}>✕</button>
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {user?.history?.length === 0 ? (
          <p className="subtitle">No disposal history yet.</p>
        ) : (
          user?.history?.map(item => (
            <div key={item.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '1rem',
              borderBottom: '1px solid var(--glass-border)',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: 'bold' }}>{item.code}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(item.timestamp).toLocaleString()}</div>
              </div>
              <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>+{item.points_awarded}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderAdmin = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
      fetch(`${API_URL}/admin/stats`).then(r => r.json()).then(setStats);
    }, []);

    const handleReset = async () => {
      if (!confirm("Reset all demo data?")) return;
      await fetch(`${API_URL}/admin/reset`, { method: 'POST' });
      alert("Reset Complete");
      setView('home');
    };

    return (
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 className="title" style={{ fontSize: '1.5rem', marginBottom: 0 }}>Admin</h2>
          <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', color: '#fff' }}>Exit</button>
        </div>

        {stats ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="stat-card">
              <div className="stat-value">{stats.total_disposals}</div>
              <div className="stat-label">Total Disposals</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.total_points_issued}</div>
              <div className="stat-label">Points Issued</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--danger)' }}>{stats.used_codes}</div>
              <div className="stat-label">Used Codes</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--primary)' }}>{stats.unused_codes}</div>
              <div className="stat-label">Available Codes</div>
            </div>
          </div>
        ) : <p>Loading stats...</p>}

        <button className="btn btn-danger" onClick={handleReset} style={{ marginTop: '2rem' }}>
          Reset Demo Data
        </button>
      </div>
    );
  };

  return (
    <>
      {view === 'home' && renderHome()}
      {view === 'scan' && renderScan()}
      {view === 'result' && renderResult()}
      {view === 'history' && renderHistory()}
      {view === 'admin' && renderAdmin()}
    </>
  );
}

export default App;
