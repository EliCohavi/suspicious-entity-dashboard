export default function EntityTable({ entities, onAction }) {
  const getRiskColor = (score) => {
    if (score >= 70) return 'text-red-600 font-bold';
    if (score <= 30) return 'text-green-600';
    return 'text-yellow-600';
  };

  return (
    <table className="w-full table-auto border-collapse">
      <thead>
        <tr className="bg-gray-100 text-left text-sm">
          <th className="px-4 py-2">Name</th>
          <th className="px-4 py-2">Type</th>
          <th className="px-4 py-2">Risk Score</th>
          <th className="px-4 py-2">Source</th>
          <th className="px-4 py-2">Status</th>
          <th className="px-4 py-2">Timestamp</th>
          <th className="px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {entities.map((entity) => (
          <tr key={entity.id} className="border-t text-sm hover:bg-gray-50">
            <td className="px-4 py-2">{entity.name}</td>
            <td className="px-4 py-2">{entity.type}</td>
            <td className={`px-4 py-2 ${getRiskColor(entity.riskScore)}`}>
              {entity.riskScore}
            </td>
            <td className="px-4 py-2">{entity.source}</td>
            <td className="px-4 py-2">{entity.status}</td>
            <td className="px-4 py-2">{new Date(entity.timestamp).toLocaleString()}</td>
            <td className="px-4 py-2 space-x-2">
              <button
                onClick={() => onAction(entity.id, 'Approved')}
                className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
              >
                ✅ Approve
              </button>
              <button
                onClick={() => onAction(entity.id, 'Escalated')}
                className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs"
              >
                ⚠️ Escalate
              </button>
              <button
                onClick={() => onAction(entity.id, 'Deleted')}
                className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs"
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
