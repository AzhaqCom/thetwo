import React, { useEffect, useRef, useMemo } from 'react';
import { getIconForType } from './Icons';
import '../CombatLog.css';

const CombatLogEntry = React.memo(({ entry, index }) => (
  <p key={index} className={entry.type}>
    {getIconForType(entry.type)}
    {entry.message}
  </p>
));

const CombatLog = ({ logMessages = [] }) => {
  const logRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logMessages]);

  // Memoize the log entries to prevent unnecessary re-renders
  const logEntries = useMemo(() => 
    logMessages.map((entry, index) => (
      <CombatLogEntry key={`${index}-${entry.message}`} entry={entry} index={index} />
    )), 
    [logMessages]
  );

  if (logMessages.length === 0) {
    return null;
  }

  return (
    <div id="combat-log">
      <div id="log-entries" ref={logRef}>
        <strong>Journal :</strong>
        {logEntries}
      </div>
    </div>
  );
};

export default React.memo(CombatLog);