import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

// Ensure Meteor method is loaded on client
import '../api/docs';



export const App = () => {
  // Set diagonal background on body for main page
  useEffect(() => {
    document.body.classList.add('main-bg-diagonal');
    return () => {
      document.body.classList.remove('main-bg-diagonal');
    };
  }, []);
  const history = useHistory();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [analysing, setAnalysing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    setUploading(true);
    setMessage("");

    // Read file as base64 (for demo, not for large files in production)
    const reader = new FileReader();
    reader.onload = function(evt) {
      const fileData = evt.target.result;
      Meteor.call('docs.upload', {
        name: file.name,
        type: file.type,
        size: file.size,
        data: fileData
      }, async (err, res) => {
        setUploading(false);
        if (err) {
          setMessage('Upload failed: ' + (err.reason || err.message));
        } else {
          setMessage('File uploaded successfully!');
          setFile(null);
          document.getElementById('moe-upload').value = '';
          if (res) {
            // Send file to backend API for analysis
            setAnalysing(true);
            setProgress(0);
            try {
              const formData = new FormData();
              formData.append('user_file', file);
              // Use fetch with progress simulation for long-running request
              const duration = 12000 + Math.floor(Math.random() * 3000); // 12-15s
              let elapsed = 0;
              const interval = 200;
              const timer = setInterval(() => {
                elapsed += interval;
                setProgress(Math.min(99, Math.round((elapsed / duration) * 100)));
              }, interval);
              const response = await fetch('http://localhost:8000/large_manual_audit', {
                method: 'POST',
                body: formData
              });
              clearInterval(timer);
              setProgress(100);
              if (!response.ok) {
                setAnalysing(false);
                setMessage('Analysis failed: ' + response.statusText);
                return;
              }
              // Parse findings from response
              let findings = [];
              try {
                const data = await response.json();
                findings = data.findings || data || [];
              } catch (e) {
                setAnalysing(false);
                setMessage('Failed to parse findings: ' + e.message);
                return;
              }
              // Save findings to db
              Meteor.call('findings.save', res, findings, (err2) => {
                setAnalysing(false);
                if (err2) {
                  setMessage('Failed to save findings: ' + (err2.reason || err2.message));
                } else {
                  setMessage('File uploaded and findings saved!');
                }
              });
            } catch (e) {
              setAnalysing(false);
              setMessage('Analysis failed: ' + e.message);
            }
          }
        }
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{
      maxWidth: 520,
      margin: '48px auto',
      padding: 0,
      borderRadius: 18,
      background: '#fff',
      boxShadow: '0 6px 32px rgba(0,44,116,0.10), 0 1.5px 6px rgba(0,44,116,0.08)',
      border: '1.5px solid #e3eaf7',
      overflow: 'hidden',
      fontFamily: 'Montserrat, Avenir, Arial, sans-serif'
    }}>
      <div style={{ padding: '36px 36px 28px 36px', background: 'linear-gradient(90deg, #e3eaf7 0%, #f7faff 100%)' }}>
        <img src="/traficom.svg" alt="Traficom" style={{ maxWidth: 180, margin: '0 auto 18px auto', display: 'block' }} />
        <h1 style={{ fontSize: '2.1rem', marginBottom: 18, textAlign: 'center', fontWeight: 700, letterSpacing: '-0.5px' }}>
          Upload your handbook so we can check it for compliance
        </h1>
        <button
          type="button"
          style={{
            margin: '12px auto 0 auto',
            display: 'block',
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 15,
            padding: '8px 18px',
            cursor: 'pointer',
            boxShadow: '0 1.5px 6px rgba(0,44,116,0.07)'
          }}
          onClick={() => history.push('/uploaded')}
        >
          View Uploaded Files
        </button>
      </div>
      <form onSubmit={handleSubmit} style={{ padding: '32px 36px 28px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <label htmlFor="moe-upload" style={{
          display: 'block',
          marginBottom: 14,
          fontWeight: 600,
          fontSize: 17,
          color: 'rgb(0,44,116)'
        }}>
          Upload Your Handbook (MoE)
        </label>
        <div style={{
          width: '100%',
          maxWidth: 340,
          minHeight: 110,
          border: '2.5px dashed #b3c6e6',
          borderRadius: 14,
          background: '#f7faff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 22,
          transition: 'border-color 0.2s',
          position: 'relative',
        }}>
          <input
            type="file"
            id="moe-upload"
            name="moe-upload"
            accept=".pdf,.md,.doc,.docx,.txt"
            style={{
              opacity: 0,
              width: '100%',
              height: '100%',
              position: 'absolute',
              left: 0,
              top: 0,
              cursor: 'pointer',
              zIndex: 2
            }}
            onChange={handleFileChange}
          />
          <span style={{
            color: '#1976d2',
            fontWeight: 500,
            fontSize: 16,
            zIndex: 1
          }}>
            {file ? file.name : 'Click or drag file here'}
          </span>
        </div>
        <button
          type="submit"
          disabled={uploading || analysing}
          style={{
            width: 180,
            padding: '12px 0',
            background: uploading || analysing ? '#b3c6e6' : '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: '0.5px',
            boxShadow: uploading || analysing ? 'none' : '0 2px 8px rgba(25,118,210,0.10)',
            cursor: uploading || analysing ? 'not-allowed' : 'pointer',
            marginTop: 8,
            marginBottom: 6,
            transition: 'background 0.2s, box-shadow 0.2s'
          }}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        {message && <div style={{ marginTop: 18, color: uploading ? '#888' : '#1976d2', fontWeight: 500 }}>{message}</div>}
        {analysing && (
          <div style={{ marginTop: 32, textAlign: 'center', width: '100%' }}>
            <div style={{ marginBottom: 12, fontWeight: 600, fontSize: 16, color: 'rgb(0,44,116)' }}>
              Analysing the document, identifying gaps and contradictions...
            </div>
            <div style={{
              width: '100%',
              height: 18,
              background: '#e3eaf7',
              borderRadius: 9,
              overflow: 'hidden',
              margin: '0 auto',
              maxWidth: 340,
              boxShadow: '0 1.5px 6px rgba(0,44,116,0.07)'
            }}>
              <div style={{
                width: progress + '%',
                height: '100%',
                background: '#1976d2',
                transition: 'width 0.1s linear'
              }} />
            </div>
            <div style={{ marginTop: 8, color: '#888', fontSize: 13 }}>{progress}%</div>
          </div>
        )}
      </form>
    </div>
  );
};
