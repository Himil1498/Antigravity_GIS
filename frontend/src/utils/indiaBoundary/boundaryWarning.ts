
/**
 * Show enhanced warning notification when user tries to use tool outside India
 */
export const showOutsideIndiaWarning = (): void => {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.2s ease-out;
  `;

  // Create warning modal
  const modal = document.createElement('div');
  modal.style.cssText = `
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border: 2px solid #ef4444;
    border-radius: 16px;
    padding: 32px;
    max-width: 480px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(239, 68, 68, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
    animation: slideIn 0.3s ease-out;
    position: relative;
  `;

  modal.innerHTML = `
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideIn {
        from {
          transform: translateY(-20px) scale(0.95);
          opacity: 0;
        }
        to {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
    </style>
    <div style="text-align: center;">
      <!-- Warning Icon -->
      <div style="
        width: 80px;
        height: 80px;
        margin: 0 auto 24px;
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
        animation: pulse 2s ease-in-out infinite;
      ">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <!-- Title -->
      <h2 style="
        color: #ffffff;
        font-size: 26px;
        font-weight: 700;
        margin: 0 0 12px 0;
        letter-spacing: -0.5px;
      ">Restricted Area</h2>

      <!-- Message -->
      <p style="
        color: #cbd5e1;
        font-size: 16px;
        line-height: 1.6;
        margin: 0 0 24px 0;
      ">
        GIS tools can only be used within <strong style="color: #60a5fa;">India's boundaries</strong>.
      </p>

      <div style="
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 24px;
      ">
        <p style="
          color: #fca5a5;
          font-size: 14px;
          margin: 0;
          line-height: 1.5;
        ">
          📍 Please click inside India to place your marker or point.
        </p>
      </div>

      <!-- Button -->
      <button id="closeWarningBtn" style="
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        border: none;
        border-radius: 12px;
        padding: 14px 32px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
        transition: all 0.2s ease;
      "
      onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(59, 130, 246, 0.5)';"
      onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 16px rgba(59, 130, 246, 0.4)';"
      >
        Understood
      </button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Close on button click
  const closeBtn = modal.querySelector('#closeWarningBtn');
  const closeModal = () => {
    overlay.style.animation = 'fadeOut 0.2s ease-out';
    setTimeout(() => {
      document.body.removeChild(overlay);
    }, 200);
  };

  closeBtn?.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Add fadeOut animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
};

