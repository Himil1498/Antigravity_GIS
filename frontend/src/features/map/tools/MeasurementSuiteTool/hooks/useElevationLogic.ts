import { useState } from "react";
import { showToast } from "../../../../../utils/toastUtils";
import { processElevationDataAndReturnResults } from "../utils/elevationUtils";

export const useElevationLogic = (state: any, map: google.maps.Map | null) => {
  const {
    points,
    elevatorRef,
    setLoading,
    setElevationData,
    setHighPoint,
    setLowPoint,
    setElevationGain,
    setElevationLoss,
    setPointToElevationIndexMap,
    setSegmentElevationStats,
    multiPointMode,
    elevationData,
    highPointMarker,
    setHighPointMarker,
    lowPointMarker,
    setLowPointMarker,
  } = state;

  const fetchElevationProfile = async () => {
    if (!elevatorRef.current || points.length < 2) return;

    setLoading(true);

    // Calculate total distance to determine optimal sample size
    let totalDist = 0;
    for (let i = 0; i < points.length - 1; i++) {
      totalDist += google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(points[i].lat, points[i].lng),
        new google.maps.LatLng(points[i + 1].lat, points[i + 1].lng)
      );
    }

    // Dynamic resolution: 1 sample per 50 meters, capped between 100 and 512 (Google API Max)
    const desiredSamples = Math.floor(totalDist / 50);
    const samples = Math.min(Math.max(desiredSamples, 100), 512);
    const pathRequest: google.maps.PathElevationRequest = {
      path: points,
      samples: samples,
    };

    elevatorRef.current.getElevationAlongPath(
      pathRequest,
      async (results: any, status: any) => {
        try {
          if (status === "OK" && results) {
            const processedResult = processElevationDataAndReturnResults(
              results,
              points,
              multiPointMode,
            );

            setElevationData(processedResult.processedData);
            setHighPoint(processedResult.highPoint);
            setLowPoint(processedResult.lowPoint);
            setElevationGain(processedResult.elevationGain);
            setElevationLoss(processedResult.elevationLoss);
            setPointToElevationIndexMap(
              processedResult.pointToElevationIndexMap,
            );
            setSegmentElevationStats(processedResult.segmentElevationStats);

            if (map) {
              if (highPointMarker) highPointMarker.setMap(null);
              if (lowPointMarker) lowPointMarker.setMap(null);
              setHighPointMarker(null);
              setLowPointMarker(null);
              setLowPointMarker(null);
            }

            showToast.success("Elevation profile generated!");
          } else {
            console.error("Elevation request failed:", status);
            showToast.error(
              "Failed to fetch elevation data. Please check your API key and quota.",
            );
          }
        } catch (error) {
          console.error("Error in elevation callback:", error);
        } finally {
          setLoading(false);
        }
      },
    );
  };

  const recalculateLOS = () => {};

  return { fetchElevationProfile, recalculateLOS };
};
