export default function SummaryBar({ entities, onSubmit, submittedCount }) {
  const total = entities.length;
  const flagged = entities.filter(e => e.status === 'Flagged').length;
  const priority = entities.filter(e => e.status === 'Priority').length;
  const deleted = entities.filter(e => e.status === 'Deleted').length;
  const avgRisk = total > 0
    ? Math.round(entities.reduce((sum, e) => sum + e.riskScore, 0) / total)
    : 0;
  const lastIngest = entities.length
    ? new Date(Math.max(...entities.map(e => new Date(e.timestamp)))).toLocaleString()
    : 'N/A';

  return (
    <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 text-sm flex flex-wrap gap-6 items-center">
      <div><strong>Total Entities:</strong> {total}</div>
      <div><strong>Flagged:</strong> {flagged}</div>
      <div><strong>Priority Alerts:</strong> {priority}</div>
      <div><strong>Deleted:</strong> {deleted}</div>
      <div><strong>Avg Risk Score:</strong> {avgRisk}</div>
      <div><strong>Last Ingest:</strong> {lastIngest}</div>

      <button
        onClick={onSubmit}
        disabled={flagged + priority + deleted === 0}
        className={`ml-auto px-3 py-1 rounded text-sm font-semibold shadow-sm transition
          ${flagged + priority + deleted === 0
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'}`}
      >
        Submit Batch ({flagged + priority + deleted})
      </button>

      {submittedCount > 0 && (
        <div className="text-xs italic text-gray-600">
          {submittedCount} submitted entities archived
        </div>
      )}
    </div>
  );
}
