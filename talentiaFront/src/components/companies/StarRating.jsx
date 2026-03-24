import React, { useState } from 'react';

const StarRating = ({ rating = 0, maxStars = 5, onRatingChange = null, size = 18, color = "#eab308" }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (selectedRating) => {
    if (onRatingChange) {
      onRatingChange(selectedRating);
    }
  };

  const currentSelection = hoverRating || rating;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= currentSelection;
        
        return (
          <span
            key={index}
            onClick={() => onRatingChange && handleClick(starValue)}
            onMouseEnter={() => onRatingChange && setHoverRating(starValue)}
            onMouseLeave={() => onRatingChange && setHoverRating(0)}
            style={{
              cursor: onRatingChange ? 'pointer' : 'default',
              fontSize: size,
              color: isFilled ? color : '#d1d5db',
              transition: 'all 0.2s ease',
              transform: (onRatingChange && starValue <= hoverRating) ? 'scale(1.2)' : 'none'
            }}
          >
            {isFilled ? '★' : '☆'}
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;
