import React from 'react';

const PageThumbnail = () => {
  return React.createElement('div', {
    style: {
      width: '80px',
      height: '60px',
      backgroundColor: '#f8f9fa',
      border: '2px solid #007bff',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      cursor: 'grab'
    }
  }, [
    React.createElement('div', { 
      key: 'icon',
      style: { fontSize: '20px' } 
    }, '📄'),
    React.createElement('div', { 
      key: 'label',
      style: { 
        fontSize: '10px', 
        fontWeight: 'bold',
        color: '#007bff',
        textAlign: 'center'
      }
    }, 'Page')
  ]);
};

export default PageThumbnail;
