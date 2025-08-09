import React from 'react';

export const CollapsibleSection = ({ 
  title, 
  isVisible, 
  onToggle, 
  children, 
  className = '' 
}) => (
  <div className={`collapsible-section ${className}`}>
    <h4 
      onClick={onToggle} 
      style={{ cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onToggle()}
    >
      {title} {isVisible ? '▼' : '►'}
    </h4>
    {isVisible && children}
  </div>
);