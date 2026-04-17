import React from 'react';

export default function Splash() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--brand)',
      minHeight: '100dvh',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
        opacity: 0,
        animation: 'splash-in 350ms ease-out 80ms forwards',
      }}>
        {/* Icon */}
        <div style={{
          width: '5rem', height: '5rem', borderRadius: '1.5rem',
          background: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>

        <p style={{
          fontFamily: 'var(--font-sans)', fontSize: '1.125rem', fontWeight: 600,
          color: '#fff', letterSpacing: '-0.01em', opacity: 0.9,
        }}>
          PawnManager
        </p>
      </div>

      <style>{`
        @keyframes splash-in {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}