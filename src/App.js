import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Header from './components/Header';
import EntityTable from './components/EntityTable';
import SummaryBar from './components/SummaryBar';
import mockEntities from './data/mockEntities';
import { AnimatePresence, motion } from 'framer-motion';

const tabs = ['Ingest', 'Flagged', 'Priority', 'Deleted'];

export default function App() {
  const [entities, setEntities] = useState(mockEntities);
  const [flaggedEntities, setFlaggedEntities] = useState([]);
  const [priorityEntities, setPriorityEntities] = useState([]);
  const [deletedEntities, setDeletedEntities] = useState([]);
  const [submittedEntities, setSubmittedEntities] = useState([]);
  const [sentEntities, setSentEntities] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const [activeTab, setActiveTab] = useState('Ingest');
  const [direction, setDirection] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [auditTrail, setAuditTrail] = useState([]);
  const [showAudit, setShowAudit] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);

  // For measuring tab positions to move slider
  const tabsRef = useRef(null);
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });

  // Update slider position when activeTab changes or on window resize
  useLayoutEffect(() => {
    if (!tabsRef.current) return;

    const tabElements = Array.from(tabsRef.current.querySelectorAll('button'));
    const activeIndex = tabs.indexOf(activeTab);
    const activeTabEl = tabElements[activeIndex];
    if (activeTabEl) {
      const { offsetLeft, offsetWidth } = activeTabEl;
      setSliderStyle({ left: offsetLeft, width: offsetWidth });
    }
  }, [activeTab, searchTerm]); // Dependency arrays

  // Logging, entity move, sorting, ingest, etc
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
      const entity = { ...sourceArr[idx], status: newEntityStatus }; // Creates copy of entity with new status
      const newSource = [...sourceArr]; // Makes shallow copy of source array
      newSource.splice(idx, 1); // Removes entity from shallow copy
      setSourceArr(newSource); // Updates source array with modified copy
      setTargetArr(prev => [entity, ...prev]);
      logAudit(`${entity.name} moved to ${newEntityStatus}`);
      return true;
    };

    if (newStatus === 'Deleted') {
      const moved =
        moveEntity(entities, setEntities, deletedEntities, setDeletedEntities, id, 'Deleted') ||
        moveEntity(flaggedEntities, setFlaggedEntities, deletedEntities, setDeletedEntities, id, 'Deleted') ||
        moveEntity(priorityEntities, setPriorityEntities, deletedEntities, setDeletedEntities, id, 'Deleted');

      return;
    }


    if (newStatus === 'Flagged') {
      const moved =
        moveEntity(entities, setEntities, flaggedEntities, setFlaggedEntities, id, 'Flagged') ||
        moveEntity(priorityEntities, setPriorityEntities, flaggedEntities, setFlaggedEntities, id, 'Flagged');

      return;
    }

    if (newStatus === 'Priority') {
      const moved =
        moveEntity(entities, setEntities, priorityEntities, setPriorityEntities, id, 'Priority') ||
        moveEntity(flaggedEntities, setFlaggedEntities, priorityEntities, setPriorityEntities, id, 'Priority');

      return;
    }


    // Add to sentEntities on Flagged, Priority, or Deleted
    if (newStatus === 'Flagged' || newStatus === 'Priority' || newStatus === 'Deleted') {
      const allEntities = [...entities, ...flaggedEntities, ...priorityEntities, ...deletedEntities];
      const entity = allEntities.find(e => e.id === id);
      if (entity) {
        setSentEntities(prev => {
          if (prev.find(e => e.id === id)) return prev;
          return [...prev, { ...entity, status: newStatus }];
        });
      }
    }
  };

  const submitBatch = () => {
    setSubmittedEntities(prev => [...flaggedEntities, ...priorityEntities, ...deletedEntities, ...prev]);
    logAudit(`Submitted batch: ${flaggedEntities.length} flagged, ${priorityEntities.length} priority, ${deletedEntities.length} deleted alert(s)`);
    setFlaggedEntities([]);
    setPriorityEntities([]);
    setDeletedEntities([]);
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

  const ingestInterval = useRef(null);

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

  // Sort entities based on direction
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

  const criticalEntities = displayedEntities.filter(e => e.riskScore >= 80);

  // Handle tab change and set slide direction
  const handleTabChange = (newTab) => {
    const currentIndex = tabs.indexOf(activeTab);
    const newIndex = tabs.indexOf(newTab);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setActiveTab(newTab);
  };

  // Animation variants for sliding content
  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      position: 'absolute',
      width: '100%',
    }),
    center: {
      x: 0,
      opacity: 1,
      position: 'relative',
      width: '100%',
    },
    exit: (direction) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      position: 'absolute',
      width: '100%',
    }),
  };

  // Download report function
  const handleDownloadReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      sentEntities,
      auditTrail,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex flex-col relative">
      <Header />
      <SummaryBar
        entities={[...entities, ...flaggedEntities, ...priorityEntities, ...deletedEntities]}
        onSubmit={submitBatch}
        submittedCount={submittedEntities.length}
      />

      <div className="flex-grow overflow-y-auto px-6 pb-6 pt-2 relative">
        {/* Critical Entities Banner */}
        {/* Critical alert always shown if any in Ingest */}
        {entities.some(e => e.riskScore >= 80) && (
          <section className="mb-6 border border-red-400 rounded p-3 bg-red-50 animate-pulse">
            <h3 className="text-red-700 font-semibold mb-2">Critical Entities (Ingest Tab)</h3>
            {entities
              .filter(e => e.riskScore >= 80)
              .map(entity => (
                <div key={entity.id} className="text-sm mb-1 font-semibold text-red-700">
                  {entity.name} (Risk: {entity.riskScore}) — {entity.summary}
                </div>
              ))
            }
          </section>
        )}

        {/* Tabs */}
        <div
          className="flex justify-between items-center bg-gray-100 rounded-xl p-1 mb-4 relative select-none"
          ref={tabsRef}
          style={{ userSelect: 'none' }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`flex-1 text-sm font-medium px-4 py-2 rounded-full mx-1 transition-colors duration-200 relative z-10
          ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600 hover:bg-white'}`}
                type="button"
              >
                {tab}
              </button>
            );
          })}

          {/* Sliding pill highlight - no text inside, z-index below buttons */}
          <motion.div
            className="absolute top-1 bottom-1 bg-white rounded-full shadow-md"
            layout
            layoutId="slider"
            style={{
              left: sliderStyle.left,
              width: sliderStyle.width,
              transition: 'left 0.3s ease, width 0.3s ease',
              pointerEvents: 'none',
              zIndex: 0, // behind buttons
            }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
          />
        </div>


        {/* Controls */}
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

            {/* Download Report button */}
            <button
              onClick={handleDownloadReport}
              disabled={submittedEntities.length === 0}
              className={`px-3 py-1 rounded text-sm font-semibold shadow-sm transition
    ${submittedEntities.length === 0
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
                }`}
            >
              Download Report
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

        {/* Sliding content */}
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={activeTab}
            custom={direction}
            variants={{
              enter: (direction) => ({
                x: direction > 0 ? 300 : -300,
                opacity: 0,
              }),
              center: {
                x: 0,
                opacity: 1,
              },
              exit: (direction) => ({
                x: direction > 0 ? -300 : 300,
                opacity: 0,
              }),
            }}

            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", duration: 0.25, ease: "easeInOut" }}
          >
            <EntityTable
              entities={sortedEntities}
              onAction={handleAction}
              onSort={requestSort}
              sortConfig={sortConfig}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {showAudit && (
        <aside
          className="absolute top-16 right-0 w-96 h-full bg-white shadow-lg border-l border-gray-200 p-4 overflow-y-auto transition-transform duration-300 ease-in-out transform translate-x-0"
          style={{ zIndex: 9999 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Audit Trail</h3>
            <button
              onClick={() => setShowAudit(false)}
              className="text-gray-600 hover:text-gray-900 transition"
              aria-label="Close Audit Log"
            >
              ✕
            </button>
          </div>
          <ul className="text-sm space-y-3">
            {auditTrail.length > 0 ? (
              auditTrail.map((log, idx) => (
                <li key={idx} className="border-b pb-1">
                  <div className="font-semibold">{new Date(log.timestamp).toLocaleString()}</div>
                  <div>{log.message}</div>
                </li>
              ))
            ) : (
              <li className="text-gray-500">No audit logs yet.</li>
            )}
          </ul>
        </aside>
      )}
    </div>
  );
}
