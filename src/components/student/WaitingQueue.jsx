import React from 'react';
import { Users, Clock, Radio, CheckCircle } from 'lucide-react';

export default function WaitingQueue({ student, queueCount }) {
  return (
    <div className="glass-panel radar-lobby">
      <div className="radar-circle">
        <div className="radar-wave" />
        <Radio size={54} color="#8b5cf6" className="animate-pulse-glow" />
      </div>

      <div className="queue-badge-pill">
        <Users size={16} style={{ marginRight: '6px', verticalAlign: 'middle', display: 'inline-block' }} />
        {queueCount} Students Joined Queue
      </div>

      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, margin: '12px 0 6px 0' }}>
        You are in the Queue!
      </h2>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '340px' }}>
        Welcome <strong style={{ color: '#ffffff' }}>{student?.name}</strong> ({student?.indexNumber}).
        Host will start the game on the main screen shortly!
      </p>

      <div style={{
        marginTop: '28px',
        padding: '14px 20px',
        background: 'rgba(15, 23, 42, 0.7)',
        borderRadius: '14px',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '0.85rem',
        color: '#38bdf8'
      }}>
        <Clock size={18} />
        <span>Keep this page open. Game will redirect automatically!</span>
      </div>
    </div>
  );
}
