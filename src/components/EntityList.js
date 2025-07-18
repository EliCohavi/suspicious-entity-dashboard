import { useState } from 'react';

export default function EntityList({ entities, onSelect }) {
  const [filter, setFilter] = useState('All');

  const filteredEntities = entities.filter((entity) => {
    return filter === 'All' || entity.threatLevel === filter;
  });

  const filters = ['All', 'High', 'Medium', 'Low'];

  return (
    <div className="h-full flex flex-col p-4">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white z-10 pb-2">
        <h2 className="text-lg font-semibold mb-2">Entities</h2>

        {/* Filter Buttons */}
        <div className="flex space-x-2 mb-2">
          {filters.map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-3 py-1 rounded-full text-sm font-medium border
                ${
                  filter === level
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable List */}
      <div className="overflow-y-auto pr-2 space-y-2">
        {filteredEntities.map((entity) => (
          <div
            key={entity.id}
            className="p-2 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer flex justify-between items-center"
            onClick={() => onSelect(entity)}
          >
            <span>{entity.name}</span>
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
          </div>
        ))}
      </div>
    </div>
  );
}
