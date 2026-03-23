import React, { useState } from 'react';

const getInitials = (name) => {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
};

const getCompanyColor = (id) => {
  const colors = ["#0d9488", "#14b8a6", "#2563eb", "#f97316", "#8b5cf6"];
  return colors[id % colors.length];
};

export default function CompanyCard({ company }) {
  const [hovered, setHovered] = useState(false);
  const color = getCompanyColor(company.id || 0);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#fff',
        borderRadius: 24,
        boxShadow: hovered ? '0 10px 40px rgba(0,0,0,.08)' : '0 4px 14px rgba(0,0,0,.03)',
        border: '1px solid #e5e5ec',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-4px)' : 'none'
      }}
    >
      {/* Header Gradient */}
      <div
        style={{
          padding: '24px',
          background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        {company.logo ? (
          <img
            src={company.logo}
            alt={company.name || ""}
            style={{
              width: 64, height: 64, borderRadius: '50%',
              objectFit: 'cover', border: '2px solid #fff',
              background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,.15)'
            }}
          />
        ) : (
          <div
            style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#fff', color: color,
              border: '2px solid #fff', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700,
              fontFamily: '"Clash Display", sans-serif',
              boxShadow: '0 4px 12px rgba(0,0,0,.15)'
            }}
          >
            {getInitials(company.name)}
          </div>
        )}

        <div style={{ flex: 1, overflow: 'hidden' }}>
          <h3 style={{
            margin: '0 0 4px 0', fontSize: 18, fontWeight: 700,
            whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden',
            fontFamily: '"Clash Display", sans-serif'
          }}>
            {company.name || "Entreprise sans nom"}
          </h3>
          {company.verified_status && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'rgba(255,255,255,0.2)', padding: '2px 8px',
              borderRadius: 12, fontSize: 11, fontWeight: 600
            }}>
              ✓ Vérifié
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {company.sector && (
            <span style={{
              padding: '4px 10px', background: '#f0fdfa', color: '#0d9488',
              borderRadius: 12, fontSize: 11, fontWeight: 600, border: '1px solid #ccfbf1'
            }}>
              {company.sector}
            </span>
          )}
          {company.activity && (
            <span style={{
              padding: '4px 10px', background: '#f3f4f6', color: '#4b5563',
              borderRadius: 12, fontSize: 11, fontWeight: 600, border: '1px solid #e5e7eb'
            }}>
              {company.activity}
            </span>
          )}
        </div>

        {/* Location & Contact Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flexGrow: 1 }}>
          {company.city && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4b5563' }}>
              <span style={{ color: '#0d9488' }}>📍</span>
              {company.city} {company.code_postal && `, ${company.code_postal}`}
            </div>
          )}
          {company.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4b5563' }}>
              <span style={{ color: '#0d9488' }}>✉️</span>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{company.email}</span>
            </div>
          )}
          {company.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4b5563' }}>
              <span style={{ color: '#0d9488' }}>📞</span>
              {company.phone}
            </div>
          )}
          {company.website && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4b5563' }}>
              <span style={{ color: '#0d9488' }}>🌐</span>
              <a href={company.website} target="_blank" rel="noreferrer" style={{
                color: 'inherit', textDecoration: 'none'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#0d9488'; e.currentTarget.style.textDecoration = 'underline'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'inherit'; e.currentTarget.style.textDecoration = 'none'; }}
              >
                {company.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>

        {/* Rating */}
        {company.average_rating ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            marginTop: 16, padding: '8px 12px', background: '#fdfbf0',
            border: '1px solid #fef08a', borderRadius: 12
          }}>
            <span style={{ color: '#eab308' }}>⭐</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0a0a12' }}>
              {company.average_rating.toFixed(1)}
            </span>
            <span style={{ fontSize: 11, color: '#6b7280' }}>
              ({company.review_count} avis)
            </span>
          </div>
        ) : null}
      </div>

      {/* Social Media Footer */}
      {company.social_media && (company.social_media.linkedin || company.social_media.facebook || company.social_media.instagram) && (
        <div style={{
          padding: '12px 24px', borderTop: '1px solid #e5e5ec',
          background: '#fafaf8', display: 'flex', justifyContent: 'flex-end', gap: 12
        }}>
          {company.social_media.linkedin && (
            <a href={company.social_media.linkedin} target="_blank" rel="noreferrer" style={{ fontSize: 14, textDecoration: 'none' }}>💼</a>
          )}
          {company.social_media.facebook && (
            <a href={company.social_media.facebook} target="_blank" rel="noreferrer" style={{ fontSize: 14, textDecoration: 'none' }}>📘</a>
          )}
          {company.social_media.instagram && (
            <a href={company.social_media.instagram} target="_blank" rel="noreferrer" style={{ fontSize: 14, textDecoration: 'none' }}>📸</a>
          )}
        </div>
      )}
    </div>
  );
}
