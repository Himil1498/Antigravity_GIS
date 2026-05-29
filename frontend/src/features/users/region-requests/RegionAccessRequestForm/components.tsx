import React from 'react';
import { INDIAN_STATES } from '../../../../utils/regionMapping/index';
import { RegionSelectionProps, PendingRequestsProps, RequestHistoryProps } from './types';

export const RegionSelection: React.FC<RegionSelectionProps> = ({ selectedRegions, assignedRegions, pendingRegions, onToggle }) => {
  const isAssigned = (r: string) => assignedRegions.includes(r);
  const isPending = (r: string) => pendingRegions.includes(r);
  const isSelectable = (r: string) => !isAssigned(r) && !isPending(r);

  return (
    <div className="ra-selection-grid" style={{ padding: '0.25rem' }}>
      {INDIAN_STATES.filter(region => isSelectable(region)).map(region => {
        const selected = selectedRegions.includes(region);
        
        let cardClass = "ra-selection-card";
        if (selected) cardClass += " selected";
        
        return (
          <label key={region} className={cardClass}>
            <div className="ra-selection-checkbox">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <input 
              type="checkbox" 
              checked={selected} 
              onChange={() => onToggle(region)} 
              style={{ display: 'none' }}
            />
            <span className="ra-selection-name">
              {region}
            </span>
          </label>
        );
      })}
    </div>
  );
};

const formatDateTime = (date: Date | string) => {
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

export const PendingRequests: React.FC<PendingRequestsProps> = ({ requests, onCancel }) => {
  if (requests.length === 0) return null;
  return (
    <div className="ra-card" style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}>
      <div className="ra-card-header" style={{ background: 'rgba(245, 158, 11, 0.05)' }}>
        <h3 className="ra-card-title" style={{ color: '#b45309' }}>
          <svg className="ra-icon-amber" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Pending Requests
          <span className="ra-badge-count" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#92400e' }}>
            {requests.length}
          </span>
        </h3>
      </div>
      <div className="ra-card-body">
        <div className="ra-pending-list">
          {requests.map(request => (
            <div key={request.id} className="ra-pending-item">
              <div className="ra-pending-header">
                <span className="ra-pending-status">⏳ Awaiting Approval</span>
                <span className="ra-pending-date">Requested: {formatDateTime(request.createdAt)}</span>
              </div>
              <div className="ra-region-tags" style={{ marginBottom: '0.75rem' }}>
                {request.requestedRegions.map((region: string) => (
                  <span key={region} className="ra-region-tag pending">
                    {region}
                  </span>
                ))}
              </div>
              {request.reason && (
                <p className="ra-pending-reason">
                  <strong>Reason:</strong> "{request.reason}"
                </p>
              )}
              <div style={{ textAlign: 'right' }}>
                <button onClick={() => onCancel(request.id)} className="ra-cancel-btn">
                  Cancel Request
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const RequestHistory: React.FC<RequestHistoryProps> = ({ requests, onCancel }) => {
  if (requests.length === 0) return null;
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return { 
        className: 'green', 
        icon: '✅', label: 'Approved' 
      };
      case 'rejected': return { 
        className: 'red', 
        icon: '❌', label: 'Rejected' 
      };
      case 'cancelled': return { 
        className: 'gray', 
        icon: '🚫', label: 'Cancelled' 
      };
      default: return { 
        className: 'amber', 
        icon: '⏳', label: 'Pending' 
      };
    }
  };

  return (
    <div className="ra-card">
      <div className="ra-card-header">
        <h3 className="ra-card-title">
          <svg className="ra-icon-blue" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Request History
          <span className="ra-badge-count blue">
            {requests.length}
          </span>
        </h3>
      </div>
      <div className="ra-history-wrapper">
        <table className="ra-history-table" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th className="ra-history-th" style={{ width: '25%' }}>Region</th>
              <th className="ra-history-th" style={{ width: '15%' }}>Status</th>
              <th className="ra-history-th" style={{ width: '25%' }}>Requested</th>
              <th className="ra-history-th" style={{ width: '25%' }}>Reviewed</th>
              <th className="ra-history-th" style={{ width: '10%', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(request => {
              const badge = getStatusBadge(request.status);
              return (
                <tr key={request.id}>
                  <td className="ra-history-td">
                    <div className="ra-region-tags" style={{ gap: '0.25rem' }}>
                      {request.requestedRegions.map((r: string) => (
                        <span key={r} style={{ padding: '0.125rem 0.375rem', fontSize: '0.75rem', background: 'rgba(59,130,246,0.1)', color: '#1d4ed8', borderRadius: '0.25rem' }}>
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="ra-history-td">
                    <span className={`ra-badge-count ${badge.className}`} style={{ marginLeft: 0 }}>
                      {badge.icon} {badge.label}
                    </span>
                  </td>
                  <td className="ra-history-td" style={{ fontSize: '0.75rem' }}>
                    {formatDateTime(request.createdAt)}
                  </td>
                  <td className="ra-history-td" style={{ fontSize: '0.75rem' }}>
                    {request.reviewedAt ? (
                      <div>
                        <div style={{ fontWeight: 500 }}>{formatDateTime(request.reviewedAt)}</div>
                        {request.reviewedByName && (
                          <div style={{ color: '#6b7280' }}>by {request.reviewedByName}</div>
                        )}
                        {request.reviewNotes && (
                          <div style={{ fontStyle: 'italic', marginTop: '0.25rem' }}>"{request.reviewNotes}"</div>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontStyle: 'italic', color: '#9ca3af' }}>— Not yet reviewed</span>
                    )}
                  </td>
                  <td className="ra-history-td" style={{ textAlign: 'center' }}>
                    {request.status === 'pending' && onCancel && (
                      <button 
                        onClick={() => onCancel(request.id)} 
                        className="ra-cancel-btn" 
                        title="Cancel Request"
                        style={{ padding: '0.25rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
