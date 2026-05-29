import { formatDistance } from "../utils/elevationUtils";

export const useChartInteractions = (
  map: google.maps.Map | null,
  state: any,
) => {
  const {
    elevationData,
    hoverMarker,
    hoverInfoWindow,
    isHoverEnabled,
    showFullGraph,
    setHoveredDataIndex,
  } = state;

  const handleGraphHover = (event: any, chartElements: any[]) => {
    if (!map || !hoverMarker || !hoverInfoWindow || elevationData.length === 0)
      return;

    if (!isHoverEnabled && !showFullGraph) return;

    if (chartElements.length > 0) {
      const dataIndex = chartElements[0].index;
      const dataPoint = elevationData[dataIndex];

      if (dataPoint) {
        setHoveredDataIndex(dataIndex);

        const position = {
          lat: dataPoint.location.lat,
          lng: dataPoint.location.lng,
        };

        hoverMarker.setPosition(position);
        hoverMarker.setMap(map);

        const content = `<div class="elevation-info-window" style="padding:5px 10px;font-family:'Inter',system-ui,sans-serif;white-space:nowrap;"><div style="display:flex;align-items:center;gap:8px;"><span style="font-weight:800;font-size:13px;color:#111827;">⛰️ ${dataPoint.elevation.toFixed(1)}m</span><span style="color:#d1d5db;">|</span><span style="font-weight:700;font-size:12px;color:#6b7280;">📏 ${formatDistance(dataPoint.distance)}</span></div></div>`;

        hoverInfoWindow.setContent(content);
        if (!hoverInfoWindow.getMap()) {
            hoverInfoWindow.open({
              anchor: hoverMarker,
              map: map,
              shouldFocus: false
            });
        }
      }
    } else {
      hoverMarker.setMap(null);
      hoverInfoWindow.close();
      setHoveredDataIndex(null);
    }
  };

  return { handleGraphHover };
};
