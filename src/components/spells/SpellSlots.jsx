import React from 'react';

export const SpellSlots = ({ spellSlots }) => (
  <>
    <h5 className="text-lg font-semibold mt-6 mb-2">Emplacements de sorts</h5>
    <ul className="list-disc list-inside bg-gray-700 p-4 rounded-lg shadow-md mb-4">
      {Object.entries(spellSlots).map(([level, slots]) => (
        <li key={level} className="text-gray-200">
          Niv. {level}: {slots.used}/{slots.total}
        </li>
      ))}
    </ul>
  </>
);