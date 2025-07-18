import { useEffect, useState } from 'react';

function formatRelativeTime(timestamp) {
  const secondsAgo = Math.floor((Date.now() - new Date(timestamp)) / 1000);
  if (secondsAgo < 60) return `${secondsAgo} seconds ago`;
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)} minutes ago`;
  const hours = Math.floor(secondsAgo / 3600);
  return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
}


export default function EntityDetail({ entity }) {
  const [relativeTime, setRelativeTime] = useState('');

  useEffect(() => {
    if (!entity) return;

    const updateTime = () => {
      setRelativeTime(formatRelativeTime(entity.lastSeen));
    };

    updateTime(); // initial call
    const interval = setInterval(updateTime, 60000); // update every minute

    return () => clearInterval(interval); // cleanup on unmount
  }, [entity]);

  if (!entity) {
    return <p>Select an entity to view details.</p>;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">{entity.name}</h2>
      <p><strong>Threat Level:</strong> {entity.threatLevel}</p>
      <p><strong>Last Seen:</strong> {relativeTime}</p>
      <p className="mt-4">{entity.description}</p>
    </div>
  );
}
