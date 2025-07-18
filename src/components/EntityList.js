import { useState } from 'react';
import entities from '../data';

export default function EntityList({ onSelect }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Entities</h2>
      <ul className="space-y-2">
        {entities.map((entity) => (
          <li
            key={entity.id}
            className="p-2 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
            onClick={() => onSelect(entity)}
          >
{entity.name}
<span
  className={`ml-2 px-2 py-1 rounded text-white text-sm font-semibold
    ${
      entity.threatLevel === 'High'
        ? 'bg-red-600'
        : entity.threatLevel === 'Medium'
        ? 'bg-orange-500'
        : 'bg-green-600'
    }`}
>
  {entity.threatLevel}
</span>

          </li>
        ))}
      </ul>
    </div>
  );
}
