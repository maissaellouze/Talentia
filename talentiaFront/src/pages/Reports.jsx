import MainLayout from "../components/layout/MainLayout";
import React, { useState, useEffect } from "react";
// ─── Mock data (remplace par ton API) ────────────────────────────────────────
const MOCK_REPORTS = [
  { id: 1, title: "Système de recommandation d'emploi basé sur le Deep Learning", domain: "IA", author: "Ahmed Ben Ali", year: "2024", university: "ESPRIT", views: 342, description: "Ce projet explore l'utilisation des réseaux de neurones profonds pour personnaliser les recommandations d'offres d'emploi selon le profil du candidat. Le système atteint un taux de pertinence de 87% sur les données de test." },
  { id: 2, title: "Plateforme e-commerce avec microservices React & Node.js", domain: "Web", author: "Sarra Trabelsi", year: "2024", university: "INSAT", views: 215, description: "Conception et développement d'une architecture microservices pour une plateforme e-commerce moderne. Chaque service est indépendant, dockerisé et communique via une API Gateway avec gestion de cache Redis." },
  { id: 3, title: "Application mobile de suivi médical avec Flutter", domain: "Mobile", author: "Mohamed Chaabani", year: "2023", university: "FST", views: 189, description: "Application cross-platform permettant aux patients de suivre leurs indicateurs de santé (tension, glycémie, poids) et d'envoyer des alertes automatiques à leur médecin en cas d'anomalie détectée." },
  { id: 4, title: "Détection d'anomalies réseau par apprentissage automatique", domain: "IA", author: "Ines Hamdi", year: "2023", university: "ESPRIT", views: 410, description: "Système de cybersécurité basé sur des algorithmes de clustering (K-Means, DBSCAN) et de classification (Random Forest) pour détecter en temps réel les intrusions et anomalies dans le trafic réseau." },
  { id: 5, title: "Digitalisation des processus RH : ERP sur mesure", domain: "Web", author: "Youssef Khelil", year: "2023", university: "ISET", views: 98, description: "Développement d'un module ERP complet pour la gestion des ressources humaines intégrant : recrutement, paie, congés, évaluations de performances et tableaux de bord analytiques." },
  { id: 6, title: "Chatbot intelligent pour le support client bancaire", domain: "IA", author: "Rania Meddeb", year: "2024", university: "INSAT", views: 276, description: "Chatbot NLP basé sur BERT fine-tuné sur des données bancaires tunisiennes. Le système gère les demandes de solde, virements, réclamations et escalade automatiquement vers un agent humain si nécessaire." },
  { id: 7, title: "Système de gestion de bibliothèque universitaire", domain: "Web", author: "Nour Belhaj", year: "2022", university: "FST", views: 134, description: "Refonte complète du système de gestion de bibliothèque avec une interface web moderne, gestion des emprunts/retours, notifications automatiques et recherche full-text dans le catalogue en ligne." },
  { id: 8, title: "Application IoT pour la gestion d'énergie intelligente", domain: "IoT", author: "Bilel Mansouri", year: "2024", university: "ENIT", views: 305, description: "Réseau de capteurs ESP32 connectés au cloud via MQTT, avec un dashboard temps réel affichant la consommation électrique par pièce et des recommandations d'optimisation générées par IA." },
  { id: 9, title: "Plateforme d'apprentissage en ligne avec IA adaptative", domain: "IA", author: "Malek Zaidi", year: "2023", university: "ESPRIT", views: 488, description: "LMS intelligent qui adapte le contenu pédagogique et le rythme d'apprentissage à chaque étudiant grâce à un moteur de recommandation basé sur la théorie de la réponse aux items (IRT) et des modèles de connaissance bayésiens." },
];

const DOMAIN_COLORS = {
  IA:     { bg: "#ede9fe", text: "#7c3aed", dot: "#8b5cf6" },
  Web:    { bg: "#dbeafe", text: "#1d4ed8", dot: "#3b82f6" },
  Mobile: { bg: "#fce7f3", text: "#be185d", dot: "#ec4899" },
  IoT:    { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatBadge({ icon, value, label, color }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      padding: "20px 28px",
      display: "flex",
      alignItems: "center",
      gap: 16,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
      border: "1px solid #f1f5f9",
      minWidth: 160,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: color + "18",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

function ReportCardNew({ report, delay = 0, onView }) {
  const colors = DOMAIN_COLORS[report.domain] || { bg: "#f1f5f9", text: "#475569", dot: "#64748b" };
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onView && onView(report)}
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: "24px",
        border: `1.5px solid ${hovered ? "#0d9488" : "#f1f5f9"}`,
        boxShadow: hovered
          ? "0 8px 32px rgba(13,148,136,0.12)"
          : "0 1px 3px rgba(0,0,0,0.05)",
        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Domain badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          background: colors.bg, color: colors.text,
          fontSize: 11, fontWeight: 700, padding: "4px 10px",
          borderRadius: 20, letterSpacing: "0.04em", textTransform: "uppercase",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: colors.dot, display: "inline-block" }} />
          {report.domain}
        </span>
        <span style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
          👁 {report.views}
        </span>
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: 15, fontWeight: 700, color: "#0f172a",
        lineHeight: 1.5, margin: 0,
      }}>
        {report.title}
      </h3>

      {/* Meta */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b" }}>
          <span>👤</span>
          <span style={{ fontWeight: 600 }}>{report.author}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#94a3b8" }}>
          <span>🎓</span> {report.university}
          <span style={{ marginLeft: "auto" }}>📅 {report.year}</span>
        </div>
      </div>

      {/* CTA */}
      <div style={{
        marginTop: 4,
        paddingTop: 14,
        borderTop: "1px solid #f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <button
          onClick={(e) => { e.stopPropagation(); onView && onView(report); }}
          style={{
            background: hovered ? "#0d9488" : "transparent",
            color: hovered ? "#fff" : "#0d9488",
            border: "1.5px solid #0d9488",
            borderRadius: 10, padding: "8px 16px",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Voir le rapport →
        </button>
        <button style={{
          background: "transparent", border: "none",
          color: "#94a3b8", cursor: "pointer", fontSize: 18,
          transition: "color 0.2s",
        }}
          title="Télécharger"
        >⬇️</button>
      </div>
    </div>
  );
}

function SearchBarNew({ setQuery, query }) {
  return (
    <div style={{ position: "relative", flex: 1 }}>
      <span style={{
        position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
        fontSize: 16, color: "#94a3b8", pointerEvents: "none",
      }}>🔍</span>
      <input
        type="text"
        value={query}
        placeholder="Rechercher par titre, auteur, université..."
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "13px 16px 13px 44px",
          borderRadius: 14,
          border: "1.5px solid #e2e8f0",
          fontSize: 14,
          color: "#0f172a",
          background: "#fff",
          outline: "none",
          transition: "border-color 0.2s",
          boxSizing: "border-box",
          fontFamily: "inherit",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
        onFocus={e => e.target.style.borderColor = "#0d9488"}
        onBlur={e => e.target.style.borderColor = "#e2e8f0"}
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          style={{
            position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
            background: "#f1f5f9", border: "none", borderRadius: "50%",
            width: 22, height: 22, cursor: "pointer", color: "#64748b",
            fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >✕</button>
      )}
    </div>
  );
}

function FilterBarNew({ domain, setDomain, sort, setSort, year, setYear }) {
  const selectStyle = {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1.5px solid #e2e8f0",
    fontSize: 13,
    color: "#374151",
    background: "#fff",
    cursor: "pointer",
    outline: "none",
    fontFamily: "inherit",
    fontWeight: 500,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  };

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <select value={domain} onChange={e => setDomain(e.target.value)} style={selectStyle}>
        <option value="">🗂 Tous les domaines</option>
        <option value="IA">🤖 Intelligence Artificielle</option>
        <option value="Web">🌐 Web</option>
        <option value="Mobile">📱 Mobile</option>
        <option value="IoT">🔌 IoT</option>
      </select>

      <select value={year} onChange={e => setYear(e.target.value)} style={selectStyle}>
        <option value="">📅 Toutes les années</option>
        <option value="2024">2024</option>
        <option value="2023">2023</option>
        <option value="2022">2022</option>
      </select>

      <select value={sort} onChange={e => setSort(e.target.value)} style={selectStyle}>
        <option value="views">🔥 Plus consultés</option>
        <option value="date_desc">📅 Plus récents</option>
        <option value="date_asc">📅 Plus anciens</option>
        <option value="title">🔤 A → Z</option>
      </select>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("");
  const [sort, setSort] = useState("views");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

useEffect(() => {
  fetch("http://localhost:8000/reports/")
    .then(res => {
      if (!res.ok) {
        throw new Error("Erreur API");
      }
      return res.json();
    })
    .then(data => {
      if (Array.isArray(data)) {
        setReports(data);
      } else {
        console.error("Data non valide:", data);
        setReports([]);
      }
      setLoading(false);
    })
    .catch(err => {
      console.error("Erreur fetch:", err);

      // fallback si API ne marche pas
      setReports(MOCK_REPORTS);

      setLoading(false);
    });
}, []);

  // ── Filter + sort ──
  const filtered = reports
    .filter(r =>
      (domain === "" || r.domain === domain) &&
      (year === "" || r.year === year) &&
      (query === "" ||
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.author?.toLowerCase().includes(query.toLowerCase()) ||
        r.university?.toLowerCase().includes(query.toLowerCase()))
    )
    .sort((a, b) => {
      if (sort === "views")      return (b.views || 0) - (a.views || 0);
      if (sort === "date_desc")  return (b.year || 0) - (a.year || 0);
      if (sort === "date_asc")   return (a.year || 0) - (b.year || 0);
      if (sort === "title")      return a.title.localeCompare(b.title);
      return 0;
    });

  // ── Domain counts ──
  const counts = { total: reports.length };
  Object.keys(DOMAIN_COLORS).forEach(d => {
    counts[d] = reports.filter(r => r.domain === d).length;
  });

  return (
    <MainLayout>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{
          background: "linear-gradient(135deg, #0f172a 0%, #134e4a 100%)",
          borderRadius: 24,
          padding: "40px 48px",
          marginBottom: 32,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Decorative circles */}
          <div style={{
            position: "absolute", right: -40, top: -40,
            width: 220, height: 220, borderRadius: "50%",
            background: "rgba(13,148,136,0.15)",
          }} />
          <div style={{
            position: "absolute", right: 60, bottom: -60,
            width: 160, height: 160, borderRadius: "50%",
            background: "rgba(13,148,136,0.08)",
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(13,148,136,0.2)",
              border: "1px solid rgba(13,148,136,0.4)",
              borderRadius: 20, padding: "6px 14px",
              fontSize: 12, color: "#5eead4", fontWeight: 600,
              marginBottom: 16, letterSpacing: "0.05em",
            }}>
              📚 BIBLIOTHÈQUE PFE
            </div>
            <h1 style={{
              fontSize: 32, fontWeight: 800, color: "#fff",
              margin: "0 0 10px", lineHeight: 1.2,
            }}>
              Rapports de Fin d'Études
            </h1>
            <p style={{
              fontSize: 15, color: "#94a3b8", margin: 0, maxWidth: 480,
            }}>
              Explorez les travaux des anciens étudiants. Recherchez par domaine, année ou mots-clés.
            </p>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
          <StatBadge icon="📄" value={counts.total} label="Rapports disponibles" color="#0d9488" />
          <StatBadge icon="🤖" value={counts.IA || 0} label="Intelligence Artificielle" color="#8b5cf6" />
          <StatBadge icon="🌐" value={counts.Web || 0} label="Développement Web" color="#3b82f6" />
          <StatBadge icon="📱" value={counts.Mobile || 0} label="Mobile" color="#ec4899" />
        </div>

        {/* ── Search + Filters ── */}
        <div style={{
          background: "#fff",
          borderRadius: 18,
          padding: "20px 24px",
          marginBottom: 28,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          border: "1px solid #f1f5f9",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}>
          <SearchBarNew setQuery={setQuery} query={query} />
          <FilterBarNew
            domain={domain} setDomain={setDomain}
            sort={sort} setSort={setSort}
            year={year} setYear={setYear}
          />
        </div>

        {/* ── Results header ── */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}>
          <span style={{ fontSize: 14, color: "#64748b", fontWeight: 600 }}>
            {loading ? "Chargement..." : `${filtered.length} rapport${filtered.length > 1 ? "s" : ""} trouvé${filtered.length > 1 ? "s" : ""}`}
          </span>
          {(query || domain || year) && (
            <button
              onClick={() => { setQuery(""); setDomain(""); setYear(""); }}
              style={{
                background: "transparent", border: "1px solid #e2e8f0",
                borderRadius: 8, padding: "6px 12px", fontSize: 12,
                color: "#64748b", cursor: "pointer", fontWeight: 500,
              }}
            >
              ✕ Effacer les filtres
            </button>
          )}
        </div>

        {/* ── Grid Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {["total", "IA", "Web", "Mobile", "IoT"].map(d => (
              <button
                key={d}
                onClick={() => setDomain(d === "total" ? "" : d)}
                style={{
                  padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                  cursor: "pointer", border: "none", transition: "all 0.2s",
                  background: (domain === d || (d === "total" && domain === "")) ? "#0d9488" : "#f1f5f9",
                  color: (domain === d || (d === "total" && domain === "")) ? "#fff" : "#64748b",
                }}
              >
                {d === "total" ? "Tout" : d} ({counts[d]})
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setShowUpload(true)}
            style={{ 
              background: "#0d9488", color: "#fff", border: "none", padding: "10px 20px", 
              borderRadius: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(13,148,136,0.2)" 
            }}
          >
            + Soumettre mon Rapport
          </button>
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background: "#f8fafc", borderRadius: 20, height: 200, animation: "pulse 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: 20, border: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ color: "#0f172a", fontWeight: 700, margin: "0 0 8px" }}>Aucun rapport trouvé</h3>
            <p style={{ color: "#94a3b8", margin: 0 }}>Essayez d'autres mots-clés ou modifiez vos filtres.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {filtered.map((report, i) => (
              <ReportCardNew 
                key={report.id} 
                report={report} 
                delay={i * 60} 
                onView={async (r) => {
                  setSelectedReport(r);
                  // Increment view on backend
                  try { await fetch(`http://localhost:8000/reports/${r.id}/view`, { method: "PATCH" }); } catch {}
                }} 
              />
            ))}
          </div>
        )}

      </div>

      {/* ── Submition Modal ── */}
      {showUpload && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 500, padding: 32, position: "relative" }}>
            <button onClick={() => setShowUpload(false)} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", fontSize: 24, cursor: "pointer" }}>×</button>
            <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 800 }}>Soumettre un Rapport</h2>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>Partagez votre travail avec la communauté TalentIA.</p>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              try {
                const res = await fetch("http://localhost:8000/reports/upload", { method: "POST", body: fd });
                if (res.ok) { setShowUpload(false); window.location.reload(); }
              } catch (err) { alert("Erreur lors de l'envoi"); }
            }}>
              <div style={{ display: "grid", gap: 16 }}>
                <input name="title" placeholder="Titre du projet" required style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14 }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <select name="domain" required style={{ padding: "12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14 }}>
                    <option value="IA">🤖 IA</option>
                    <option value="Web">🌐 Web</option>
                    <option value="Mobile">📱 Mobile</option>
                    <option value="IoT">🔌 IoT</option>
                  </select>
                  <input name="year" placeholder="Année (ex: 2024)" required style={{ padding: "12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14 }} />
                </div>
                <input name="author" placeholder="Votre Nom Complet" required style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14 }} />
                <input name="university" placeholder="Université / École" required style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14 }} />
                <textarea name="description" placeholder="Court résumé de votre PFE..." style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, minHeight: 80 }} />
                <div style={{ border: "2px dashed #cbd5e1", borderRadius: 12, padding: 20, textAlign: "center" }}>
                   <input type="file" name="file" accept=".pdf" required style={{ fontSize: 13 }} />
                   <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>Format PDF uniquement</div>
                </div>
                <button type="submit" style={{ background: "#0d9488", color: "#fff", border: "none", padding: "14px", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 8 }}>Publier le Rapport</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedReport && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setSelectedReport(null)}>
          <div style={{
            background: '#fff', borderRadius: 24, width: '90%', maxWidth: 640,
            maxHeight: '90vh', overflowY: 'auto', padding: '36px 40px', position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedReport(null)} style={{
              position: 'absolute', top: 16, right: 16, background: '#f3f4f6', border: 'none',
              width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold', fontSize: 16
            }}>✕</button>

            {/* Domain badge */}
            {(() => {
              const dColors = DOMAIN_COLORS[selectedReport.domain] || { bg: '#f1f5f9', text: '#475569', dot: '#64748b' };
              return (
                <span style={{ background: dColors.bg, color: dColors.text, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 16 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: dColors.dot, display: 'inline-block' }} />
                  {selectedReport.domain}
                </span>
              );
            })()}

            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 16, lineHeight: 1.4 }}>
              {selectedReport.title}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 16px' }}>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>AUTEUR</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedReport.author || 'Anonyme'}</div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 16px' }}>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>UNIVERSITÉ</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedReport.university || 'Non précisé'}</div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 16px' }}>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>ANNÉE</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedReport.year || 'N/A'}</div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 16px' }}>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>VUES</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>👁 {selectedReport.views || 0}</div>
              </div>
            </div>

            {selectedReport.description && (
              <>
                <h3 style={{ fontWeight: 700, marginBottom: 10, color: '#0f172a' }}>Résumé</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: '#374151', marginBottom: 24 }}>{selectedReport.description}</p>
              </>
            )}

            {selectedReport.url ? (
              <a href={selectedReport.url} target="_blank" rel="noreferrer" style={{
                display: 'block', textAlign: 'center', background: '#0d9488', color: '#fff',
                padding: '12px', borderRadius: 12, fontWeight: 700, textDecoration: 'none',
              }}>
                Télécharger / Voir le PDF →
              </a>
            ) : (
              <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: '12px', background: '#f9fafb', borderRadius: 12 }}>
                📄 Document disponible en consultation seule
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </MainLayout>
  );
};

export default Reports;
