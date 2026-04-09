import React, { useState, useRef } from 'react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

const API = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/auth';

export default function StepCompanyExtraction({ onAnalyze, onSkip }) {
  const [method, setMethod] = useState('file'); // 'file' or 'url'
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [error, setError] = useState(null);
  const fileRef = useRef();

  function handleFileChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setError(null);
  }

  async function startAnalysis() {
    setRunning(true);
    setProgress(0);
    setError(null);

    const iv = setInterval(() => {
      setProgress(p => p >= 85 ? 85 : p + 2);
    }, 100);

    try {
      let res;
      if (method === 'file') {
        if (!file) throw new Error('Veuillez sélectionner un fichier.');
        const fd = new FormData();
        fd.append('file', file);
        res = await fetch(`${API}/register/company/parse-file`, { method: 'POST', body: fd });
      } else {
        if (!url) throw new Error('Veuillez entrer une URL.');
        const fd = new FormData();
        fd.append('url', url);
        res = await fetch(`${API}/register/company/parse-url`, { method: 'POST', body: fd });
      }

      clearInterval(iv);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Erreur serveur (${res.status})`);
      }

      const data = await res.json();
      setProgress(100);

      setTimeout(() => {
        setRunning(false);
        onAnalyze(data);
      }, 400);

    } catch (e) {
      clearInterval(iv);
      setRunning(false);
      setProgress(0);
      setError(e.message);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: '1.5rem' }}>
        <button
          onClick={() => setMethod('file')}
          style={{
            flex: 1, padding: '10px', borderRadius: 12, border: method === 'file' ? '2px solid #0d9488' : '1px solid #e5e5ec',
            background: method === 'file' ? '#f0fdfa' : '#fff', fontWeight: 600, color: method === 'file' ? '#0d9488' : '#6b7280', cursor: 'pointer'
          }}
        >📄 Document PDF</button>
        <button
          onClick={() => setMethod('url')}
          style={{
            flex: 1, padding: '10px', borderRadius: 12, border: method === 'url' ? '2px solid #0d9488' : '1px solid #e5e5ec',
            background: method === 'url' ? '#f0fdfa' : '#fff', fontWeight: 600, color: method === 'url' ? '#0d9488' : '#6b7280', cursor: 'pointer'
          }}
        >🌐 Site Web</button>
      </div>

      {method === 'file' ? (
        <div
          onClick={() => !file && fileRef.current?.click()}
          style={{
            border: `1.5px ${file ? 'solid #0d9488' : 'dashed #d1d5db'}`,
            borderRadius: 16, padding: '2rem', textAlign: 'center',
            background: file ? '#f0fdfa' : '#fafaf8',
            position: 'relative', overflow: 'hidden', cursor: file ? 'default' : 'pointer'
          }}
        >
          {file ? (
            <>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0a0a12' }}>{file.name}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Prêt pour l'analyse</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📎</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Déposez le document de l'entreprise</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>PDF ou CSV</div>
            </>
          )}
          {running && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(240,253,250,.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#0d9488' }}>Extraction IA...</div>
              <div style={{ width: 150, height: 4, background: '#e5e5ec', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: '#0d9488', transition: 'width .2s' }} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ marginBottom: '1.5rem' }}>
          <Input 
            placeholder="https://entreprise.com" 
            value={url} 
            onChange={e => setUrl(e.target.value)}
            style={{ borderRadius: 12, padding: '12px 16px' }}
          />
          <p style={{ fontSize: 11, color: '#6b7280', marginTop: 8 }}>
            L'IA va parcourir le site pour extraire les informations pertinentes.
          </p>
        </div>
      )}

      <input ref={fileRef} type="file" accept=".pdf,.csv" style={{ display: 'none' }} onChange={handleFileChange} />

      {error && (
        <div style={{ marginTop: 15, padding: '10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 12, color: '#dc2626' }}>
          ⚠ {error}
        </div>
      )}

      <Button 
        style={{ marginTop: '1.5rem' }} 
        onClick={startAnalysis} 
        disabled={running || (method === 'file' ? !file : !url)}
      >
        {running ? 'Analyse en cours...' : "✦ Lancer l'IA →"}
      </Button>

      <div style={{ textAlign: 'center', marginTop: 15 }}>
        <button 
          onClick={onSkip} 
          style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 13, textDecoration: 'underline', cursor: 'pointer' }}
        >
          Saisir manuellement
        </button>
      </div>
    </div>
  );
}
