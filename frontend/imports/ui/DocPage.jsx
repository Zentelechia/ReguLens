import React, { useEffect, useState, useRef } from 'react';
import jsPDF from 'jspdf';
import { useParams, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { FindingsSidebar } from './DocPage/FindingsSidebar';
import { ReportModal } from './DocPage/ReportModal';
import { DocDetails } from './DocPage/DocDetails';


// Try to get findings from location.state, else from doc, else mock
const getFindingsFromLocation = (location, doc) => {
  if (location?.state?.findings && Array.isArray(location.state.findings)) {
    return location.state.findings;
  }
  if (doc && Array.isArray(doc.findings)) {
    return doc.findings;
  }
  // Mock findings for demo/testing
  return [
    {
      law_clause: '1.1.1',
      compliance: 'No',
      type: 'Gap',
      comment: 'Section 1.1.1 (General Requirements) is missing entirely from the uploaded handbook. This section is required to outline the scope and applicability of the manual.',
      user_chunks: ['Section 1', 'Section 2']
    },
    {
      law_clause: '2.2.2',
      compliance: 'Partial',
      type: 'Contradiction',
      comment: 'Section 2.2.2 contains statements that contradict Section 2.1.1 regarding maintenance intervals. Please clarify which interval is correct and ensure consistency throughout the document.',
      user_chunks: ['Section 3']
    },
    {
      law_clause: '3.3.5',
      compliance: 'No',
      type: 'Omission',
      comment: 'No evidence of a safety management system (SMS) policy was found. An explicit SMS policy is required by regulation 3.3.5.',
      user_chunks: ['Section 5.1', 'Section 5.2']
    },
    {
      law_clause: '4.4.1',
      compliance: 'Partial',
      type: 'Formatting',
      comment: 'Section 4.4.1 is present but lacks the required table of responsibilities. Please add a table listing all responsible persons and their roles as per the regulation.',
      user_chunks: ['Section 4.4.1']
    },
    {
      law_clause: '5.2.3',
      compliance: 'No',
      type: 'Reference Error',
      comment: 'Section 5.2.3 references "Appendix B" but no such appendix exists in the document. Please add the missing appendix or correct the reference.',
      user_chunks: ['Section 5.2.3']
    },
    {
      law_clause: '6.1.1',
      compliance: 'No',
      type: 'Gap',
      comment: 'There is no description of the document control process. Regulation 6.1.1 requires a clear explanation of how document revisions are managed and tracked.',
      user_chunks: ['Section 6']
    },
    {
      law_clause: '7.2.2',
      compliance: 'Partial',
      type: 'Ambiguity',
      comment: 'Section 7.2.2 uses ambiguous language regarding staff training requirements. Please specify the minimum training hours and required certifications.',
      user_chunks: ['Section 7.2.2']
    },
    {
      law_clause: '8.3.4',
      compliance: 'No',
      type: 'Omission',
      comment: 'No emergency procedures are described in Section 8.3.4. This section must include step-by-step instructions for emergency response.',
      user_chunks: ['Section 8.3.4']
    },
    {
      law_clause: '9.1.1',
      compliance: 'Partial',
      type: 'Formatting',
      comment: 'Section 9.1.1 is present but the required flowchart is missing. Please include a process flowchart for incident reporting.',
      user_chunks: ['Section 9.1.1']
    },
    {
      law_clause: '10.2.1',
      compliance: 'No',
      type: 'Contradiction',
      comment: 'Section 10.2.1 contradicts Section 10.1.1 regarding the approval process for technical changes. Please resolve the inconsistency and ensure only one process is described.',
      user_chunks: ['Section 10.2.1', 'Section 10.1.1']
    }
  ];
};


export const DocPage = () => {
  // Remove diagonal background on findings page
  useEffect(() => {
    document.body.classList.remove('main-bg-diagonal');
  }, []);
  const { id } = useParams();
  const location = useLocation();
  const markdownRef = useRef();

  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [doc, setDoc] = useState(null);

  // findings: prefer location.state, else doc
  const findings = getFindingsFromLocation(location, doc);
  const hasFindings = findings.length > 0;

  useEffect(() => {
    if (hasFindings) console.log('Findings:', findings);
  }, [findings, hasFindings]);

  // PDF DOWNLOAD
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Findings Report', 14, 18);

    let y = 30;
    findings.forEach((f, i) => {
      doc.setFontSize(14);
      doc.text(`${i + 1}. ${f.law_clause || f.clause || f.findingTitle || 'Law Clause'}`, 14, y);
      y += 7;

      doc.setFontSize(11);
      doc.text(`Type: ${JSON.stringify(f.type)}`, 14, y); y += 6;
      doc.text(`Comment: ${JSON.stringify(f.comment)}`, 14, y); y += 6;
      doc.text(`Compliance: ${JSON.stringify(f.compliance)}`, 14, y); y += 6;

      if (Array.isArray(f.user_chunks) && f.user_chunks.length > 0) {
        doc.text(`Relevant Chunks: ${f.user_chunks.join(' | ')}`, 14, y);
        y += 6;
      }

      y += 4;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save('findings-report.pdf');
  };

  // LOAD MARKDOWN
  useEffect(() => {
    setLoading(true);
    setError(null);

    if (!id) {
      setError('No document ID provided.');
      setLoading(false);
      return;
    }

    Meteor.call('docs.get', id, (err, docResult) => {
      if (err || !docResult) {
        setError('Failed to load document.');
        setLoading(false);
        return;
      }

      setDoc(docResult);

      let content = '';
      if (docResult.data && typeof docResult.data === 'string') {
        const base64Match = docResult.data.match(/^data:.*;base64,(.*)$/);
        content = base64Match ? atob(base64Match[1]) : docResult.data;
      }

      setMarkdown(content);
      setLoading(false);
    });
  }, [id]);

  // No highlight for relevant sections
  const getHighlightedMarkdown = () => markdown;

  // UI
  return (
    <>
      <img
        src="/traficom.svg"
        alt="Traficom"
        style={{ maxWidth: 220, margin: '8px auto 0 auto', display: 'block' }}
      />

      <div style={{ display: 'flex', margin: '10px auto', padding: 12 }}>
        {/* SIDEBAR */}
        <FindingsSidebar findings={findings} activeTab={activeTab} setActiveTab={setActiveTab} setShowReport={setShowReport} />

        {/* MAIN CONTENT */}

        <div
          ref={markdownRef}
          style={{
            flex: 1,
            background: '#fff',
            border: '1px solid #eee',
            borderRadius: 8,
            padding: 24,
            overflowX: 'auto',
            position: 'relative'
          }}
        >
          <h2>Handbook</h2>

          {loading && <div>Loading markdown...</div>}
          {error && <div style={{ color: 'red' }}>{error}</div>}

          {!loading && !error && (
            <>
              {/* Sticky/absolute finding box with reserved space */}
              <div style={{ position: 'relative', minHeight: 110 }}>
                {hasFindings && findings[activeTab] && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 2,
                    borderRadius: 8,
                    padding: 0,
                    background: 'inherit'
                  }}>
                    <DocDetails finding={findings[activeTab]} />
                  </div>
                )}
              </div>
              <div style={{ marginTop: 8 }}>
                <ReactMarkdown>{getHighlightedMarkdown()}</ReactMarkdown>
              </div>
            </>
          )}

          {/* REPORT MODAL */}
          {showReport && (
            <ReportModal findings={findings} onClose={() => setShowReport(false)} onDownload={handleDownloadPDF} />
          )}

        </div>
      </div>
    </>
  );
};
