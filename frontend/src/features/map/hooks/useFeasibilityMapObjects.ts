/**
 * useFeasibilityMapObjects
 * Manages study site markers, connection polylines, and elevation path lines
 * imperatively on a provided google.maps.Map instance.
 * This allows FeasibilityHub overlays to render on ANY map (including the Main Map).
 */
import { useEffect, useRef, useCallback } from 'react';
import type { MarkedLocation } from '../../../services/gisTools/locationMarkerService';

interface ElevationStudy {
  customerCoords: { lat: number; lng: number };
  btsCoords: { lat: number; lng: number };
  customerName: string;
  btsName: string;
}

interface UseFeasibilityMapObjectsParams {
  map: google.maps.Map | null;
  markers: MarkedLocation[];
  visibleMarkerIds: Set<number>;
  selectedMarkerId: number | null;
  showConnections: boolean;
  activeElevationStudy: ElevationStudy | null;
  onMarkerClick: (marker: MarkedLocation) => void;
  onCandidateClick: (candidate: Record<string, unknown>) => void;
}

/**
 * Creates and manages Google Maps markers/polylines imperatively.
 * Cleans up on unmount or when dependencies change.
 */
export function useFeasibilityMapObjects({
  map,
  markers,
  visibleMarkerIds,
  selectedMarkerId,
  showConnections,
  activeElevationStudy,
  onMarkerClick,
  onCandidateClick,
}: UseFeasibilityMapObjectsParams) {
  // Refs to track created map objects for cleanup
  const studyMarkersRef = useRef<google.maps.Marker[]>([]);
  const connectionLinesRef = useRef<google.maps.Polyline[]>([]);
  const candidateMarkersRef = useRef<google.maps.Marker[]>([]);
  const bearingArcMarkersRef = useRef<google.maps.Marker[]>([]);
  const elevationLineRef = useRef<google.maps.Polyline | null>(null);

  // Stable callback refs to avoid re-creating markers on handler changes
  const onMarkerClickRef = useRef(onMarkerClick);
  onMarkerClickRef.current = onMarkerClick;
  const onCandidateClickRef = useRef(onCandidateClick);
  onCandidateClickRef.current = onCandidateClick;

  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const candidateInfoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const distanceLabelMarkersRef = useRef<google.maps.Marker[]>([]);
  const openInfoWindowMarkerIdRef = useRef<number | null>(null);
  const openCandidateInfoWindowNameRef = useRef<string | null>(null);

  // SVG pin icon factory for candidate markers
  const createPinSvg = useCallback((fill: string, stroke: string) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
      <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.27 21.73 0 14 0z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
      <circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/>
      <circle cx="14" cy="14" r="3" fill="${fill}"/>
    </svg>`;
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(28, 40),
      anchor: new google.maps.Point(14, 40),
    };
  }, []);

  const feasiblePinIcon = createPinSvg('#27AE60', '#1E8449');
  const candidatePinIcon = createPinSvg('#5B6CF0', '#4338CA');

  // Helper to generate premium card HTML for study markers (resolves transparent background)
  const getStudyMarkerDetailsHtml = useCallback((m: MarkedLocation) => {
    let attributesHtml = '';
    if (m.feasibility_data?.attributes) {
      const attrs = m.feasibility_data.attributes;
      for (const key in attrs) {
        if (attrs[key] !== undefined && attrs[key] !== null && String(attrs[key]).trim() !== '') {
           attributesHtml += `<div style="display: flex; justify-content: space-between; margin-bottom: 4px; gap: 8px; font-size: 11.5px;">
             <span style="font-weight: 600; color: var(--iw-text-label);">${key}:</span>
             <span style="color: var(--iw-text-main); text-align: right; font-weight: 500; word-break: break-word;">${attrs[key]}</span>
           </div>`;
        }
      }
    }
    if (attributesHtml) {
      attributesHtml = `<div style="border-top: 1px solid var(--iw-border); padding-top: 8px; margin-top: 8px; margin-bottom: 4px;">${attributesHtml}</div>`;
    }

    let surveySummaryHtml = '';
    if (m.feasibility_data?.points && Array.isArray(m.feasibility_data.points)) {
      const points = m.feasibility_data.points;
      const total = points.length;
      let feasibleCount = 0;
      let blockedCount = 0;
      let overDistCount = 0;

      points.forEach((p: any) => {
        const candidateLat = Number(p.lat);
        const candidateLng = Number(p.lng);
        if (isNaN(candidateLat) || isNaN(candidateLng)) return;

        const distMeters = window.google ? google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(m.lat, m.lng),
          new google.maps.LatLng(candidateLat, candidateLng)
        ) : 0;
        const isOver = distMeters > 20000;
        
        if (isOver) {
          overDistCount++;
        } else if (p.feasible) {
          feasibleCount++;
        } else {
          blockedCount++;
        }
      });

      surveySummaryHtml = `
        <div style="border-top: 1px solid var(--iw-border); padding-top: 8px; margin-top: 8px; margin-bottom: 4px;">
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--iw-text-label); margin-bottom: 6px; letter-spacing: 0.5px;">Attached Survey Summary</div>
          <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 6px;">
            <span style="padding: 3px 6px; border-radius: 6px; font-size: 9.5px; font-weight: 700; background: var(--iw-accent-bg); color: var(--iw-accent-text); display: inline-flex; align-items: center; gap: 4px;">
              🗼 ${total} Candidates
            </span>
            ${feasibleCount > 0 ? `
            <span style="padding: 3px 6px; border-radius: 6px; font-size: 9.5px; font-weight: 700; background: rgba(16, 185, 129, 0.15); color: #10B981; display: inline-flex; align-items: center; gap: 4px;">
              ✓ ${feasibleCount} OK
            </span>` : ''}
            ${blockedCount > 0 ? `
            <span style="padding: 3px 6px; border-radius: 6px; font-size: 9.5px; font-weight: 700; background: rgba(244, 63, 94, 0.15); color: #F43F5E; display: inline-flex; align-items: center; gap: 4px;">
              ✗ ${blockedCount} Blocked
            </span>` : ''}
            ${overDistCount > 0 ? `
            <span style="padding: 3px 6px; border-radius: 6px; font-size: 9.5px; font-weight: 700; background: rgba(244, 63, 94, 0.15); color: #F43F5E; display: inline-flex; align-items: center; gap: 4px;">
              ⚠️ ${overDistCount} >20km
            </span>` : ''}
          </div>
        </div>
      `;
    }

    const notesText = m.notes || m.remarks;

    return `
      <div class="elevation-info-window" style="padding: 12px; max-width: 280px; font-family: 'Inter', system-ui, sans-serif; background-color: var(--iw-bg); border-radius: 12px; color: var(--iw-text-main);">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 8px;">
          <h3 style="margin: 0; font-size: 15px; font-weight: 700; color: var(--iw-text-main); flex: 1; display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; background: var(--iw-accent-bg); color: var(--iw-accent-text); border-radius: 6px; font-size: 12px;">📍</span>
            ${m.name}
          </h3>
          <button onclick="window.__closeGisInfoWindow()" style="background: none; border: none; cursor: pointer; padding: 2px; border-radius: 4px; line-height: 1; font-size: 18px; color: var(--iw-text-label); flex-shrink: 0;" title="Close" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='var(--iw-text-label)'">&times;</button>
        </div>
        ${notesText ? `<div style="margin: 0 0 10px 0; font-size: 12.5px; color: var(--iw-text-main); line-height: 1.4; max-height: 80px; overflow-y: auto; background: var(--iw-accent-bg); padding: 8px 10px; border-radius: 8px; border-left: 3px solid var(--iw-accent-text); font-style: italic;">"${notesText}"</div>` : ''}
        ${attributesHtml}
        ${surveySummaryHtml}
        <div style="font-size: 10.5px; font-family: monospace; text-align: center; background-color: var(--iw-coord-bg); color: var(--iw-coord-text); border-radius: 6px; padding: 6px; margin-top: 8px; font-weight: 600; letter-spacing: 0.5px;">
          ${m.lat.toFixed(6)}, ${m.lng.toFixed(6)}
        </div>
      </div>
    `;
  }, []);

  // ── Study Site Markers (📍) ──
  useEffect(() => {
    if (!map) return;

    if (!infoWindowRef.current && window.google) {
      infoWindowRef.current = new google.maps.InfoWindow();
      infoWindowRef.current.addListener('closeclick', () => {
        openInfoWindowMarkerIdRef.current = null;
      });
    }

    // Clear previous
    studyMarkersRef.current.forEach(m => m.setMap(null));
    studyMarkersRef.current = [];

    let visibleMarkers = markers.filter(m => visibleMarkerIds.has(m.id));

    // When elevation profile is active, only show the selected study marker
    if (activeElevationStudy && selectedMarkerId) {
      visibleMarkers = visibleMarkers.filter(m => m.id === selectedMarkerId);
    }

    visibleMarkers.forEach(m => {
      const gMarker = new google.maps.Marker({
        position: { lat: m.lat, lng: m.lng },
        map,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new google.maps.Size(32, 32),
        },
        title: m.name,
        zIndex: 100,
      });

      gMarker.addListener('click', () => {
        onMarkerClickRef.current(m);

        if (infoWindowRef.current && map) {
          if (openInfoWindowMarkerIdRef.current === m.id) {
            infoWindowRef.current.close();
            openInfoWindowMarkerIdRef.current = null;
            return;
          }

          // Expose close function globally for inline onclick
          (window as any).__closeGisInfoWindow = () => {
            infoWindowRef.current?.close();
            openInfoWindowMarkerIdRef.current = null;
          };

          const detailsHtml = getStudyMarkerDetailsHtml(m);
          infoWindowRef.current.setContent(detailsHtml);
          infoWindowRef.current.open(map, gMarker);
          openInfoWindowMarkerIdRef.current = m.id;
        }
      });

      studyMarkersRef.current.push(gMarker);

    });

    const handleTriggerInfoWindow = (e: any) => {
      const markerId = e.detail?.markerId;
      if (!markerId || !map || activeElevationStudy) return;
      
      const m = visibleMarkers.find(mk => mk.id === markerId);
      if (!m) return;
      
      const gMarkerIndex = visibleMarkers.findIndex(mk => mk.id === markerId);
      if (gMarkerIndex === -1) return;
      
      const gMarker = studyMarkersRef.current[gMarkerIndex];
      if (gMarker && infoWindowRef.current) {
        if (openInfoWindowMarkerIdRef.current === markerId) {
          infoWindowRef.current.close();
          openInfoWindowMarkerIdRef.current = null;
          return;
        }

        (window as any).__closeGisInfoWindow = () => {
          infoWindowRef.current?.close();
          openInfoWindowMarkerIdRef.current = null;
        };
        const detailsHtml = getStudyMarkerDetailsHtml(m);
        infoWindowRef.current.setContent(detailsHtml);
        infoWindowRef.current.open(map, gMarker);
        openInfoWindowMarkerIdRef.current = markerId;
      }
    };

    window.addEventListener('triggerGisInfoWindow', handleTriggerInfoWindow);

    return () => {
      window.removeEventListener('triggerGisInfoWindow', handleTriggerInfoWindow);
      studyMarkersRef.current.forEach(m => m.setMap(null));
      studyMarkersRef.current = [];
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, [map, markers, visibleMarkerIds, activeElevationStudy, selectedMarkerId, getStudyMarkerDetailsHtml]);

  // ── Connection Lines & Candidate Markers ──
  useEffect(() => {
    // Clear previous
    connectionLinesRef.current.forEach(l => l.setMap(null));
    connectionLinesRef.current = [];
    candidateMarkersRef.current.forEach(m => m.setMap(null));
    candidateMarkersRef.current = [];
    distanceLabelMarkersRef.current.forEach(m => m.setMap(null));
    distanceLabelMarkersRef.current = [];

    if (!candidateInfoWindowRef.current && window.google) {
      candidateInfoWindowRef.current = new google.maps.InfoWindow();
      candidateInfoWindowRef.current.addListener('closeclick', () => {
        openCandidateInfoWindowNameRef.current = null;
      });
    }

    if (!map || !selectedMarkerId || !visibleMarkerIds.has(selectedMarkerId)) return;

    if (!showConnections) return;

    const selectedMarker = markers.find(m => m.id === selectedMarkerId);
    if (!selectedMarker?.feasibility_data?.points) return;

    const centerLat = Number(selectedMarker.lat);
    const centerLng = Number(selectedMarker.lng);
    const centerLatLng = new google.maps.LatLng(centerLat, centerLng);

    const allPoints = selectedMarker.feasibility_data.points || [];
    const pointsToRender = allPoints.slice(0, 200);

    pointsToRender.forEach((p: Record<string, unknown>) => {
      const candidateLat = Number(p.lat);
      const candidateLng = Number(p.lng);
      if (isNaN(candidateLat) || isNaN(candidateLng)) return;

      const distMeters = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(centerLat, centerLng),
        new google.maps.LatLng(candidateLat, candidateLng)
      );
      const distLabel = distMeters >= 1000 ? `${(distMeters / 1000).toFixed(2)} km` : `${distMeters.toFixed(0)} m`;
      
      const isOverMaxDistance = distMeters > 20000;
      const lineColor = isOverMaxDistance ? '#F43F5E' : (p.feasible ? '#10B981' : '#F43F5E');

      const hasActiveStudy = !!activeElevationStudy;
      const isActiveCandidate = !hasActiveStudy || (
        activeElevationStudy &&
        Math.abs(activeElevationStudy.btsCoords.lat - candidateLat) < 0.0001 &&
        Math.abs(activeElevationStudy.btsCoords.lng - candidateLng) < 0.0001
      );

      // Connection polyline
      const line = new google.maps.Polyline({
        path: [
          { lat: centerLat, lng: centerLng },
          { lat: candidateLat, lng: candidateLng },
        ],
        visible: showConnections,
        strokeColor: lineColor,
        strokeOpacity: isActiveCandidate ? 0.8 : 0.15,
        strokeWeight: 2,
        icons: [{
          icon: { path: 'M 0,-1 0,1', strokeOpacity: isActiveCandidate ? 1 : 0.15, scale: 4 },
          offset: '0',
          repeat: '20px',
        }],
        map,
      });
      connectionLinesRef.current.push(line);

      // Distance label at midpoint of the connection line
      if (showConnections) {
        const midLat = (centerLat + candidateLat) / 2;
        const midLng = (centerLng + candidateLng) / 2;
        const distLabelMarker = new google.maps.Marker({
          position: { lat: midLat, lng: midLng },
          map,
          icon: { path: 'M 0 0', scale: 0 },
          label: { text: distLabel, className: 'gis-distance-label' },
          opacity: isActiveCandidate ? 1.0 : 0.2,
          zIndex: 95,
          clickable: false,
        });
        distanceLabelMarkersRef.current.push(distLabelMarker);
      }

      // Candidate marker
      const cMarker = new google.maps.Marker({
        position: { lat: candidateLat, lng: candidateLng },
        map: showConnections ? map : null,
        icon: p.feasible ? {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 16,
          fillColor: 'transparent',
          fillOpacity: 0,
          strokeColor: 'transparent',
          strokeWeight: 0,
        } : candidatePinIcon,
        label: p.feasible ? {
          text: '🗼',
          fontSize: '24px',
        } : undefined,
        title: `Candidate: ${p.name}`,
        opacity: isActiveCandidate ? 1.0 : 0.2,
        zIndex: 90,
      });

      const openCandidateInfoWindow = () => {
        if (candidateInfoWindowRef.current && map) {
          (window as any).__closeCandidateInfoWindow = () => {
            candidateInfoWindowRef.current?.close();
            openCandidateInfoWindowNameRef.current = null;
          };

          let attributesHtml = '';
          for (const key in p) {
            if (['lat', 'lng', 'name', 'feasible', 'studyName'].includes(key)) continue;
            if (p[key] !== undefined && p[key] !== null && String(p[key]).trim() !== '') {
               attributesHtml += `<div style="display: flex; justify-content: space-between; margin-bottom: 4px; gap: 8px; font-size: 11.5px;">
                 <span style="font-weight: 600; color: var(--iw-text-label);">${key}:</span>
                 <span style="color: var(--iw-text-main); text-align: right; font-weight: 500; word-break: break-word;">${p[key]}</span>
               </div>`;
            }
          }
          if (attributesHtml) {
            attributesHtml = `<div style="border-top: 1px solid var(--iw-border); padding-top: 8px; margin-top: 8px; margin-bottom: 4px;">${attributesHtml}</div>`;
          }

          const statusText = p.feasible && !isOverMaxDistance ? '\u2713 LOS OK' : (isOverMaxDistance ? '\u26A0 Over 20km' : '\u2717 LOS Blocked');
          const badgeBg = p.feasible && !isOverMaxDistance ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)';
          const badgeColor = p.feasible && !isOverMaxDistance ? '#10B981' : '#F43F5E';

          const detailsHtml = `
            <div class="elevation-info-window" style="padding: 12px; max-width: 280px; font-family: 'Inter', system-ui, sans-serif; background-color: var(--iw-bg); border-radius: 12px; color: var(--iw-text-main);">
              <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 8px;">
                <h3 style="margin: 0; font-size: 15px; font-weight: 700; color: var(--iw-text-main); flex: 1; display: flex; align-items: center; gap: 6px;">
                  <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; background: var(--iw-accent-bg); color: var(--iw-accent-text); border-radius: 6px; font-size: 12px;">🗼</span>
                  ${p.name || 'Candidate'}
                </h3>
                <button onclick="window.__closeCandidateInfoWindow()" style="background: none; border: none; cursor: pointer; padding: 2px; border-radius: 4px; line-height: 1; font-size: 18px; color: var(--iw-text-label); flex-shrink: 0;" title="Close" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='var(--iw-text-label)'">&times;</button>
              </div>
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px; flex-wrap: wrap;">
                 <span style="padding: 4px 8px; border-radius: 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; background-color: ${badgeBg}; color: ${badgeColor}; display: inline-flex; align-items: center;">
                    ${statusText}
                 </span>
                 <span style="padding: 4px 8px; border-radius: 8px; font-size: 10px; font-weight: 700; background-color: var(--iw-accent-bg); color: var(--iw-accent-text); display: inline-flex; align-items: center;">
                    📍 ${distLabel}
                 </span>
              </div>
              ${attributesHtml}
              <div style="font-size: 10.5px; font-family: monospace; text-align: center; background-color: var(--iw-coord-bg); color: var(--iw-coord-text); border-radius: 6px; padding: 6px; margin-top: 8px; font-weight: 600; letter-spacing: 0.5px;">
                ${candidateLat.toFixed(6)}, ${candidateLng.toFixed(6)}
              </div>
            </div>
          `;
          candidateInfoWindowRef.current.setContent(detailsHtml);
          candidateInfoWindowRef.current.open(map, cMarker);
        }
      };

      cMarker.addListener('click', () => {
        if (openCandidateInfoWindowNameRef.current === String(p.name)) {
          candidateInfoWindowRef.current?.close();
          openCandidateInfoWindowNameRef.current = null;
          return;
        }

        openCandidateInfoWindowNameRef.current = String(p.name);
        
        onCandidateClickRef.current({
          ...p,
          lat: candidateLat,
          lng: candidateLng,
          studyName: selectedMarker.name,
        });

        openCandidateInfoWindow();
      });

      candidateMarkersRef.current.push(cMarker);

      // Restore if this is the active info window (e.g. after React rerender from activeElevationStudy change)
      if (openCandidateInfoWindowNameRef.current === String(p.name)) {
        openCandidateInfoWindow();
      }candidateMarkersRef.current.push(cMarker);
    });

    return () => {
      connectionLinesRef.current.forEach(l => l.setMap(null));
      connectionLinesRef.current = [];
      candidateMarkersRef.current.forEach(m => m.setMap(null));
      candidateMarkersRef.current = [];
      distanceLabelMarkersRef.current.forEach(m => m.setMap(null));
      distanceLabelMarkersRef.current = [];
      if (candidateInfoWindowRef.current) candidateInfoWindowRef.current.close();
    };
  }, [map, markers, selectedMarkerId, showConnections, visibleMarkerIds, activeElevationStudy]);

  // ── Bearing Arcs (Separate Effect to avoid unmounting Candidate markers on click) ──
  useEffect(() => {
    // Clear previous
    bearingArcMarkersRef.current.forEach(m => m.setMap(null));
    bearingArcMarkersRef.current = [];

    if (!map || !activeElevationStudy || !showConnections) return;

    // Helper functions for arcs
    const createNorthLineMarker = (point: google.maps.LatLng, radiusPx: number) => {
      return new google.maps.Marker({
        position: point,
        map,
        icon: { path: 'M 0 0 L 0 -1.5', scale: radiusPx, strokeColor: '#9CA3AF', strokeOpacity: 0.8, strokeWeight: 2, fillOpacity: 0 },
        zIndex: 98,
        clickable: false
      });
    };

    const createBearingArcMarker = (point: google.maps.LatLng, bearing: number, color: string, radiusPx: number) => {
      const rad = bearing * Math.PI / 180;
      const x = Math.sin(rad);
      const y = -Math.cos(rad);
      const largeArcFlag = bearing > 180 ? 1 : 0;
      const path = `M 0 -1 A 1 1 0 ${largeArcFlag} 1 ${x} ${y}`;
      return new google.maps.Marker({
        position: point,
        map,
        icon: { path, scale: radiusPx, strokeColor: color, strokeOpacity: 0.9, strokeWeight: 3, fillOpacity: 0 },
        zIndex: 101,
        clickable: false
      });
    };

    const createBearingLabelMarker = (point: google.maps.LatLng, bearing: number, color: string, radiusPx: number) => {
      const angle = bearing * Math.PI / 180;
      const xOffset = Math.sin(angle) * (radiusPx * 1.5);
      const yOffset = -Math.cos(angle) * (radiusPx * 1.5);
      return new google.maps.Marker({
        position: point,
        map,
        icon: { path: 'M 0 0', scale: 1, labelOrigin: new google.maps.Point(xOffset, yOffset) },
        label: { text: `${bearing.toFixed(1)}°`, className: 'gis-distance-label' },
        zIndex: 102,
        clickable: false
      });
    };

    const centerLatLng = new google.maps.LatLng(activeElevationStudy.customerCoords.lat, activeElevationStudy.customerCoords.lng);
    const candidateLatLng = new google.maps.LatLng(activeElevationStudy.btsCoords.lat, activeElevationStudy.btsCoords.lng);

    let bearing = google.maps.geometry.spherical.computeHeading(centerLatLng, candidateLatLng);
    if (bearing < 0) bearing += 360;
    const reverseBearing = (bearing + 180) % 360;
    const radiusPx = 45;

    const northLineA = createNorthLineMarker(centerLatLng, radiusPx);
    const arcA = createBearingArcMarker(centerLatLng, bearing, "#10B981", radiusPx);
    const labelA = createBearingLabelMarker(centerLatLng, bearing, "#047857", radiusPx);

    const northLineB = createNorthLineMarker(candidateLatLng, radiusPx);
    const arcB = createBearingArcMarker(candidateLatLng, reverseBearing, "#EF4444", radiusPx);
    const labelB = createBearingLabelMarker(candidateLatLng, reverseBearing, "#B91C1C", radiusPx);

    bearingArcMarkersRef.current.push(northLineA, arcA, labelA, northLineB, arcB, labelB);

    return () => {
      bearingArcMarkersRef.current.forEach(m => m.setMap(null));
      bearingArcMarkersRef.current = [];
    };
  }, [map, activeElevationStudy, showConnections]);

  // ── Elevation Study Polyline (Indigo dashed) ──
  useEffect(() => {
    if (elevationLineRef.current) {
      elevationLineRef.current.setMap(null);
      elevationLineRef.current = null;
    }

    if (!map || !activeElevationStudy) return;

    elevationLineRef.current = new google.maps.Polyline({
      path: [activeElevationStudy.customerCoords, activeElevationStudy.btsCoords],
      strokeColor: '#6366F1',
      strokeOpacity: 0.8,
      strokeWeight: 4,
      zIndex: 1000,
      icons: [{
        icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 },
        offset: '0',
        repeat: '20px',
      }],
      map,
    });

    return () => {
      if (elevationLineRef.current) {
        elevationLineRef.current.setMap(null);
        elevationLineRef.current = null;
      }
    };
  }, [map, activeElevationStudy]);

  // ── Cleanup everything on unmount ──
  const clearAll = useCallback(() => {
    studyMarkersRef.current.forEach(m => m.setMap(null));
    studyMarkersRef.current = [];
    connectionLinesRef.current.forEach(l => l.setMap(null));
    connectionLinesRef.current = [];
    candidateMarkersRef.current.forEach(m => m.setMap(null));
    candidateMarkersRef.current = [];
    bearingArcMarkersRef.current.forEach(m => m.setMap(null));
    bearingArcMarkersRef.current = [];
    distanceLabelMarkersRef.current.forEach(m => m.setMap(null));
    distanceLabelMarkersRef.current = [];
    if (candidateInfoWindowRef.current) { candidateInfoWindowRef.current.close(); candidateInfoWindowRef.current = null; }
    if (elevationLineRef.current) {
      elevationLineRef.current.setMap(null);
      elevationLineRef.current = null;
    }
  }, []);

  useEffect(() => {
    return clearAll;
  }, [clearAll]);

  return { clearAll };
}
