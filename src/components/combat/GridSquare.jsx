import React from 'react';

const GridSquare = ({ x, y, onClick, className = '', children }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(x, y);
    }
  };

  return (
    <div 
      className={`grid-square ${className}`}
      onClick={handleClick}
      data-x={x}
      data-y={y}
    >
      {children}
    </div>
  );
};

export default React.memo(GridSquare);