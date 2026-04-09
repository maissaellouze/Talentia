import React, { useState, useEffect, useRef } from 'react';
import StarRating from './StarRating';

const API_BASE_URL = "http://127.0.0.1:8000";

export default function CompanyModal({ company, onClose, onReviewAdded }) {
  const [reviews, setReviews]         = useState([]);
  const [pfeReports, setPfeReports]   = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingPfe, setLoadingPfe]   = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittingPfe, setSubmittingPfe]       = useState(false);
  const [activeTab, setActiveTab]     = useState('details');
  const fileRef = useRef(null);

  const [newReview, setNewReview] = useState({
    title: '', content: '', rating: 0, position: '', is_anonymous: false
  });

  const [newPfe, setNewPfe] = useState({
    title: '', domain: '', author: '', university: '', year: '', description: '', file: null
  });

  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (!company?.id) return;
    fetchReviews();
    fetchPfe();
  }, [company]);

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const r = await fetch(`${API_BASE_URL}/societes/${company.id}/reviews`);
      if (r.ok) setReviews(await r.json());
    } catch (e) { console.error(e); }
    finally { setLoadingReviews(false); }
  };

  const fetchPfe = async () => {
    setLoadingPfe(true);
    try {
      const r = await fetch(`${API_BASE_URL}/societes/${company.id}/pfe`);
      if (r.ok) setPfeReports(await r.json());
    } catch (e) { console.error(e); }
    finally { setLoadingPfe(false); }
  };

 const handleReviewSubmit = async (e) => {
  e.preventDefault();
  if (!newReview.rating) return alert("Veuillez sélectionner une note.");
  setSubmittingReview(true);
  try {
    const r = await fetch(`${API_BASE_URL}/societes/${company.id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReview)
    });
    if (r.ok) {
      const added = await r.json();
      setReviews(prev => [added, ...prev]);
      setNewReview({ title: '', content: '', rating: 0, position: '', is_anonymous: false });
      
      // ✅ update the count on the company object locally
      company.review_count = (company.review_count || 0) + 1;
      
      onReviewAdded?.();  // this tells the parent (dashboard) to refresh
    }
  } catch (e) { console.error(e); }
  finally { setSubmittingReview(false); }
};

  const handlePfeSubmit = async (e) => {
    e.preventDefault();
    if (!newPfe.file || !newPfe.title) return alert("Titre et fichier requis.");
    setSubmittingPfe(true);
    try {
      const form = new FormData();
      form.append('file', newPfe.file);
      form.append('title', newPfe.title);
      form.append('domain', newPfe.domain);
      form.append('author', newPfe.author);
      form.append('university', newPfe.university);
      form.append('year', newPfe.year);
      form.append('description', newPfe.description);
      const r = await fetch(`${API_BASE_URL}/societes/${company.id}/pfe`, {
        method: 'POST', body: form
      });
      if (r.ok) {
        setPfeReports([await r.json(), ...pfeReports]);
        setNewPfe({ title: '', domain: '', author: '', university: '', year: '', description: '', file: null });
        if (fileRef.current) fileRef.current.value = '';
      } else {
        alert("Erreur lors du dépôt du PFE.");
      }
    } catch (e) { console.error(e); }
    finally { setSubmittingPfe(false); }
  };

  if (!company) return null;

  const tabs = [
    { id: 'details',  label: 'Détails' },
    { id: 'reviews',  label: `Avis (${company.review_count || 0})` },
    { id: 'pfe',      label: 'Rapports PFE' },
  ];

  return (
    <>
      <style>{`
        .modal-inp {
          width: 100%; padding: 12px 16px; border-radius: 12px;
          border: 1.5px solid #e5e7eb; font-family: system-ui, -apple-system, sans-serif;
          font-size: 14px; outline: none; transition: border 0.2s, box-shadow 0.2s;
          background: #f9fafb; color: #111827; box-sizing: border-box;
        }
        .modal-inp:focus { 
          border-color: #6391B9; 
          background: #fff;
          box-shadow: 0 0 0 4px rgba(99,145,185,0.1); 
        }
        .submit-btn {
          padding: 14px 28px; background: linear-gradient(135deg, #6391B9, #2B547E); 
          color: #fff; border: none; border-radius: 12px; font-weight: 700;
          font-family: system-ui, -apple-system, sans-serif; font-size: 14px; letter-spacing: 0.02em;
          cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); align-self: flex-start;
          box-shadow: 0 4px 12px rgba(99,145,185,0.25);
        }
        .submit-btn:hover { 
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(99,145,185,0.35); 
        }
        .submit-btn:disabled { background: #9ca3af; cursor: not-allowed; box-shadow: none; transform: none; }
        
        @keyframes modalIn { 
          from { opacity: 0; transform: translateY(30px) scale(0.96); filter: blur(4px); } 
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes overlayIn { from { opacity: 0; backdrop-filter: blur(0px); } to { opacity: 1; backdrop-filter: blur(8px); } }
        
        .info-row { display:flex; align-items:flex-start; gap:16px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color: #64748b; width:140px; flex-shrink:0; padding-top:2px; }
        .info-val { font-size:14px; color:#1e293b; flex:1; font-weight: 500; }
        .section-title { 
          font-family: system-ui, -apple-system, sans-serif; font-size: 16px; font-weight: 700; 
          color: #2B547E; margin: 0 0 16px; 
          display: flex; align-items: center; gap: 8px;
        }
        .section-title::before {
          content: ''; display: inline-block; width: 4px; height: 16px; 
          background: #6391B9; border-radius: 4px;
        }
        .tag { display:inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; margin: 3px; letter-spacing: 0.02em; }
        
        .details-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 28px;
        }
        .modal-tabs {
          display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none;
        }
        .modal-tabs::-webkit-scrollbar { display: none; }
        .modal-tab-btn {
          padding: 12px 20px; border: none; background: transparent;
          font-family: system-ui, -apple-system, sans-serif; font-size: 14px; white-space: nowrap;
          cursor: pointer; transition: all 0.2s;
          border-bottom: 2px solid transparent;
        }
        .modal-tab-btn.active {
          font-weight: 700; color: #fff;
          border-bottom: 2px solid #6391B9;
        }
        .modal-tab-btn.inactive {
          font-weight: 500; color: rgba(255,255,255,0.6);
        }
        .modal-tab-btn.inactive:hover {
          color: rgba(255,255,255,0.9);
        }

        /* Responsive Layout Updates */
        .company-header-layout {
          display: flex; gap: 18px; align-items: flex-start; flex-direction: column; 
          margin-bottom: 20px;
        }
        .info-row { display:flex; align-items:flex-start; gap:8px; flex-direction: column; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
        
        @media (min-width: 640px) {
          .company-header-layout {
            flex-direction: row; align-items: center;
          }
          .info-row { flex-direction: row; gap: 16px; }
        }
        @media (min-width: 768px) {
          .details-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>

      <div
        onClick={onClose}
        style={{
          position:'fixed', inset:0, background:'rgba(10, 15, 25, 0.65)',
          backdropFilter:'blur(8px)', zIndex:1000,
          display:'flex', alignItems:'center', justifyContent:'center',
          padding:'16px', animation:'overlayIn 0.3s ease forwards'
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background:'#fff', width:'100%', maxWidth:960,
            maxHeight:'90vh', minHeight: 0,
            borderRadius: 24, overflow:'hidden',
            boxShadow:'0 25px 80px rgba(0,0,0,0.3)',
            display:'flex', flexDirection:'column',
            animation:'modalIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
            margin:'auto',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          {/* ── HEADER ── */}
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #2B547E 55%, #6391B9 100%)',
            padding:'24px 24px 0', flexShrink:0, position:'relative', overflow: 'hidden'
          }}>
            {/* Background decorators */}
            <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,145,185,.4), transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 10, left: '20%', width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,145,185,.25), transparent 70%)', pointerEvents: 'none' }} />

            <button onClick={onClose} style={{
              position:'absolute', top:24, right:24, width:36, height:36,
              borderRadius:'50%', background:'rgba(255,255,255,0.15)', border:'none',
              color:'#fff', fontSize:14, cursor:'pointer', display:'flex',
              alignItems:'center', justifyContent:'center', backdropFilter: 'blur(4px)',
              transition: 'background 0.2s', zIndex: 10
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >✕</button>

            <div className="company-header-layout">
              <div style={{
                width:64, height:64, borderRadius:16, flexShrink:0,
                background: company.logo ? 'transparent' : 'rgba(255,255,255,0.15)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:24, fontWeight:800, fontFamily:'system-ui, -apple-system, sans-serif', color:'#fff',
                border:'2px solid rgba(255,255,255,.2)', overflow:'hidden', backdropFilter: 'blur(4px)'
              }}>
                {company.logo
                  ? <img src={company.logo} alt={company.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : company.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', fontWeight: 500, marginBottom: 2 }}>{company.sector || 'Entreprise'}</div>
                <h2 style={{
                  fontFamily:'system-ui, -apple-system, sans-serif', fontWeight:800, fontSize: 26,
                  color:'#fff', margin:'0 0 6px', lineHeight:1.2, letterSpacing: '-0.02em'
                }}>
                  {company.name}
                  {company.is_verified && (
                    <span style={{ marginLeft:10, fontSize:11, background:'rgba(255,255,255,0.15)', color:'#93C5FD', border:'1px solid rgba(255,255,255,0.25)', padding:'3px 10px', borderRadius:20, verticalAlign:'middle', backdropFilter: 'blur(4px)', fontWeight: 600 }}>
                      ✓ Recommandée
                    </span>
                  )}
                </h2>
                {company.legal_name && company.legal_name !== company.name && (
                  <p style={{ margin:'0 0 6px', color:'rgba(255,255,255,.45)', fontSize:13 }}>{company.legal_name}</p>
                )}
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <StarRating value={company.average_rating || 0} size={15} readonly />
                  <span style={{ fontSize:13, color:'rgba(255,255,255,.8)', fontWeight:600 }}>
                    {company.average_rating?.toFixed(1) || '–'} · {company.review_count || 0} avis
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="modal-tabs">
              {tabs.map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setActiveTab(t.id)} 
                  className={`modal-tab-btn ${activeTab === t.id ? 'active' : 'inactive'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── SCROLLABLE BODY ── */}
          <div style={{ flex:1, overflowY:'auto', padding:'28px 36px', background: '#fff', minHeight: 0 }}>

            {/* ══ TAB: DETAILS ══ */}
            {activeTab === 'details' && (
              <div className="details-grid">

                {/* Left column */}
                <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

                  {/* Description */}
                  {company.description && (
                    <Section title="À propos">
                      <p style={{ fontSize:14, color:'#475569', lineHeight:1.7, margin:0 }}>{company.description}</p>
                    </Section>
                  )}

                  {/* Business info */}
                  <Section title="Informations légales">
                    <InfoRow label="RNE" val={company.rne_id} />
                    <InfoRow label="Forme juridique" val={company.legal_form} />
                    <InfoRow label="Code NAF" val={company.naf_code} />
                    <InfoRow label="Secteur" val={company.sector} />
                    <InfoRow label="Activité" val={company.activity} />
                    <InfoRow label="Année création" val={company.creation_year} />
                    <InfoRow label="Effectif" val={company.employee_count ? `${company.employee_count} employés` : null} />
                  </Section>

                  {/* Domains & Tech */}
                  {(company.main_domain || company.secondary_domains?.length || company.technologies?.length) && (
                    <Section title="Domaines & Technologies">
                      {company.main_domain && <InfoRow label="Domaine principal" val={company.main_domain} />}
                      {company.secondary_domains?.length > 0 && (
                        <div className="info-row">
                          <span className="info-label">Domaines secondaires</span>
                          <div className="info-val">
                            {company.secondary_domains.map((d, i) => (
                              <span key={i} className="tag" style={{ background:'#eff6ff', color:'#1d4ed8', border:'1px solid #bfdbfe' }}>{d}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {company.technologies?.length > 0 && (
                        <div className="info-row">
                          <span className="info-label">Technologies</span>
                          <div className="info-val">
                            {company.technologies.map((t, i) => (
                              <span key={i} className="tag" style={{ background:'#f0fdf4', color:'#15803d', border:'1px solid #bbf7d0' }}>{t}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </Section>
                  )}
                </div>

                {/* Right column */}
                <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

                  {/* Location */}
                  <Section title="Localisation">
                    <InfoRow label="Adresse" val={company.address} />
                    <InfoRow label="Ville" val={company.city} />
                    <InfoRow label="Code postal" val={company.code_postal} />
                    <InfoRow label="Siège social" val={company.headquarters} />
                    {company.locations?.length > 0 && (
                      <div className="info-row">
                        <span className="info-label">Autres sites</span>
                        <div className="info-val">
                          {company.locations.map((l, i) => (
                            <span key={i} className="tag" style={{ background:'#f8fafc', color:'#475569', border:'1px solid #e2e8f0' }}>{l}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </Section>

                  {/* Contact */}
                  <Section title="Contact">
                    {company.email && <InfoRow label="Email" val={<a href={`mailto:${company.email}`} style={{ color:'#1a56db' }}>{company.email}</a>} />}
                    {company.phone && <InfoRow label="Téléphone" val={company.phone} />}
                    {company.website && <InfoRow label="Site web" val={<a href={company.website} target="_blank" rel="noreferrer" style={{ color:'#1a56db' }}>{company.website}</a>} />}
                  </Section>

                  {/* Social */}
                  {company.social_media && Object.values(company.social_media).some(Boolean) && (
                    <Section title="Réseaux sociaux">
                      <div style={{ display:'flex', gap:10, flexWrap:'wrap', paddingTop:4 }}>
                        {company.social_media.linkedin && <SocialBtn href={company.social_media.linkedin} label="LinkedIn" color="#0a66c2" />}
                        {company.social_media.facebook && <SocialBtn href={company.social_media.facebook} label="Facebook" color="#1877f2" />}
                        {company.social_media.instagram && <SocialBtn href={company.social_media.instagram} label="Instagram" color="#e1306c" />}
                      </div>
                    </Section>
                  )}
                </div>
              </div>
            )}

            {/* ══ TAB: REVIEWS ══ */}
            {activeTab === 'reviews' && (
              <div style={{ display:'flex', flexDirection:'column', gap:28 }}>

                {/* Submit form */}
                <div style={{ background:'linear-gradient(135deg, #F8FAFC, #f1f5f9)', border:'1.5px solid #e2e8f0', borderRadius:16, padding:24 }}>
                  <p className="section-title">Donnez votre avis</p>
                  <form onSubmit={handleReviewSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>

                    {/* Star picker */}
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <span style={{ fontSize:13, fontWeight:600, color:'#64748b' }}>Note :</span>
                      <div style={{ display:'flex', gap:2 }}>
                        {[1,2,3,4,5].map(s => (
                          <span key={s}
                            onMouseEnter={() => setHoverRating(s)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setNewReview({ ...newReview, rating: s })}
                            style={{ fontSize:26, cursor:'pointer', color: s <= (hoverRating || newReview.rating) ? '#f59e0b' : '#cbd5e1', transition:'color .1s' }}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <input className="modal-inp" placeholder="Titre de l'avis" required
                        value={newReview.title} onChange={e => setNewReview({ ...newReview, title: e.target.value })} />
                      <input className="modal-inp" placeholder="Votre poste / fonction"
                        value={newReview.position} onChange={e => setNewReview({ ...newReview, position: e.target.value })} />
                    </div>

                    <textarea className="modal-inp" placeholder="Partagez votre expérience..." required rows={4}
                      value={newReview.content} onChange={e => setNewReview({ ...newReview, content: e.target.value })}
                      style={{ resize:'vertical' }} />

                    <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#475569', cursor:'pointer' }}>
                      <input type="checkbox" checked={newReview.is_anonymous}
                        onChange={e => setNewReview({ ...newReview, is_anonymous: e.target.checked })} />
                      Publier anonymement
                    </label>

                    <button type="submit" className="submit-btn" disabled={submittingReview}>
                      {submittingReview ? 'Envoi...' : 'Publier l\'avis'}
                    </button>
                  </form>
                </div>

                {/* Reviews list */}
                <div>
                  <p className="section-title">Derniers avis</p>
                  {loadingReviews ? (
                    <p style={{ color:'#94a3b8', textAlign:'center', padding:'32px 0' }}>Chargement...</p>
                  ) : reviews.length === 0 ? (
                    <p style={{ color:'#94a3b8', textAlign:'center', padding:'40px 0' }}>Aucun avis pour le moment.</p>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                      {reviews.map(r => (
                        <div key={r.id} style={{ padding:'18px', background:'#f9fafb', border:'1px solid #e5e5ec', borderRadius:14 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                            <div>
                              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                                <StarRating rating={r.rating} size={14} />
                                <span style={{ fontSize:15, fontWeight:700, color:'#0a1628', fontFamily:'system-ui, -apple-system, sans-serif' }}>{r.title}</span>
                              </div>
                              <span style={{ fontSize:12, color:'#94a3b8' }}>
                                {r.is_anonymous ? 'Anonyme' : (r.position || 'Utilisateur')} · {new Date(r.created_at).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </div>
                          <p style={{ margin:0, fontSize:14, color:'#475569', lineHeight:1.6 }}>{r.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══ TAB: PFE ══ */}
            {activeTab === 'pfe' && (
              <div style={{ display:'flex', flexDirection:'column', gap:28 }}>

                {/* Upload form */}
                <div style={{ background:'linear-gradient(135deg, #F8FAFC, #f1f5f9)', border:'1.5px solid #e2e8f0', borderRadius:16, padding:24 }}>
                  <p className="section-title">Déposer votre rapport PFE</p>
                  <form onSubmit={handlePfeSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <input className="modal-inp" placeholder="Titre du PFE" required
                        value={newPfe.title} onChange={e => setNewPfe({ ...newPfe, title: e.target.value })} />
                      <input className="modal-inp" placeholder="Domaine (ex: IA, Web...)"
                        value={newPfe.domain} onChange={e => setNewPfe({ ...newPfe, domain: e.target.value })} />
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <input className="modal-inp" placeholder="Auteur (votre nom)"
                        value={newPfe.author} onChange={e => setNewPfe({ ...newPfe, author: e.target.value })} />
                      <input className="modal-inp" placeholder="Université / École"
                        value={newPfe.university} onChange={e => setNewPfe({ ...newPfe, university: e.target.value })} />
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <input className="modal-inp" placeholder="Année (ex: 2024)"
                        value={newPfe.year} onChange={e => setNewPfe({ ...newPfe, year: e.target.value })} />
                      {/* Empty div for layout if needed or add more info */}
                      <div />
                    </div>
                    <textarea className="modal-inp" placeholder="Résumé du rapport..." rows={2}
                      value={newPfe.description} onChange={e => setNewPfe({ ...newPfe, description: e.target.value })} />

                    {/* File drop zone */}
                    <label style={{
                      display:'flex', flexDirection:'column', alignItems:'center', gap:10,
                      border:'2px dashed #e2e8f0', borderRadius:12, padding:'24px',
                      cursor:'pointer', background: newPfe.file ? '#F8FAFC' : '#fff',
                      transition:'background .15s'
                    }}>
                      <span style={{ fontSize:28 }}>📄</span>
                      <span style={{ fontSize:13, color:'#64748b', fontWeight:500 }}>
                        {newPfe.file ? newPfe.file.name : 'Cliquez ou glissez votre fichier PDF ici'}
                      </span>
                      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display:'none' }}
                        onChange={e => setNewPfe({ ...newPfe, file: e.target.files[0] })} />
                    </label>

                    <button type="submit" className="submit-btn" disabled={submittingPfe}>
                      {submittingPfe ? 'Dépôt en cours...' : 'Soumettre le PFE'}
                    </button>
                  </form>
                </div>

                {/* PFE list */}
                <div>
                  <p className="section-title">Rapports déposés</p>
                  {loadingPfe ? (
                    <p style={{ color:'#94a3b8', textAlign:'center', padding:'32px 0' }}>Chargement...</p>
                  ) : pfeReports.length === 0 ? (
                    <p style={{ color:'#94a3b8', textAlign:'center', padding:'40px 0' }}>Aucun rapport PFE déposé sous cette entreprise.</p>
                  ) : (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:16 }}>
                      {pfeReports.map(p => (
                        <div key={p.id} style={{ background:'#fff', border:'1.5px solid #e5e5ec', borderRadius:14, padding:18, display:'flex', flexDirection:'column', gap:10 }}>
                          <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                            <span style={{ fontSize:28, flexShrink:0 }}>📑</span>
                            <div style={{ minWidth:0 }}>
                              <p style={{ fontFamily:'system-ui, -apple-system, sans-serif', fontWeight:700, fontSize:14, color:'#0a1628', margin:'0 0 4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                {p.title}
                              </p>
                              {p.domain && (
                                <span style={{ fontSize:11, background:'#F8FAFC', color:'#6391B9', border:'1px solid #e2e8f0', padding:'2px 8px', borderRadius:20, fontWeight:600 }}>
                                  {p.domain}
                                </span>
                              )}
                            </div>
                          </div>
                          {p.content_text && (
                            <p style={{ fontSize:12, color:'#64748b', lineHeight:1.5, margin:0,
                              display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                              {p.content_text}
                            </p>
                          )}
                          {p.university && (
                            <p style={{ fontSize:11, color:'#94a3b8', margin:0 }}>🏫 {p.university}</p>
                          )}
                          {p.year && (
                             <p style={{ fontSize:11, color:'#94a3b8', margin:0 }}>📅 {p.year}</p>
                          )}
                          {p.file_url && (
                            <a href={p.file_url} target="_blank" rel="noreferrer" style={{
                              marginTop:'auto', display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                              padding:'9px', background:'linear-gradient(135deg, #6391B9, #2B547E)', color:'#fff', borderRadius:10,
                              textDecoration:'none', fontSize:13, fontWeight:700
                            }}>
                              ⬇ Télécharger
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="section-title">{title}</p>
      <div>{children}</div>
    </div>
  );
}

function InfoRow({ label, val }) {
  if (!val && val !== 0) return null;
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-val">{val}</span>
    </div>
  );
}

function SocialBtn({ href, label, color }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" style={{
      display:'flex', alignItems:'center', gap:6, padding:'8px 16px',
      background:`${color}12`, border:`1.5px solid ${color}30`, color,
      borderRadius:10, textDecoration:'none', fontSize:13, fontWeight:600
    }}>
      {label} ↗
    </a>
  );
}