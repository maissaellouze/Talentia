import React, { useState, useEffect } from 'react';
import CompanyCard from '../../components/companies/CompanyCard';

export default function OpportunitiesPage() {
    // 1. Defined all necessary state setters
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 2. Fetching from your FastAPI backend
        fetch('http://localhost:8000/opportunities/?student_id=1')
            .then((res) => {
                // Handle the 404 gracefully if the CV doesn't exist yet
                if (res.status === 404) return [];
                if (!res.ok) throw new Error("Failed to connect to backend");
                return res.json();
            })
            .then((data) => {
                // 3. Updated to use setOpportunities correctly
                setOpportunities(data);
                setLoading(false);
            })
            .catch((err) => {
                // 4. Fixed the 'setError is not defined' crash
                console.error("Fetch error:", err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    // 5. Added Loading and Error UI states for better UX
    if (loading) return <div style={{ padding: '50px' }}>Chargement des recommandations...</div>;
    if (error) return <div style={{ padding: '50px', color: 'red' }}>Erreur: {error}</div>;

    return (
        <div style={{ padding: '50px', backgroundColor: '#F9FAFB' }}>
            <h1 style={{ marginBottom: '30px', fontWeight: 'bold' }}>Recommandations pour vous 🎯</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {opportunities.length > 0 ? (
                    opportunities.map((item) => (
                        <div key={item.internship.id} style={{ position: 'relative' }}>
                            {/* The Badge showing the AI Score */}
                            <div style={{
                                position: 'absolute', top: '15px', right: '15px', zIndex: 2,
                                backgroundColor: '#0d9488', color: 'white', padding: '5px 10px',
                                borderRadius: '10px', fontWeight: 'bold'
                            }}>
                                {item.match_score}% Match
                            </div>

                            <CompanyCard company={{
                                id: item.internship.id,
                                name: item.internship.company_name,
                                activity: item.internship.title,
                                sector: item.internship.sector,
                                city: item.internship.location,
                                // Mock values for the stars based on match score
                                average_rating: item.match_score / 20,
                                review_count: Math.round(item.match_score)
                            }} />
                        </div>
                    ))
                ) : (
                    <p>Aucune opportunité trouvée pour le moment.</p>
                )}
            </div>
        </div>
    );
}