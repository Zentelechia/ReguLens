
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
// Webpack will not bundle .md files by default in Meteor, so we fetch it at runtime



// Mock findings array
const findings = [
  {
    findingTitle: 'Missing Responsible Manager',
    textPosition: 4000,
    comment: 'The responsible manager contact is missing a required field.',
    description: 'According to Regulation XYZ §12.3, the responsible manager’s full contact information must be present in the MoE. This omission is a direct contradiction to the compliance requirement.',
    length: 100
  },
  {
    findingTitle: 'Outdated Revision',
    textPosition: 10000,
    comment: 'The document revision is not up to date.',
    description: 'Regulation ABC §2.1 requires that the latest revision date and number be clearly indicated. The current document does not reflect the latest approved revision.',
    length: 80
  },
  {
    findingTitle: 'No Email for Technical Manager',
    textPosition: 30,
    comment: 'Technical manager email is missing.',
    description: 'Per Regulation DEF §5.4, the technical manager’s email address must be provided for official correspondence. Its absence is a compliance issue.',
    length: 400
  }
];

export const DocPage = () => {
  const { id } = useParams();
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const markdownRef = useRef();

  useEffect(() => {
    fetch('/moe.md')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load markdown');
        return res.text();
      })
      .then(setMarkdown)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Scroll to the finding's text position in the markdown
  useEffect(() => {
    if (selectedFinding && markdownRef.current) {
      const el = document.getElementById('finding-' + selectedFinding.textPosition);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedFinding]);

  // Highlight findings in markdown by injecting spans using textPosition and length
  const getHighlightedMarkdown = () => {
    let md = markdown;
    // Sort findings in reverse order to avoid messing up positions as we insert tags
    const sortedFindings = [...findings].sort((a, b) => (b.textPosition - a.textPosition));
    sortedFindings.forEach(f => {
      if (
        typeof f.textPosition === 'number' &&
        typeof f.length === 'number' &&
        f.textPosition < md.length &&
        f.length > 0
      ) {
        md =
          md.slice(0, f.textPosition) +
          `<span id="finding-${f.textPosition}" class="highlight-finding">` +
          md.slice(f.textPosition, f.textPosition + f.length) +
          '</span>' +
          md.slice(f.textPosition + f.length);
      }
    });
    return md;
  };

  // Add highlight CSS to the document head if not already present
  useEffect(() => {
    if (!document.getElementById('highlight-finding-style')) {
      const style = document.createElement('style');
      style.id = 'highlight-finding-style';
      style.innerHTML = `.highlight-finding { background: #ffe066 !important; }`;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div style={{ display: 'flex',  margin: '40px auto', padding: 24 }}>
      {/* Tabs/Findings List */}
  <div style={{ width: 240, minWidth: 240, maxWidth: 240, marginRight: 32, position: 'sticky', top: 40, alignSelf: 'flex-start' }}>
        <h3 style={{ marginTop: 0 }}>Findings</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {findings.map((f, i) => (
            <li key={i} style={{ marginBottom: 16 }}>
              <button
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: selectedFinding === f ? '#e3f2fd' : '#f7f7f7',
                  border: '1px solid #ddd',
                  borderRadius: 6,
                  padding: '10px 12px',
                  cursor: 'pointer',
                  fontWeight: selectedFinding === f ? 600 : 400
                }}
                onClick={() => setSelectedFinding(f)}
              >
                <div>{f.findingTitle}</div>
                <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{f.comment}</div>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/* Markdown Viewer */}
  <div style={{ flex: 1, background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 24, overflowX: 'auto', position: 'relative' }} ref={markdownRef}>
        <h2>MoE Document</h2>
        <p>Document ID: {id}</p>
        {loading && <div>Loading markdown...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!loading && !error && (
          <>
            {/* Show comment above highlighted text if a finding is selected */}
            {selectedFinding && (
              <div style={{
                position: 'fixed',
                left: markdownRef.current ? markdownRef.current.getBoundingClientRect().left + window.scrollX : 0,
                width: markdownRef.current ? markdownRef.current.offsetWidth : 'auto',
                top: 0,
                background: '#fffbe6',
                border: '1px solid #ffe066',
                borderRadius: 6,
                padding: '12px 18px',
                marginBottom: 16,
                zIndex: 1000,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <b>Comment:</b> {selectedFinding.comment}
                <div style={{ marginTop: 8, fontSize: 14, color: '#555' }}>
                  <b>Contradiction:</b> {selectedFinding.description}
                </div>
              </div>
            )}
            <ReactMarkdown
              children={getHighlightedMarkdown()}
              allowDangerousHtml
              skipHtml={false}
            />
          </>
        )}
      </div>
    </div>
  );
};
