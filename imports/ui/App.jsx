import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

// Ensure Meteor method is loaded on client
import '../api/docs';



export const App = () => {
  const history = useHistory();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

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
      }, (err, res) => {
        setUploading(false);
        if (err) {
          setMessage('Upload failed: ' + (err.reason || err.message));
        } else {
          setMessage('File uploaded successfully!');
          setFile(null);
          document.getElementById('moe-upload').value = '';
          if (res) {
            history.push(`/doc/${res}`);
          }
        }
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 8, background: '#fafbfc' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 24 }}>Upload your MoE so we can check it for compliance</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="moe-upload" style={{ display: 'block', marginBottom: 12, fontWeight: 500 }}>
          Upload Document (MoE)
        </label>
        <input type="file" id="moe-upload" name="moe-upload" accept=".pdf,.md,.doc,.docx,.txt" style={{ marginBottom: 20 }} onChange={handleFileChange} />
        <button type="submit" disabled={uploading} style={{ marginLeft: 8 }}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {message && <div style={{ marginTop: 16 }}>{message}</div>}
    </div>
  );
};
