import React, { useEffect, useState } from "react";
import CompanyCard from "../components/companies/CompanyCard";
import CompaniesFilter from "../components/companies/CompaniesFilter";
import CompanyModal from "../components/companies/CompanyModal";
import MainLayout from "../components/layout/MainLayout";

// ─── COULEURS ISSAT ───────────────────────────────────────────────────────────
const COLORS = {
  blueMain: '#6391B9',    // Bleu ISSAT
  blueDark: '#2B547E',    // Bleu foncé
  bgDark: '#1e1e2e',      // Fond sombre
  grayText: '#6b7280',
  white: '#ffffff'
};

const API_BASE_URL = "http://127.0.0.1:8000";

const CompaniesDashboard = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [sectors, setSectors] = useState([]);
  const [cities, setCities] = useState([]);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pageSize = 12;

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [page, searchTerm, selectedSector, selectedCity]);

  const fetchFilters = async () => {
    setFiltersLoading(true);
    try {
      const [sectorsRes, citiesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/filters/sectors`),
        fetch(`${API_BASE_URL}/filters/cities`),
      ]);

      if (sectorsRes.ok) {
        const sectorsData = await sectorsRes.json();
        setSectors(Array.isArray(sectorsData) ? sectorsData : []);
      }

      if (citiesRes.ok) {
        const citiesData = await citiesRes.json();
        setCities(Array.isArray(citiesData) ? citiesData : []);
      }
    } catch (err) {
      console.error("Error fetching filters:", err);
    } finally {
      setFiltersLoading(false);
    }
  };

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      if (searchTerm) params.append("search", searchTerm);
      if (selectedSector) params.append("sector", selectedSector);
      if (selectedCity) params.append("city", selectedCity);

      const response = await fetch(
        `${API_BASE_URL}/societes/paginated?${params}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch companies: ${response.status}`);
      }

      const data = await response.json();
      setCompanies(data.data || []);
      setTotalPages(data.total_pages || 1);
      setTotalCompanies(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSector("");
    setSelectedCity("");
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCompanyClick = (company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const handleReviewAdded = () => {
    fetchCompanies(); // Refresh company list to update ratings
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const activeStats = [
    { icon: '🏢', value: totalCompanies, label: 'Partenaires' },
    { icon: '🗂️', value: sectors.length, label: 'Secteurs' },
    { icon: '📍', value: cities.length, label: 'Villes' },
    { icon: '✨', value: 'IA', label: 'Match Intelligent' },
  ];

  return (
    <MainLayout>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    <div
      style={{
        minHeight: "100%",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Segoe UI', sans-serif",
        paddingBottom: 64,
        background: '#f7f8fa'
      }}
    >
      {/* Background Decorators */}
      <div style={{
        position: 'absolute', top: -200, right: -150, width: 700, height: 700,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(99, 145, 185,.1), transparent 65%)',
        pointerEvents: 'none', zIndex: 0
      }} />
      <div style={{
        position: 'absolute', bottom: -80, left: -80, width: 450, height: 450,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(99, 145, 185,.05), transparent 65%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto',
        padding: '32px 32px 64px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* ── Hero Banner ─────────────────────────────────────── */}
        <div style={{
          borderRadius: 20,
          background: 'linear-gradient(135deg, #1e1e2e 0%, #2B547E 50%, #6391B9 100%)',
          padding: '40px 48px',
          marginBottom: 28,
          position: 'relative',
          overflow: 'hidden',
          animation: 'fadeUp 0.5s ease both'
        }}>
          {/* decorative blobs */}
          <div style={{
            position: 'absolute', top: -60, right: -60, width: 260, height: 260,
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,184,166,.25), transparent 65%)',
            pointerEvents: 'none'
          }} />
          
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
            ✦ Entreprises Partenaires
          </div>

          <h1 style={{
            margin: '0 0 12px', fontSize: 34, fontWeight: 800, color: '#fff',
            fontFamily: "'Segoe UI', sans-serif", letterSpacing: '-0.02em', lineHeight: 1.2
          }}>
            Découvrez le Réseau TalentIA
          </h1>
          <p style={{
            margin: 0, fontSize: 15, color: 'rgba(255,255,255,.65)', maxWidth: 520, lineHeight: 1.7
          }}>
            Explorez les meilleures entreprises technologiques et trouvez 
            l'environnement idéal pour propulser votre carrière.
          </p>
        </div>

        {/* ── Stats Row ──────────────────────────────────────── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16, marginBottom: 28,
          animation: 'fadeUp 0.5s 0.1s ease both'
        }}>
          {activeStats.map(({ icon, value, label }, i) => (
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
                  {loading && !companies.length ? '—' : value}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2, fontWeight: 500 }}>
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Section */}
        <CompaniesFilter 
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          selectedSector={selectedSector} setSelectedSector={setSelectedSector}
          selectedCity={selectedCity} setSelectedCity={setSelectedCity}
          sectors={sectors} cities={cities}
          filtersLoading={filtersLoading}
          onClear={clearFilters}
        />

        {/* Results Metadata & Tags */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px', marginBottom: 24, minHeight: 32 }}>
          <p style={{ margin: 0, fontSize: 14, color: '#6b7280', fontWeight: 500 }}>
            {!loading && totalCompanies > 0 ? (
              <span><strong style={{ color: '#0a0a12' }}>{totalCompanies}</strong> entreprise{totalCompanies > 1 ? 's' : ''} trouvée{totalCompanies > 1 ? 's' : ''}</span>
            ) : " "}
          </p>
          {!loading && !error && companies.length > 0 && (
            <span style={{
              background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
              padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: 6
            }}>
              ✨ Recommandations IA disponibles
            </span>
          )}
        </div>

        {/* Error Handling */}
        {error && (
          <div style={{
            padding: '16px 24px', background: '#fef2f2', border: '1px solid #fecaca',
            color: '#ef4444', borderRadius: 16, marginBottom: 24, fontSize: 14
          }}>
            {error}
          </div>
        )}

        {/* Grid Container */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 24,
          marginBottom: 48
        }}>
          {loading ? (
            // Skeleton Loader matching CompanyCard structure
            Array(12).fill(null).map((_, i) => (
              <div key={i} style={{ 
                background: '#fff', borderRadius: 24, border: '1px solid #e5e5ec', 
                height: 380, overflow: 'hidden', display: 'flex', flexDirection: 'column'
              }}>
                <div style={{ background: '#f5f5f7', height: 110, padding: 24 }} />
                <div style={{ padding: 24, flexGrow: 1 }}>
                   <div style={{ display: 'flex', gap: 16, marginTop: -40 }}>
                     <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e5e5ec', border: '2px solid #fff' }} />
                     <div style={{ flex: 1, marginTop: 40 }}>
                       <div style={{ height: 20, width: '80%', background: '#f5f5f7', borderRadius: 4, marginBottom: 8 }} />
                       <div style={{ height: 16, width: '40%', background: '#f5f5f7', borderRadius: 4 }} />
                     </div>
                   </div>
                   <div style={{ marginTop: 24 }}>
                     <div style={{ height: 16, width: '60%', background: '#f5f5f7', borderRadius: 4, marginBottom: 16 }} />
                     <div style={{ height: 16, width: '90%', background: '#f5f5f7', borderRadius: 4, marginBottom: 12 }} />
                     <div style={{ height: 16, width: '70%', background: '#f5f5f7', borderRadius: 4 }} />
                   </div>
                </div>
              </div>
            ))
          ) : !error && companies.length === 0 ? (
            // Empty State
            <div style={{
              gridColumn: '1 / -1',
              padding: 60, textAlign: 'center', background: '#fff',
              borderRadius: 24, border: '1px solid #e5e5ec'
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: 24, background: '#f0fdfa',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px', fontSize: 32
              }}>
                🏢
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', fontFamily: '"Clash Display", sans-serif' }}>
                Aucune entreprise trouvée
              </h3>
              <p style={{ color: '#6b7280', margin: 0, fontSize: 15 }}>
                Essayez d'ajuster vos filtres de recherche ou réinitialisez les critères.
              </p>
              {(searchTerm || selectedSector || selectedCity) && (
                <button 
                  onClick={clearFilters}
                  style={{ 
                    marginTop: 24, padding: '12px 24px', background: '#6391B9', 
                    color: '#fff', border: 'none', borderRadius: 12, fontWeight: 600,
                    cursor: 'pointer', fontSize: 14 
                  }}
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          ) : (
            companies.map(company => (
              <CompanyCard 
                key={company.id} 
                company={company} 
                onClick={handleCompanyClick}
              />
            ))
          )}
        </div>

        {/* Company Modal */}
        {isModalOpen && selectedCompany && (
          <CompanyModal 
            company={selectedCompany} 
            onClose={() => setIsModalOpen(false)}
            onReviewAdded={handleReviewAdded}
          />
        )}

        {/* Pagination Controls */}
        {!loading && !error && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 48 }}>
            <button
               disabled={page === 1}
               onClick={() => handlePageChange(page - 1)}
               style={{
                 width: 40, height: 40, borderRadius: 12,
                 border: '1.5px solid #e5e5ec', background: '#fff',
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 cursor: page === 1 ? 'not-allowed' : 'pointer',
                 opacity: page === 1 ? 0.5 : 1, fontSize: 16, color: '#0a0a12'
               }}
            >
              ←
            </button>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: 40, padding: '0 20px', borderRadius: 12,
              background: '#6391B9', color: '#fff', fontSize: 14, fontWeight: 700,
              boxShadow: '0 4px 14px rgba(99, 145, 185,.25)'
            }}>
              {page} / {totalPages}
            </div>
            <button
               disabled={page === totalPages}
               onClick={() => handlePageChange(page + 1)}
               style={{
                 width: 40, height: 40, borderRadius: 12,
                 border: '1.5px solid #e5e5ec', background: '#fff',
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 cursor: page === totalPages ? 'not-allowed' : 'pointer',
                 opacity: page === totalPages ? 0.5 : 1, fontSize: 16, color: '#0a0a12'
               }}
            >
              →
            </button>
          </div>
        )}
      </div>
     </div>
  </MainLayout>
  );
};


export default CompaniesDashboard;