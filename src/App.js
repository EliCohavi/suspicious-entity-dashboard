import { useState, useEffect } from 'react';
import EntityList from './components/EntityList';
import EntityDetail from './components/EntityDetail';
import Header from './components/Header';


export default function App() {
  const [entities, setEntities] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);

  const totalToGenerate = 30;
  let currentIndexRef = { current: 0 }; // preserve index across re-renders

  // Create a new entity
  function addRandomEntity(index, total) {
    return {
      id: crypto.randomUUID(),
      name: `Entity ${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      threatLevel: getRandomThreatLevel(),
      lastSeen: new Date().toISOString(),
      description: 'Suspicious activity detected in sector 9.',
    };
  }

  const threatWeights = [
  { level: 'Low', weight: 0.5 },
  { level: 'Medium', weight: 0.3 },
  { level: 'High', weight: 0.2 },
];

function getRandomThreatLevel() {
  const rand = Math.random();
  let sum = 0;

  for (const { level, weight } of threatWeights) {
    sum += weight;
    if (rand <= sum) {
      return level;
    }
  }
  return threatWeights[threatWeights.length - 1].level; // fallback
}


  // Simulate real-time entity generation
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentIndexRef.current >= totalToGenerate) {
        clearInterval(interval);
        return;
      }

      const newEntity = addRandomEntity(currentIndexRef.current, totalToGenerate);
      setEntities((prev) => [...prev, newEntity]);
      currentIndexRef.current++;
    }, Math.random() * 1000 + 1000); // 1–2 second interval

    return () => clearInterval(interval);
  }, []);

  return (
<div className="h-screen flex flex-col overflow-hidden">
  <Header />

  <main className="flex flex-1 overflow-hidden">
    {/* Left: Entity List */}
    <div className="w-1/3 border-r border-gray-300 overflow-y-auto p-4">
      <EntityList entities={entities} onSelect={setSelectedEntity} />
    </div>

    {/* Right: Details */}
    <div className="flex-1 p-6 overflow-y-auto">
      {selectedEntity ? (
        <EntityDetail entity={selectedEntity} />
      ) : (
        <div className="text-gray-500 text-center mt-10">
          Select an entity to view details.
        </div>
      )}
    </div>
  </main>
</div>


  );
}
