import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Download, Sparkles, CheckCircle2, Crown } from 'lucide-react';

export default function WinnerPodium({ leaderboard }) {
  const completedStudents = (leaderboard || []).filter((s) => s.status === 'COMPLETED');
  const top1 = completedStudents[0];
  const top2 = completedStudents[1];
  const top3 = completedStudents[2];

  useEffect(() => {
    const count = 200;
    const defaults = { origin: { y: 0.6 } };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  const formatTime = (ms) => {
    if (!ms) return 'N/A';
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    return `${mins}m ${secs}.${tenths}s`;
  };

  const exportToCSV = () => {
    if (!completedStudents.length) return alert('No completed puzzle submissions to export yet.');

    let csvContent = 'data:text/csv;charset=utf-8,Rank,Name,Index Number,MCQ Score (out of 100),Solve Time (ms),Formatted Time,Moves Count,Submitted At\n';
    completedStudents.forEach((student, index) => {
      const dateStr = student.completedAt ? new Date(student.completedAt).toISOString() : '';
      csvContent += `${index + 1},"${student.name}","${student.indexNumber}",${student.mcqScore || 0},${student.solveTime},"${formatTime(student.solveTime)}",${student.moves},"${dateStr}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Fusion_26_Puzzle_Results_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-panel podium-wrapper">
      {/* Header Banner */}
      <div className="podium-header-banner">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '12px' }}>
          <img
            src="/assets/club_logo.png"
            alt="Arts Club Logo"
            style={{
              height: '56px',
              maxWidth: '220px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.6))'
            }}
          />
          <div className="brand-badge" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid #fbbf24', margin: 0 }}>
            <Sparkles size={14} /> FUSION '26 OFFICIAL SCOREBOARD
          </div>
        </div>

        <h2 className="podium-main-title text-gradient-gold">
          GRAND CHAMPIONS PODIUM 🏆
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          Faculty of Technology - University of Colombo
        </p>
      </div>

      {/* 3D Integrated Pillar Pedestal Stage */}
      <div className="podium-stage-container">
        {/* 2nd Place Pedestal Column */}
        <div className="podium-card-column order-2">
          <div className="winner-card silver-glow">
            <div className="winner-rank-badge silver-badge">2ND PLACE</div>
            <div className="winner-avatar silver-avatar">🥈</div>
            <div style={{ width: '100%', textAlign: 'center' }}>
              <h3 className="winner-name">{top2 ? top2.name : 'Awaiting...'}</h3>
              <p className="winner-index">{top2 ? top2.indexNumber : '-'}</p>
            </div>
            <div className="winner-mcq-tag">
              MCQ: {top2 ? top2.mcqScore || 0 : 0}/100 pts
            </div>
            <div className="winner-time-pill silver-pill">
              {top2 ? formatTime(top2.solveTime) : '--:--'}
            </div>
          </div>
          <div className="podium-pedestal pedestal-silver">
            <span className="pedestal-number">2</span>
          </div>
        </div>

        {/* 1st Place Pedestal Column (Center Champion) */}
        <div className="podium-card-column order-1 champion-column">
          <div className="winner-card gold-glow champion-card">
            <div className="crown-icon-wrapper">
              <Crown size={32} color="#fbbf24" className="animate-pulse-glow" />
            </div>
            <div className="winner-rank-badge gold-badge">GRAND CHAMPION</div>
            <div className="winner-avatar gold-avatar">👑</div>
            <div style={{ width: '100%', textAlign: 'center' }}>
              <h3 className="winner-name champion-name">{top1 ? top1.name : 'Awaiting...'}</h3>
              <p className="winner-index champion-index">{top1 ? top1.indexNumber : '-'}</p>
            </div>
            <div className="winner-mcq-tag gold-mcq-tag">
              MCQ: {top1 ? top1.mcqScore || 0 : 0}/100 pts
            </div>
            <div className="winner-time-pill gold-pill">
              {top1 ? formatTime(top1.solveTime) : '--:--'}
            </div>
          </div>
          <div className="podium-pedestal pedestal-gold">
            <span className="pedestal-number">1</span>
          </div>
        </div>

        {/* 3rd Place Pedestal Column */}
        <div className="podium-card-column order-3">
          <div className="winner-card bronze-glow">
            <div className="winner-rank-badge bronze-badge">3RD PLACE</div>
            <div className="winner-avatar bronze-avatar">🥉</div>
            <div style={{ width: '100%', textAlign: 'center' }}>
              <h3 className="winner-name">{top3 ? top3.name : 'Awaiting...'}</h3>
              <p className="winner-index">{top3 ? top3.indexNumber : '-'}</p>
            </div>
            <div className="winner-mcq-tag">
              MCQ: {top3 ? top3.mcqScore || 0 : 0}/100 pts
            </div>
            <div className="winner-time-pill bronze-pill">
              {top3 ? formatTime(top3.solveTime) : '--:--'}
            </div>
          </div>
          <div className="podium-pedestal pedestal-bronze">
            <span className="pedestal-number">3</span>
          </div>
        </div>
      </div>

      {/* CSV Export & Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '36px 0 24px 0' }}>
        <button className="btn-primary btn-gold" onClick={exportToCSV} style={{ padding: '14px 32px', fontSize: '1.05rem' }}>
          <Download size={20} /> Export Full Results to CSV
        </button>
      </div>

      {/* Full Leaderboard Table */}
      <div className="leaderboard-table-container">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Student Name</th>
              <th>Index Number</th>
              <th>MCQ Score</th>
              <th>Puzzle Time</th>
              <th>Moves</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {completedStudents.map((s, index) => (
              <tr key={index} className={index < 3 ? `top-row top-row-${index + 1}` : ''}>
                <td>
                  <span className={`table-rank-pill rank-${index + 1}`}>
                    #{index + 1}
                  </span>
                </td>
                <td style={{ fontWeight: 700 }}>{s.name}</td>
                <td style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{s.indexNumber}</td>
                <td style={{ fontWeight: 900, color: '#fbbf24' }}>
                  {s.mcqScore || 0}/100 pts
                </td>
                <td style={{ fontWeight: 800, color: '#c084fc' }}>
                  {formatTime(s.solveTime)}
                </td>
                <td>{s.moves} moves</td>
                <td>
                  <span className="status-badge-completed">
                    <CheckCircle2 size={12} style={{ marginRight: '4px' }} /> COMPLETED
                  </span>
                </td>
              </tr>
            ))}
            {completedStudents.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  No completed puzzle & quiz submissions recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
