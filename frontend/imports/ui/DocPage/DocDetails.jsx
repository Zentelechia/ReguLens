import React from 'react';

export function DocDetails({ finding }) {
  if (!finding) return null;
  return (
    <div style={{
      marginBottom: 24,
      background: '#fff9c4',
      borderRadius: 10,
      padding: '20px 28px',
      color: '#222',
      fontSize: 16,
      fontWeight: 500
    }}>
      <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 8, color: '#b28704', letterSpacing: '0.5px' }}>
        {finding.law_clause || 'Law Clause'}
      </div>
      <div style={{ fontSize: 15, color: '#b28704', marginBottom: 4, fontWeight: 600 }}>
        <span style={{ marginRight: 8 }}><b>Compliance:</b> {finding.compliance}</span>
        <span style={{ color: '#888', fontWeight: 500, marginLeft: 12 }}><b>Type:</b> {finding.type}</span>
      </div>
      <div style={{ fontSize: 15, margin: '10px 0 0 0', color: '#333', lineHeight: 1.6 }}>
        <b>Explanation:</b> {finding.comment}
      </div>
      {Array.isArray(finding.user_chunks) && finding.user_chunks.length > 0 && (
        <div style={{ fontSize: 14, color: '#b28704', marginTop: 8 }}>
          <b>Relevant Sections:</b> {finding.user_chunks.join(' | ')}
        </div>
      )}
    </div>
  );
}
