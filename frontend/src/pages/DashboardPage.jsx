import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function randomId() {
  return Math.random().toString(36).substring(2, 10);
}

function DashboardPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [drafts] = useState([
    { id: 'draft1', title: 'Wedding Invitation (Draft)' },
    { id: 'draft2', title: 'Birthday Party (Draft)' },
  ]);
  const [published] = useState([
    { id: 'pub1', title: 'My Portfolio Site' },
  ]);

  const handleCreateNew = () => {
    const newId = randomId();
    navigate(`/editor/${newId}`);
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Welcome back, {user.nickname}!</h2>
        <button onClick={onLogout} style={{ padding: '8px 16px' }}>Logout</button>
      </div>
      <button
        style={{
          margin: '24px 0',
          padding: '12px 24px',
          fontSize: 16,
          background: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: 4
        }}
        onClick={handleCreateNew}
      >
        Create New Page
      </button>
      <div style={{ marginTop: 32 }}>
        <h3>Drafts</h3>
        <div>
          {drafts.map(draft => (
            <div key={draft.id} style={{
              padding: 12,
              marginBottom: 8,
              background: '#f5f5f5',
              borderRadius: 6
            }}>
              {draft.title}
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 32 }}>
        <h3>Published</h3>
        <div>
          {published.map(pub => (
            <div key={pub.id} style={{
              padding: 12,
              marginBottom: 8,
              background: '#e9f7ef',
              borderRadius: 6
            }}>
              {pub.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;