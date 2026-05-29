import { showToast } from "../../../../../utils/toastUtils";
import { formatDistance } from "../utils/index";

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
    clickMarker,
    setClickMarker,
    clickInfoWindow,
    setClickInfoWindow,
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

        const content = `<div style="padding: 10px; min-width: 160px; font-family: system-ui;">
          <div style="color: #f59e0b; font-weight: bold; font-size: 13px; margin-bottom: 6px;">📍 Hover Location</div>
          <div style="font-size: 15px; font-weight: bold; margin-bottom: 2px;">Elevation: ${dataPoint.elevation.toFixed(
            1,
          )} m</div>
          <div style="color: #666; font-size: 12px; margin-bottom: 4px;">Distance: ${formatDistance(
            dataPoint.distance,
          )}</div>
          <div style="color: #999; font-size: 11px; border-top: 1px solid #eee; padding-top: 4px; margin-top: 4px;">
            ${dataPoint.location.lat.toFixed(
              6,
            )}, ${dataPoint.location.lng.toFixed(6)}
          </div>
        </div>`;

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

  const handleGraphClick = (event: any, chartElements: any[]) => {
    if (!map || elevationData.length === 0 || chartElements.length === 0)
      return;

    const dataIndex = chartElements[0].index;
    const dataPoint = elevationData[dataIndex];

    if (dataPoint) {
      // Cleanup previous pin if exists
      if (clickMarker) clickMarker.setMap(null);
      if (clickInfoWindow) clickInfoWindow.close();

      const marker = new google.maps.Marker({
        position: { lat: dataPoint.location.lat, lng: dataPoint.location.lng },
        map: map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: "#8b5cf6",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
        title: `Selected Point: ${dataPoint.elevation.toFixed(1)}m`,
        zIndex: 1001,
        animation: google.maps.Animation.DROP,
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="padding: 12px; min-width: 200px; font-family: system-ui;">
          <div style="color: #8b5cf6; font-weight: bold; font-size: 14px; margin-bottom: 8px;">📌 Pinned Location</div>
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 2px;">Elevation: ${dataPoint.elevation.toFixed(
            1,
          )} m</div>
          <div style="color: #666; font-size: 13px; margin-bottom: 6px;">Distance: ${formatDistance(
            dataPoint.distance,
          )}</div>
          <div style="color: #999; font-size: 11px; border-top: 1px solid #eee; padding-top: 6px; margin-top: 6px;">
            ${dataPoint.location.lat.toFixed(
              6,
            )}, ${dataPoint.location.lng.toFixed(6)}
          </div>
          <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #eee;">
            <small style="color: #999;">Click graph to move • Click X to remove pin</small>
          </div>
        </div>`,
      });

      infoWindow.open(map, marker);
      
      // Marker click re-opens window
      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });

      // CRITICAL FIX: Close marker when info window is closed via 'X'
      infoWindow.addListener("closeclick", () => {
        marker.setMap(null);
        setClickMarker(null);
        setClickInfoWindow(null);
      });

      setClickMarker(marker);
      setClickInfoWindow(infoWindow);
      map.panTo({ lat: dataPoint.location.lat, lng: dataPoint.location.lng });

      showToast.success("📌 Location pinned!");
    }
  };

  const removePinnedMarker = () => {
    if (clickMarker) clickMarker.setMap(null);
    if (clickInfoWindow) clickInfoWindow.close();
    setClickMarker(null);
    setClickInfoWindow(null);
  };

  return { handleGraphHover, handleGraphClick, removePinnedMarker };
};
