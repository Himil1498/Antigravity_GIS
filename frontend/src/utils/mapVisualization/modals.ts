
import { DataEntry } from "./types";

/**
 * Create full elevation graph modal
 */
export function createElevationModal(entry: DataEntry, elevationData: any[], minElev: number, maxElev: number) {
  // Create modal overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(4px);
  `;

  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 900px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    font-family: system-ui, -apple-system, sans-serif;
  `;

  const elevRange = maxElev - minElev || 1;
  const chartWidth = 800;
  const chartHeight = 400;

  // Build elevation chart path
  const chartPoints = elevationData.map((point: any, i: number) => {
    const x = (i / (elevationData.length - 1)) * chartWidth;
    const normalizedElev = (point.elevation - minElev) / elevRange;
    const y = chartHeight - (normalizedElev * (chartHeight - 40) + 20);
    return `${x},${y}`;
  }).join(" ");

  // Build area fill path
  const areaPath = `0,${chartHeight} ${chartPoints} ${chartWidth},${chartHeight}`;

  // Calculate statistics
  const totalDistance = entry.data.distance || 0;
  const elevationGain = entry.data.elevationGain || 0;
  const elevationLoss = entry.data.elevationLoss || 0;
  const avgGrade = totalDistance > 0 ? ((elevationGain / (totalDistance * 1000)) * 100) : 0;

  modalContent.innerHTML = `
    <div style="background: linear-gradient(135deg, #C2410C 0%, #9A3412 100%); color: white; padding: 20px; border-radius: 12px 12px 0 0;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">⛰️ ${entry.name}</h2>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">Elevation Profile Analysis</p>
        </div>
        <button id="close-modal" style="background: rgba(255, 255, 255, 0.2); border: none; color: white; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; transition: background 0.2s;">
          ×
        </button>
      </div>
    </div>

    <div style="padding: 24px;">
      <!-- Statistics Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%); padding: 16px; border-radius: 8px; border-left: 4px solid #C2410C;">
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #9A3412; font-weight: 600; text-transform: uppercase;">Distance</p>
          <p style="margin: 0; font-size: 24px; font-weight: 700; color: #C2410C;">${(totalDistance / 1000).toFixed(2)} km</p>
        </div>
        <div style="background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); padding: 16px; border-radius: 8px; border-left: 4px solid #16A34A;">
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #15803D; font-weight: 600; text-transform: uppercase;">Elevation Gain</p>
          <p style="margin: 0; font-size: 24px; font-weight: 700; color: #16A34A;">${elevationGain.toFixed(0)} m</p>
        </div>
        <div style="background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%); padding: 16px; border-radius: 8px; border-left: 4px solid #DC2626;">
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #991B1B; font-weight: 600; text-transform: uppercase;">Elevation Loss</p>
          <p style="margin: 0; font-size: 24px; font-weight: 700; color: #DC2626;">${elevationLoss.toFixed(0)} m</p>
        </div>
        <div style="background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%); padding: 16px; border-radius: 8px; border-left: 4px solid #2563EB;">
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #1E40AF; font-weight: 600; text-transform: uppercase;">Avg Grade</p>
          <p style="margin: 0; font-size: 24px; font-weight: 700; color: #2563EB;">${avgGrade.toFixed(1)}%</p>
        </div>
      </div>

      <!-- Elevation Range -->
      <div style="display: flex; gap: 16px; margin-bottom: 16px;">
        <div style="flex: 1; background: #F9FAFB; padding: 12px; border-radius: 8px;">
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #6B7280; font-weight: 600;">⬆️ Highest Point</p>
          <p style="margin: 0; font-size: 18px; font-weight: 700; color: #1F2937;">${maxElev.toFixed(1)} m</p>
        </div>
        <div style="flex: 1; background: #F9FAFB; padding: 12px; border-radius: 8px;">
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #6B7280; font-weight: 600;">⬇️ Lowest Point</p>
          <p style="margin: 0; font-size: 18px; font-weight: 700; color: #1F2937;">${minElev.toFixed(1)} m</p>
        </div>
        <div style="flex: 1; background: #F9FAFB; padding: 12px; border-radius: 8px;">
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #6B7280; font-weight: 600;">📊 Total Climb</p>
          <p style="margin: 0; font-size: 18px; font-weight: 700; color: #1F2937;">${(maxElev - minElev).toFixed(1)} m</p>
        </div>
      </div>

      <!-- Elevation Graph -->
      <div style="background: white; padding: 20px; border-radius: 8px; border: 2px solid #E5E7EB; margin-bottom: 16px;">
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #1F2937;">📊 Elevation Profile</h3>
        <div style="overflow-x: auto;">
          <svg width="${chartWidth}" height="${chartHeight + 60}" style="display: block;">
            <!-- Grid lines -->
            ${[0, 0.25, 0.5, 0.75, 1].map(ratio => `
              <line x1="0" y1="${20 + (chartHeight - 40) * ratio}" x2="${chartWidth}" y2="${20 + (chartHeight - 40) * ratio}"
                    stroke="#E5E7EB" stroke-width="1" stroke-dasharray="4,4"/>
              <text x="-5" y="${20 + (chartHeight - 40) * ratio + 4}"
                    fill="#6B7280" font-size="11px" text-anchor="end">
                ${(maxElev - elevRange * ratio).toFixed(0)}m
              </text>
            `).join('')}

            <!-- Area fill -->
            <polygon points="${areaPath}" fill="url(#elevGradient)" opacity="0.3"/>

            <!-- Elevation line -->
            <polyline points="${chartPoints}" fill="none" stroke="#C2410C" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>

            <!-- Data points -->
            ${elevationData.map((point: any, i: number) => {
              const x = (i / (elevationData.length - 1)) * chartWidth;
              const normalizedElev = (point.elevation - minElev) / elevRange;
              const y = chartHeight - (normalizedElev * (chartHeight - 40) + 20);
              return i % Math.ceil(elevationData.length / 20) === 0 ?
                `<circle cx="${x}" cy="${y}" r="4" fill="#C2410C" stroke="white" stroke-width="2"/>` : '';
            }).join('')}

            <!-- Gradient definition -->
            <defs>
              <linearGradient id="elevGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#C2410C;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#FED7AA;stop-opacity:0.3" />
              </linearGradient>
            </defs>

            <!-- X-axis labels -->
            ${[0, 0.25, 0.5, 0.75, 1].map(ratio => `
              <text x="${chartWidth * ratio}" y="${chartHeight + 40}"
                    fill="#6B7280" font-size="11px" text-anchor="middle">
                ${((totalDistance / 1000) * ratio).toFixed(1)} km
              </text>
            `).join('')}
          </svg>
        </div>
        <p style="margin: 12px 0 0 0; text-align: center; font-size: 12px; color: #6B7280;">Distance (km) →</p>
      </div>

      ${entry.data.description ? `
      <div style="background: #FEF3C7; padding: 16px; border-radius: 8px; border-left: 4px solid #F59E0B; margin-bottom: 16px;">
        <p style="margin: 0; font-size: 14px; color: #78350F;"><strong>📝 Description:</strong></p>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #92400E;">${entry.data.description}</p>
      </div>
      ` : ""}

      <div style="border-top: 2px solid #E5E7EB; padding-top: 16px; margin-top: 16px;">
        <p style="margin: 0; font-size: 12px; color: #9CA3AF; text-align: center;">
          ⏰ Created: ${new Date(entry.createdAt).toLocaleString()} • ${elevationData.length} data points
        </p>
      </div>
    </div>
  `;

  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);

  // Close modal handlers
  const closeModal = () => {
    document.body.removeChild(modalOverlay);
  };

  const closeBtn = modalContent.querySelector('#close-modal');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
    (closeBtn as HTMLElement).addEventListener('mouseenter', () => {
      (closeBtn as HTMLElement).style.background = 'rgba(255, 255, 255, 0.3)';
    });
    (closeBtn as HTMLElement).addEventListener('mouseleave', () => {
      (closeBtn as HTMLElement).style.background = 'rgba(255, 255, 255, 0.2)';
    });
  }

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // Close on Escape key
  const escapeHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

