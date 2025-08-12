import React, { useCallback } from 'react';

export const InventoryItem = React.memo(({ item, onUseItem }) => {
  const handleUse = useCallback(() => {
    onUseItem(item);
  }, [item, onUseItem]);

  return (
    <li className="item">
      <strong>{item.name}</strong>
      <span>{item.description}</span>
      <button onClick={handleUse}>Utiliser</button>
    </li>
  );
});