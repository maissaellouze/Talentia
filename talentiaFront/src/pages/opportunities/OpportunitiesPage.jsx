import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../components/layout/StudentSidebar';

// ─── Helpers ────────────────────────────────────────────────────────────────

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

const getMatchBadge = (score) => {
  if (!score && score !== 0) return null;
  const pct = Math.round(score * 100);
  if (pct >= 80) return { label: `${pct}% match`, bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' };
  if (pct >= 60) return { label: `${pct}% match`, bg: '#fefce8', text: '#ca8a04', border: '#fef08a' };
  return { label: `${pct}% match`, bg: '#fff7ed', text: '#f97316', border: '#fed7aa' };
};

// ─── Skeleton Card ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1px solid #e5e5ec',
      padding: 24, display: 'flex', flexDirection: 'column', gap: 12,
      animation: 'opp-pulse 1.5s ease-in-out infinite'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: 60, height: 22, borderRadius: 8, background: '#f1f5f9' }} />
        <div style={{ width: 40, height: 16, borderRadius: 4, background: '#f1f5f9' }} />
      </div>
      <div style={{ height: 20, width: '80%', borderRadius: 6, background: '#f1f5f9' }} />
      <div style={{ height: 16, width: '60%', borderRadius: 6, background: '#f1f5f9' }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ height: 14, width: 80, borderRadius: 4, background: '#f1f5f9' }} />
        <div style={{ height: 14, width: 60, borderRadius: 4, background: '#f1f5f9' }} />
      </div>
      <div style={{ height: 1, background: '#f1f5f9', marginTop: 4 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ height: 36, width: 140, borderRadius: 10, background: '#f1f5f9' }} />
        <div style={{ height: 36, width: 36, borderRadius: 10, background: '#f1f5f9' }} />
      </div>
    </div>
  );
}

// ─── Opportunity Card ────────────────────────────────────────────────────────

function OpportunityCard({ item, index }) {
  const [hovered, setHovered] = useState(false);
  const internship = item?.internship || {};
  const sector = internship.sector || 'Stage';
  const colorScheme = getSectorColor(sector);
  const matchBadge = getMatchBadge(item?.score);
  const isHighlighted = matchBadge && parseInt(matchBadge.label) >= 80;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 16,
        border: hovered
          ? '2px solid #0d9488'
          : isHighlighted
            ? '2px solid #0d9488'
            : '1.5px solid #e5e5ec',
        padding: hovered || isHighlighted ? '23.5px' : '24px', // compensate 0.5px border diff
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'all 0.22s ease',
        boxShadow: hovered
          ? '0 8px 28px rgba(13,148,136,.15), 0 2px 8px rgba(13,148,136,.08)'
          : '0 2px 8px rgba(0,0,0,.04)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        cursor: 'default',
        animationDelay: `${index * 0.05}s`,
        animation: 'opp-fadeUp 0.4s ease both',
      }}
    >
      {/* Top row: badge + match */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
          background: colorScheme.bg, color: colorScheme.text, border: `1px solid ${colorScheme.border}`,
          letterSpacing: '0.04em', textTransform: 'uppercase'
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: colorScheme.dot,
            flexShrink: 0
          }} />
          {sector.length > 14 ? sector.slice(0, 14) + '…' : sector}
        </span>
        {matchBadge && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: matchBadge.bg, color: matchBadge.text, border: `1px solid ${matchBadge.border}`
          }}>
            ✦ {matchBadge.label}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 style={{
        margin: 0, fontSize: 15, fontWeight: 700, color: '#0a0a12',
        lineHeight: 1.4, fontFamily: "'Segoe UI', sans-serif"
      }}>
        {internship.title || 'Poste non spécifié'}
      </h3>

      {/* Company */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151', fontWeight: 600 }}>
        <span style={{ fontSize: 14 }}>🏢</span>
        {internship.company_name || 'Entreprise'}
      </div>

      {/* Meta info */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12, color: '#6b7280' }}>
        {internship.location && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 13 }}>📍</span>
            {internship.location}
          </span>
        )}
        {internship.duration && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 13 }}>📅</span>
            {internship.duration}
          </span>
        )}
        {!internship.location && !internship.duration && (
          <span style={{ color: '#d1d5db', fontStyle: 'italic' }}>Détails non disponibles</span>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#f3f4f6', margin: '4px 0' }} />

      {/* Action row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '9px 16px', borderRadius: 10,
            border: '1.5px solid #0d9488',
            background: hovered || isHighlighted ? '#0d9488' : 'transparent',
            color: hovered || isHighlighted ? '#fff' : '#0d9488',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Voir l'offre →
        </button>
        <button
          title="Sauvegarder"
          style={{
            width: 38, height: 38, borderRadius: 10, border: '1.5px solid #e5e5ec',
            background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f0fdfa'; e.currentTarget.style.borderColor = '#0d9488'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#e5e5ec'; }}
        >
          🔖
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const OpportunitiesPage = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [sortBy, setSortBy] = useState('match');

  // ── Original fetch logic (untouched) ──────────────────────────────────────
  useEffect(() => {
    fetch('http://127.0.0.1:8000/opportunities/?student_id=1')
      .then((res) => {
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("SUCCESS DATA:", data);
        setOpportunities(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("FETCH ERROR:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // ── Derived data ──────────────────────────────────────────────────────────
  const sectors = [...new Set(
    opportunities.map(o => o?.internship?.sector).filter(Boolean)
  )];

  const filtered = opportunities
    .filter(item => {
      const internship = item?.internship || {};
      const matchesSearch = !searchTerm || [
        internship.title, internship.company_name, internship.location, internship.sector
      ].some(f => f?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSector = !selectedSector || internship.sector === selectedSector;
      return matchesSearch && matchesSector;
    })
    .sort((a, b) => {
      if (sortBy === 'match') return (b?.score || 0) - (a?.score || 0);
      if (sortBy === 'company') return (a?.internship?.company_name || '').localeCompare(b?.internship?.company_name || '');
      return 0;
    });

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalCount = opportunities.length;
  const highMatchCount = opportunities.filter(o => (o?.score || 0) >= 0.8).length;
  const sectorCount = sectors.length;
  const cityCount = [...new Set(opportunities.map(o => o?.internship?.location).filter(Boolean))].length;

  const stats = [
    { icon: '🎯', value: totalCount, label: 'Offres disponibles' },
    { icon: '✨', value: highMatchCount, label: 'Matches élevés' },
    { icon: '🗂️', value: sectorCount, label: 'Secteurs' },
    { icon: '📍', value: cityCount, label: 'Villes' },
  ];

  return (
    <>
      <style>{`
        @keyframes opp-fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes opp-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .opp-search:focus {
          outline: none;
          border-color: #0d9488 !important;
          box-shadow: 0 0 0 3px rgba(13,148,136,.12) !important;
        }
        .opp-select:focus {
          outline: none;
          border-color: #0d9488 !important;
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f8fa' }}>
        <StudentSidebar />

        <main style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 32px 64px' }}>

            {/* ── Hero Banner ─────────────────────────────────────── */}
            <div style={{
              borderRadius: 20,
              background: 'linear-gradient(135deg, #0f2027 0%, #0d4f47 50%, #1a6b5e 100%)',
              padding: '40px 48px',
              marginBottom: 28,
              position: 'relative',
              overflow: 'hidden',
              animation: 'opp-fadeUp 0.5s ease both'
            }}>
              {/* decorative blobs */}
              <div style={{
                position: 'absolute', top: -60, right: -60, width: 260, height: 260,
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,184,166,.25), transparent 65%)',
                pointerEvents: 'none'
              }} />
              <div style={{
                position: 'absolute', bottom: -40, left: '40%', width: 200, height: 200,
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,.15), transparent 65%)',
                pointerEvents: 'none'
              }} />

              {/* label tag */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16,
                background: 'rgba(20,184,166,.15)', border: '1px solid rgba(20,184,166,.35)',
                color: '#5eead4', fontSize: 11, fontWeight: 700,
                padding: '6px 14px', borderRadius: 20, letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%', background: '#5eead4',
                  boxShadow: '0 0 6px #5eead4'
                }} />
                ✦ Recommandations IA
              </div>

              <h1 style={{
                margin: '0 0 12px', fontSize: 34, fontWeight: 800, color: '#fff',
                fontFamily: "'Segoe UI', sans-serif", letterSpacing: '-0.02em', lineHeight: 1.2
              }}>
                Mes Opportunités de Stage
              </h1>
              <p style={{
                margin: 0, fontSize: 15, color: 'rgba(255,255,255,.65)', maxWidth: 520, lineHeight: 1.7
              }}>
                Découvrez les offres sélectionnées par notre IA selon votre profil.
                Postulez aux stages qui correspondent le mieux à vos compétences.
              </p>
            </div>

            {/* ── Stats Row ──────────────────────────────────────── */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16, marginBottom: 28,
              animation: 'opp-fadeUp 0.5s 0.1s ease both'
            }}>
              {stats.map(({ icon, value, label }, i) => (
                <div key={i} style={{
                  background: '#fff', borderRadius: 14, border: '1px solid #e5e5ec',
                  padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14,
                  boxShadow: '0 2px 8px rgba(0,0,0,.03)'
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: '#f0fdfa', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 20, flexShrink: 0
                  }}>
                    {icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#0a0a12', lineHeight: 1.1 }}>
                      {loading ? '—' : value}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2, fontWeight: 500 }}>
                      {label}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Search + Filters ──────────────────────────────── */}
            <div style={{
              background: '#fff', borderRadius: 16, border: '1px solid #e5e5ec',
              padding: '20px 24px', marginBottom: 24,
              boxShadow: '0 2px 8px rgba(0,0,0,.03)',
              animation: 'opp-fadeUp 0.5s 0.15s ease both'
            }}>
              {/* Search input */}
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <span style={{
                  position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 16, color: '#9ca3af', pointerEvents: 'none'
                }}>🔍</span>
                <input
                  className="opp-search"
                  type="text"
                  placeholder="Rechercher par titre, entreprise, ville..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 16px 12px 44px',
                    borderRadius: 12, border: '1.5px solid #e5e5ec',
                    fontSize: 14, color: '#0a0a12', background: '#fafafa',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    fontFamily: 'inherit', boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Filters row */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 13, pointerEvents: 'none'
                  }}>🗂️</span>
                  <select
                    className="opp-select"
                    value={selectedSector}
                    onChange={e => setSelectedSector(e.target.value)}
                    style={{
                      padding: '9px 34px 9px 34px', borderRadius: 10,
                      border: '1.5px solid #e5e5ec', background: '#fff',
                      fontSize: 13, color: '#374151', cursor: 'pointer',
                      fontFamily: 'inherit', fontWeight: 500,
                      appearance: 'none', paddingRight: 36,
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <option value="">Tous les secteurs</option>
                    {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <span style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 10, color: '#9ca3af', pointerEvents: 'none'
                  }}>▼</span>
                </div>

                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 13, pointerEvents: 'none'
                  }}>🔥</span>
                  <select
                    className="opp-select"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    style={{
                      padding: '9px 34px 9px 34px', borderRadius: 10,
                      border: '1.5px solid #e5e5ec', background: '#fff',
                      fontSize: 13, color: '#374151', cursor: 'pointer',
                      fontFamily: 'inherit', fontWeight: 500,
                      appearance: 'none', paddingRight: 36,
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <option value="match">Meilleur match</option>
                    <option value="company">Par entreprise</option>
                  </select>
                  <span style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 10, color: '#9ca3af', pointerEvents: 'none'
                  }}>▼</span>
                </div>

                {(searchTerm || selectedSector) && (
                  <button
                    onClick={() => { setSearchTerm(''); setSelectedSector(''); }}
                    style={{
                      padding: '9px 16px', borderRadius: 10, border: '1.5px solid #fecaca',
                      background: '#fef2f2', color: '#ef4444', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit'
                    }}
                  >
                    ✕ Réinitialiser
                  </button>
                )}
              </div>
            </div>

            {/* ── Results count ──────────────────────────────────── */}
            {!loading && !error && (
              <p style={{
                margin: '0 0 20px', fontSize: 14, color: '#6b7280', fontWeight: 500,
                animation: 'opp-fadeUp 0.5s 0.2s ease both'
              }}>
                <strong style={{ color: '#0a0a12' }}>{filtered.length}</strong>{' '}
                offre{filtered.length !== 1 ? 's' : ''} trouvée{filtered.length !== 1 ? 's' : ''}
              </p>
            )}

            {/* ── Error state ────────────────────────────────────── */}
            {error && (
              <div style={{
                padding: '20px 24px', background: '#fef2f2', border: '1px solid #fecaca',
                color: '#ef4444', borderRadius: 14, marginBottom: 24, fontSize: 14
              }}>
                ⚠️ Erreur lors du chargement : {error}
              </div>
            )}

            {/* ── Cards Grid ─────────────────────────────────────── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 20
            }}>
              {loading ? (
                Array(6).fill(null).map((_, i) => <SkeletonCard key={i} />)
              ) : !error && filtered.length === 0 ? (
                <div style={{
                  gridColumn: '1 / -1', padding: '60px 40px', textAlign: 'center',
                  background: '#fff', borderRadius: 16, border: '1px solid #e5e5ec'
                }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: 20, background: '#f0fdfa',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px', fontSize: 32
                  }}>
                    🎯
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px', color: '#0a0a12' }}>
                    Aucune opportunité trouvée
                  </h3>
                  <p style={{ color: '#6b7280', margin: 0, fontSize: 14 }}>
                    {searchTerm || selectedSector
                      ? "Essayez d'ajuster vos filtres de recherche."
                      : "Aucune recommandation disponible pour votre profil pour le moment."}
                  </p>
                </div>
              ) : (
                filtered.map((item, index) => (
                  <OpportunityCard key={item?.internship?.id || index} item={item} index={index} />
                ))
              )}
            </div>

          </div>
        </main>
      </div>
    </>
  );
};

export default OpportunitiesPage;