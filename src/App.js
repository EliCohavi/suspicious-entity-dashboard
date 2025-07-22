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
  }, [activeTab, searchTerm]); // also update if search changes (tabs stay fixed, but just in case)

  // Logging, entity move, sorting, ingest, etc (same as your logic)
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

  return (
    <div className="h-screen flex flex-col relative">
      <Header />
      <SummaryBar
        entities={[...entities, ...flaggedEntities, ...priorityEntities]}
        onSubmit={submitBatch}
        submittedCount={submittedEntities.length}
      />

      <div className="flex-grow overflow-y-auto px-6 pb-6 pt-2 relative">
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
                className={`flex-1 text-sm font-medium px-4 py-2 rounded-full mx-1 transition-colors duration-200
                  ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600 hover:bg-white'}`}
                type="button"
              >
                {tab}
              </button>
            );
          })}

          {/* Sliding pill highlight */}
          <motion.div
            className="absolute top-1 bottom-1 bg-white rounded-full shadow-md"
            layout
            layoutId="slider"
            style={{
              left: sliderStyle.left,
              width: sliderStyle.width,
              transition: 'left 0.3s ease, width 0.3s ease',
              pointerEvents: 'none',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
              {/* Text inside the active pill */}
      <div className="flex items-center justify-center h-full">
        <span className="text-blue-600 font-semibold text-sm">
          {activeTab}
        </span>
      </div>
      </motion.div>
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
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <EntityTable entities={sortedEntities} onAction={handleAction} onSort={requestSort} sortConfig={sortConfig} />
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
  {showAudit && (
    <motion.div
      key="audit"
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'tween', duration: 0.3 }}
      className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-xl z-50 p-4 overflow-y-auto"
    >
      {/* Close Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Audit Log</h2>
        <button
          onClick={() => setShowAudit(false)}
          className="text-gray-500 hover:text-red-500 text-xl font-bold"
        >
          ×
        </button>
      </div>

      {/* Render your audit log entries here */}
      {auditTrail.length > 0 ? (
        <ul className="space-y-2">
          {auditTrail.map((log, idx) => (
            <li key={idx} className="text-sm text-gray-700 border-b pb-2">
              {log}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">No actions yet.</p>
      )}
    </motion.div>
  )}
</AnimatePresence>
    </div>
  );
}
