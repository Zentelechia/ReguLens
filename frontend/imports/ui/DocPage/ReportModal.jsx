import React from 'react';

export function ReportModal({ findings, onClose, onDownload }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.25)',
      zIndex: 2000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 10,
        maxWidth: 700,
        width: '90vw',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
        padding: '64px 32px 32px 32px',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: '#eee', border: 'none',
            borderRadius: 4, padding: '4px 10px',
            fontWeight: 600, cursor: 'pointer'
          }}
        >
          Close
        </button>
        <button
          onClick={onDownload}
          style={{
            position: 'absolute',
            top: 16, left: 16,
            background: 'linear-gradient(90deg, #1976d2 60%, #3fa6ff 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 28px 10px 18px',
            fontWeight: 700,
            fontSize: 17,
            boxShadow: '0 2px 12px rgba(25,118,210,0.13)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center',
            gap: 10,
            borderBottom: '2.5px solid #1556a0'
          }}
        >
          Download as PDF
        </button>
        <h2 style={{ marginTop: 0 }}>Findings Report</h2>
        <ol style={{ paddingLeft: 20 }}>
          {findings.map((f, i) => (
            <li key={i} style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 600, fontSize: 17 }}>
                {f.law_clause || f.clause || f.findingTitle || 'Law Clause'}
              </div>
              <div style={{ color: '#888', fontSize: 14, margin: '2px 0 6px 0' }}>
                {f.type || f.mismatchType}
              </div>
              <div style={{ fontSize: 15, marginBottom: 4 }}>
                <b>Comment:</b> {typeof f.comment === 'object' ? JSON.stringify(f.comment) : f.comment}
              </div>
              <div style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
                <b>Compliance:</b> {f.compliance}
              </div>
              {Array.isArray(f.user_chunks) && f.user_chunks.length > 0 && (
                <div style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
                  <b>Relevant Chunks:</b> {f.user_chunks.map(chunk =>
                    typeof chunk === 'string' ? chunk : JSON.stringify(chunk)
                  ).join(' | ')}
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
