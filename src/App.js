// App.js
import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import EntityTable from './components/EntityTable';
import SummaryBar from './components/SummaryBar';
import mockEntities from './data/mockEntities';

export default function App() {
  const [entities, setEntities] = useState(mockEntities);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [auditTrail, setAuditTrail] = useState([]);
  const [showAudit, setShowAudit] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const ingestInterval = useRef(null);

  const handleAction = (id, newStatus) => {
    setEntities(prev =>
      prev.map(entity =>
        entity.id === id ? { ...entity, status: newStatus } : entity
      )
    );
    const acted = entities.find(e => e.id === id);
    if (acted) {
      setAuditTrail(prev => [
        { timestamp: new Date().toISOString(), message: `${acted.name} marked as ${newStatus}` },
        ...prev,
      ]);
    }
  };

  const filtered = entities.filter(entity =>
    (filter === 'All' ? true : entity.status === filter) &&
    entity.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleIngest = () => {
    if (isIngesting) {
      clearInterval(ingestInterval.current);
      ingestInterval.current = null;
      setIsIngesting(false);
    } else {
      ingestInterval.current = setInterval(() => {
        const newEntity = {
          id: Math.random().toString(36).substring(2, 7).toUpperCase(),
          name: `Entity ${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          type: ['Person', 'Shipment', 'IP Address', 'Email', 'File'][Math.floor(Math.random() * 5)],
          riskScore: Math.floor(Math.random() * 101),
          source: ['Watchlist', 'Custom Ingest', 'AI Model', 'Manual Flag'][Math.floor(Math.random() * 4)],
          status: 'Unreviewed',
          timestamp: new Date().toISOString(),
        };
        setEntities(prev => [newEntity, ...prev]);
      }, 2000);
      setIsIngesting(true);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      <Header />
      <SummaryBar entities={entities} />
      <div className="flex-grow overflow-y-auto px-6 pb-6 pt-2">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          {/* Left Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={toggleIngest}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm shadow-sm hover:bg-blue-200 transition"
            >
              {isIngesting ? 'Stop Ingest' : 'Start Ingest'}
            </button>
            <button
              onClick={() => setShowAudit(prev => !prev)}
              className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-sm shadow-sm hover:bg-purple-200 transition"
            >
              {showAudit ? 'Hide Audit' : 'Show Audit'}
            </button>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="All">All</option>
              <option value="Unreviewed">Unreviewed</option>
              <option value="Escalated">Escalated</option>
              <option value="Approved">Approved</option>
              <option value="Deleted">Deleted</option>
            </select>
          </div>

          {/* Right Search */}
          <input
            type="text"
            placeholder="Search entities..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm w-64"
          />
        </div>

        <EntityTable entities={filtered} onAction={handleAction} />
      </div>

      {/* Animated Audit Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg border-l border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
          showAudit ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 border-b font-semibold text-lg flex justify-between items-center">
          Audit Trail
          <button
            onClick={() => setShowAudit(false)}
            className="text-sm text-gray-500 hover:text-black"
          >
            ✖
          </button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
          {auditTrail.length === 0 ? (
            <p className="text-gray-500 italic">No audit logs yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {auditTrail.map((log, idx) => (
                <li key={idx} className="border-b pb-1">
                  <strong>{new Date(log.timestamp).toLocaleString()}</strong>
                  <div>{log.message}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
