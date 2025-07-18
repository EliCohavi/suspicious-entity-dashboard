import { useState } from 'react';
import Header from './components/Header';
import EntityTable from './components/EntityTable';
import SummaryBar from './components/SummaryBar';
import mockEntities from './data/mockEntities';

export default function App() {
  const [entities, setEntities] = useState(mockEntities);
  const [filter, setFilter] = useState('All');

  const handleAction = (id, newStatus) => {
    setEntities(prev =>
      prev.map(entity =>
        entity.id === id ? { ...entity, status: newStatus } : entity
      )
    );
  };

  const filtered = entities.filter(entity =>
    filter === 'All' ? true : entity.status === filter
  );

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <SummaryBar entities={entities} />
      <div className="flex-grow overflow-y-auto px-6 pb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Entity Ingest Table</h2>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value="All">All</option>
            <option value="Unreviewed">Unreviewed</option>
            <option value="Escalated">Escalated</option>
            <option value="Approved">Approved</option>
            <option value="Deleted">Deleted</option>
          </select>
        </div>
        <EntityTable entities={filtered} onAction={handleAction} />
      </div>
    </div>
  );
}
