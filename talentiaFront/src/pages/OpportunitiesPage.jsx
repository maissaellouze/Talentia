import React, { useState, useEffect } from 'react';
import OpportunityCard from './OpportunityCard';
import { Loader2, Sparkles } from 'lucide-react'; // If you have lucide-react installed

const OpportunitiesPage = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Calling your Talentia backend endpoint
    fetch('http://localhost:8000/opportunities/?student_id=1')
      .then((res) => {
        if (!res.ok) throw new Error("Failed to connect to backend");
        return res.json();
      })
      .then((data) => {
        setOpportunities(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Finding the best matches for your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-100 rounded-xl mt-10">
        <p className="text-red-600 font-semibold">Backend Connection Error</p>
        <p className="text-red-400 text-sm">Make sure your FastAPI server is running on port 8000.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            AI Matches <Sparkles className="text-blue-500 w-6 h-6" />
          </h1>
          <p className="text-gray-500 mt-1">Personalized opportunities for your career path.</p>
        </div>
        <div className="text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
          {opportunities.length} Opportunities Found
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {opportunities.length > 0 ? (
          opportunities.map((item, index) => (
            <OpportunityCard key={index} data={item} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl">
            <p className="text-gray-400">No internships found matching your skills yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpportunitiesPage;