import React from 'react';
import { usePageComponentSync } from '../hooks/usePageComponentSync';

const PageComponentStatus = ({ components }) => {
  const { getPageComponentsSummary } = usePageComponentSync();
  const summary = getPageComponentsSummary(components);

  if (summary.total === 0) {
    return null;
  }

  const deployedCount = summary.withUrl;
  const pendingCount = summary.withoutUrl;
  const deploymentRate = summary.total > 0 ? Math.round((deployedCount / summary.total) * 100) : 0;

  return (
    <div className="page-component-status">
      <div className="status-header">
        <span className="status-icon">📄</span>
        <span className="status-title">페이지 컴포넌트 상태</span>
      </div>
      
      <div className="status-summary">
        <div className="status-item">
          <span className="status-label">총 개수:</span>
          <span className="status-value">{summary.total}개</span>
        </div>
        
        <div className="status-item">
          <span className="status-label">배포됨:</span>
          <span className="status-value deployed">{deployedCount}개</span>
        </div>
        
        <div className="status-item">
          <span className="status-label">대기중:</span>
          <span className="status-value pending">{pendingCount}개</span>
        </div>
        
        <div className="status-item">
          <span className="status-label">배포율:</span>
          <span className="status-value rate">{deploymentRate}%</span>
        </div>
      </div>

      {pendingCount > 0 && (
        <div className="status-warning">
          <span className="warning-icon">⚠️</span>
          <span className="warning-text">
            {pendingCount}개의 페이지 컴포넌트가 배포되지 않았습니다.
          </span>
        </div>
      )}

      <div className="status-progress">
        <div 
          className="progress-bar"
          style={{ width: `${deploymentRate}%` }}
        />
      </div>

      <style jsx>{`
        .page-component-status {
          background: #ffffff;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .status-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .status-icon {
          font-size: 16px;
        }

        .status-title {
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .status-summary {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-bottom: 12px;
        }

        .status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
        }

        .status-label {
          font-size: 12px;
          color: #666;
        }

        .status-value {
          font-size: 12px;
          font-weight: 600;
        }

        .status-value.deployed {
          color: #4caf50;
        }

        .status-value.pending {
          color: #ff9800;
        }

        .status-value.rate {
          color: #2196f3;
        }

        .status-warning {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 4px;
          margin-bottom: 12px;
        }

        .warning-icon {
          font-size: 14px;
        }

        .warning-text {
          font-size: 12px;
          color: #856404;
        }

        .status-progress {
          height: 4px;
          background: #f0f0f0;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #4caf50, #8bc34a);
          transition: width 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default PageComponentStatus; 