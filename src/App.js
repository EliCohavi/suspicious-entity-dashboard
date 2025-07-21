import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import EntityTable from './components/EntityTable';
import SummaryBar from './components/SummaryBar';
import mockEntities from './data/mockEntities';

export default function App() {
  const [entities, setEntities] = useState(mockEntities);
  const [flaggedEntities, setFlaggedEntities] = useState([]);
  const [priorityEntities, setPriorityEntities] = useState([]);
  const [deletedEntities, setDeletedEntities] = useState([]);
  const [submittedEntities, setSubmittedEntities] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const [activeTab, setActiveTab] = useState('Ingest');
  const [searchTerm, setSearchTerm] = useState('');
  const [auditTrail, setAuditTrail] = useState([]);
  const [showAudit, setShowAudit] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);

  const ingestInterval = useRef(null);

  const logAudit = (message) => {
    setAuditTrail(prev => [
      { timestamp: new Date().toISOString(), message },
      ...prev,
    ]);
  };

  const handleAction = (id, newStatus) => {
    const moveEntity = (sourceArr, setSourceArr, targetArr, setTargetArr, entityId, newEntityStatus) => {
      const idx = sourceArr.findIndex(e => e.id === entityId);
      if (idx === -1) return false;
      const entity = { ...sourceArr[idx], status: newEntityStatus };
      const newSource = [...sourceArr];
      newSource.splice(idx, 1);
      setSourceArr(newSource);
      setTargetArr(prev => [entity, ...prev]);
      logAudit(`${entity.name} moved to ${newEntityStatus}`);
      return true;
    };

    if (newStatus === 'Deleted') {
      if (!moveEntity(entities, setEntities, deletedEntities, setDeletedEntities, id, 'Deleted'))
        if (!moveEntity(flaggedEntities, setFlaggedEntities, deletedEntities, setDeletedEntities, id, 'Deleted'))
          moveEntity(priorityEntities, setPriorityEntities, deletedEntities, setDeletedEntities, id, 'Deleted');
      return;
    }

    if (newStatus === 'Flagged') {
      if (!moveEntity(entities, setEntities, flaggedEntities, setFlaggedEntities, id, 'Flagged'))
        if (!moveEntity(priorityEntities, setPriorityEntities, flaggedEntities, setFlaggedEntities, id, 'Flagged'))
          ;
      return;
    }

    if (newStatus === 'Priority') {
      if (!moveEntity(entities, setEntities, priorityEntities, setPriorityEntities, id, 'Priority'))
        if (!moveEntity(flaggedEntities, setFlaggedEntities, priorityEntities, setPriorityEntities, id, 'Priority'))
          ;
      return;
    }
  };

  const submitBatch = () => {
    setSubmittedEntities(prev => [...flaggedEntities, ...priorityEntities, ...prev]);
    logAudit(`Submitted batch: ${flaggedEntities.length} flagged, ${priorityEntities.length} priority alert(s)`);
    setFlaggedEntities([]);
    setPriorityEntities([]);
  };

  const toggleIngest = () => {
    if (isIngesting) {
      clearInterval(ingestInterval.current);
      ingestInterval.current = null;
      setIsIngesting(false);
      logAudit('Stopped ingesting new entities');
    } else {
      ingestInterval.current = setInterval(() => {
        const newId = Math.random().toString(36).substring(2, 7).toUpperCase();
        const riskScore = Math.floor(Math.random() * 101);
        const newEntity = {
          id: newId,
          name: `Entity ${newId}`,
          type: ['Person', 'Shipment', 'IP Address', 'Email', 'File'][Math.floor(Math.random() * 5)],
          riskScore,
          source: ['Watchlist', 'Custom Ingest', 'AI Model', 'Manual Flag'][Math.floor(Math.random() * 4)],
          status: 'Unreviewed',
          timestamp: new Date().toISOString(),
          summary: generateSummary(riskScore),
        };
        setEntities(prev => [newEntity, ...prev]);
        logAudit(`New entity ingested: ${newEntity.name}`);
      }, 2000);
      setIsIngesting(true);
      logAudit('Started ingesting new entities');
    }
  };

  useEffect(() => {
    setEntities(prev =>
      prev.map(e => ({ ...e, summary: generateSummary(e.riskScore) }))
    );
  }, []);

  function generateSummary(riskScore) {
    const signals = [
      "Matches a watchlist pattern.",
      "Unusual activity detected.",
      "Reported from a trusted source.",
      "Linked to known threat actor.",
      "Anomalous transaction history."
    ];
    const noises = [
      "Common name, low risk.",
      "No suspicious links found.",
      "Data matches typical background noise.",
      "No recent activity flagged.",
      "Unverified source, likely false positive."
    ];
    const criticals = [
      "Imminent threat requiring escalation.",
      "Direct match with top-level threat profile.",
      "Highly anomalous activity traced to sensitive infrastructure.",
      "Multiple signals converge — likely coordinated operation.",
      "Critical intelligence priority."
    ];

    if (riskScore < 40) {
      return `Likely Noise: ${noises[Math.floor(Math.random() * noises.length)]}`;
    } else if (riskScore < 80) {
      return `Likely Signal: ${signals[Math.floor(Math.random() * signals.length)]}`;
    } else {
      return `Critical: ${criticals[Math.floor(Math.random() * criticals.length)]}`;
    }
  }

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  let displayedEntities = [];
  if (activeTab === 'Ingest') displayedEntities = entities;
  else if (activeTab === 'Flagged') displayedEntities = flaggedEntities;
  else if (activeTab === 'Priority') displayedEntities = priorityEntities;
  else if (activeTab === 'Deleted') displayedEntities = deletedEntities;

  displayedEntities = displayedEntities.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedEntities = [...displayedEntities];

  if (sortConfig.key !== null) {
    sortedEntities.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  }

  const criticalEntities = displayedEntities.filter(e => e.riskScore >= 80);

  return (
    <div className="h-screen flex flex-col relative">
      <Header />
      <SummaryBar
        entities={[...entities, ...flaggedEntities, ...priorityEntities]}
        onSubmit={submitBatch}
        submittedCount={submittedEntities.length}
      />

      <div className="flex-grow overflow-y-auto px-6 pb-6 pt-2">
        {/* Critical Entities Banner */}
        {criticalEntities.length > 0 && (
          <section className="mb-6 border border-red-400 rounded p-3 bg-red-50 animate-pulse">
            <h3 className="text-red-700 font-semibold mb-2">Critical Entities</h3>
            {criticalEntities.map(entity => (
              <div key={entity.id} className="text-sm mb-1 font-semibold text-red-700">
                {entity.name} (Risk: {entity.riskScore}) — {entity.summary}
              </div>
            ))}
          </section>
        )}

        {/* Tabs UI */}
        <div className="flex justify-between items-center bg-gray-100 rounded-xl p-1 mb-4">
          {['Ingest', 'Flagged', 'Priority', 'Deleted'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-sm font-medium px-4 py-2 rounded-full transition-colors duration-200 mx-1
              ${activeTab === tab
              ? 'bg-white shadow text-blue-600'
              : 'bg-transparent text-gray-600 hover:bg-white hover:text-blue-600'
                }`}
            >
          {tab}
        </button>
  ))}
      </div>

      {/* Top Controls */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={toggleIngest}
            className={`px-3 py-1 rounded text-sm font-semibold shadow-sm transition
                ${isIngesting ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {isIngesting ? 'Stop Ingest' : 'Start Ingest'}
          </button>
          <button
            onClick={() => setShowAudit(prev => !prev)}
            className="px-3 py-1 font-semibold bg-purple-600 text-white rounded text-sm shadow-sm hover:bg-purple-700 transition"
          >
            {showAudit ? 'Hide Audit' : 'Show Audit'}
          </button>
        </div>

        <input
          type="text"
          placeholder="Search entities..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 text-sm w-64"
        />
      </div>

      <EntityTable
        entities={sortedEntities}
        onAction={handleAction}
        onSort={requestSort}
        sortConfig={sortConfig}
      />
    </div>

      {
    showAudit && (
      <aside className="absolute top-16 right-0 w-96 h-full bg-white shadow-lg border-l border-gray-200 p-4 overflow-y-auto transition-transform duration-300 ease-in-out transform translate-x-0"
        style={{ zIndex: 9999 }}>
        <h3 className="text-lg font-semibold mb-4">Audit Trail</h3>
        <ul className="text-sm space-y-3">
          {auditTrail.map((log, idx) => (
            <li key={idx} className="border-b pb-1">
              <div className="font-semibold">{new Date(log.timestamp).toLocaleString()}</div>
              <div>{log.message}</div>
            </li>
          ))}
          {auditTrail.length === 0 && <li className="text-gray-500">No audit logs yet.</li>}
        </ul>
      </aside>
    )
  }
    </div >
  );
}
