/**
 * useElevation Hook
 * Manages elevation data fetching, processing, and visualization
 */

import { useState, useEffect, useRef } from "react";
import { showToast } from "../../../../../utils/toastUtils";
import { SegmentElevation } from "../../../../../types/gisToolTypes/index";
import { Point, Segment, ElevationDataPoint } from "../types/distanceTypes";
import {
  createHighPointMarker,
  createLowPointMarker,
  createHoverMarker,
  createPinnedMarker,
} from "../utils/markerFactory";
import {
  createHighPointInfoContent,
  createLowPointInfoContent,
  createHoverInfoContent,
  createPinnedInfoContent,
} from "../utils/infoWindowContent";
import {
  processRawElevationResults,
  findExtremePoints,
  calculateGainLoss,
  calculateElevationStats,
  getElevationErrorMessage,
  handleExportKML,
  handleExportGPX,
  handleExportCSV,
} from "../utils/distanceElevationUtils";

interface UseElevationProps {
  map: google.maps.Map | null;
  points: Point[];
  segments: Segment[];
  totalDistance: number;
  name: string;
}

export const useElevation = ({
  map,
  points,
  segments,
  totalDistance,
  name,
}: UseElevationProps) => {
  // State
  const [elevationData, setElevationData] = useState<ElevationDataPoint[]>([]);
  const [highPoint, setHighPoint] = useState<ElevationDataPoint | null>(null);
  const [lowPoint, setLowPoint] = useState<ElevationDataPoint | null>(null);
  const [elevationGain, setElevationGain] = useState<number>(0);
  const [elevationLoss, setElevationLoss] = useState<number>(0);
  const [loadingElevation, setLoadingElevation] = useState<boolean>(false);
  const [showElevationGraph, setShowElevationGraph] = useState<boolean>(false);
  const [showElevationDrawer, setShowElevationDrawer] =
    useState<boolean>(false);
  const [isDrawerMinimized, setIsDrawerMinimized] = useState<boolean>(false);
  const [showFullGraph, setShowFullGraph] = useState<boolean>(false);
  const [showElevationPrompt, setShowElevationPrompt] =
    useState<boolean>(false);

  // Marker state
  const [highPointMarker, setHighPointMarker] =
    useState<google.maps.Marker | null>(null);
  const [lowPointMarker, setLowPointMarker] =
    useState<google.maps.Marker | null>(null);
  const [hoverMarker, setHoverMarker] = useState<google.maps.Marker | null>(
    null,
  );
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);
  const [hoverInfoWindow, setHoverInfoWindow] =
    useState<google.maps.InfoWindow | null>(null);
  const [isHoverEnabled, setIsHoverEnabled] = useState<boolean>(true);
  const [pinnedMarker, setPinnedMarker] = useState<google.maps.Marker | null>(
    null,
  );
  const [pinnedInfoWindow, setPinnedInfoWindow] =
    useState<google.maps.InfoWindow | null>(null);

  // Mapping state
  const [pointToElevationIndexMap, setPointToElevationIndexMap] = useState<
    Map<string, number>
  >(new Map());
  const [segmentElevationStats, setSegmentElevationStats] = useState<
    SegmentElevation[]
  >([]);

  // Refs
  const elevatorRef = useRef<google.maps.ElevationService | null>(null);
  const chartRef = useRef<any>(null);

  // Initialize Elevation Service
  useEffect(() => {
    if (map && !elevatorRef.current) {
      elevatorRef.current = new google.maps.ElevationService();
    }
  }, [map]);

  // Initialize hover marker
  useEffect(() => {
    if (map && !hoverMarker) {
      setHoverMarker(createHoverMarker());
      setHoverInfoWindow(new google.maps.InfoWindow());
    }
  }, [map, hoverMarker]);

  // Initialize pinned marker
  useEffect(() => {
    if (map && !pinnedMarker) {
      setPinnedMarker(createPinnedMarker());
      setPinnedInfoWindow(new google.maps.InfoWindow());
    }
  }, [map, pinnedMarker]);

  // Process elevation data
  const processElevationData = (results: google.maps.ElevationResult[]) => {
    const processedData = processRawElevationResults(results, totalDistance);
    setElevationData(processedData);

    const { mapping, segmentStats } = calculateElevationStats(
      points,
      processedData,
      segments,
    );
    setPointToElevationIndexMap(mapping);
    setSegmentElevationStats(segmentStats);

    const { high, low } = findExtremePoints(processedData);
    setHighPoint(high);
    setLowPoint(low);

    // Create high/low point markers
    if (map) {
      if (highPointMarker) highPointMarker.setMap(null);
      if (lowPointMarker) lowPointMarker.setMap(null);

      const highMarker = createHighPointMarker(
        map,
        high.location.lat,
        high.location.lng,
        high.elevation,
      );
      setTimeout(() => highMarker.setAnimation(null), 2000);
      const highInfoWindow = new google.maps.InfoWindow({
        content: createHighPointInfoContent(high.elevation, high.distance),
      });
      highMarker.addListener("click", () =>
        highInfoWindow.open(map, highMarker),
      );

      const lowMarker = createLowPointMarker(
        map,
        low.location.lat,
        low.location.lng,
        low.elevation,
      );
      setTimeout(() => lowMarker.setAnimation(null), 2000);
      const lowInfoWindow = new google.maps.InfoWindow({
        content: createLowPointInfoContent(low.elevation, low.distance),
      });
      lowMarker.addListener("click", () => lowInfoWindow.open(map, lowMarker));

      setHighPointMarker(highMarker);
      setLowPointMarker(lowMarker);
    }

    const { gain, loss } = calculateGainLoss(processedData);
    setElevationGain(gain);
    setElevationLoss(loss);
  };

  // Fetch elevation
  const fetchElevationForPoints = async () => {
    if (!elevatorRef.current || points.length < 2) {
      showToast.error("Need at least 2 points to fetch elevation data");
      return;
    }

    setLoadingElevation(true);
    setShowElevationPrompt(false);

    try {
      const samples = Math.max(points.length * 2, 50);
      if (totalDistance < 10)
        showToast.warning(
          "Distance may be too short for accurate elevation profiling",
        );

      const pathRequest: google.maps.PathElevationRequest = {
        path: points.map((p) => ({ lat: p.lat, lng: p.lng })),
        samples,
      };

      elevatorRef.current.getElevationAlongPath(
        pathRequest,
        (results, status) => {
          if (status === "OK" && results) {
            if (results.length < points.length) {
              showToast.error(
                `Insufficient elevation data: got ${results.length} samples for ${points.length} points`,
              );
              setLoadingElevation(false);
              return;
            }
            const validResults = results.filter((r) => r.elevation != null);
            if (validResults.length < results.length * 0.9)
              showToast.warning(
                "Some elevation data may be inaccurate or missing",
              );

            processElevationData(results);
            setShowElevationGraph(true);
            setShowElevationDrawer(true);
            setIsDrawerMinimized(false);
            showToast.success("📊 Elevation profile generated successfully!");
          } else {
            showToast.error(getElevationErrorMessage(status));
          }
          setLoadingElevation(false);
        },
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      showToast.error(`Error: ${errorMsg}`);
      setLoadingElevation(false);
    }
  };

  // Graph handlers
  const handleGraphHover = (event: any, chartElements: any[]) => {
    if (
      !map ||
      !hoverMarker ||
      !hoverInfoWindow ||
      elevationData.length === 0 ||
      !isHoverEnabled
    )
      return;

    if (chartElements.length > 0) {
      const dataPoint = elevationData[chartElements[0].index];
      if (dataPoint) {
        setHoveredDataIndex(chartElements[0].index);
        const position = {
          lat: dataPoint.location.lat,
          lng: dataPoint.location.lng,
        };
        hoverMarker.setPosition(position);
        hoverMarker.setMap(map);
        hoverInfoWindow.setContent(createHoverInfoContent(dataPoint));
        hoverInfoWindow.open(map, hoverMarker);
      }
    } else {
      hoverMarker.setMap(null);
      hoverInfoWindow.close();
      setHoveredDataIndex(null);
    }
  };

  const handleGraphClick = (event: any, chartElements: any[]) => {
    if (
      !map ||
      !pinnedMarker ||
      !pinnedInfoWindow ||
      elevationData.length === 0
    )
      return;

    if (chartElements.length > 0) {
      const dataPoint = elevationData[chartElements[0].index];
      if (dataPoint) {
        const position = {
          lat: dataPoint.location.lat,
          lng: dataPoint.location.lng,
        };
        pinnedMarker.setPosition(position);
        pinnedMarker.setMap(map);
        pinnedMarker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => pinnedMarker.setAnimation(null), 1400);
        pinnedInfoWindow.setContent(
          createPinnedInfoContent(
            dataPoint,
            lowPoint?.elevation,
            highPoint?.elevation,
          ),
        );
        pinnedInfoWindow.open(map, pinnedMarker);
        map.panTo(position);
      }
    }
  };

  // Export handlers
  const exportKML = () =>
    handleExportKML(
      elevationData,
      points,
      name,
      totalDistance,
      highPoint?.elevation || 0,
      lowPoint?.elevation || 0,
      elevationGain,
      elevationLoss,
    );
  const exportGPX = () =>
    handleExportGPX(
      elevationData,
      points,
      name,
      totalDistance,
      highPoint?.elevation || 0,
      lowPoint?.elevation || 0,
      elevationGain,
      elevationLoss,
    );
  const exportCSV = () =>
    handleExportCSV(
      elevationData,
      name,
      totalDistance,
      highPoint?.elevation || 0,
      lowPoint?.elevation || 0,
      elevationGain,
      elevationLoss,
    );

  // Clear elevation data
  const clearElevationData = () => {
    if (highPointMarker) highPointMarker.setMap(null);
    if (lowPointMarker) lowPointMarker.setMap(null);
    if (hoverMarker) hoverMarker.setMap(null);
    if (hoverInfoWindow) hoverInfoWindow.close();
    if (pinnedMarker) pinnedMarker.setMap(null);
    if (pinnedInfoWindow) pinnedInfoWindow.close();

    setElevationData([]);
    setHighPoint(null);
    setLowPoint(null);
    setHighPointMarker(null);
    setLowPointMarker(null);
    setHoveredDataIndex(null);
    setElevationGain(0);
    setElevationLoss(0);
    setShowElevationGraph(false);
    setShowElevationDrawer(false);
    setShowFullGraph(false);
    setSegmentElevationStats([]);
    setPointToElevationIndexMap(new Map());
  };

  return {
    elevationData,
    highPoint,
    lowPoint,
    elevationGain,
    elevationLoss,
    loadingElevation,
    showElevationGraph,
    showElevationDrawer,
    setShowElevationDrawer,
    isDrawerMinimized,
    setIsDrawerMinimized,
    showFullGraph,
    setShowFullGraph,
    showElevationPrompt,
    setShowElevationPrompt,
    hoveredDataIndex,
    setHoveredDataIndex,
    isHoverEnabled,
    setIsHoverEnabled,
    pointToElevationIndexMap,
    segmentElevationStats,
    chartRef,
    highPointMarker,
    lowPointMarker,
    hoverMarker,
    hoverInfoWindow,
    pinnedMarker,
    pinnedInfoWindow,
    fetchElevationForPoints,
    processElevationData,
    handleGraphHover,
    handleGraphClick,
    exportKML,
    exportGPX,
    exportCSV,
    clearElevationData,
  };
};
