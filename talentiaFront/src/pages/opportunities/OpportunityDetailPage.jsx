import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getSectorColor = (sector) => {
  if (!sector) return { bg: '#f3f4f6', text: '#4b5563', border: '#e5e7eb', dot: '#9ca3af' };
  const s = sector.toLowerCase();
  if (s.includes('ia') || s.includes('intelligence') || s.includes('ai') || s.includes('ml'))
    return { bg: '#f0f0ff', text: '#6366f1', border: '#c7d2fe', dot: '#6366f1' };
  if (s.includes('web') || s.includes('frontend') || s.includes('backend'))
    return { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe', dot: '#2563eb' };
  if (s.includes('mobile') || s.includes('android') || s.includes('ios'))
    return { bg: '#fff7ed', text: '#f97316', border: '#fed7aa', dot: '#f97316' };
  if (s.includes('iot') || s.includes('embedded') || s.includes('hardware'))
    return { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0', dot: '#16a34a' };
  if (s.includes('data') || s.includes('cloud') || s.includes('devops'))
    return { bg: '#fdf4ff', text: '#9333ea', border: '#e9d5ff', dot: '#9333ea' };
  return { bg: '#f0fdfa', text: '#0d9488', border: '#ccfbf1', dot: '#0d9488' };
};

// ─── Star Rating ──────────────────────────────────────────────────────────────

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          style={{
            fontSize: readonly ? 16 : 28,
            cursor: readonly ? 'default' : 'pointer',
            color: (hovered || value) >= star ? '#f59e0b' : '#d1d5db',
            transition: 'color 0.15s, transform 0.15s',
            transform: !readonly && (hovered || value) >= star ? 'scale(1.2)' : 'scale(1)',
            display: 'inline-block',
            lineHeight: 1,
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

// ─── Comment Card ─────────────────────────────────────────────────────────────

function CommentCard({ comment }) {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [reported, setReported] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState([]);
  const [actionHover, setActionHover] = useState(null);

  const handleLike = () => { setLiked(l => !l); if (disliked) setDisliked(false); };
  const handleDislike = () => { setDisliked(d => !d); if (liked) setLiked(false); };
  const handleReport = () => setReported(r => !r);

  const publishReply = () => {
    if (!replyText.trim()) return;
    setReplies(prev => [...prev, { id: Date.now(), text: replyText, author: 'Vous', date: new Date().toLocaleDateString('fr-FR') }]);
    setReplyText('');
    setShowReply(false);
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      border: '1.5px solid #e5e5ec',
      padding: '20px 24px',
      transition: 'box-shadow 0.2s',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%',
            background: 'linear-gradient(135deg, #0d9488, #0f2027)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0,
          }}>
            {comment.author?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#0a0a12' }}>{comment.author || 'Anonyme'}</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>{comment.date || 'Récemment'}</div>
          </div>
        </div>
        <StarRating value={comment.rating || 0} readonly />
      </div>

      {/* Body */}
      <p style={{ margin: '0 0 14px', fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{comment.text}</p>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { id: 'like', label: liked ? '👍 Aimé' : '👍 J\'aime', active: liked, onClick: handleLike, activeColor: '#0d9488' },
          { id: 'dislike', label: disliked ? '👎 Pas aimé' : '👎 Je n\'aime pas', active: disliked, onClick: handleDislike, activeColor: '#f97316' },
          { id: 'reply', label: '💬 Répondre', active: showReply, onClick: () => setShowReply(s => !s), activeColor: '#6366f1' },
          { id: 'report', label: reported ? '🚩 Signalé' : '🚩 Signaler', active: reported, onClick: handleReport, activeColor: '#ef4444' },
        ].map(action => (
          <button
            key={action.id}
            onClick={action.onClick}
            onMouseEnter={() => setActionHover(action.id)}
            onMouseLeave={() => setActionHover(null)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              border: `1.5px solid ${action.active ? action.activeColor : '#e5e5ec'}`,
              background: action.active ? `${action.activeColor}15` : actionHover === action.id ? '#f9fafb' : '#fff',
              color: action.active ? action.activeColor : actionHover === action.id ? '#374151' : '#6b7280',
              cursor: 'pointer', transition: 'all 0.18s',
            }}
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Reply box */}
      {showReply && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f3f4f6' }}>
          <textarea
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="Votre réponse..."
            style={{
              width: '100%', minHeight: 80, borderRadius: 12, border: '1.5px solid #e5e5ec',
              padding: '12px 14px', fontSize: 13, resize: 'vertical', outline: 'none',
              fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: 1.6,
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#0d9488'}
            onBlur={e => e.target.style.borderColor = '#e5e5ec'}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={publishReply} style={{
              padding: '8px 18px', borderRadius: 10, border: 'none',
              background: '#0d9488', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              Publier
            </button>
            <button onClick={() => setShowReply(false)} style={{
              padding: '8px 18px', borderRadius: 10, border: '1.5px solid #e5e5ec',
              background: '#fff', color: '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Nested replies */}
      {replies.length > 0 && (
        <div style={{ marginTop: 14, paddingLeft: 20, borderLeft: '3px solid #f0fdfa', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {replies.map(r => (
            <div key={r.id} style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0d9488', marginBottom: 4 }}>{r.author} · {r.date}</div>
              <div style={{ fontSize: 13, color: '#374151' }}>{r.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const MOCK_OPPORTUNITY = {
  id: 1,
  title: 'Développeur Frontend React',
  company_name: 'TechVision Tunisie',
  company_logo: null,
  company_initials: 'TV',
  sector: 'Web',
  location: 'Tunis, Tunisie',
  duration: '6 mois',
  contract_type: 'Stage',
  description: `Nous recherchons un(e) développeur(se) frontend passionné(e) par React pour rejoindre notre équipe dynamique.\n\nVous travaillerez sur des projets innovants, en collaboration étroite avec notre équipe design et backend. Vous participerez à la conception et au développement de nouvelles fonctionnalités, et contribuerez à l'amélioration continue de notre codebase.\n\nC'est une opportunité unique pour acquérir de l'expérience professionnelle dans un environnement stimulant et bienveillant.`,
  skills: ['React', 'JavaScript', 'CSS', 'Git', 'REST API', 'TypeScript'],
  total_slots: 5,
  selected_count: 3,
  salary_min: 400,
  salary_max: 600,
  remote_work: false,
  experience_level: 'Junior',
};

const MOCK_COMMENTS = [
  {
    id: 1,
    author: 'Sara M.',
    date: '15 mars 2026',
    rating: 5,
    text: "Excellente entreprise ! L'équipe est très professionnelle et accueillante. J'ai appris énormément pendant mon stage. Je recommande vivement.",
  },
  {
    id: 2,
    author: 'Karim B.',
    date: '02 avril 2026',
    rating: 4,
    text: "Bonne ambiance de travail, projets intéressants. Le seul bémol est la communication parfois lente entre les équipes, mais l'expérience globale est très positive.",
  },
];

export default function OpportunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opp, setOpp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);

  // Comments state
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [commentFocused, setCommentFocused] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [ratingError, setRatingError] = useState(false);

  useEffect(() => {
    // Try to fetch from API; fall back to mock
    fetch(`http://127.0.0.1:8000/opportunities/${id}`)
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { 
          // Map backend fields to frontend expectations
          data.skills = data.requirements?.map(r => r.description) || [];
          setOpp(data); 
          setLoading(false); 
      })
      .catch(() => { setOpp({ ...MOCK_OPPORTUNITY, id: parseInt(id) || 1 }); setLoading(false); });
  }, [id]);

  const handleApply = async () => {
    if (applied) return;
    setApplyLoading(true);
    const studentId = parseInt(localStorage.getItem('studentId')) || 1;
    try {
      const res = await fetch(`http://127.0.0.1:8000/opportunities/${id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId }),
      });
      if (res.ok) {
        setApplied(true);
      } else {
        const err = await res.json().catch(() => ({}));
        if (err.detail === 'You have already applied to this opportunity') {
          setApplied(true); // Already applied, reflect that
        }
      }
    } catch {
      // network error - optimistic
      setApplied(true);
    } finally {
      setApplyLoading(false);
    }
  };

  const publishComment = () => {
    if (newRating === 0) { setRatingError(true); return; }
    if (!newComment.trim()) return;
    setPublishLoading(true);
    setTimeout(() => {
      setComments(prev => [{
        id: Date.now(),
        author: 'Vous',
        date: new Date().toLocaleDateString('fr-FR'),
        rating: newRating,
        text: newComment.trim(),
      }, ...prev]);
      setNewComment('');
      setNewRating(0);
      setRatingError(false);
      setPublishLoading(false);
    }, 600);
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '80vh' }}>
          <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 15 }}>Chargement...</div>
        </div>
      </MainLayout>
    );
  }

  const sectorColor = getSectorColor(opp?.sector);
  const filledPct = opp?.total_slots > 0 ? Math.round((opp.selected_count / opp.total_slots) * 100) : 0;
  const avgRating = comments.length > 0
    ? (comments.reduce((s, c) => s + (c.rating || 0), 0) / comments.length).toFixed(1)
    : null;

  return (
    <>
      <style>{`
        @keyframes opp-fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes opp-slideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: none; }
        }
        .apply-btn:hover { opacity: 0.92; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(13,148,136,.35) !important; }
        .apply-btn:active { transform: translateY(0); }
        .back-link:hover { color: #0d9488 !important; }
        .opp-detail-comment:focus { outline: none; border-color: #0d9488 !important; box-shadow: 0 0 0 3px rgba(13,148,136,.12) !important; }
      `}</style>

      <MainLayout>
          <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 32px 72px' }}>

            {/* ── Back link ─────────────────────────────────── */}
            <button
              className="back-link"
              onClick={() => navigate('/opportunities')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 13, fontWeight: 600, color: '#6b7280',
                marginBottom: 24, padding: 0, transition: 'color 0.2s',
                animation: 'opp-fadeUp 0.35s ease both',
              }}
            >
              ← Retour aux opportunités
            </button>

            {/* ══════════════════════════════════════════════════
                SECTION 1 — OPPORTUNITY DETAIL CARD
            ═══════════════════════════════════════════════════ */}
            <div style={{
              background: '#fff', borderRadius: 20, border: '1.5px solid #e5e5ec',
              boxShadow: '0 4px 24px rgba(0,0,0,.05)',
              overflow: 'hidden',
              marginBottom: 28,
              animation: 'opp-fadeUp 0.4s ease both',
            }}>
              {/* Hero gradient strip */}
              <div style={{
                background: 'linear-gradient(135deg, #0f2027 0%, #0d4f47 55%, #1a6b5e 100%)',
                padding: '32px 36px',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Decoration blobs */}
                <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,184,166,.22), transparent 65%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -30, left: '35%', width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,.14), transparent 65%)', pointerEvents: 'none' }} />

                {/* Company logo + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 16,
                    background: opp?.company_logo ? 'transparent' : 'rgba(255,255,255,0.15)',
                    border: '2px solid rgba(255,255,255,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, fontWeight: 800, color: '#fff',
                    backdropFilter: 'blur(8px)', flexShrink: 0,
                    overflow: 'hidden',
                  }}>
                    {opp?.company_logo
                      ? <img src={opp.company_logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : (opp?.company_initials || opp?.company_name?.slice(0, 2)?.toUpperCase() || '🏢')
                    }
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', fontWeight: 500, marginBottom: 2 }}>Entreprise</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
                      {opp?.company_name || 'Entreprise'}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h1 style={{
                  margin: '0 0 14px', fontSize: 28, fontWeight: 800,
                  color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.25,
                  fontFamily: "'Segoe UI', sans-serif",
                }}>
                  {opp?.title || 'Poste non spécifié'}
                </h1>

                {/* Tags row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { icon: '📍', text: opp?.location },
                    { icon: '📅', text: opp?.duration },
                    { icon: '🏷️', text: opp?.contract_type },
                    { icon: '🎓', text: opp?.experience_level },
                    opp?.remote_work && { icon: '🌐', text: 'Télétravail' },
                  ].filter(Boolean).filter(t => t.text).map((tag, i) => (
                    <span key={i} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)',
                      border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)',
                    }}>
                      <span>{tag.icon}</span>{tag.text}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content area */}
              <div style={{ padding: '32px 36px' }}>

                {/* ── Description ─────────────────── */}
                <section style={{ marginBottom: 28 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0a0a12', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 4, height: 18, background: '#0d9488', borderRadius: 4, display: 'inline-block' }} />
                    Description du poste
                  </h2>
                  <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                    {opp?.description || "Aucune description fournie."}
                  </div>
                </section>

                {/* Divider */}
                <div style={{ height: 1, background: '#f3f4f6', marginBottom: 28 }} />

                {/* ── Skills Required ──────────────── */}
                {opp?.skills?.length > 0 && (
                  <section style={{ marginBottom: 28 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0a0a12', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 4, height: 18, background: '#6366f1', borderRadius: 4, display: 'inline-block' }} />
                      Compétences requises
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {opp.skills.map((skill, i) => (
                        <span key={i} style={{
                          padding: '6px 14px', borderRadius: 20,
                          background: '#f0f0ff', color: '#6366f1',
                          border: '1.5px solid #c7d2fe',
                          fontSize: 13, fontWeight: 600,
                          animation: `opp-slideIn 0.3s ${i * 0.06}s ease both`,
                        }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Divider */}
                <div style={{ height: 1, background: '#f3f4f6', marginBottom: 28 }} />

                {/* ── Slots + Salary ───────────────── */}
                <section style={{ marginBottom: 32 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0a0a12', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 4, height: 18, background: '#f59e0b', borderRadius: 4, display: 'inline-block' }} />
                    Sélection des candidats
                  </h2>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
                    {/* Slots card */}
                    <div style={{
                      background: '#f9fafb', borderRadius: 14, border: '1.5px solid #e5e5ec',
                      padding: '16px 20px',
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                        Places disponibles
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span style={{ fontSize: 30, fontWeight: 800, color: '#0a0a12', lineHeight: 1 }}>
                          {opp?.selected_count ?? 0}
                        </span>
                        <span style={{ fontSize: 16, color: '#9ca3af', fontWeight: 600 }}>
                          / {opp?.total_slots ?? '?'}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>étudiants sélectionnés</div>
                    </div>

                    {/* Salary card */}
                    {(opp?.salary_min || opp?.salary_max) && (
                      <div style={{
                        background: '#f0fdfa', borderRadius: 14, border: '1.5px solid #ccfbf1',
                        padding: '16px 20px',
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                          Rémunération
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#0a0a12' }}>
                          {opp.salary_min && opp.salary_max
                            ? `${opp.salary_min}–${opp.salary_max} DT`
                            : opp.salary_min ? `À partir de ${opp.salary_min} DT` : `Jusqu'à ${opp.salary_max} DT`}
                        </div>
                        <div style={{ fontSize: 12, color: '#0d9488', marginTop: 4 }}>par mois</div>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: '#6b7280', fontWeight: 600 }}>
                      <span>Progression des sélections</span>
                      <span style={{ color: filledPct >= 80 ? '#ef4444' : '#0d9488' }}>{filledPct}%</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 8, background: '#f3f4f6', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${filledPct}%`,
                        borderRadius: 8,
                        background: filledPct >= 80
                          ? 'linear-gradient(90deg, #f97316, #ef4444)'
                          : 'linear-gradient(90deg, #0d9488, #14b8a6)',
                        transition: 'width 0.8s ease',
                      }} />
                    </div>
                    {filledPct >= 80 && (
                      <div style={{ fontSize: 12, color: '#ef4444', marginTop: 6, fontWeight: 600 }}>
                        ⚠️ Presque complet — postulez vite !
                      </div>
                    )}
                  </div>
                </section>

                {/* ── Apply Button ─────────────────────────── */}
                <button
                  className="apply-btn"
                  onClick={handleApply}
                  disabled={applied || applyLoading}
                  style={{
                    width: '100%', padding: '16px', borderRadius: 14, border: 'none',
                    background: applied
                      ? 'linear-gradient(135deg, #16a34a, #15803d)'
                      : 'linear-gradient(135deg, #0d9488, #0f2027)',
                    color: '#fff', fontSize: 16, fontWeight: 700,
                    cursor: applied ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    transition: 'all 0.22s ease',
                    boxShadow: '0 4px 18px rgba(13,148,136,.25)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {applyLoading ? (
                    <>⏳ Envoi en cours...</>
                  ) : applied ? (
                    <>✅ Candidature envoyée</>
                  ) : (
                    <>🚀 Postuler maintenant</>
                  )}
                </button>

                {applied && (
                  <p style={{ textAlign: 'center', margin: '12px 0 0', fontSize: 13, color: '#0d9488', fontWeight: 500 }}>
                    Votre candidature a été transmise à l'entreprise. Bonne chance ! 🎉
                  </p>
                )}
              </div>
            </div>

            {/* ══════════════════════════════════════════════════
                SECTION 2 — REVIEWS / COMMENTS
            ═══════════════════════════════════════════════════ */}
            <div style={{
              background: '#fff', borderRadius: 20, border: '1.5px solid #e5e5ec',
              boxShadow: '0 4px 24px rgba(0,0,0,.05)',
              overflow: 'hidden',
              animation: 'opp-fadeUp 0.5s 0.15s ease both',
            }}>
              {/* Section header */}
              <div style={{
                padding: '24px 36px', borderBottom: '1px solid #f3f4f6',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 12,
              }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0a0a12' }}>
                    Avis sur l'entreprise
                  </h2>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9ca3af' }}>
                    Partagez votre expérience avec cette entreprise
                  </p>
                </div>
                {avgRating && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: '#fffbeb', border: '1.5px solid #fde68a',
                    borderRadius: 14, padding: '10px 16px',
                  }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: '#0a0a12', lineHeight: 1 }}>{avgRating}</span>
                    <div>
                      <StarRating value={Math.round(parseFloat(avgRating))} readonly />
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{comments.length} avis</div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* ── Write new comment ──────────────────── */}
                <div style={{
                  background: 'linear-gradient(135deg, #f0fdfa, #f9fafb)',
                  borderRadius: 16, border: '1.5px solid #ccfbf1', padding: '24px',
                }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#0a0a12' }}>
                    ✍️ Évaluer l'entreprise
                  </h3>

                  {/* Stars input */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                      Votre note {ratingError && <span style={{ color: '#ef4444', fontSize: 12, fontWeight: 500 }}> — veuillez choisir une note</span>}
                    </div>
                    <StarRating
                      value={newRating}
                      onChange={r => { setNewRating(r); setRatingError(false); }}
                    />
                  </div>

                  {/* Comment textarea */}
                  <textarea
                    className="opp-detail-comment"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onFocus={() => setCommentFocused(true)}
                    onBlur={() => setCommentFocused(false)}
                    placeholder="Partagez votre expérience avec cette entreprise…"
                    style={{
                      width: '100%', minHeight: commentFocused ? 120 : 90,
                      borderRadius: 12, border: `1.5px solid ${commentFocused ? '#0d9488' : '#e5e5ec'}`,
                      padding: '14px 16px', fontSize: 14, resize: 'vertical', outline: 'none',
                      fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: 1.7,
                      background: '#fff',
                      transition: 'border-color 0.2s, min-height 0.25s, box-shadow 0.2s',
                      boxShadow: commentFocused ? '0 0 0 3px rgba(13,148,136,.1)' : 'none',
                    }}
                  />

                  <button
                    onClick={publishComment}
                    disabled={publishLoading || !newComment.trim()}
                    style={{
                      marginTop: 12, padding: '12px 28px',
                      borderRadius: 12, border: 'none',
                      background: publishLoading || !newComment.trim()
                        ? '#e5e5ec'
                        : 'linear-gradient(135deg, #0d9488, #0f766e)',
                      color: publishLoading || !newComment.trim() ? '#9ca3af' : '#fff',
                      fontSize: 14, fontWeight: 700, cursor: publishLoading || !newComment.trim() ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: 8,
                      transition: 'all 0.2s',
                    }}
                  >
                    {publishLoading ? '⏳ Publication...' : '📢 Publier l\'avis'}
                  </button>
                </div>

                {/* ── Existing comments ──────────────────── */}
                {comments.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {comments.map(c => <CommentCard key={c.id} comment={c} />)}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '32px 20px', color: '#9ca3af' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>Aucun avis pour le moment</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>Soyez le premier à partager votre expérience !</div>
                  </div>
                )}
              </div>
            </div>

          </div>
      </MainLayout>
    </>
  );
}
