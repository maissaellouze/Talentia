import React from "react";

const SearchBar = ({ setQuery }) => {
  return (
    <input
      type="text"
      placeholder="🔍 Rechercher un rapport..."
      onChange={(e) => setQuery(e.target.value)}
      className="w-full p-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
};

export default SearchBar;