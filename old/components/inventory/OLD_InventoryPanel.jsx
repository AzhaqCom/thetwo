import React, { useState, useMemo } from 'react';
import { CollapsibleSection } from '../ui/CollapsibleSection';
import { InventoryItem } from './InventoryItem';

const InventoryPanel = ({ characterInventory = [], onUseItem }) => {
  const [inventoryVisible, setInventoryVisible] = useState(false);

  const inventoryItems = useMemo(() => {
    if (characterInventory.length === 0) {
      return <li>Ton inventaire est vide.</li>;
    }

    return characterInventory.map((item) => (
      <InventoryItem 
        key={item.id} 
        item={item} 
        onUseItem={onUseItem} 
      />
    ));
  }, [characterInventory, onUseItem]);

  return (
    <div className="inventory">
      <CollapsibleSection
        title="Inventaire"
        isVisible={inventoryVisible}
        onToggle={() => setInventoryVisible(!inventoryVisible)}
      >
        <ul>
          {inventoryItems}
        </ul>
      </CollapsibleSection>
    </div>
  );
};

export default React.memo(InventoryPanel);