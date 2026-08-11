import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import QRCodeModal from './QRCodeModal';
import WinnerPodium from './WinnerPodium';
import { 
  Play, RotateCcw, StopCircle, QrCode, Users, Trophy, Clock, 
  Settings, Image as ImageIcon, Grid, Sparkles, CheckCircle2, AlertCircle 
} from 'lucide-react';

export default function AdminDashboard() {
  const { socket, isConnected, gameState } = useSocket();
  const [showQR, setShowQR] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const { status, config, studentsCount, students, gameStartTime } = gameState;

  // Master Timer for Admin Screen
  useEffect(() => {
    if (status !== 'PLAYING' || !gameStartTime) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.max(0, Date.now() - gameStartTime));
    }, 100);

    return () => clearInterval(interval);
  }, [status, gameStartTime]);

  const handleStartGame = () => {
    if (!studentsCount) {
      if (!confirm('No students in queue yet! Start game anyway?')) return;
    }
    socket.emit('admin:start_game');
  };

  const handleResetGame = () => {
    if (confirm('Are you sure you want to reset the current round? Queue will be preserved.')) {
      socket.emit('admin:reset_game', { clearQueue: false });
    }
  };

  const handleClearAll = () => {
    if (confirm('WARNING: Reset game AND clear student queue?')) {
      socket.emit('admin:reset_game', { clearQueue: true });
    }
  };

  const handleEndGame = () => {
    if (confirm('End Fusion 26 Puzzle Game and show Grand Winners Podium?')) {
      socket.emit('admin:end_game');
    }
  };

  const handleGridChange = (e) => {
    const gridDimension = parseInt(e.target.value);
    socket.emit('admin:update_config', { gridDimension });
  };

  const handleImageSelect = (imageSrc) => {
    socket.emit('admin:update_config', { imageSrc, customImageUrl: null });
  };

  const formatTime = (ms) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${tenths}`;
  };

  const completedCount = (students || []).filter((s) => s.status === 'COMPLETED').length;

  return (
    <div className="admin-layout">
      {/* Top Navbar */}
      <header className="glass-panel admin-navbar">
        <div className="admin-title-group">
          <img
            src="/assets/club_logo.png"
            alt="Arts Club Logo"
            style={{
              height: '46px',
              maxWidth: '180px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.6))'
            }}
          />
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800 }}>
              FUSION '26 ADMIN CONTROL CENTER
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Faculty of Technology - University of Colombo
            </p>
          </div>
        </div>

        <div className="admin-controls-group">
          <button className="btn-primary btn-cyan" onClick={() => setShowQR(true)}>
            <QrCode size={18} /> Show QR Code
          </button>
          <button className="btn-primary" style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5' }} onClick={handleResetGame}>
            <RotateCcw size={18} /> Reset Round
          </button>
          {status === 'PLAYING' && (
            <button className="btn-primary btn-gold" onClick={handleEndGame}>
              <StopCircle size={18} /> End & Show Podium
            </button>
          )}
        </div>
      </header>

      {/* Stats Summary Bar */}
      <div className="admin-stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon-box">
            <Users size={28} />
          </div>
          <div>
            <div className="stat-number">{studentsCount || 0}</div>
            <div className="stat-label">Participants Joined</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-box" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8' }}>
            <Clock size={28} />
          </div>
          <div>
            <div className="stat-number">{status === 'PLAYING' ? formatTime(elapsedTime) : status}</div>
            <div className="stat-label">Master Timer / Status</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-box" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>
            <Trophy size={28} />
          </div>
          <div>
            <div className="stat-number">{completedCount}</div>
            <div className="stat-label">Puzzles Solved</div>
          </div>
        </div>
      </div>

      {/* Main Content Stage */}
      {status === 'FINISHED' ? (
        <WinnerPodium leaderboard={students} />
      ) : (
        <>
          {/* Admin Config & Launch Deck */}
          <div className="glass-panel admin-action-deck">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              {/* Grid Size Select */}
              <div className="config-item">
                <Grid size={18} color="#c084fc" />
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Grid Size:</span>
                <select className="select-dropdown" value={config?.gridDimension || 3} onChange={handleGridChange}>
                  <option value={3}>3 x 3 (Easy - 9 Tiles)</option>
                  <option value={4}>4 x 4 (Medium - 16 Tiles)</option>
                  <option value={5}>5 x 5 (Hard - 25 Tiles)</option>
                </select>
              </div>

              {/* Target Image Preset Select */}
              <div className="config-item">
                <ImageIcon size={18} color="#06b6d4" />
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Artwork:</span>
                <button
                  className={`btn-primary ${config?.imageSrc === '/assets/monalisa.jpg' ? 'btn-cyan' : ''}`}
                  style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  onClick={() => handleImageSelect('/assets/monalisa.jpg')}
                >
                  Mona Lisa Photo
                </button>
                <button
                  className={`btn-primary ${config?.imageSrc === '/assets/club_logo.png' ? 'btn-cyan' : ''}`}
                  style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  onClick={() => handleImageSelect('/assets/club_logo.png')}
                >
                  Official Arts Logo
                </button>
              </div>
            </div>

            {/* Launch Big Game Button */}
            {status === 'LOBBY' ? (
              <button className="btn-primary" style={{ padding: '16px 36px', fontSize: '1.2rem', background: 'linear-gradient(135deg, #22c55e, #15803d)', boxShadow: '0 0 30px rgba(34, 197, 94, 0.4)' }} onClick={handleStartGame}>
                <Play size={24} /> START FUSION '26 GAME NOW 🚀
              </button>
            ) : (
              <div className="brand-badge" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid #22c55e', fontSize: '1rem', padding: '10px 20px' }}>
                <CheckCircle2 size={18} /> GAME IN PROGRESS LIVE!
              </div>
            )}
          </div>

          {/* Real-time Student Queue Chips Grid */}
          <div className="glass-panel queue-chips-container">
            <div className="queue-chips-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="#8b5cf6" />
                Live Waiting Queue ({studentsCount || 0} Freshers Ready)
              </h3>
              <button
                style={{ background: 'none', border: 'none', color: '#fca5a5', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={handleClearAll}
              >
                Clear Queue
              </button>
            </div>

            <div className="chips-grid">
              {students && students.map((student, idx) => (
                <div key={idx} className="student-chip">
                  <div className="chip-avatar">{student.name.charAt(0).toUpperCase()}</div>
                  <div style={{ overflow: 'hidden' }}>
                    <div className="chip-name">{student.name}</div>
                    <div className="chip-index">{student.indexNumber}</div>
                  </div>
                </div>
              ))}
              {(!students || students.length === 0) && (
                <div style={{ gridColumn: '1 / -1', padding: '30px', textAlign: 'center', color: '#64748b' }}>
                  No students in queue yet. Scan QR Code on screen to join!
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* QR Code Presentation Modal */}
      {showQR && <QRCodeModal onClose={() => setShowQR(false)} />}
    </div>
  );
}
