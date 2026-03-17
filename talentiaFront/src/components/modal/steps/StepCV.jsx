import React, { useState, useRef } from 'react';
import Button from '../../ui/Button';

export default function StepCV({ onAnalyze, onSkip }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [fileName,  setFileName]  = useState('ahmed_benali_cv_2024.pdf');
  const fileRef = useRef();

  function startAnalysis() {
    setAnalyzing(true);
    setProgress(0);
    const iv = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(iv); return 100; }
        return p + 2;
      });
    }, 48);
    setTimeout(() => {
      setAnalyzing(false);
      onAnalyze();
    }, 2500);
  }

  function handleFileChange(e) {
    const f = e.target.files[0];
    if (f) setFileName(f.name);
  }

  return (
    <div>
      {/* CV Zone — already dropped, not clickable */}
      <div style={{
        border: '1.5px solid #e8d88a', borderRadius: 16,
        padding: '1.8rem 1.5rem', textAlign: 'center',
        background: '#fdfbf0', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, margin: '0 auto 12px', background: '#fff', border: '1px solid #e8d88a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📄</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0a0a12', marginBottom: 4 }}>{fileName}</div>
        <div style={{ fontSize: 12, color: '#6b7280' }}>2.3 MB · PDF</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff', border: '1px solid #e8d88a', borderRadius: 8, padding: '7px 13px', marginTop: 12, fontSize: 12 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#D4AF37', animation: 'pulse 2s infinite', flexShrink: 0 }} />
          <span style={{ fontWeight: 600, color: '#b8960c' }}>{fileName}</span>
          <span style={{ color: '#6b7280' }}> · déposé</span>
        </div>

        {/* Analyzing overlay */}
        {analyzing && (
          <div style={{ position: 'absolute', inset: 0, borderRadius: 14, background: 'rgba(253,251,240,.93)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#b8960c' }}>✦ Extraction en cours...</div>
            <div style={{ width: 190, height: 3, background: '#e5e5ec', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#D4AF37,#e8d080)', borderRadius: 2, transition: 'width .1s' }} />
            </div>
            <div style={{ fontSize: 10, color: '#6b7280' }}>Nom · Email · Téléphone · Date de naissance</div>
          </div>
        )}
      </div>

      {/* Change file link */}
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <span
          onClick={() => fileRef.current?.click()}
          style={{ fontSize: 11, color: '#6b7280', textDecoration: 'underline', cursor: 'pointer' }}
        >
          Changer de fichier
        </span>
        <input ref={fileRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }} onChange={handleFileChange} />
      </div>

      <Button style={{ marginTop: '1.5rem' }} onClick={startAnalysis} disabled={analyzing}>
        {analyzing ? '⏳ Analyse en cours...' : '✦ Analyser avec l\'IA →'}
      </Button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#6b7280', margin: '12px 0' }}>
        <div style={{ flex: 1, height: 1, background: '#e5e5ec' }} />
        ou
        <div style={{ flex: 1, height: 1, background: '#e5e5ec' }} />
      </div>

      <Button variant="ghost" onClick={onSkip}>Remplir manuellement sans CV</Button>
    </div>
  );
}
