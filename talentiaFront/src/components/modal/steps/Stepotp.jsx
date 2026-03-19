import React, { useState, useRef, useEffect } from 'react';
import Button from '../../ui/Button';

// Changement de la prop : onVerify pour correspondre à Modal.jsx
export default function StepOTP({ email, onVerify, onResend, error, loading: externalLoading }) {
  const [digits, setDigits]   = useState(['', '', '', '', '', '']);
  const [internalLoading, setInternalLoading] = useState(false);
  const [timer,   setTimer]   = useState(60);
  const [err,     setErr]     = useState(null);
  const inputs = useRef([]);

  // Focus sur le premier champ au montage
  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  // Synchronisation de l'erreur externe
  useEffect(() => {
    if (error) setErr(error);
  }, [error]);

  // Countdown pour renvoyer le code
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  function handleChange(i, val) {
    // On ne garde que les chiffres
    const cleanVal = val.replace(/[^0-9]/g, '');
    if (!cleanVal && val !== '') return;

    const updated = [...digits];
    updated[i] = cleanVal.slice(-1); // Ne garder que le dernier caractère saisi
    setDigits(updated);
    setErr(null);

    // Focus suivant
    if (updated[i] && i < 5) {
      inputs.current[i + 1]?.focus();
    }
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
    // Permettre la validation avec "Entrée"
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
      // Focus le dernier champ rempli ou le bouton
      const nextIdx = Math.min(paste.length, 5);
      inputs.current[nextIdx]?.focus();
    }
  }

  async function handleVerify() {
    const code = digits.join('');
    if (code.length < 6) { 
      setErr('Entrez les 6 chiffres du code.'); 
      return; 
    }
    
    setInternalLoading(true);
    setErr(null);
    
    try {
      // Appel de la fonction passée par Modal.jsx
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
      {/* Icône animée ou fixe */}
      <div style={{ 
        width: 64, height: 64, borderRadius: 20, 
        background: '#f0fdfa', border: '2px solid #ccfbf1', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        fontSize: 28, margin: '0 auto 1.5rem' 
      }}>
        ✉️
      </div>

      <h3 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 22, fontWeight: 700, color: '#0a0a12', marginBottom: 8 }}>
        Vérification par email
      </h3>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: '2rem', lineHeight: 1.5 }}>
        Saisissez le code de sécurité envoyé à<br />
        <strong style={{ color: '#0a0a12' }}>{email}</strong>
      </p>

      {/* Champs OTP */}
      <div 
        style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: '2rem' }}
        onPaste={handlePaste}
      >
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => inputs.current[i] = el}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={d}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            style={{
              width: 50, height: 62, textAlign: 'center',
              fontSize: 24, fontWeight: 700,
              border: `2px solid ${err ? '#ef4444' : (d ? '#0d9488' : '#e5e5ec')}`,
              borderRadius: 12, outline: 'none',
              background: d ? '#f0fdfa' : '#fff',
              color: '#0a0a12',
              boxShadow: d ? '0 0 0 4px rgba(13, 148, 136, 0.05)' : 'none',
              transition: 'all .2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        ))}
      </div>

      {/* Message d'erreur */}
      {err && (
        <div style={{ 
          padding: '10px 14px', background: '#fff1f1', 
          border: '1px solid #fecaca', borderRadius: 12, 
          fontSize: 13, color: '#dc2626', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center'
        }}>
          <span>⚠</span> {err}
        </div>
      )}

      {/* Bouton de validation */}
      <Button
        onClick={handleVerify}
        disabled={isLoading || !isComplete}
        style={{ 
          width: '100%',
          height: 48,
          opacity: (isLoading || !isComplete) ? 0.6 : 1,
          transition: 'all .3s'
        }}
      >
        {isLoading ? 'Vérification en cours...' : 'Confirmer l\'inscription →'}
      </Button>

      {/* Footer / Renvoyer */}
      <div style={{ marginTop: 24, fontSize: 14, color: '#6b7280' }}>
        Vous n'avez rien reçu ?<br />
        {timer > 0 ? (
          <span style={{ display: 'inline-block', marginTop: 8 }}>
            Renvoyer possible dans <strong style={{ color: '#0d9488' }}>{timer}s</strong>
          </span>
        ) : (
          <button
            onClick={handleResendClick}
            style={{ 
              background: 'none', border: 'none', padding: 0,
              color: '#0d9488', cursor: 'pointer', 
              textDecoration: 'underline', fontWeight: 600,
              marginTop: 8, fontSize: 14
            }}
          >
            Renvoyer un nouveau code
          </button>
        )}
      </div>
    </div>
  );
}