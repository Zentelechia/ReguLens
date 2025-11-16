import React, { useState, useMemo } from 'react';

export function FindingsSidebar({ findings, activeTab, setActiveTab, setShowReport }) {
  // Hide compliant findings
  const nonCompliantFindings = useMemo(() => findings.filter(f => String(f.compliance).toLowerCase() !== 'compliant'), [findings]);
  const hasFindings = nonCompliantFindings.length > 0;
  // Get unique types
  const types = useMemo(() => {
    const set = new Set();
    nonCompliantFindings.forEach(f => {
      if (f.type) set.add(f.type);
    });
    return Array.from(set).sort();
  }, [nonCompliantFindings]);
  const [selectedType, setSelectedType] = useState('All');
  const filteredFindings = useMemo(() => {
    if (selectedType === 'All') return nonCompliantFindings;
    return nonCompliantFindings.filter(f => f.type === selectedType);
  }, [nonCompliantFindings, selectedType]);

  return (
    <div style={{
      width: 260, minWidth: 240, maxWidth: 280,
      marginRight: 32, position: 'sticky', top: 0, alignSelf: 'flex-start',
      height: '100vh', maxHeight: '100vh',
  // background removed for cleaner look
  // border removed for minimal look
      boxSizing: 'border-box',
      zIndex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 18px 18px 18px'
    }}>
      <h3 style={{ marginTop: 0 }}>Findings</h3>
      {types.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="finding-type-select" style={{ fontWeight: 500, fontSize: 15 }}>Filter by type:</label>
          <select
            id="finding-type-select"
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 5, border: '1px solid #bbb', fontSize: 15 }}
          >
            <option value="All">All</option>
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      )}
      {hasFindings ? (
        <>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            marginBottom: 18,
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
          }}>
            {filteredFindings.map((f, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(findings.indexOf(f))}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: activeTab === findings.indexOf(f) ? '#fff9c4' : '#f7f7f7',
                  border: '1.5px solid #ddd',
                  borderRadius: 7,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  fontWeight: activeTab === findings.indexOf(f) ? 700 : 400,
                  color: 'rgb(0,44,116)',
                  boxShadow: 'none',
                  transition: 'background 0.15s, box-shadow 0.15s'
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  {typeof f.law_clause === 'object'
                    ? JSON.stringify(f.law_clause)
                    : (f.law_clause || f.clause || f.findingTitle || 'Law Clause')}
                </div>
                <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
                  {typeof f.comment === 'object' ? JSON.stringify(f.comment) : f.comment}
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowReport(true)}
            style={{
              width: '100%',
              marginBottom: 16,
              padding: 10,
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 5,
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 16
            }}
          >
            Show All as Report
          </button>
        </>
      ) : (
        <div style={{ color: '#888', fontSize: 15, marginTop: 24 }}>
          No findings available.
        </div>
      )}
    </div>
  );
}
