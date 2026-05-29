import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import NotificationDialog from '../../../../components/ui/NotificationDialog';
import { INDIAN_STATES } from '../../../../utils/regionMapping/index';
import { useRegionAccessRequest } from './useRegionAccessRequest';
import { RegionSelection, PendingRequests, RequestHistory } from './components';
import './RegionAccess.css';

const RegionAccessRequestForm: React.FC = () => {
  const {
    user, selectedRegions, reason, setReason, userRequests, isSubmitting, isRefreshing, notification,
    assignedRegions, pendingRequests, pendingRegions,
    handleRegionToggle, handleSubmit, closeNotification, loadUserRequests,
    confirmingDeleteId, requestDeleteConfirmation, confirmDelete, cancelDeleteConfirmation,
  } = useRegionAccessRequest();
  const navigate = useNavigate();

  const iconVariants: Variants = {
    idle: { scale: 1, rotate: 0, y: 0 },
    hover: { 
      scale: 1.15, 
      rotate: [0, -10, 10, 0],
      y: [0, -2, 0],
      transition: { duration: 0.4 }
    }
  };

  if (!user) {
    return (
      <div className="ra-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="ra-title">Please log in to request region access.</p>
      </div>
    );
  }

  const confirmingRequest = confirmingDeleteId ? pendingRequests.find(r => r.id === confirmingDeleteId) : null;

  return (
    <div className="ra-container">
      {/* Header */}
      <div className="ra-header-wrapper">
        <div className="ra-header-inner">
          <div className="ra-header-content">
            <div className="ra-header-left">
              <button onClick={() => navigate(-1)} className="ra-back-btn" title="Go Back">
                <ArrowLeft className="ra-back-icon" />
              </button>

              <motion.div className="ra-icon-box" initial="idle" whileHover="hover">
                <motion.svg variants={iconVariants} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </motion.svg>
              </motion.div>
              <div className="ra-title-group">
                <h1 className="ra-title">Region Access Request</h1>
                <p className="ra-subtitle">Request access to additional regions. Administrators will review your request.</p>
              </div>
            </div>
            <div className="ra-header-right">
              <button onClick={() => { loadUserRequests(); }} disabled={isRefreshing} className="ra-refresh-btn">
                <svg className={`ra-spin-icon ${isRefreshing ? 'spinning' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="ra-main-content">
        
        {/* Left Sidebar (My Access & Pending) */}
        <div className="ra-sidebar">
          
          {/* Assigned Regions */}
          <div className="ra-card">
            <div className="ra-card-header">
              <h3 className="ra-card-title">
                <svg className="ra-icon-green" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                My Regions
                <span className="ra-badge-count green">{assignedRegions.length}</span>
              </h3>
              <p className="ra-card-desc">Regions you currently have access to.</p>
            </div>
            <div className="ra-card-body">
              {assignedRegions.length > 0 ? (
                <div className="ra-region-tags">
                  {assignedRegions.map(region => (
                    <span key={region} className="ra-region-tag assigned">
                      <div className="ra-region-dot assigned" />
                      {region}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="ra-empty-state">
                  <svg className="ra-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="ra-empty-text">No regions currently assigned.</p>
                </div>
              )}
            </div>
          </div>

          {/* Pending Requests */}
          <PendingRequests requests={pendingRequests} onCancel={requestDeleteConfirmation} />

        </div>

        {/* Right Area (Request Form & History) */}
        <div className="ra-sidebar">
          
          {/* Form */}
          <div className="ra-card">
            <div className="ra-card-header">
              <h3 className="ra-card-title">
                <svg className="ra-icon-blue" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Request New Access
              </h3>
              <p className="ra-card-desc">Select the regions you need and provide a brief justification to speed up approval.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="ra-card-body">
              <div className="ra-form-grid">
                
                {/* Region Selection component */}
                <div>
                  <div className="ra-form-label-row">
                    <label className="ra-form-label" style={{ display: 'flex', alignItems: 'center' }}>
                      Select Regions
                      <span className="ra-badge-count green" style={{ marginLeft: '8px' }}>Assigned: {assignedRegions.length}</span>
                      <span className="ra-badge-count" style={{ marginLeft: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#b91c1c' }}>Not Assigned: {INDIAN_STATES.length - assignedRegions.length - pendingRegions.length}</span>
                    </label>
                    <span className="ra-badge-count blue">{selectedRegions.length} selected</span>
                  </div>
                  <RegionSelection selectedRegions={selectedRegions} assignedRegions={assignedRegions} pendingRegions={pendingRegions} onToggle={handleRegionToggle} />
                </div>
                
                {/* Reason Textarea */}
                <div>
                  <label htmlFor="reason" className="ra-form-label">Business Justification <span style={{ color: '#ef4444' }}>*</span></label>
                  <textarea 
                    id="reason" 
                    value={reason} 
                    onChange={(e) => setReason(e.target.value)} 
                    placeholder="E.g. I need access to the East region for the Q4 fiber deployment analysis..." 
                    className="ra-textarea" 
                    required 
                    minLength={3} 
                  />
                  <p className="ra-form-helper">Minimum 3 characters required.</p>
                </div>

                {/* Submit */}
                <button 
                  type="submit" 
                  disabled={isSubmitting || selectedRegions.length === 0 || reason.trim().length < 3} 
                  className="ra-submit-btn"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="ra-spin-icon spinning" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Submit Request
                    </>
                  )}
                </button>

              </div>
            </form>
          </div>

        </div>

        {/* Request History - Full Width */}
        <div style={{ gridColumn: '1 / -1' }}>
          <RequestHistory requests={userRequests} onCancel={requestDeleteConfirmation} />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmingDeleteId && (
          <div className="ra-modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="ra-modal-content"
            >
              <h3 className="ra-card-title" style={{ marginBottom: '0.5rem' }}>Cancel Region Request</h3>
              <p className="ra-card-desc" style={{ marginBottom: '1rem' }}>Are you sure you want to cancel your access request for:</p>
              
              {confirmingRequest && (
                <div className="ra-region-tags" style={{ marginBottom: '1.5rem', background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                  {confirmingRequest.requestedRegions.map((r: string) => (
                    <span key={r} className="ra-region-tag pending">{r}</span>
                  ))}
                </div>
              )}
              
              <p className="ra-form-helper" style={{ marginBottom: '1.5rem' }}>You will need to submit a new request if you change your mind later.</p>
              
              <div className="ra-modal-actions">
                <button onClick={cancelDeleteConfirmation} className="ra-modal-btn ra-modal-btn-cancel">Keep Request</button>
                <button onClick={confirmDelete} className="ra-modal-btn ra-modal-btn-danger">Yes, Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <NotificationDialog 
        isOpen={notification.isOpen} 
        onClose={closeNotification} 
        type={notification.type} 
        title={notification.title} 
        message={notification.message} 
        autoClose={notification.type === 'success'} 
        autoCloseDelay={3000} 
      />
    </div>
  );
};

export default RegionAccessRequestForm;
