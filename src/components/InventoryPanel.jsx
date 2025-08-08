import React from 'react';

const InventoryPanel = ({ characterInventory, onUseItem }) => {
    return (
        <div className="inventory">
            <h4>Inventaire</h4>
            <ul>
                {characterInventory.length === 0 ? (
                    <li>Ton inventaire est vide.</li>
                ) : (
                    characterInventory.map((item) => (
                        <li key={item.id}>
                            <strong>{item.name}</strong> {item.description}
                            <button onClick={() => onUseItem(item)}>Utiliser</button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default InventoryPanel;