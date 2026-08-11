import React, { useState } from 'react';
import { User, CreditCard, Sparkles, AlertCircle } from 'lucide-react';

export default function RegisterForm({ onRegister, isConnecting }) {
  const [name, setName] = useState('');
  const [indexNumber, setIndexNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      return setError('Please enter your full name.');
    }

    if (!indexNumber.trim()) {
      return setError('Please enter your Index Number.');
    }

    const cleanIndex = indexNumber.trim().toLowerCase();
    const indexRegex = /^2025[\/]?t[\/]?\w{3,7}$/i;
    if (!indexRegex.test(cleanIndex)) {
      return setError('Invalid format! Index number must start with 2025t (e.g., 2025t00123).');
    }

    onRegister({ name: name.trim(), indexNumber: indexNumber.trim() });
  };

  return (
    <div className="glass-panel register-card">
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img
          src="/assets/club_logo.png"
          alt="Arts Club Logo"
          style={{
            height: '48px',
            maxWidth: '220px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 10px rgba(6, 182, 212, 0.5))',
            marginBottom: '8px'
          }}
        />
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800 }}>
          Join Puzzle Challenge
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Faculty of Technology - University of Colombo
        </p>
      </div>

      {error && (
        <div className="error-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">
            <User size={16} color="#c084fc" /> Full Name
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Kasun Perera"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isConnecting}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <CreditCard size={16} color="#38bdf8" /> Index Number
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="2025t00123"
            value={indexNumber}
            onChange={(e) => setIndexNumber(e.target.value)}
            disabled={isConnecting}
          />
          <span className="form-hint">Format must be: 2025txxxxx (e.g. 2025t00123)</span>
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{ width: '100%', marginTop: '10px' }}
          disabled={isConnecting}
        >
          {isConnecting ? 'Joining...' : 'ENTER GAME 🚀'}
        </button>
      </form>
    </div>
  );
}
