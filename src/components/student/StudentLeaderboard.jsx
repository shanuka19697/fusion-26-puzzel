import React from 'react';
import { Trophy, Award, Clock, Users, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function StudentLeaderboard({ studentResult, leaderboard }) {
  const formatTime = (ms) => {
    if (!ms) return 'N/A';
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    return `${mins}m ${secs}.${tenths}s`;
  };

  return (
    <div style={{ width: '100%', maxWidth: '460px' }}>
      {/* Victory Card */}
      <div className="glass-panel victory-card" style={{ marginBottom: '20px' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #fbbf24, #d97706)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
          boxShadow: '0 0 30px rgba(251, 191, 36, 0.5)'
        }}>
          <Trophy size={40} color="#0f172a" />
        </div>

        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 900 }}>
          Challenge Completed! 🎉
        </h2>

        <div className="queue-badge-pill" style={{ marginTop: '10px', fontSize: '1.1rem', background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid #fbbf24' }}>
          Overall Rank #{studentResult?.rank || 1}
        </div>

        {/* 3 Metric Pills */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', margin: '24px 0 10px 0' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MCQ SCORE</span>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, color: '#fbbf24' }}>
              {studentResult?.mcqScore || 0}/100
            </p>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TIME</span>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>
              {formatTime(studentResult?.solveTime)}
            </p>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MOVES</span>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, color: '#c084fc' }}>
              {studentResult?.moves || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Live Leaderboard Table Preview */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} color="#06b6d4" /> Live Submissions Feed
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
          {leaderboard && leaderboard.filter(s => s.status === 'COMPLETED').map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '10px',
                background: item.indexNumber === studentResult?.indexNumber ? 'rgba(139, 92, 246, 0.25)' : 'rgba(15, 23, 42, 0.6)',
                border: item.indexNumber === studentResult?.indexNumber ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 800, color: idx === 0 ? '#fbbf24' : idx === 1 ? '#e2e8f0' : idx === 2 ? '#f97316' : '#94a3b8' }}>
                  #{idx + 1}
                </span>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.indexNumber}</p>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fbbf24', display: 'block' }}>
                  {item.mcqScore || 0}/100 pts
                </span>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                  {formatTime(item.solveTime)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
