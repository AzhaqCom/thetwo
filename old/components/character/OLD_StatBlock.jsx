import React from 'react';

export const StatBlock = ({ label, value, className = '' }) => (
  <div className={`stat-block ${className}`}>
    <span>{label}: {value}</span>
  </div>
);