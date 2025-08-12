import React from 'react';

export const XPBar = ({ currentXP, nextLevelXP, xpProgress }) => (
  <div className="xp-bar">
    <h4>Expérience</h4>
    <div className="stat-block xp-bar-container">
      <div className="xp-text">
        <span>✨ XP: {currentXP}/{nextLevelXP}</span>
      </div>
      <div className="xp-bar-background">
        <div
          className="xp-bar-fill"
          style={{ width: `${xpProgress}%` }}
        />
      </div>
    </div>
  </div>
);