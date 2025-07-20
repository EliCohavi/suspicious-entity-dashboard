export default function SummaryBar({ entities }) {
  const total = entities.length;
  const escalated = entities.filter(e => e.status === 'Escalated').length;
  const avgRisk = total > 0 ? Math.round(entities.reduce((sum, e) => sum + e.riskScore, 0) / total) : 0;
  const lastIngest = entities.length
    ? new Date(Math.max(...entities.map(e => new Date(e.timestamp)))).toLocaleString()
    : 'N/A';

  return (
    <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 text-sm flex gap-6">
      <div><strong>Total Entities:</strong> {total}</div>
      <div><strong>Escalated:</strong> {escalated}</div>
      <div><strong>Avg Risk Score:</strong> {avgRisk}</div>
      <div><strong>Last Ingest:</strong> {lastIngest}</div>
    </div>
  );
}
