import React from 'react';
// On importe l'image directement ici
import logoImg from '../../assets/logo-issat.png'; 

/**
 * Composant Logo pour ISSATSO Talent Portal.
 * Affiche l'image en l'agrandissant.
 */
export default function Logo({ size = 150 }) { // Taille par défaut augmentée à 150px
  return (
    <div style={{ 
      display: 'inline-flex', // Utilisation de inline-flex pour ne pas prendre toute la largeur
      alignItems: 'center', 
      justifyContent: 'center',
      // On définit la hauteur basée sur 'size'
      height: size,
      // On laisse la largeur en 'auto' ou on l'adapte pour éviter de compresser l'image
      minWidth: size, 
    }}>
      <img 
        src={logoImg} 
        alt="Logo ISSAT Sousse" 
        style={{ 
          height: '100%', 
          width: 'auto', // Important : garde le ratio original
          display: 'block',
          objectFit: 'contain', // Garantit que l'image entière est visible sans rognage
          backgroundColor: 'transparent' // S'assure qu'aucun fond ne vient polluer le PNG
        }} 
      />
    </div>
  );
}