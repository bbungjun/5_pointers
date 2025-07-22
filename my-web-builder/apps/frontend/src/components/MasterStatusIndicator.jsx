import React from 'react';

/**
 * 마스터 상태 표시 컴포넌트 (접속 순서 기반)
 */
const MasterStatusIndicator = ({ 
  isMaster, 
  masterUserId, 
  userInfo, 
  connectedUsers = [], 
  totalUsers = 0,
  myJoinOrder = null,
  getNextMaster = null
}) => {
  if (!userInfo) return null;

  const masterUser = connectedUsers.find(user => user.userId === masterUserId);
  const nextMaster = getNextMaster && getNextMaster();

  return (
    <div className="master-status-indicator" style={{
      position: 'fixed',
      top: '70px',
      right: '10px',
      background: isMaster ? '#4CAF50' : '#2196F3',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      minWidth: '250px',
      flexDirection: 'column',
      alignItems: 'flex-start'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {isMaster ? (
          <>
            <span>👑</span>
            <span>마스터 (1번째 접속자)</span>
          </>
        ) : (
          <>
            <span>👤</span>
            <span>
              {myJoinOrder ? `${myJoinOrder}번째 접속자` : '일반 사용자'}
              {masterUser && ` - 마스터: ${masterUser.userName}`}
            </span>
          </>
        )}
      </div>
      
      <div style={{ fontSize: '10px', opacity: 0.9 }}>
        총 {totalUsers}명 접속
        {!isMaster && nextMaster && myJoinOrder === 2 && (
          <span style={{ color: '#FFE082' }}> • 다음 마스터 대기</span>
        )}
      </div>
    </div>
  );
};

export default MasterStatusIndicator;
