import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, QrCode as QrIcon, Copy, ExternalLink, Check } from 'lucide-react';

export default function QRCodeModal({ onClose }) {
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const currentOrigin = window.location.origin;

  useEffect(() => {
    QRCode.toDataURL(currentOrigin, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then((url) => setQrUrl(url))
      .catch((err) => console.error(err));
  }, [currentOrigin]);

  const copyUrl = () => {
    navigator.clipboard.writeText(currentOrigin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="glass-panel qr-presentation-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>

        <img
          src="/assets/club_logo.png"
          alt="Arts Club Logo"
          style={{
            height: '56px',
            maxWidth: '260px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 14px rgba(6, 182, 212, 0.6))',
            marginBottom: '12px'
          }}
        />

        <div className="brand-badge" style={{ marginBottom: '12px' }}>
          <QrIcon size={14} /> SCAN TO ENTER FUSION '26 GAME
        </div>

        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 900 }}>
          Join the Mona Lisa Challenge!
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
          Faculty of Technology - Arts Club Freshers Welcome
        </p>

        {/* Big Projector QR Frame */}
        {qrUrl ? (
          <div className="qr-code-frame">
            <img src={qrUrl} alt="Game QR Code" style={{ width: '280px', height: '280px', display: 'block' }} />
          </div>
        ) : (
          <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Generating QR Code...
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
          <code style={{
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#38bdf8',
            fontSize: '1rem',
            fontWeight: 700
          }}>
            {currentOrigin}
          </code>
          <button className="btn-primary" style={{ padding: '8px 14px' }} onClick={copyUrl}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}
