import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CompanyCard from '../../components/companies/CompanyCard';

export default function OpportunitiesPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Calling the real backend with Student ID 1 (Mayssam)
        axios.get('http://127.0.0.1:8000/opportunities/?student_id=1')
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div style={{ padding: '50px', backgroundColor: '#F9FAFB' }}>
            <h1 style={{ marginBottom: '30px', fontWeight: 'bold' }}>Recommandations pour vous 🎯</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {data.map((item) => (
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
                            average_rating: item.match_score / 20, // Converts score to stars
                            review_count: item.match_score
                        }} />
                    </div>
                ))}
            </div>
        </div>
    );
}