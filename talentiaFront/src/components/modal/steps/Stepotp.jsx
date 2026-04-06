import React, { useState, useRef, useEffect } from 'react';

const COLORS = {
  blueMain: '#4682B4',
  blueDark: '#2B547E',
  blueLight: '#7BAFD4',
  border: '#E2E8F0',
  error: '#ef4444',
  bgLight: '#F8FAFC'
};

export default function StepOTP({ email, onVerify, onResend, error, loading: externalLoading }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [internalLoading, setInternalLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [err, setErr] = useState(null);
  const inputs = useRef([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (error) setErr(error);
  }, [error]);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  function handleChange(i, val) {
    const cleanVal = val.replace(/[^0-9]/g, '');
    if (!cleanVal && val !== '') return;

    const updated = [...digits];
    updated[i] = cleanVal.slice(-1);
    setDigits(updated);
    setErr(null);

    if (updated[i] && i < 5) {
      inputs.current[i + 1]?.focus();
    }
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
    if (e.key === 'Enter' && digits.join('').length === 6) {
      handleVerify();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length > 0) {
      const newDigits = [...digits];
      paste.split('').forEach((char, idx) => {
        if (idx < 6) newDigits[idx] = char;
      });
      setDigits(newDigits);
      const nextIdx = Math.min(paste.length, 5);
      inputs.current[nextIdx]?.focus();
    }
  }

  async function handleVerify() {
    const code = digits.join('');
    if (code.length < 6) { 
      setErr('Veuillez entrer les 6 chiffres.'); 
      return; 
    }
    
    setInternalLoading(true);
    setErr(null);
    
    try {
      await onVerify(code);
    } catch (e) {
      setErr(e.message || "Code invalide");
    } finally {
      setInternalLoading(false);
    }
  }

  function handleResendClick() {
    if (timer > 0) return;
    setDigits(['', '', '', '', '', '']);
    setTimer(60);
    setErr(null);
    if (onResend) onResend();
    inputs.current[0]?.focus();
  }

  const isComplete = digits.join('').length === 6;
  const isLoading = internalLoading || externalLoading;

  return (
    <div style={{ textAlign: 'center', padding: '10px 0' }}>
      {/* Icône de sécurité style ISSAT */}
      <div style={{ 
        width: 64, height: 64, borderRadius: 4, 
        background: COLORS.bgLight, border: `2px solid ${COLORS.blueMain}`, 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        fontSize: 28, margin: '0 auto 1.5rem', color: COLORS.blueDark
      }}>
        🛡️
      </div>

      <h3 style={{ fontSize: 22, fontWeight: 900, color: COLORS.blueDark, marginBottom: 8, letterSpacing: '-0.5px' }}>
        VÉRIFICATION DU COMPTE
      </h3>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: '2.5rem', lineHeight: 1.6, fontWeight: 600 }}>
        Un code de sécurité a été envoyé à l'adresse :<br />
        <span style={{ color: COLORS.blueMain, fontWeight: 800 }}>{email}</span>
      </p>

      {/* Champs OTP Style "Pixel" */}
      <div 
        style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: '2.5rem' }}
        onPaste={handlePaste}
      >
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => inputs.current[i] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            style={{
              width: 46, height: 58, textAlign: 'center',
              fontSize: 24, fontWeight: 900,
              border: `2px solid ${err ? COLORS.error : (d ? COLORS.blueDark : COLORS.border)}`,
              borderRadius: 4, outline: 'none',
              background: d ? '#fff' : COLORS.bgLight,
              color: COLORS.blueDark,
              transition: 'all .2s ease-in-out',
              boxShadow: d ? `0 0 0 3px ${COLORS.blueLight}33` : 'none',
            }}
          />
        ))}
      </div>

      {/* Message d'erreur pro */}
      {err && (
        <div style={{ 
          padding: '10px 14px', background: '#FEF2F2', 
          borderLeft: `4px solid ${COLORS.error}`,
          fontSize: 12, color: COLORS.error, marginBottom: 25,
          fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center'
        }}>
          <span>⚠</span> {err.toUpperCase()}
        </div>
      )}

      {/* Bouton de validation Institutionnel */}
      <button
        onClick={handleVerify}
        disabled={isLoading || !isComplete}
        style={{ 
          width: '100%', height: 52, borderRadius: 4,
          background: (isLoading || !isComplete) ? '#CBD5E1' : `linear-gradient(135deg, ${COLORS.blueDark} 0%, ${COLORS.blueMain} 100%)`,
          color: '#fff', border: 'none', fontWeight: 900, fontSize: 14,
          cursor: (isLoading || !isComplete) ? 'not-allowed' : 'pointer',
          letterSpacing: '1px', textTransform: 'uppercase', transition: 'all .3s'
        }}
      >
        {isLoading ? 'VÉRIFICATION EN COURS...' : 'CONFIRMER L\'INSCRIPTION →'}
      </button>

      {/* Renvoyer le code */}
      <div style={{ marginTop: 25, fontSize: 13, color: '#64748b', fontWeight: 700 }}>
        Vous n'avez pas reçu l'email ?<br />
        {timer > 0 ? (
          <div style={{ marginTop: 10, color: COLORS.blueMain, fontSize: 11, letterSpacing: '0.5px' }}>
            NOUVEL ENVOI POSSIBLE DANS : <strong style={{ fontSize: 14 }}>{timer}s</strong>
          </div>
        ) : (
          <button
            onClick={handleResendClick}
            style={{ 
              background: 'none', border: 'none', padding: '10px',
              color: COLORS.blueDark, cursor: 'pointer', 
              textDecoration: 'underline', fontWeight: 900,
              marginTop: 5, fontSize: 12, textTransform: 'uppercase'
            }}
          >
            Renvoyer un nouveau code
          </button>
        )}
      </div>
    </div>
  );
}