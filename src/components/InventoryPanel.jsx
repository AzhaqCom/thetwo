import React, { useState } from 'react';

const InventoryPanel = ({ characterInventory, onUseItem }) => {
    const [inventoryVisible, setinventoryVisible] = useState(false);

    // Fonction pour basculer la visibilité
    const toggleInventory = () => {
        setinventoryVisible(!inventoryVisible);
    };
    return (
        <div className="inventory">
            <h4 onClick={toggleInventory} style={{ cursor: 'pointer' }}> Inventaire {inventoryVisible ? '▼' : '►'}</h4>
            {inventoryVisible && (

                <ul>
                    {characterInventory.length === 0 ? (
                        <li>Ton inventaire est vide.</li>
                    ) : (
                        characterInventory.map((item) => (
                            <li key={item.id} className='item'>
                                <strong>{item.name}</strong> <span>{item.description}</span>
                                <button onClick={() => onUseItem(item)}>Utiliser</button>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};

export default InventoryPanel;