import React from 'react';
import { useFind, useSubscribe } from 'meteor/react-meteor-data';
import { DocsCollection } from '../api/docs';
import { useHistory } from 'react-router-dom';

export const UploadedFiles = () => {
  useSubscribe('docs');
  const docs = useFind(() => DocsCollection.find({}, { sort: { uploadedAt: -1 } }));
  const history = useHistory();

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 2px 12px #e3eaf7' }}>
      <h2>Uploaded Files</h2>
      {docs.length === 0 ? (
        <div>No files uploaded yet.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {docs.map(doc => (
            <li key={doc._id} style={{ marginBottom: 12 }}>
              <button
                style={{
                  background: '#e3eaf7',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: 16
                }}
                onClick={() => history.push(`/doc/${doc._id}`)}
              >
                {doc.name || doc._id}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
