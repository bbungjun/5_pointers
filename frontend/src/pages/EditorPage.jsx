import React from 'react';
import { useParams } from 'react-router-dom';

function EditorPage() {
  const { pageId } = useParams();

  return (
    <div style={{
      maxWidth: 700,
      margin: '60px auto',
      padding: 32,
      border: '1px solid #eee',
      borderRadius: 12,
      background: '#f8f9fa'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
      }}>
        <h2>Template Editing Canvas</h2>
        <div>
          <button style={{ marginRight: 12, padding: '8px 16px' }}>Preview</button>
          <button style={{ padding: '8px 16px' }}>Deploy</button>
        </div>
      </div>
      <div style={{
        minHeight: 300,
        background: '#fff',
        border: '1px dashed #bbb',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        color: '#888'
      }}>
        (Page ID: {pageId})<br />
        Template Editing Canvas
      </div>
    </div>
  );
}

export default EditorPage;