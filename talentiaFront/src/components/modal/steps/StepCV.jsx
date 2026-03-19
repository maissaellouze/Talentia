import React, { useState, useRef } from 'react';
import Button from '../../ui/Button';

const API = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

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

    // Progress bar cosmétique pendant l'appel API
    const iv = setInterval(() => {
      setProgress(p => p >= 85 ? 85 : p + 2);
    }, 80);

    try {
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch(`${API}/parse-cv`, {
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
        onAnalyze(data, file); // données parsées + fichier brut → Modal
      }, 400);

    } catch (e) {
      clearInterval(iv);
      setRunning(false);
      setProgress(0);
      setError(e.message || "Erreur lors de l'analyse. Réessaie.");
    }
  }

  const hasFile = !!file;

  return (
    <div>
      {/* Zone de sélection */}
      <div
        onClick={() => !hasFile && fileRef.current?.click()}
        style={{
          border: `1.5px ${hasFile ? 'solid #e8d88a' : 'dashed #d1d5db'}`,
          borderRadius: 16, padding: '1.8rem 1.5rem', textAlign: 'center',
          background: hasFile ? '#fdfbf0' : '#fafaf8',
          position: 'relative', overflow: 'hidden',
          cursor: hasFile ? 'default' : 'pointer', transition: 'all .2s',
        }}
      >
        {hasFile ? (
          <>
            <div style={{ width: 56, height: 56, borderRadius: 14, margin: '0 auto 12px', background: '#fff', border: '1px solid #e8d88a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📄</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0a0a12', marginBottom: 4 }}>{file.name}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{(file.size / 1024 / 1024).toFixed(1)} MB · PDF</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff', border: '1px solid #e8d88a', borderRadius: 8, padding: '7px 13px', marginTop: 12, fontSize: 12 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#D4AF37', flexShrink: 0 }} />
              <span style={{ fontWeight: 600, color: '#b8960c' }}>Prêt pour l'analyse</span>
            </div>
          </>
        ) : (
          <>
            <div style={{ width: 56, height: 56, borderRadius: 14, margin: '0 auto 12px', background: '#fff', border: '1.5px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📎</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0a0a12', marginBottom: 4 }}>Déposez votre CV ici</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>PDF · max 10 MB</div>
          </>
        )}

        {/* Overlay d'analyse */}
        {running && (
          <div style={{ position: 'absolute', inset: 0, borderRadius: 14, background: 'rgba(253,251,240,.93)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#b8960c' }}>✦ Extraction en cours...</div>
            <div style={{ width: 190, height: 3, background: '#e5e5ec', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#D4AF37,#e8d080)', borderRadius: 2, transition: 'width .15s' }} />
            </div>
            <div style={{ fontSize: 10, color: '#6b7280' }}>Nom · Email · Téléphone · Compétences</div>
          </div>
        )}
      </div>

      {/* Lien changer fichier */}
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <span onClick={() => fileRef.current?.click()} style={{ fontSize: 11, color: '#6b7280', textDecoration: 'underline', cursor: 'pointer' }}>
          {hasFile ? 'Changer de fichier' : 'Parcourir…'}
        </span>
        <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileChange} />
      </div>

      {/* Erreur */}
      {error && (
        <div style={{ marginTop: 10, padding: '9px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 12, color: '#dc2626' }}>
          ⚠ {error}
        </div>
      )}

      <Button style={{ marginTop: '1.5rem' }} onClick={startAnalysis} disabled={running || !hasFile}>
        {running ? '⏳ Analyse en cours...' : "✦ Analyser avec l'IA →"}
      </Button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#6b7280', margin: '12px 0' }}>
        <div style={{ flex: 1, height: 1, background: '#e5e5ec' }} /> ou <div style={{ flex: 1, height: 1, background: '#e5e5ec' }} />
      </div>

      <Button variant="ghost" onClick={onSkip}>Remplir manuellement sans CV</Button>
    </div>
  );
}