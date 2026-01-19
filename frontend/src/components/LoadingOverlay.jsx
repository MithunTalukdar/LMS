import React, { useEffect } from 'react';

const LoadingOverlay = ({ message, onCancel, logo, status = 'loading', soundUrl }) => {
  useEffect(() => {
    if (status === 'success' && soundUrl) {
      // Standard success chime sound
      const audio = new Audio(soundUrl);
      
      // Play sound after a short delay to sync with the checkmark animation finishing (~1s)
      const timer = setTimeout(() => {
        audio.play().catch(err => console.warn("Audio playback failed (likely browser policy):", err));
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [status, soundUrl]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(5px)',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      {logo ? (
        <img src={logo} alt="Logo" style={{ width: '60px', marginBottom: '20px', objectFit: 'contain' }} />
      ) : (
        <div style={{ fontSize: '40px', marginBottom: '20px' }}>📚</div>
      )}
      {status === 'loading' ? (
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid #ffffff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      ) : (
        <div style={{ width: '80px', height: '80px' }}>
          <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            display: 'block',
            strokeWidth: '2',
            stroke: '#fff',
            strokeMiterlimit: '10',
            boxShadow: 'inset 0px 0px 0px #7ac142',
            animation: 'fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both'
          }}>
            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" style={{ strokeDasharray: '166', strokeDashoffset: '166', strokeWidth: '2', strokeMiterlimit: '10', stroke: '#7ac142', fill: 'none', animation: 'stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards' }} />
            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" style={{ transformOrigin: '50% 50%', strokeDasharray: '48', strokeDashoffset: '48', animation: 'stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards' }} />
          </svg>
        </div>
      )}
      <h3 style={{ color: 'white', marginTop: '20px', fontFamily: 'sans-serif' }}>{message}</h3>
      {onCancel && status === 'loading' && (
        <button
          onClick={onCancel}
          style={{
            marginTop: '20px',
            padding: '8px 20px',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            color: 'white',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            fontFamily: 'sans-serif'
          }}
        >
          Go Back
        </button>
      )}
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes stroke { 100% { stroke-dashoffset: 0; } }
        @keyframes scale { 0%, 100% { transform: none; } 50% { transform: scale3d(1.1, 1.1, 1); } }
        @keyframes fill { 100% { box-shadow: inset 0px 0px 0px 30px #7ac142; } }
      `}</style>
    </div>
  );
};

export default LoadingOverlay;