const types = ['Person', 'Shipment', 'IP Address', 'Email', 'File'];
const sources = ['Watchlist', 'Custom Ingest', 'AI Model', 'Manual Flag'];

function randomEntity(id) {
  const risk = Math.floor(Math.random() * 101);
  const statuses = ['Unreviewed', 'Escalated', 'Approved', 'Deleted'];
  return {
    id,
    name: `Entity ${id}`,
    type: types[Math.floor(Math.random() * types.length)],
    riskScore: risk,
    source: sources[Math.floor(Math.random() * sources.length)],
    status: 'Unreviewed',
    timestamp: new Date(Date.now() - Math.random() * 100000000).toISOString(),
  };
}

const mockEntities = Array.from({ length: 25 }, (_, i) => randomEntity(i + 1));

export default mockEntities;
