import React from "react";

const ReportCard = ({ report }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 hover:shadow-xl transition duration-300">
      
      <h2 className="text-lg font-semibold text-gray-800">
        {report.title}
      </h2>

      <p className="text-sm text-gray-500 mt-2">
        📌 Domaine: {report.domain}
      </p>

      <p className="text-xs text-gray-400 mt-1">
        📅 {report.created_at}
      </p>

      <button className="mt-4 text-blue-600 font-medium hover:underline">
        Voir rapport →
      </button>

    </div>
  );
};

export default ReportCard;