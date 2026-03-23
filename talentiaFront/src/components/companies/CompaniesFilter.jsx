import React from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

export default function CompaniesFilter({
  searchTerm, setSearchTerm,
  selectedSector, setSelectedSector,
  selectedCity, setSelectedCity,
  sectors, cities, filtersLoading, onClear
}) {
  
  return (
    <div style={{
      padding: '24px',
      marginBottom: '32px',
      borderRadius: 24,
      border: '1px solid #e5e5ec',
      background: '#fff',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      alignItems: 'center',
      boxShadow: '0 4px 14px rgba(0,0,0,.03)'
    }}>
      <div style={{ flex: '1 1 300px', position: 'relative' }}>
        <Input 
          placeholder="Rechercher une entreprise ou activité..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            style={{
              position: 'absolute', right: 12, top: 12,
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#6b7280', fontSize: 16
            }}
          >
            ✕
          </button>
        )}
      </div>

      <div style={{ flex: '1 1 200px', display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <Select 
            value={selectedSector} 
            onChange={(e) => setSelectedSector(e.target.value)}
            disabled={filtersLoading}
          >
            <option value="">Tous les secteurs</option>
            {sectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </Select>
        </div>

        <div style={{ flex: 1 }}>
          <Select 
            value={selectedCity} 
            onChange={(e) => setSelectedCity(e.target.value)}
            disabled={filtersLoading}
          >
            <option value="">Toutes les villes</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </Select>
        </div>
      </div>

      <div style={{ width: '120px' }}>
        <Button variant="ghost" onClick={onClear} fullWidth style={{ height: 46, borderRadius: 10 }}>
          Effacer
        </Button>
      </div>
    </div>
  );
}
