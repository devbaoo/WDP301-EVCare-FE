import React from 'react';
import { StarFilled, StarOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'small' | 'default' | 'large';
  showNumber?: boolean;
  tooltip?: string;
  className?: string;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'default',
  showNumber = false,
  tooltip,
  className = '',
  interactive = false,
  onRatingChange
}) => {
  const sizeMap = {
    small: '12px',
    default: '16px',
    large: '20px'
  };

  const handleStarClick = (starIndex: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  const stars = [];
  const fullStars = Math.floor(rating);
  

  // Tạo sao đầy
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <StarFilled
        key={i}
        style={{ 
          color: '#faad14', 
          fontSize: sizeMap[size],
          marginRight: '2px',
          cursor: interactive ? 'pointer' : 'default'
        }}
        onClick={() => handleStarClick(i)}
      />
    );
  }

  // Tạo sao rỗng
  for (let i = fullStars; i < maxRating; i++) {
    stars.push(
      <StarOutlined
        key={i}
        style={{ 
          color: '#d9d9d9', 
          fontSize: sizeMap[size],
          marginRight: '2px',
          cursor: interactive ? 'pointer' : 'default'
        }}
        onClick={() => handleStarClick(i)}
      />
    );
  }

  const content = (
    <div className={`flex items-center ${className}`}>
      <div className="flex items-center">
        {stars}
      </div>
      {showNumber && (
        <span className="ml-1 text-sm text-gray-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip}>
        {content}
      </Tooltip>
    );
  }

  return content;
};

export default StarRating;
