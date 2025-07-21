export default function EntityTable({ entities, onAction, onSort, sortConfig }) {
  const getRiskColor = (score) => {
    if (score >= 80) return 'text-red-700 font-bold';
    if (score >= 50) return 'text-yellow-600 font-semibold';
    return 'text-green-600';
  };

  const getSortSymbol = (key) => {
    if (!sortConfig || sortConfig.key !== key) return '';
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  return (
    <table className="w-full table-auto border-collapse">
      <thead>
        <tr className="bg-gray-100 text-left text-sm">
          <th className="px-4 py-2 cursor-pointer" onClick={() => onSort('name')}>
            Name{getSortSymbol('name')}
          </th>
          <th className="px-4 py-2 cursor-pointer" onClick={() => onSort('type')}>
            Type{getSortSymbol('type')}
          </th>
          <th className="px-4 py-2 cursor-pointer" onClick={() => onSort('riskScore')}>
            Risk Score{getSortSymbol('riskScore')}
          </th>
          <th className="px-4 py-2 cursor-pointer" onClick={() => onSort('summary')}>
            Summary{getSortSymbol('summary')}
          </th>
          <th className="px-4 py-2 cursor-pointer" onClick={() => onSort('source')}>
            Source{getSortSymbol('source')}
          </th>
          <th className="px-4 py-2 cursor-pointer" onClick={() => onSort('status')}>
            Status{getSortSymbol('status')}
          </th>
          <th className="px-4 py-2 cursor-pointer" onClick={() => onSort('timestamp')}>
            Timestamp{getSortSymbol('timestamp')}
          </th>
          <th className="px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {entities.length === 0 && (
          <tr>
            <td colSpan="8" className="text-center py-4 text-gray-500">
              No entities to display.
            </td>
          </tr>
        )}
        {entities.map((entity) => (
          <tr
            key={entity.id}
            className={`border-t text-sm hover:bg-gray-50 ${
              entity.riskScore >= 80 ? 'animate-pulse bg-red-50' : ''
            }`}
          >
            <td className="px-4 py-2 font-semibold">{entity.name}</td>
            <td className="px-4 py-2">{entity.type}</td>
            <td className={`px-4 py-2 ${getRiskColor(entity.riskScore)}`}>
              {entity.riskScore}
            </td>
            <td className="px-4 py-2 italic text-gray-700">{entity.summary || '-'}</td>
            <td className="px-4 py-2">{entity.source}</td>
            <td className="px-4 py-2">{entity.status}</td>
            <td className="px-4 py-2">
              {new Date(entity.timestamp).toLocaleString()}
            </td>
            <td className="px-4 py-2 space-x-2 whitespace-nowrap">
              {(entity.status !== 'Flagged' && entity.status !== 'Priority') && (
                <>
                  <button
                    onClick={() => onAction(entity.id, 'Flagged')}
                    className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs"
                    title="Flag for Review"
                  >
                    ⚑ Flag
                  </button>
                  <button
                    onClick={() => onAction(entity.id, 'Priority')}
                    className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs"
                    title="Priority Alert"
                  >
                    ⚠️ Priority
                  </button>
                </>
              )}
              <button
                onClick={() => onAction(entity.id, 'Deleted')}
                className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs"
                title="Delete Entity"
              >
                🗑️ Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
