export default function EntityDetail({ entity }) {
  if (!entity) {
    return <p>Select an entity to view details.</p>;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">{entity.name}</h2>
      <p><strong>Threat Level:</strong> {entity.threatLevel}</p>
      <p><strong>Last Seen:</strong> {new Date(entity.lastSeen).toLocaleString()}</p>
      <p className="mt-4">{entity.description}</p>
    </div>
  );
}
