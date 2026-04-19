import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const API = 'http://127.0.0.1:8000';

// ─── COULEURS ISSAT ───────────────────────────────────────────────────────────
const COLORS = {
  blueMain: '#6391B9',    // Bleu ISSAT
  blueDark: '#2B547E',    // Bleu foncé
  bgDark: '#1e1e2e',      // Fond sombre
  grayText: '#6b7280',
  white: '#ffffff'
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function authHeaders(token) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';
}

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:   { label: 'En attente', bg: '#fef9c3', color: '#854d0e', dot: '#ca8a04' },
  approved:  { label: 'Accepté',    bg: '#dcfce7', color: '#166534', dot: '#16a34a' },
  rejected:  { label: 'Refusé',     bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  completed: { label: 'Rédigée',    bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
  refused:   { label: 'Refusée',    bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
};

function StatusBadge({ status }) {
  const normalized = (status || '').toLowerCase().trim();
  const s = STATUS_CONFIG[normalized] || STATUS_CONFIG.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 11px', borderRadius: 20, fontSize: 12, fontWeight: 700,
      background: s.bg, color: s.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

function Avatar({ name, size = 40, bg = 'rgba(99, 145, 185, 0.08)', color = '#2B547E' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: bg, color, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontWeight: 800, fontSize: size * 0.35,
    }}>
      {getInitials(name)}
    </div>
  );
}

function CountBadge({ count }) {
  if (!count) return null;
  return (
    <span style={{
      minWidth: 20, height: 20, borderRadius: 10, background: '#ef4444',
      color: '#fff', fontSize: 11, fontWeight: 800,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 5px',
    }}>{count}</span>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3800); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      background: type === 'success' ? '#6391B9' : '#ef4444',
      color: '#fff', padding: '13px 20px', borderRadius: 14,
      fontWeight: 600, fontSize: 14, boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
      display: 'flex', alignItems: 'center', gap: 10, maxWidth: 360,
      animation: 'slideUp 0.3s ease-out',
    }}>
      <span style={{ fontSize: 18 }}>{type === 'success' ? '✅' : '❌'}</span>
      {message}
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────

function Modal({ title, subtitle, icon, onClose, children, danger }) {
  // Trap click outside
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(10,10,18,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 24, padding: '2rem',
        width: '100%', maxWidth: 520, maxHeight: '85vh', overflowY: 'auto',
        animation: 'popIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: danger ? '#fee2e2' : 'rgba(99, 145, 185, 0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>{icon}</div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0a0a12' }}>{title}</h3>
              {subtitle && <p style={{ margin: 0, fontSize: 13, color: '#6b7280', marginTop: 2 }}>{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: '#f3f4f6', border: 'none', borderRadius: 8,
            width: 30, height: 30, cursor: 'pointer', fontSize: 14, color: '#6b7280',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────────────────

function RequestCard({ children, highlight }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 18,
      border: highlight ? '1.5px solid #6391B9' : '1px solid #f1f5f9',
      padding: '1.25rem 1.5rem',
      transition: 'box-shadow 0.2s, border-color 0.2s',
    }}>
      {children}
    </div>
  );
}

function EmptyState({ icon, title, sub }) {
  return (
    <div style={{
      padding: '4rem 2rem', textAlign: 'center',
      background: '#fafafa', borderRadius: 20, border: '1.5px dashed #e5e7eb',
    }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontWeight: 700, color: '#4b5563', fontSize: 15, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#9ca3af' }}>{sub}</div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{
      background: '#fff', borderRadius: 18, border: '1px solid #f1f5f9',
      padding: '1.25rem 1.5rem', display: 'flex', gap: 14, alignItems: 'center',
    }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f3f4f6' }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 14, background: '#f3f4f6', borderRadius: 6, marginBottom: 8, width: '60%' }} />
        <div style={{ height: 11, background: '#f3f4f6', borderRadius: 6, width: '40%' }} />
      </div>
      <div style={{ width: 80, height: 24, background: '#f3f4f6', borderRadius: 12 }} />
    </div>
  );
}

const btnBase = {
  border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13,
  cursor: 'pointer', fontFamily: 'inherit', padding: '8px 16px',
  display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
};

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═══════════════════════════════════════════════════════════════════════════════

export default function TeacherDemandesPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [activeTab, setActiveTab] = useState('projects');
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  // Data
  const [projects, setProjects]           = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingRecs, setLoadingRecs]     = useState(true);

  // Modals
  const [modal, setModal] = useState(null); // { type, item }
  // type: 'acceptProject' | 'refuseProject' | 'writeRec' | 'refuseRec'

  // Modal form state
  const [feedback, setFeedback]       = useState('');
  const [letterContent, setLetterContent] = useState('');
  const [refuseReason, setRefuseReason]   = useState('');
  const [modalLoading, setModalLoading]   = useState(false);

  const openModal = (type, item) => {
    setFeedback('');
    setLetterContent('');
    setRefuseReason('');
    setModal({ type, item });
  };
  const closeModal = () => { setModal(null); setModalLoading(false); };

  // ── Fetch ──
  const fetchProjects = useCallback(() => {
    setLoadingProjects(true);
    fetch(`${API}/teachers/received-project-ideas`, {
      headers: authHeaders(token),
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]))
      .finally(() => setLoadingProjects(false));
  }, [token]);

  const fetchRecs = useCallback(() => {
    setLoadingRecs(true);
    fetch(`${API}/teachers/recommendation-requests`, {
      headers: authHeaders(token),
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => setRecommendations(Array.isArray(data) ? data : []))
      .catch(() => setRecommendations([]))
      .finally(() => setLoadingRecs(false));
  }, [token]);

  useEffect(() => { fetchProjects(); fetchRecs(); }, [fetchProjects, fetchRecs]);

  // ── Counters ──
  const pendingProjects = projects.filter(p => { const s=(p.status||'').toLowerCase(); return s!=='approved'&&s!=='rejected'; }).length;
  const pendingRecs     = recommendations.filter(r => { const s=(r.status||'').toLowerCase(); return s!=='completed'&&s!=='refused'&&s!=='rejected'; }).length;

  // ─── ACTION HANDLERS ────────────────────────────────────────────────────────

  // Accepter un projet (avec feedback optionnel)
  const handleAcceptProject = async () => {
    setModalLoading(true);
    try {
      const res = await fetch(`${API}/teachers/review-project-idea/${modal.item.id}`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: JSON.stringify({ action: 'accept', feedback: feedback || 'Projet validé.' }),
      });
      if (!res.ok) throw new Error((await res.json()).detail);
      showToast('Projet accepté avec succès.', 'success');
      closeModal();
      fetchProjects();
    } catch (e) {
      showToast(e.message || 'Erreur lors de l\'acceptation.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Refuser un projet (feedback obligatoire ≥ 5 chars)
  const handleRefuseProject = async () => {
    if (!feedback.trim() || feedback.trim().length < 5) {
      showToast('Le motif de refus doit faire au moins 5 caractères.', 'error');
      return;
    }
    setModalLoading(true);
    try {
      const res = await fetch(`${API}/teachers/review-project-idea/${modal.item.id}`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: JSON.stringify({ action: 'refuse', feedback: feedback.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).detail);
      showToast('Projet refusé.', 'success');
      closeModal();
      fetchProjects();
    } catch (e) {
      showToast(e.message || 'Erreur lors du refus.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Rédiger la lettre de recommandation (= accepter)
  const handleWriteRec = async () => {
    if (!letterContent.trim() || letterContent.trim().length < 20) {
      showToast('La lettre doit comporter au moins 20 caractères.', 'error');
      return;
    }
    setModalLoading(true);
    try {
      const res = await fetch(`${API}/teachers/write-recommendation/${modal.item.id}`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: JSON.stringify({ letter_content: letterContent.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).detail);
      showToast('Lettre envoyée à l\'étudiant.', 'success');
      closeModal();
      fetchRecs();
    } catch (e) {
      showToast(e.message || 'Erreur lors de l\'envoi.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Refuser une recommandation
  // NOTE: endpoint à ajouter côté backend → PATCH /teachers/refuse-recommendation/{id}
  const handleRefuseRec = async () => {
    if (!refuseReason.trim() || refuseReason.trim().length < 5) {
      showToast('Le motif de refus doit faire au moins 5 caractères.', 'error');
      return;
    }
    setModalLoading(true);
    try {
      // Endpoint attendu: PATCH /teachers/refuse-recommendation/{id}
      const res = await fetch(`${API}/teachers/refuse-recommendation/${modal.item.id}`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: JSON.stringify({ reason: refuseReason.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Endpoint non implémenté côté serveur.');
      showToast('Demande refusée.', 'success');
      closeModal();
      fetchRecs();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Télécharger PDF
  const handleDownloadPdf = (ideaId, filename) => {
    const url = `${API}/teachers/download-pdf/${ideaId}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.blob() : Promise.reject())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename || `projet_${ideaId}.pdf`;
        a.click();
      })
      .catch(() => showToast('Impossible de télécharger le fichier.', 'error'));
  };

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <MainLayout>
      <div style={{ padding: '2rem 3.5rem', maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <header style={{ marginBottom: '2.5rem' }}>
          <button onClick={() => navigate(-1)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6b7280', fontSize: 13, fontWeight: 600, padding: 0,
            marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6,
          }}>← Retour</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, #6391B9, #0891b2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>🎓</div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0a0a12', margin: 0 }}>
                Espace Enseignant
              </h1>
              <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
                Gérez les demandes de vos étudiants
              </p>
            </div>
          </div>
        </header>

        {/* Stats summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { icon: '📋', label: 'Projets en attente', count: pendingProjects, total: projects.length, color: '#6391B9' },
            { icon: '✉️', label: 'Recommandations en attente', count: pendingRecs, total: recommendations.length, color: '#3b82f6' },
          ].map(s => (
            <div key={s.label} style={{
              background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9',
              padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 46, height: 46, borderRadius: 12,
                background: `${s.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.count > 0 ? s.color : '#111827' }}>
                  {s.count}
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#9ca3af', marginLeft: 4 }}>
                    / {s.total}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: '2rem',
          background: '#f3f4f6', padding: 6, borderRadius: 14,
        }}>
          {[
            { id: 'projects', label: 'Projets d\'encadrement', icon: '📋', count: pendingProjects },
            { id: 'recommendations', label: 'Lettres de recommandation', icon: '✉️', count: pendingRecs },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none',
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
              transition: 'all 0.2s',
              background: activeTab === tab.id ? '#fff' : 'transparent',
              color: activeTab === tab.id ? '#6391B9' : '#6b7280',
              boxShadow: activeTab === tab.id ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {tab.icon} {tab.label}
              {tab.count > 0 && <CountBadge count={tab.count} />}
            </button>
          ))}
        </div>

        {/* ── PROJECTS TAB ── */}
        {activeTab === 'projects' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s ease-out' }}>
            {loadingProjects
              ? [1, 2, 3].map(i => <SkeletonCard key={i} />)
              : projects.length === 0
                ? <EmptyState icon="📂" title="Aucun projet reçu" sub="Les étudiants pourront vous soumettre leurs idées de projets." />
                : projects.map(idea => (
                  <ProjectCard
                    key={idea.id}
                    idea={idea}
                    onAccept={() => openModal('acceptProject', idea)}
                    onRefuse={() => openModal('refuseProject', idea)}
                    onDownload={() => handleDownloadPdf(idea.id, idea.pdf_filename)}
                  />
                ))
            }
          </div>
        )}

        {/* ── RECOMMENDATIONS TAB ── */}
        {activeTab === 'recommendations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s ease-out' }}>
            {loadingRecs
              ? [1, 2, 3].map(i => <SkeletonCard key={i} />)
              : recommendations.length === 0
                ? <EmptyState icon="📬" title="Aucune demande reçue" sub="Les étudiants pourront vous envoyer leurs demandes ici." />
                : recommendations.map(rec => (
                  <RecommendationCard
                    key={rec.id}
                    rec={rec}
                    onWrite={() => openModal('writeRec', rec)}
                    onRefuse={() => openModal('refuseRec', rec)}
                  />
                ))
            }
          </div>
        )}
      </div>

      {/* ═══ MODALS ═══ */}

      {/* Accepter un projet */}
      {modal?.type === 'acceptProject' && (
        <Modal
          title="Accepter le projet"
          subtitle={modal.item.title}
          icon="✅"
          onClose={closeModal}
        >
          <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: 12 }}>
            <div style={{ fontSize: 13, color: '#166534', lineHeight: 1.6 }}>
              <strong>Étudiant :</strong>{' '}
              {modal.item.student_info?.full_name || '—'}
              <br />
              <strong>Email :</strong>{' '}
              {modal.item.student_info?.email || '—'}
            </div>
          </div>
          <label style={labelStyle}>Commentaire pour l'étudiant <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optionnel)</span></label>
          <textarea
            placeholder="Félicitations ! Votre projet est validé. Nous allons démarrer les réunions de suivi..."
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            rows={4}
            style={{ ...textareaStyle, marginBottom: '1.25rem' }}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={closeModal} style={{ ...btnBase, flex: 1, background: '#f3f4f6', color: '#4b5563' }}>
              Annuler
            </button>
            <button onClick={handleAcceptProject} disabled={modalLoading} style={{
              ...btnBase, flex: 2,
              background: modalLoading ? '#d1d5db' : '#6391B9',
              color: '#fff',
            }}>
              {modalLoading ? <><SpinnerIcon />Traitement...</> : <>✅ Confirmer l'acceptation</>}
            </button>
          </div>
        </Modal>
      )}

      {/* Refuser un projet */}
      {modal?.type === 'refuseProject' && (
        <Modal
          title="Refuser le projet"
          subtitle={modal.item.title}
          icon="❌"
          onClose={closeModal}
          danger
        >
          <div style={{ marginBottom: '1rem', padding: '1rem', background: '#fff7f7', borderRadius: 12, border: '1px solid #fecaca' }}>
            <div style={{ fontSize: 13, color: '#991b1b', lineHeight: 1.6 }}>
              L'étudiant recevra votre motif de refus. Il pourra réviser et soumettre une nouvelle idée.
            </div>
          </div>
          <label style={labelStyle}>Motif du refus <RequiredStar /></label>
          <textarea
            placeholder="Ex : Le sujet est trop vaste pour un projet de fin d'études. Je vous suggère de restreindre le périmètre à..."
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            rows={5}
            style={{ ...textareaStyle, marginBottom: '1.25rem', borderColor: '#fecaca' }}
          />
          <CharCount current={feedback.trim().length} min={5} />
          <div style={{ display: 'flex', gap: 10, marginTop: '1rem' }}>
            <button onClick={closeModal} style={{ ...btnBase, flex: 1, background: '#f3f4f6', color: '#4b5563' }}>
              Annuler
            </button>
            <button
              onClick={handleRefuseProject}
              disabled={modalLoading || feedback.trim().length < 5}
              style={{
                ...btnBase, flex: 2,
                background: (modalLoading || feedback.trim().length < 5) ? '#fca5a5' : '#ef4444',
                color: '#fff',
              }}
            >
              {modalLoading ? <><SpinnerIcon />Traitement...</> : <>❌ Confirmer le refus</>}
            </button>
          </div>
        </Modal>
      )}

      {/* Rédiger lettre de recommandation */}
      {modal?.type === 'writeRec' && (
        <Modal
          title="Rédiger la lettre"
          subtitle={`Pour ${modal.item.student_name}`}
          icon="✍️"
          onClose={closeModal}
        >
          <div style={{
            padding: '10px 14px', background: '#eff6ff', borderRadius: 10,
            marginBottom: '1.25rem', fontSize: 13, color: '#1e40af',
          }}>
            <strong>Objet :</strong> {modal.item.purpose}
          </div>
          <label style={labelStyle}>Contenu de la lettre <RequiredStar /></label>
          <textarea
            placeholder={`Madame, Monsieur,\n\nJ'ai le plaisir de recommander ${modal.item.student_name}, étudiant(e) que j'ai eu l'opportunité d'encadrer au sein de notre établissement...\n\nCordialement,`}
            value={letterContent}
            onChange={e => setLetterContent(e.target.value)}
            rows={10}
            style={{ ...textareaStyle, marginBottom: '0.5rem', fontFamily: 'Georgia, serif', fontSize: 13 }}
          />
          <CharCount current={letterContent.trim().length} min={20} label="Minimum 20 caractères" />
          <div style={{ display: 'flex', gap: 10, marginTop: '1.25rem' }}>
            <button onClick={closeModal} style={{ ...btnBase, flex: 1, background: '#f3f4f6', color: '#4b5563' }}>
              Annuler
            </button>
            <button
              onClick={handleWriteRec}
              disabled={modalLoading || letterContent.trim().length < 20}
              style={{
                ...btnBase, flex: 2,
                background: (modalLoading || letterContent.trim().length < 20) ? '#d1d5db' : '#6391B9',
                color: '#fff',
              }}
            >
              {modalLoading ? <><SpinnerIcon />Envoi...</> : <>📨 Envoyer à l'étudiant</>}
            </button>
          </div>
        </Modal>
      )}

      {/* Refuser une recommandation */}
      {modal?.type === 'refuseRec' && (
        <Modal
          title="Refuser la demande"
          subtitle={`Demande de ${modal.item.student_name}`}
          icon="🚫"
          onClose={closeModal}
          danger
        >
          {/* NOTE DEV: nécessite l'endpoint PATCH /teachers/refuse-recommendation/{id} */}
          <div style={{ padding: '10px 14px', background: '#fff7ed', borderRadius: 10, marginBottom: '1.25rem', fontSize: 13, color: '#92400e', border: '1px solid #fed7aa' }}>
            ⚠️ L'étudiant sera informé que sa demande a été refusée et pourra en soumettre une nouvelle.
          </div>
          <label style={labelStyle}>Motif du refus <RequiredStar /></label>
          <textarea
            placeholder="Ex : Je ne vous connais pas suffisamment pour écrire une lettre de recommandation pertinente. Je vous encourage à..."
            value={refuseReason}
            onChange={e => setRefuseReason(e.target.value)}
            rows={5}
            style={{ ...textareaStyle, marginBottom: '0.5rem', borderColor: '#fecaca' }}
          />
          <CharCount current={refuseReason.trim().length} min={5} />
          <div style={{ display: 'flex', gap: 10, marginTop: '1.25rem' }}>
            <button onClick={closeModal} style={{ ...btnBase, flex: 1, background: '#f3f4f6', color: '#4b5563' }}>
              Annuler
            </button>
            <button
              onClick={handleRefuseRec}
              disabled={modalLoading || refuseReason.trim().length < 5}
              style={{
                ...btnBase, flex: 2,
                background: (modalLoading || refuseReason.trim().length < 5) ? '#fca5a5' : '#ef4444',
                color: '#fff',
              }}
            >
              {modalLoading ? <><SpinnerIcon />Traitement...</> : <>🚫 Confirmer le refus</>}
            </button>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <style>{`
        @keyframes fadeIn  { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px)} to { opacity:1; transform:translateY(0) } }
        @keyframes popIn   { from { opacity:0; transform:scale(0.92) }      to { opacity:1; transform:scale(1) } }
        @keyframes spin    { to   { transform:rotate(360deg) } }
        textarea:focus, input:focus {
          outline: none;
          border-color: #6391B9 !important;
          box-shadow: 0 0 0 3px rgba(13,148,136,0.12);
          background: #fff !important;
        }
      `}</style>
    </MainLayout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SOUS-COMPOSANTS CARDS
// ═══════════════════════════════════════════════════════════════════════════════

function ProjectCard({ idea, onAccept, onRefuse, onDownload }) {
  const resolvedStatus = (idea.status||'').toLowerCase().trim();
  const isResolved = resolvedStatus==='approved'||resolvedStatus==='rejected';
  const isPending = !isResolved;
  return (
    <RequestCard highlight={isPending}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <Avatar name={idea.student_info?.full_name || '?'} bg="rgba(99, 145, 185, 0.08)" color="#2B547E" />
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#111827' }}>
              {idea.title}
            </h3>
            <StatusBadge status={idea.status} />
          </div>

          {/* Meta */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 10 }}>
            <MetaChip icon="👤" text={idea.student_info?.full_name} />
            <MetaChip icon="📅" text={formatDate(idea.created_at)} />
            {idea.difficulty_level && <MetaChip icon="⚡" text={idea.difficulty_level} />}
            {idea.technologies && <MetaChip icon="🛠️" text={idea.technologies} />}
          </div>

          {/* Description */}
          {idea.description && (
            <p style={{
              margin: '0 0 10px', fontSize: 13, color: '#6b7280',
              lineHeight: 1.6, display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {idea.description}
            </p>
          )}

          {/* Feedback (si déjà traité) */}
          {idea.feedback && !isPending && (
            <div style={{
              background: idea.status === 'approved' ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${idea.status === 'approved' ? '#bbf7d0' : '#fecaca'}`,
              borderRadius: 10, padding: '8px 12px', fontSize: 12,
              color: idea.status === 'approved' ? '#166534' : '#991b1b',
              marginBottom: 10,
            }}>
              💬 {idea.feedback}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {idea.pdf_filename && (
              <button onClick={onDownload} style={{
                ...btnBase, background: '#f0f9ff', color: '#0369a1', fontSize: 12, padding: '6px 12px',
              }}>
                📄 Télécharger le PDF
              </button>
            )}
            {isPending && (
              <>
                <button onClick={onRefuse} style={{
                  ...btnBase, background: '#fff1f2', color: '#be123c', padding: '7px 16px',
                }}>
                  ✕ Refuser
                </button>
                <button onClick={onAccept} style={{
                  ...btnBase, background: '#6391B9', color: '#fff', padding: '7px 16px',
                }}>
                  ✓ Accepter
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </RequestCard>
  );
}

function RecommendationCard({ rec, onWrite, onRefuse }) {
  const resolvedStatus = (rec.status||'').toLowerCase().trim();
  const isPending = resolvedStatus!=='completed'&&resolvedStatus!=='refused'&&resolvedStatus!=='rejected';
  return (
    <RequestCard highlight={isPending}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <Avatar name={rec.student_name} bg="#eff6ff" color="#1e40af" />
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#111827' }}>
              {rec.student_name}
            </h3>
            <StatusBadge status={rec.status} />
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 10 }}>
            <MetaChip icon="🎯" text={rec.purpose} />
            <MetaChip icon="📅" text={formatDate(rec.created_at)} />
          </div>

          {/* Actions */}
          {isPending && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onRefuse} style={{
                ...btnBase, background: '#fff1f2', color: '#be123c', padding: '7px 16px',
              }}>
                ✕ Refuser
              </button>
              <button onClick={onWrite} style={{
                ...btnBase, background: '#6391B9', color: '#fff', padding: '7px 16px',
              }}>
                ✍️ Rédiger la lettre
              </button>
            </div>
          )}
          {rec.status === 'completed' && (
            <div style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600 }}>
              ✅ Lettre rédigée et envoyée à l'étudiant.
            </div>
          )}
          {rec.status === 'refused' && (
            <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>
              🚫 Demande refusée.
            </div>
          )}
        </div>
      </div>
    </RequestCard>
  );
}

// ─── MICRO COMPONENTS ─────────────────────────────────────────────────────────

function MetaChip({ icon, text }) {
  if (!text) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7280' }}>
      <span style={{ fontSize: 12 }}>{icon}</span> {text}
    </span>
  );
}

function RequiredStar() {
  return <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>;
}

function CharCount({ current, min, label }) {
  const ok = current >= min;
  return (
    <div style={{ fontSize: 12, color: ok ? '#16a34a' : '#9ca3af', marginTop: 4 }}>
      {label || `Minimum ${min} caractères`} — {current} saisi{current > 1 ? 's' : ''}
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: 'spin 0.8s linear infinite', marginRight: 4 }}>
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

// ─── STYLE CONSTANTS ──────────────────────────────────────────────────────────
const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 700,
  color: '#374151', marginBottom: 6, letterSpacing: 0.2,
};

const textareaStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: '1.5px solid #e5e7eb', fontSize: 13, color: '#111827',
  background: '#f9fafb', fontFamily: 'inherit', lineHeight: 1.65,
  resize: 'vertical', boxSizing: 'border-box', transition: 'all 0.2s',
};