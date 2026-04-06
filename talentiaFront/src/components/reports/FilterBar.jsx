import React from "react";

const FilterBar = ({ setDomain, setSort }) => {
  return (
    <div className="flex gap-4 mt-4 flex-wrap">

      <select
        onChange={(e) => setDomain(e.target.value)}
        className="p-2 rounded-lg border shadow-sm"
      >
        <option value="">Tous domaines</option>
        <option value="IA">IA</option>
        <option value="Web">Web</option>
      </select>

      <select
        onChange={(e) => setSort(e.target.value)}
        className="p-2 rounded-lg border shadow-sm"
      >
        <option value="date">Plus récents</option>
        <option value="title">A-Z</option>
      </select>

    </div>
  );
};

export default FilterBar;