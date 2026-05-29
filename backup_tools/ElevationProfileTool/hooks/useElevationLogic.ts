import { useState } from "react";
import { showToast } from "../../../../../utils/toastUtils";
import {
  fetchBuildingsAlongPath,
  type BuildingDataResult,
} from "../../../../../utils/buildingData/index";
import { calculateLOS } from "../../../../../utils/losAnalysis/index";
import { processElevationDataAndReturnResults } from "../utils/index";

export const useElevationLogic = (state: any, map: google.maps.Map | null) => {
  const {
    points,
    elevatorRef,
    setLoading,
    setElevationData,
    setBuildingData,
    setObstacleData,
    setLosAnalysis,
    setHighPoint,
    setLowPoint,
    setElevationGain,
    setElevationLoss,
    setPointToElevationIndexMap,
    setSegmentElevationStats,
    setLoadingBuildings,
    multiPointMode,
    antennaHeight1,
    antennaHeight2,
    rfFrequency,
    elevationData,
    buildingData,
    obstacleData,
    highPointMarker,
    setHighPointMarker,
    lowPointMarker,
    setLowPointMarker,
  } = state;

  const fetchElevationProfile = async () => {
    if (!elevatorRef.current || points.length < 2) return;

    setLoading(true);

    const samples = 100;
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
            }

            // NEW: Fetch building and obstacle data for LOS analysis
            setLoadingBuildings(true);
            try {
              const buildingResult: BuildingDataResult =
                await fetchBuildingsAlongPath(points, 30); // 30m buffer for accuracy

              setBuildingData(buildingResult.buildings);
              setObstacleData(buildingResult.obstacles);

              // NEW: Perform LOS analysis if we have exactly 2 points
              if (
                points.length === 2 &&
                processedResult.processedData.length > 0
              ) {
                const losResult = calculateLOS(
                  {
                    ...points[0],
                    elevation: processedResult.processedData[0].elevation,
                  },
                  {
                    ...points[points.length - 1],
                    elevation:
                      processedResult.processedData[
                        processedResult.processedData.length - 1
                      ].elevation,
                  },
                  processedResult.processedData,
                  buildingResult.buildings,
                  buildingResult.obstacles,
                  antennaHeight1,
                  antennaHeight2,
                  rfFrequency,
                );

                setLosAnalysis(losResult);

                if (losResult.isClear) {
                  showToast.success(
                    `Clear line of sight! ${losResult.clearancePercentage.toFixed(1)}% clearance`,
                  );
                } else {
                  showToast.warning(
                    `Obstructed path - ${losResult.obstructions.length} obstacles found`,
                  );
                }
              } else {
                showToast.success("Elevation profile generated!");
              }
            } catch (buildingError) {
              console.error("Building data fetch error:", buildingError);
              showToast.warning(
                "Elevation profile generated (building data unavailable)",
              );
            } finally {
              setLoadingBuildings(false);
            }
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

  const recalculateLOS = () => {
    if (
      points.length === 2 &&
      elevationData.length > 0 &&
      buildingData.length >= 0
    ) {
      try {
        const processedData = elevationData.map((d: any, index: number) => ({
          elevation: d.elevation,
          location: d.location,
          distance: d.distance,
        }));

        const losResult = calculateLOS(
          { ...points[0], elevation: processedData[0].elevation },
          {
            ...points[points.length - 1],
            elevation: processedData[processedData.length - 1].elevation,
          },
          processedData,
          buildingData,
          obstacleData,
          antennaHeight1,
          antennaHeight2,
          rfFrequency,
        );

        setLosAnalysis(losResult);

        if (losResult.isClear) {
          showToast.success(
            `✓ Clear LOS! ${losResult.clearancePercentage.toFixed(1)}% clearance`,
          );
        } else {
          showToast.warning(
            `⚠ ${losResult.obstructions.length} obstructions found`,
          );
        }
      } catch (error) {
        console.error("LOS recalculation error:", error);
      }
    }
  };

  return { fetchElevationProfile, recalculateLOS };
};
