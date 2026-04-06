import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/companies/SideBar';

// ─── Status badge helper ──────────────────────────────────────────────────────

const STATUS_MAP = {
  pending:  { label: 'En attente',  bg: '#fffbeb', color: '#ca8a04', border: '#fde68a' },
  accepted: { label: 'Accepté',     bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  rejected: { label: 'Refusé',      bg: '#fef2f2', color: '#ef4444', border: '#fecaca' },
};

// ─── Mock data (fallback) ─────────────────────────────────────────────────────

const MOCK_APPLICATIONS = [
  { id: 1, student_name: 'Sara Mansouri',  email: 'sara@example.com',  major: 'Génie Logiciel',    university: 'ESPRIT',  status: 'pending',  applied_at: '2026-04-01', gpa: 3.9, avatar: 'SM' },
  { id: 2, student_name: 'Karim Belhaj',   email: 'karim@example.com', major: 'Informatique',      university: 'FST',     status: 'accepted', applied_at: '2026-04-02', gpa: 3.7, avatar: 'KB' },
  { id: 3, student_name: 'Lina Trabelsi',  email: 'lina@example.com',  major: 'Data Science',      university: 'INSAT',   status: 'pending',  applied_at: '2026-04-03', gpa: 4.0, avatar: 'LT' },
  { id: 4, student_name: 'Amine Oueslati', email: 'amine@example.com', major: 'Réseaux & Systèmes', university: 'Sup\'Com', status: 'rejected', applied_at: '2026-04-04', gpa: 3.2, avatar: 'AO' },
];

// ─── Application Card ─────────────────────────────────────────────────────────

function ApplicationCard({ app, onStatusChange }) {
  const [hovered, setHovered] = useState(false);
  const statusInfo = STATUS_MAP[app.status] || STATUS_MAP.pending;
  const avatarColors = ['#0d9488', '#6366f1', '#f97316', '#ec4899', '#14b8a6', '#8b5cf6'];
  const avatarColor = avatarColors[app.id % avatarColors.length];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 16,
        border: hovered ? '2px solid #0d9488' : '1.5px solid #e5e5ec',
        padding: hovered ? '19.5px 23.5px' : '20px 24px',
        display: 'flex', alignItems: 'center', gap: 16,
        flexWrap: 'wrap',
        boxShadow: hovered ? '0 8px 28px rgba(13,148,136,.12)' : '0 2px 8px rgba(0,0,0,.03)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'all 0.22s ease',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}99)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 800, fontSize: 17, flexShrink: 0,
      }}>
        {app.avatar || app.student_name?.slice(0, 2).toUpperCase()}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 180 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#0a0a12', marginBottom: 2 }}>
          {app.student_name}
        </div>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>
          {app.major} · {app.university}
        </div>
        <div style={{ fontSize: 12, color: '#9ca3af' }}>
          📧 {app.email}
        </div>
      </div>

      {/* GPA */}
      {app.gpa && (
        <div style={{
          textAlign: 'center', minWidth: 60,
          background: app.gpa >= 3.7 ? '#f0fdf4' : '#f9fafb',
          border: `1.5px solid ${app.gpa >= 3.7 ? '#bbf7d0' : '#e5e5ec'}`,
          borderRadius: 12, padding: '8px 12px',
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: app.gpa >= 3.7 ? '#16a34a' : '#374151', lineHeight: 1 }}>
            {app.gpa?.toFixed(1)}
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginTop: 2 }}>GPA</div>
        </div>
      )}

      {/* Applied date */}
      <div style={{ fontSize: 12, color: '#9ca3af', minWidth: 80, textAlign: 'center' }}>
        📅 {app.applied_at}
      </div>

      {/* Status badge */}
      <span style={{
        padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
        background: statusInfo.bg, color: statusInfo.color, border: `1.5px solid ${statusInfo.border}`,
      }}>
        {statusInfo.label}
      </span>

      {/* Action buttons */}
      {app.status === 'pending' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onStatusChange(app.id, 'accepted')}
            style={{
              padding: '8px 16px', borderRadius: 10, border: 'none',
              background: '#f0fdf4', color: '#16a34a', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#16a34a'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.color = '#16a34a'; }}
          >
            ✓ Accepter
          </button>
          <button
            onClick={() => onStatusChange(app.id, 'rejected')}
            style={{
              padding: '8px 16px', borderRadius: 10, border: 'none',
              background: '#fef2f2', color: '#ef4444', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
          >
            ✕ Refuser
          </button>
        </div>
      )}

      {app.status !== 'pending' && (
        <button
          onClick={() => onStatusChange(app.id, 'pending')}
          style={{
            padding: '7px 14px', borderRadius: 10, border: '1.5px solid #e5e5ec',
            background: '#f9fafb', color: '#9ca3af', fontSize: 12, fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Réinitialiser
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CompanyApplicationsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const companyId = localStorage.getItem('companyId');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // Fetch opportunity details
        const oppRes = await fetch(`http://127.0.0.1:8000/company/opportunities/${id}?company_id=${companyId}`);
        if (oppRes.ok) setOpportunity(await oppRes.json());

        // Fetch applications
        const appRes = await fetch(`http://127.0.0.1:8000/company/opportunities/${id}/applications?company_id=${companyId}`);
        if (appRes.ok) {
          const data = await appRes.json();
          setApplications(Array.isArray(data) ? data : []);
        } else {
          setApplications(MOCK_APPLICATIONS);
        }
      } catch {
        setApplications(MOCK_APPLICATIONS);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, companyId]);

  const handleStatusChange = async (appId, status) => {
    // Optimistic update
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    try {
      await fetch(`http://127.0.0.1:8000/company/applications/${appId}?company_id=${companyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch {
      // Keep optimistic update for demo
    }
  };

  const filtered = applications.filter(a => {
    const matchFilter = filter === 'all' || a.status === filter;
    const matchSearch = !search || a.student_name?.toLowerCase().includes(search.toLowerCase()) || a.email?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <>
      <style>{`
        @keyframes opp-fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
        .ca-search:focus { outline: none; border-color: #0d9488 !important; box-shadow: 0 0 0 3px rgba(13,148,136,.1) !important; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f8fa' }}>
        <Sidebar role="company" activeTab="opportunities" setActiveTab={() => navigate('/company-dashboard')} />

        <main style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ maxWidth: 980, margin: '0 auto', padding: '32px 32px 72px' }}>

            {/* ── Back link ─────────────────────────── */}
            <button
              onClick={() => navigate('/company-dashboard')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 13, fontWeight: 600, color: '#6b7280',
                marginBottom: 24, padding: 0,
                animation: 'opp-fadeUp 0.35s ease both',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#0d9488'}
              onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
            >
              ← Retour au tableau de bord
            </button>

            {/* ── Hero ──────────────────────────────── */}
            <div style={{
              borderRadius: 20,
              background: 'linear-gradient(135deg, #0f2027 0%, #0d4f47 50%, #1a6b5e 100%)',
              padding: '36px 44px', marginBottom: 28,
              position: 'relative', overflow: 'hidden',
              animation: 'opp-fadeUp 0.4s ease both',
            }}>
              <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,184,166,.22), transparent 65%)', pointerEvents: 'none' }} />
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 14,
                background: 'rgba(20,184,166,.15)', border: '1px solid rgba(20,184,166,.35)',
                color: '#5eead4', fontSize: 11, fontWeight: 700,
                padding: '5px 14px', borderRadius: 20, letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#5eead4', boxShadow: '0 0 6px #5eead4' }} />
                Gestion des candidatures
              </div>
              <h1 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                {opportunity?.title || `Offre #${id}`}
              </h1>
              <p style={{ margin: 0, fontSize: 15, color: 'rgba(255,255,255,.6)' }}>
                {counts.all} candidature{counts.all !== 1 ? 's' : ''} reçue{counts.all !== 1 ? 's' : ''}
              </p>
            </div>

            {/* ── Stats pills ───────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24, animation: 'opp-fadeUp 0.4s 0.1s ease both' }}>
              {[
                { key: 'all',      label: 'Total',      color: '#0d9488', bg: '#f0fdfa', border: '#ccfbf1' },
                { key: 'pending',  label: 'En attente', color: '#ca8a04', bg: '#fffbeb', border: '#fde68a' },
                { key: 'accepted', label: 'Acceptés',   color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
                { key: 'rejected', label: 'Refusés',    color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
              ].map(s => (
                <button
                  key={s.key}
                  onClick={() => setFilter(s.key)}
                  style={{
                    background: filter === s.key ? s.bg : '#fff',
                    borderRadius: 14, border: `1.5px solid ${filter === s.key ? s.border : '#e5e5ec'}`,
                    padding: '16px 20px', textAlign: 'left', cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: filter === s.key ? `0 4px 14px ${s.color}20` : '0 2px 8px rgba(0,0,0,.03)',
                  }}
                >
                  <div style={{ fontSize: 24, fontWeight: 800, color: filter === s.key ? s.color : '#0a0a12', lineHeight: 1 }}>
                    {loading ? '—' : counts[s.key]}
                  </div>
                  <div style={{ fontSize: 12, color: filter === s.key ? s.color : '#9ca3af', fontWeight: 600, marginTop: 4 }}>
                    {s.label}
                  </div>
                </button>
              ))}
            </div>

            {/* ── Search ────────────────────────── */}
            <div style={{
              background: '#fff', borderRadius: 14, border: '1.5px solid #e5e5ec',
              padding: '14px 18px', marginBottom: 20,
              animation: 'opp-fadeUp 0.4s 0.15s ease both',
              position: 'relative',
            }}>
              <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: '#9ca3af', pointerEvents: 'none' }}>🔍</span>
              <input
                className="ca-search"
                type="text"
                placeholder="Rechercher un étudiant par nom ou email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', border: 'none', outline: 'none',
                  fontSize: 14, color: '#0a0a12', paddingLeft: 32,
                  fontFamily: 'inherit', background: 'transparent',
                }}
              />
            </div>

            {/* ── Applications list ────────────── */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af', fontSize: 15 }}>Chargement...</div>
            ) : filtered.length === 0 ? (
              <div style={{
                background: '#fff', borderRadius: 20, border: '1.5px dashed #e5e5ec',
                padding: '60px 40px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 40, marginBottom: 14 }}>📭</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 8px', color: '#0a0a12' }}>
                  Aucune candidature {filter !== 'all' ? `(${STATUS_MAP[filter]?.label || filter})` : ''}
                </h3>
                <p style={{ color: '#9ca3af', margin: 0, fontSize: 13 }}>
                  {search ? "Essayez d'effacer votre recherche." : "Les candidatures apparaîtront ici dès que des étudiants postuleront."}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'opp-fadeUp 0.4s 0.2s ease both' }}>
                {filtered.map((app, i) => (
                  <ApplicationCard key={app.id} app={app} onStatusChange={handleStatusChange} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
