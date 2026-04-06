import React, { useState, useRef } from 'react';
import Button from '../../ui/Button';

const API = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const COLORS = {
  blueMain: '#4682B4',
  blueDark: '#2B547E',
  blueLight: '#7BAFD4',
  border: '#E2E8F0',
  bgLight: '#F8FAFC'
};

export default function StepCV({ onAnalyze, onSkip }) {
  const [progress, setProgress] = useState(0);
  const [running,  setRunning]  = useState(false);
  const [file,     setFile]     = useState(null);
  const [error,    setError]    = useState(null);
  const fileRef = useRef();

  function handleFileChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    if (f.type !== 'application/pdf') {
      setError('Seuls les fichiers PDF sont acceptés.');
      return;
    }
    setFile(f);
    setError(null);
  }

  async function startAnalysis() {
    if (!file) { setError('Veuillez sélectionner un fichier PDF.'); return; }

    setRunning(true);
    setProgress(0);
    setError(null);

    const iv = setInterval(() => {
      setProgress(p => p >= 85 ? 85 : p + 2);
    }, 80);

    try {
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch(`${API}/auth/parse-cv`, {
        method: 'POST',
        body: fd,
      });

      clearInterval(iv);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Erreur serveur (${res.status})`);
      }

      const data = await res.json();
      setProgress(100);

      setTimeout(() => {
        setRunning(false);
        onAnalyze(data, file);
      }, 400);

    } catch (e) {
      clearInterval(iv);
      setRunning(false);
      setProgress(0);
      setError(e.message || "Erreur lors de l'analyse. Réessayez.");
    }
  }

  const hasFile = !!file;

  return (
    <div>
      {/* Zone de sélection style ISSAT */}
      <div
        onClick={() => !hasFile && !running && fileRef.current?.click()}
        style={{
          border: `2px ${hasFile ? 'solid ' + COLORS.blueMain : 'dashed ' + COLORS.border}`,
          borderRadius: 4, 
          padding: '2rem 1.5rem', 
          textAlign: 'center',
          background: hasFile ? '#F0F7FF' : COLORS.bgLight,
          position: 'relative', 
          overflow: 'hidden',
          cursor: hasFile || running ? 'default' : 'pointer', 
          transition: 'all .2s',
        }}
      >
        {hasFile ? (
          <>
            <div style={{ 
              width: 50, height: 50, borderRadius: 4, margin: '0 auto 12px', 
              background: '#fff', border: `1px solid ${COLORS.blueMain}`, 
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 
            }}>📄</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.blueDark, marginBottom: 4 }}>{file.name}</div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{(file.size / 1024 / 1024).toFixed(1)} MB · DOCUMENT PDF</div>
            
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 7, 
              background: COLORS.blueDark, borderRadius: 2, 
              padding: '6px 12px', marginTop: 15, fontSize: 11, color: '#fff',
              textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700
            }}>
              <span style={{ width: 6, height: 6, background: COLORS.blueLight }}></span>
              Prêt pour l'analyse
            </div>
          </>
        ) : (
          <>
            <div style={{ 
              width: 50, height: 50, borderRadius: 4, margin: '0 auto 12px', 
              background: '#fff', border: `2px dashed ${COLORS.border}`, 
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 
            }}>📎</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.blueDark, marginBottom: 4 }}>IMPORTATION DU CV</div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>PDF UNIQUEMENT · MAX 10 MB</div>
          </>
        )}

        {/* Overlay d'analyse avec le dégradé du logo */}
        {running && (
          <div style={{ 
            position: 'absolute', inset: 0, background: 'rgba(255,255,255,.95)', 
            display: 'flex', flexDirection: 'column', alignItems: 'center', 
            justifyContent: 'center', gap: 12 
          }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: COLORS.blueDark, letterSpacing: '1px' }}>
              EXTRACTION DES DONNÉES...
            </div>
            <div style={{ width: 220, height: 6, background: COLORS.border, borderRadius: 0, overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', width: `${progress}%`, 
                background: `linear-gradient(90deg, ${COLORS.blueDark}, ${COLORS.blueMain})`, 
                transition: 'width .2s' 
              }} />
            </div>
            <div style={{ fontSize: 10, color: COLORS.blueMain, fontWeight: 700, textTransform: 'uppercase' }}>
              Analyse IA en cours
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ textAlign: 'center', marginTop: 10 }}>
        <span 
          onClick={() => !running && fileRef.current?.click()} 
          style={{ fontSize: 11, color: COLORS.blueMain, fontWeight: 700, textDecoration: 'none', cursor: 'pointer', textTransform: 'uppercase' }}
        >
          {hasFile ? '✖ Changer de fichier' : '📂 Parcourir mes documents'}
        </span>
        <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileChange} />
      </div>

      {error && (
        <div style={{ 
          marginTop: 15, padding: '10px 14px', background: '#FEF2F2', 
          borderLeft: '4px solid #EF4444', borderRadius: 2, fontSize: 12, color: '#B91C1C', fontWeight: 600 
        }}>
          ⚠ {error}
        </div>
      )}

      <button 
        disabled={running || !hasFile}
        onClick={startAnalysis}
        style={{ 
          marginTop: '2rem', width: '100%', height: 52, 
          background: running || !hasFile ? '#CBD5E1' : `linear-gradient(135deg, ${COLORS.blueDark} 0%, ${COLORS.blueMain} 100%)`,
          color: '#fff', border: 'none', borderRadius: 4, 
          fontWeight: 900, cursor: running || !hasFile ? 'not-allowed' : 'pointer',
          boxShadow: hasFile && !running ? '0 4px 12px rgba(43, 84, 126, 0.25)' : 'none',
          transition: 'transform 0.2s'
        }}
      >
        {running ? 'TRAITEMENT EN COURS...' : "LANCER L'ANALYSE IA →"}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: '#94A3B8', margin: '15px 0', fontWeight: 800 }}>
        <div style={{ flex: 1, height: 1, background: COLORS.border }} /> OU <div style={{ flex: 1, height: 1, background: COLORS.border }} />
      </div>

      <button 
        onClick={onSkip}
        style={{ 
          width: '100%', background: 'none', border: `2px solid ${COLORS.border}`, 
          color: '#64748B', padding: '12px', borderRadius: 4, fontWeight: 800, 
          fontSize: 12, cursor: 'pointer', transition: 'all 0.2s'
        }}
      >
        REMPLIR MANUELLEMENT
      </button>
    </div>
  );
}