import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';

const API = 'http://127.0.0.1:8000';

// ─── COULEURS ISSAT ───────────────────────────────────────────────────────────
const COLORS = {
  blueMain: '#6391B9',    // Bleu ISSAT
  blueDark: '#2B547E',    // Bleu foncé
  bgDark: '#1e1e2e',      // Fond sombre
  grayText: '#6b7280',
  white: '#ffffff'
};

const DIFFICULTY_OPTIONS = ['Débutant', 'Intermédiaire', 'Avancé'];
const PURPOSE_OPTIONS = [
  'Candidature Master / Doctorat', 'Stage en entreprise',
  "Bourse d'études", 'Échange universitaire', 'Emploi', 'Autre',
];

// ─── STATUS ───────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  pending:   { label: 'En attente',    bg: '#fef9c3', color: '#854d0e', dot: '#ca8a04' },
  approved:  { label: 'Accepté',       bg: '#dcfce7', color: '#166534', dot: '#16a34a' },
  rejected:  { label: 'Refusé',        bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  completed: { label: 'Lettre reçue',  bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
  refused:   { label: 'Refusée',       bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
};
const FILTERS_REC = [
  { key: 'all', label: 'Tous' }, { key: 'pending', label: 'En attente' },
  { key: 'completed', label: 'Lettre reçue' }, { key: 'refused', label: 'Refusées' },
];
const FILTERS_ENC = [
  { key: 'all', label: 'Tous' }, { key: 'pending', label: 'En attente' },
  { key: 'approved', label: 'Acceptés' }, { key: 'rejected', label: 'Refusés' },
];

function norm(s) { return (s || 'pending').toLowerCase().trim(); }
function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── ATOMS ────────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const c = STATUS_CFG[norm(status)] || STATUS_CFG.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 11px', borderRadius: 20, fontSize: 12, fontWeight: 700,
      background: c.bg, color: c.color, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      background: type === 'success' ? '#6391B9' : '#ef4444',
      color: '#fff', padding: '13px 20px', borderRadius: 14,
      fontWeight: 600, fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,.15)',
      display: 'flex', alignItems: 'center', gap: 10, animation: 'slideUp .3s ease-out',
    }}>
      <span>{type === 'success' ? '✅' : '❌'}</span>{message}
    </div>
  );
}

function Modal({ title, icon, bg = 'rgba(99, 145, 185, 0.08)', onClose, children }) {
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(10,10,18,.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{
        background: '#fff', borderRadius: 24, padding: '2rem',
        width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto',
        animation: 'popIn .25s cubic-bezier(.34,1.56,.64,1)',
        boxShadow: '0 24px 64px rgba(0,0,0,.18)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{icon}</div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0a0a12' }}>{title}</h3>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 14, color: '#6b7280' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FilterBar({ filters, active, onChange, counts }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1.25rem' }}>
      {filters.map(f => {
        const on = active === f.key;
        const n = counts?.[f.key];
        return (
          <button key={f.key} onClick={() => onChange(f.key)} style={{
            padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 13, fontWeight: on ? 700 : 500,
            background: on ? COLORS.blueMain : '#f3f4f6', 
            color: on ? '#fff' : '#6b7280',
            display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s',
            boxShadow: on ? `0 4px 12px rgba(99, 145, 185, 0.2)` : 'none'
          }}>
            {f.label}
            {n > 0 && (
              <span style={{
                background: on ? 'rgba(255,255,255,.28)' : '#d1d5db',
                color: on ? '#fff' : '#374151',
                borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700,
              }}>{n}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Card({ children, style }) {
  return <div style={{ 
    background: '#fff', 
    borderRadius: 20, 
    border: '1px solid #eee', 
    padding: '2rem', 
    boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
    ...style 
  }}>{children}</div>;
}
function SectionTitle({ children }) {
  return <h2 style={{ fontSize: 17, fontWeight: 800, color: '#111827', margin: '0 0 1.25rem' }}>{children}</h2>;
}
function Label({ children, required }) {
  return (
    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
      {children}{required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
    </label>
  );
}
function Skeleton() {
  return <div style={{ height: 70, background: '#f3f4f6', borderRadius: 14, marginBottom: 8 }} />;
}
function Empty({ icon, text }) {
  return (
    <div style={{ padding: '2.5rem', textAlign: 'center', background: '#f9fafb', borderRadius: 16, border: '1.5px dashed #e5e7eb' }}>
      <div style={{ fontSize: 30, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontWeight: 600, color: '#6b7280', fontSize: 14 }}>{text}</div>
    </div>
  );
}
function Spinner() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin .8s linear infinite' }}>
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}
const inp = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: '1.5px solid #e5e7eb', fontSize: 14, color: '#111827',
  background: '#f9fafb', outline: 'none', fontFamily: 'inherit',
  transition: 'border-color .2s, background .2s', boxSizing: 'border-box',
};
function NewBtn({ open, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 18px', borderRadius: 10, border: 'none',
      background: open ? '#f3f4f6' : COLORS.blueMain,
      color: open ? '#6b7280' : '#fff',
      fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
      display: 'flex', alignItems: 'center', gap: 6, transition: 'all .2s',
      boxShadow: open ? 'none' : `0 4px 12px rgba(99, 145, 185, 0.2)`
    }}>{open ? '✕ Fermer' : '+ Nouveau'}</button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function StudentDemandesPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [activeTab, setActiveTab] = useState('recommendation');
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => setToast({ message: msg, type });

  useEffect(() => {
    fetch(`${API}/auth/available-teachers`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setTeachers(Array.isArray(d) ? d : []))
      .catch(() => {}).finally(() => setLoadingTeachers(false));
  }, [token]);

  return (
    <MainLayout>
      <div style={{ padding: '2rem 3.5rem', maxWidth: 920, margin: '0 auto' }}>
        <header style={{ marginBottom: '2.5rem' }}>
          <button onClick={() => navigate(-1)} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280',
            fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>← Retour</button>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#0a0a12', margin: 0, marginBottom: 6 }}>Mes Demandes</h1>
          <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>Soumettez et suivez vos demandes auprès des enseignants.</p>
        </header>

        <div style={{ display: 'flex', gap: 8, marginBottom: '2rem', background: '#f3f4f6', padding: 6, borderRadius: 14 }}>
          {[
            { id: 'recommendation', label: '✉️  Recommandations' },
            { id: 'encadrement',    label: '📋  Encadrements' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none',
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
              transition: 'all .2s',
              background: activeTab === tab.id ? '#fff' : 'transparent',
              color: activeTab === tab.id ? '#6391B9' : '#6b7280',
              boxShadow: activeTab === tab.id ? '0 1px 6px rgba(0,0,0,.08)' : 'none',
            }}>{tab.label}</button>
          ))}
        </div>

        {activeTab === 'recommendation' && <RecTab teachers={teachers} loadingTeachers={loadingTeachers} token={token} showToast={showToast} />}
        {activeTab === 'encadrement'    && <EncTab teachers={teachers} loadingTeachers={loadingTeachers} token={token} showToast={showToast} />}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <style>{`
        @keyframes fadeIn  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn   { from{opacity:0;transform:scale(.92)} to{opacity:1;transform:scale(1)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        input:focus,select:focus,textarea:focus{border-color:#6391B9!important;background:#fff!important;box-shadow:0 0 0 3px rgba(13,148,136,.1);}
        .tc:hover{background:rgba(99, 145, 185, 0.08)!important;border-color:#6391B9!important}
        .sbtn:hover{background:#0a7a70!important;transform:translateY(-1px)}
        .sbtn:active{transform:translateY(0)}
        .hrow:hover{background:#f8fafc!important}
      `}</style>
    </MainLayout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB RECOMMANDATION
// ═══════════════════════════════════════════════════════════════════════════════
function RecTab({ teachers, loadingTeachers, token, showToast }) {
  const [form, setForm] = useState({ teacher_id: '', purpose: '', custom_purpose: '', additional_info: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const isOther = form.purpose === 'Autre';
  const finalPurpose = isOther ? form.custom_purpose : form.purpose;
  const canSubmit = form.teacher_id && finalPurpose.trim();

  const fetchHistory = useCallback(() => {
  setLoading(true);
  fetch(`${API}/auth/my-recommendation-requests`, { 
    headers: { Authorization: `Bearer ${token}` } 
  })
    .then(r => {
      if (!r.ok) throw new Error("Erreur réseau");
      return r.json();
    })
    .then(d => {
      // On s'assure que chaque objet a un statut valide pour STATUS_CFG
      const sanitized = Array.isArray(d) ? d.map(item => ({
        ...item,
        status: item.status ? item.status.toLowerCase().trim() : 'pending'
      })) : [];
      setHistory(sanitized);
    })
    .catch((err) => {
      console.error("Erreur fetch:", err);
      setHistory([]);
    })
    .finally(() => setLoading(false));
}, [token]);
  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const body = new FormData();
    body.append('teacher_id', form.teacher_id);
    body.append('purpose', finalPurpose.trim());
    if (form.additional_info.trim()) body.append('additional_info', form.additional_info.trim());
    try {
      const res = await fetch(`${API}/auth/request-recommendation`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body });
      if (!res.ok) throw new Error((await res.json()).detail || 'Erreur.');
      showToast('Demande envoyée !', 'success');
      setForm({ teacher_id: '', purpose: '', custom_purpose: '', additional_info: '' });
      setShowForm(false); fetchHistory();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const counts = history.reduce((a, r) => { const s = norm(r.status); a[s] = (a[s]||0)+1; a.all=(a.all||0)+1; return a; }, {});
const filtered = filter === 'all' 
  ? history 
  : history.filter(r => {
      const s = norm(r.status);
      if (filter === 'refused') return s === 'refused' || s === 'rejected';
      return s === filter;
    });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn .4s ease-out' }}>

      {/* ── Historique ── */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <SectionTitle>Mes demandes de recommandation</SectionTitle>
          <NewBtn open={showForm} onClick={() => setShowForm(p => !p)} />
        </div>
        <FilterBar filters={FILTERS_REC} active={filter} onChange={setFilter} counts={counts} />
        {loading ? [1,2].map(i => <Skeleton key={i} />) :
         filtered.length === 0 ? <Empty icon="📬" text={filter==='all' ? 'Aucune demande.' : 'Aucune demande avec ce statut.'} /> :
         <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
           {filtered.map(r => <RecCard key={r.id} rec={r} onView={() => setModal(r)} />)}
         </div>
        }
      </Card>

{showForm && (
  <Modal 
    title="Nouvelle demande de recommandation" 
    icon="✉️" 
    onClose={() => setShowForm(false)}
  >
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      <div>
        <Label required>Choisir un enseignant</Label>
        {loadingTeachers
          ? <div style={{ height: 56, background: '#f3f4f6', borderRadius: 12 }} />
          : <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {teachers.map(t => (
                <div key={t.id} className="tc" onClick={() => set('teacher_id', String(t.id))} style={{
                  padding:'10px', borderRadius:12, cursor:'pointer',
                  border:`2px solid ${form.teacher_id===String(t.id)?'#6391B9':'#e5e7eb'}`,
                  background:form.teacher_id===String(t.id)?'rgba(99, 145, 185, 0.08)':'#f9fafb',
                  display:'flex', alignItems:'center', gap:10,
                }}>
                  <div style={{ fontWeight:700, color:'#111827', fontSize:12 }}>{t.name}</div>
                </div>
              ))}
            </div>
        }
      </div>

      <div>
        <Label required>Objectif</Label>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:8 }}>
          {PURPOSE_OPTIONS.map(opt => (
            <button key={opt} onClick={() => set('purpose', opt)} style={{
              padding:'8px', borderRadius:10, cursor:'pointer', textAlign:'left',
              border:`1.5px solid ${form.purpose===opt?'#6391B9':'#e5e7eb'}`,
              background:form.purpose===opt?'rgba(99, 145, 185, 0.08)':'#f9fafb',
              fontSize:12, fontWeight:form.purpose===opt?700:500, fontFamily:'inherit',
            }}>{opt}</button>
          ))}
        </div>
        {isOther && <input type="text" placeholder="Précisez..." value={form.custom_purpose} onChange={e=>set('custom_purpose',e.target.value)} style={{...inp,marginTop:10}} />}
      </div>

      <div>
        <Label>Informations complémentaires</Label>
        <textarea placeholder="Résumé de votre parcours..." value={form.additional_info} onChange={e=>set('additional_info',e.target.value)} rows={3} style={{...inp,resize:'vertical'}} />
      </div>

      <button className="sbtn" onClick={handleSubmit} disabled={!canSubmit||submitting} style={{
        width:'100%', padding:14, borderRadius:12, border:'none',
        background:canSubmit?'#6391B9':'#d1d5db', color:'#fff',
        fontWeight:800, fontSize:15, cursor:canSubmit?'pointer':'not-allowed',
      }}>
        {submitting ? <Spinner/> : "Envoyer la demande"}
      </button>
    </div>
  </Modal>
)}
      {/* ── Modal ── */}
      {modal && (
        <Modal
          title={norm(modal.status)==='completed'?'Lettre de recommandation':'Détails de la demande'}
          icon={norm(modal.status)==='completed'?'📜':norm(modal.status)==='refused'?'🚫':'✉️'}
          bg={norm(modal.status)==='completed'?'#dbeafe':norm(modal.status)==='refused'?'#fee2e2':'#fef9c3'}
          onClose={()=>setModal(null)}
        >
          {/* Meta */}
          <div style={{background:'#f8fafc',borderRadius:12,padding:'1rem',marginBottom:'1.25rem',fontSize:13}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:'6px 16px',alignItems:'center'}}>
              <div><span style={{color:'#9ca3af'}}>Objectif : </span><strong>{modal.purpose}</strong></div>
              <StatusBadge status={modal.status} />
              {modal.teacher_name && <div style={{gridColumn:'1/-1'}}><span style={{color:'#9ca3af'}}>Enseignant : </span><strong>{modal.teacher_name}</strong></div>}
              {modal.created_at && <div style={{gridColumn:'1/-1',color:'#9ca3af',fontSize:12}}>{fmtDate(modal.created_at)}</div>}
            </div>
          </div>

          {/* Lettre */}
          {norm(modal.status)==='completed' && modal.content && (
            <>
              <div style={{fontSize:13,fontWeight:700,color:'#374151',marginBottom:8}}>Contenu de la lettre :</div>
              <div style={{
                background:'#fffbeb',border:'1px solid #fde68a',borderRadius:12,
                padding:'1.25rem',fontSize:13,lineHeight:1.9,color:'#111827',
                fontFamily:'Georgia,serif',whiteSpace:'pre-wrap',marginBottom:'1rem',
              }}>{modal.content}</div>
              <button onClick={()=>{
                const b=new Blob([modal.content],{type:'text/plain'});
                const a=document.createElement('a');
                a.href=URL.createObjectURL(b);
                a.download=`lettre_${(modal.purpose||'recommandation').replace(/\s+/g,'_')}.txt`;
                a.click();
              }} style={{
                width:'100%',padding:'11px',borderRadius:10,border:'none',
                background:'#6391B9',color:'#fff',fontWeight:700,fontSize:13,
                cursor:'pointer',fontFamily:'inherit',
              }}>⬇️ Télécharger la lettre</button>
            </>
          )}

          {/* Refusée */}
          {(norm(modal.status)==='refused'||norm(modal.status)==='rejected') && (
            <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,padding:'1rem',fontSize:13,color:'#991b1b',lineHeight:1.7}}>
              <div style={{fontWeight:700,marginBottom:6}}>Motif du refus :</div>
              {modal.content || modal.feedback || 'Aucun motif précisé.'}
            </div>
          )}

          {/* En attente */}
          {norm(modal.status)==='pending' && (
            <div style={{background:'#fefce8',border:'1px solid #fde68a',borderRadius:12,padding:'1rem',fontSize:13,color:'#854d0e',textAlign:'center'}}>
              ⏳ Votre demande est en cours de traitement.
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

function RecCard({ rec, onView }) {
  const s = norm(rec.status);
  const hasResp = s==='completed'||s==='refused'||s==='rejected';
  return (
    <div className="hrow" style={{
      padding:'14px 16px',borderRadius:14,transition:'background .15s',
      border:hasResp?`1.5px solid ${s==='completed'?'#bfdbfe':'#fecaca'}`:'1px solid #f1f5f9',
      background:'#fff',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,
    }}>
      <div style={{display:'flex',alignItems:'center',gap:12,minWidth:0,flex:1}}>
        <div style={{
          width:38,height:38,borderRadius:10,flexShrink:0,fontSize:16,
          background:s==='completed'?'#dbeafe':s==='refused'?'#fee2e2':'#fef9c3',
          display:'flex',alignItems:'center',justifyContent:'center',
        }}>{s==='completed'?'📜':s==='refused'?'🚫':'✉️'}</div>
        <div style={{minWidth:0}}>
          <div style={{fontWeight:700,color:'#111827',fontSize:14,marginBottom:2}}>{rec.purpose}</div>
          <div style={{fontSize:12,color:'#9ca3af'}}>
            {rec.teacher_name&&`Prof. ${rec.teacher_name} · `}{fmtDate(rec.created_at)}
          </div>
          {hasResp && (
            <div style={{fontSize:12,fontWeight:600,marginTop:3,color:s==='completed'?'#1e40af':'#991b1b'}}>
              {s==='completed'?'✅ Lettre disponible':'❌ Demande refusée'}
            </div>
          )}
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
        <StatusBadge status={rec.status}/>
        {hasResp && (
          <button onClick={onView} style={{
            padding:'6px 12px',borderRadius:8,border:'none',
            background:s==='completed'?'#6391B9':'#f3f4f6',
            color:s==='completed'?'#fff':'#374151',
            fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',
          }}>{s==='completed'?'📜 Voir lettre':'👁 Motif'}</button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB ENCADREMENT
// ═══════════════════════════════════════════════════════════════════════════════
function EncTab({ teachers, loadingTeachers, token, showToast }) {
  const [form, setForm] = useState({ title:'',description:'',teacher_id:'',technologies:'',difficulty_level:'Intermédiaire' });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const fileRef = useRef();
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  const canSubmit = form.title.trim()&&form.description.trim()&&form.teacher_id;

  const fetchIdeas = useCallback(() => {
    setLoading(true);
    fetch(`${API}/auth/my-project-ideas`,{headers:{Authorization:`Bearer ${token}`}})
      .then(r=>r.ok?r.json():[]).then(d=>setIdeas(Array.isArray(d)?d:[]))
      .catch(()=>setIdeas([])).finally(()=>setLoading(false));
  },[token]);

  useEffect(()=>{fetchIdeas();},[fetchIdeas]);

  const handleFileChange = e => {
    const f=e.target.files[0];
    if(f&&f.type==='application/pdf') setFile(f);
    else showToast('Fichier PDF uniquement.','error');
  };

  const handleSubmit = async () => {
    if(!canSubmit) return;
    setSubmitting(true);
    const body=new FormData();
    body.append('title',form.title.trim());
    body.append('description',form.description.trim());
    body.append('teacher_id',form.teacher_id);
    body.append('difficulty_level',form.difficulty_level);
    if(form.technologies.trim()) body.append('technologies',form.technologies.trim());
    if(file) body.append('file',file);
    try {
      const res=await fetch(`${API}/auth/submit-project-idea/`,{method:'POST',headers:{Authorization:`Bearer ${token}`},body});
      if(!res.ok) throw new Error((await res.json()).detail||'Erreur.');
      showToast('Projet soumis !','success');
      setForm({title:'',description:'',teacher_id:'',technologies:'',difficulty_level:'Intermédiaire'});
      setFile(null); setShowForm(false); fetchIdeas();
    } catch(e){showToast(e.message,'error');}
    finally{setSubmitting(false);}
  };

  const counts = ideas.reduce((a,r)=>{const s=norm(r.status);a[s]=(a[s]||0)+1;a.all=(a.all||0)+1;return a;},{});
  const filtered = filter==='all'?ideas:ideas.filter(r=>norm(r.status)===filter);

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'1.5rem',animation:'fadeIn .4s ease-out'}}>

      {/* ── Historique ── */}
      <Card>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
          <SectionTitle>Mes projets soumis</SectionTitle>
          <NewBtn open={showForm} onClick={()=>setShowForm(p=>!p)}/>
        </div>
        <FilterBar filters={FILTERS_ENC} active={filter} onChange={setFilter} counts={counts}/>
        {loading?[1,2].map(i=><Skeleton key={i}/>):
         filtered.length===0?<Empty icon="📂" text={filter==='all'?'Aucun projet soumis.':'Aucun projet avec ce statut.'}/>:
         <div style={{display:'flex',flexDirection:'column',gap:8}}>
           {filtered.map(idea=><EncCard key={idea.id} idea={idea} onView={()=>setModal(idea)}/>)}
         </div>
        }
      </Card>

      {/* ── Formulaire ── */}
     {/* —— Remplacer l'ancien bloc {showForm && ...} par ceci —— */}
{showForm && (
  <Modal 
    title="Soumettre un nouveau projet" 
    icon="🚀" 
    onClose={() => setShowForm(false)}
  >
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <Label required>Titre</Label>
        <input type="text" placeholder="Ex : Application de gestion..." value={form.title} onChange={e=>set('title',e.target.value)} style={inp}/>
      </div>

      <div>
        <Label required>Description</Label>
        <textarea placeholder="Décrivez votre projet..." value={form.description} onChange={e=>set('description',e.target.value)} rows={3} style={{...inp,resize:'vertical'}}/>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
        <div>
          <Label>Technologies</Label>
          <input type="text" placeholder="React, FastAPI..." value={form.technologies} onChange={e=>set('technologies',e.target.value)} style={inp}/>
        </div>
        <div>
          <Label>Niveau</Label>
          <select value={form.difficulty_level} onChange={e=>set('difficulty_level',e.target.value)} style={inp}>
            {DIFFICULTY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      </div>

      <div>
        <Label required>Enseignant encadrant</Label>
        <select value={form.teacher_id} onChange={e=>set('teacher_id',e.target.value)} style={inp}>
          <option value="">-- Sélectionner --</option>
          {teachers.map(t=><option key={t.id} value={String(t.id)}>{t.name}</option>)}
        </select>
      </div>

      <div>
        <Label>Cahier des charges (PDF)</Label>
        <div onClick={()=>fileRef.current?.click()} style={{
          border:`2px dashed ${file?'#6391B9':'#d1d5db'}`, borderRadius:14, padding:'1rem',
          textAlign:'center', cursor:'pointer', background:file?'rgba(99, 145, 185, 0.08)':'#fafafa'
        }}>
          <input ref={fileRef} type="file" accept="application/pdf" onChange={handleFileChange} style={{display:'none'}}/>
          {file ? <span style={{fontSize:12, fontWeight:700, color:'#2B547E'}}>{file.name}</span> : <span style={{fontSize:12, color:'#9ca3af'}}>Ajouter un PDF</span>}
        </div>
      </div>

      <button className="sbtn" onClick={handleSubmit} disabled={!canSubmit||submitting} style={{
        width:'100%', padding:14, borderRadius:12, border:'none',
        background:canSubmit?'#6391B9':'#d1d5db', color:'#fff',
        fontWeight:800, fontSize:15,
      }}>
        {submitting ? <Spinner/> : "Soumettre le projet"}
      </button>
    </div>
  </Modal>
)}

      {/* ── Modal feedback ── */}
      {modal && (
        <Modal
          title="Réponse de l'enseignant"
          icon={norm(modal.status)==='approved'?'✅':norm(modal.status)==='rejected'?'❌':'📋'}
          bg={norm(modal.status)==='approved'?'#dcfce7':norm(modal.status)==='rejected'?'#fee2e2':'rgba(99, 145, 185, 0.08)'}
          onClose={()=>setModal(null)}
        >
          <div style={{background:'#f8fafc',borderRadius:12,padding:'1rem',marginBottom:'1.25rem',fontSize:13}}>
            <div style={{fontWeight:700,color:'#111827',fontSize:15,marginBottom:8}}>{modal.title}</div>
            <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'center'}}>
              {modal.difficulty_level&&<span style={{color:'#6b7280'}}>⚡ {modal.difficulty_level}</span>}
              {modal.technologies&&<span style={{color:'#6b7280'}}>🛠️ {modal.technologies}</span>}
              <StatusBadge status={modal.status}/>
            </div>
            {modal.teacher&&<div style={{marginTop:6,color:'#6b7280',fontSize:12}}>👤 {modal.teacher}</div>}
          </div>

          {modal.feedback&&(
            <>
              <div style={{fontSize:13,fontWeight:700,color:'#374151',marginBottom:8}}>
                {norm(modal.status)==='approved'?'💬 Commentaire :':'❌ Motif du refus :'}
              </div>
              <div style={{
                background:norm(modal.status)==='approved'?'#f0fdf4':'#fef2f2',
                border:`1px solid ${norm(modal.status)==='approved'?'#bbf7d0':'#fecaca'}`,
                borderRadius:12,padding:'1rem',fontSize:13,lineHeight:1.8,
                color:norm(modal.status)==='approved'?'#166534':'#991b1b',
                whiteSpace:'pre-wrap',
              }}>{modal.feedback}</div>
            </>
          )}

          {norm(modal.status)==='pending'&&(
            <div style={{background:'#fefce8',border:'1px solid #fde68a',borderRadius:12,padding:'1rem',fontSize:13,color:'#854d0e',textAlign:'center'}}>
              ⏳ Votre projet est en attente de réponse.
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

function EncCard({ idea, onView }) {
  const s = norm(idea.status);
  const hasResp = s==='approved'||s==='rejected';
  return (
    <div className="hrow" style={{
      padding:'14px 16px',borderRadius:14,transition:'background .15s',
      border:hasResp?`1.5px solid ${s==='approved'?'#bbf7d0':'#fecaca'}`:'1px solid #f1f5f9',
      background:'#fff',
    }}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:12,minWidth:0,flex:1}}>
          <div style={{
            width:38,height:38,borderRadius:10,flexShrink:0,marginTop:2,fontSize:16,
            background:s==='approved'?'#dcfce7':s==='rejected'?'#fee2e2':'rgba(99, 145, 185, 0.08)',
            display:'flex',alignItems:'center',justifyContent:'center',
          }}>{s==='approved'?'✅':s==='rejected'?'❌':'📋'}</div>
          <div style={{minWidth:0,flex:1}}>
            <div style={{fontWeight:700,color:'#111827',fontSize:14,marginBottom:3}}>{idea.title}</div>
            <div style={{display:'flex',gap:10,flexWrap:'wrap',fontSize:12,color:'#9ca3af',marginBottom:hasResp&&idea.feedback?6:0}}>
              {idea.teacher&&<span>👤 {idea.teacher}</span>}
              {idea.difficulty_level&&<span>⚡ {idea.difficulty_level}</span>}
              {idea.technologies&&<span>🛠️ {idea.technologies}</span>}
            </div>
            {/* Feedback preview */}
            {hasResp&&idea.feedback&&(
              <div style={{
                fontSize:12,color:s==='approved'?'#166534':'#991b1b',
                background:s==='approved'?'#f0fdf4':'#fef2f2',
                padding:'6px 10px',borderRadius:8,
                display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden',
              }}>💬 {idea.feedback}</div>
            )}
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8,flexShrink:0}}>
          <StatusBadge status={idea.status}/>
          {hasResp&&(
            <button onClick={onView} style={{
              padding:'5px 12px',borderRadius:8,border:'none',background:'#f3f4f6',
              color:'#374151',fontWeight:600,fontSize:12,cursor:'pointer',fontFamily:'inherit',
            }}>👁 Voir détails</button>
          )}
        </div>
      </div>
    </div>
  );
}