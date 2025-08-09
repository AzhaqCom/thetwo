import { useCallback } from 'react';
import { items } from '../data/items';

export const useInventoryActions = (
    playerCharacter,
    setPlayerCharacter,
    addCombatMessage
) => {
    const handleItemGain = useCallback((itemNames) => {
        const itemsToProcess = Array.isArray(itemNames) ? itemNames : [itemNames];

        itemsToProcess.forEach(itemName => {
            const itemToAdd = items[itemName];
            if (itemToAdd) {
                setPlayerCharacter(prev => ({
                    ...prev,
                    inventory: [...prev.inventory, { ...itemToAdd, id: Date.now() + Math.random() }]
                }));
                addCombatMessage(`Tu as trouvé un(e) ${itemToAdd.name} ! Il a été ajouté à ton inventaire.`, 'bag');
            }
        });
    }, [addCombatMessage, setPlayerCharacter]);

    const handleUseItem = useCallback((itemToUse) => {
        if (itemToUse.type === 'consumable') {
            const updatedCharacter = itemToUse.use(playerCharacter);
            setPlayerCharacter({
                ...updatedCharacter,
                inventory: playerCharacter.inventory.filter(item => item.id !== itemToUse.id)
            });

            const message = itemToUse.message(updatedCharacter.currentHP - playerCharacter.currentHP);
            addCombatMessage(message, itemToUse.iconType);
        } else {
            addCombatMessage(`L'objet ${itemToUse.name} ne peut pas être utilisé.`, itemToUse.iconType);
        }
    }, [playerCharacter, addCombatMessage, setPlayerCharacter]);

    return {
        handleItemGain,
        handleUseItem
    };
};