/**
 * Google Maps Custom Styles
 * 
 * Provides custom JSON styling arrays for Google Maps to support Dark Mode
 * and other thematic changes.
 */

export const darkMapStyle: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1e293b" }] }, // slate-800
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] }, // slate-900
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] }, // slate-400
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }], // slate-300
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }], // slate-500
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#0f2e2e" }], // dark teal
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#14b8a6" }], // teal-500
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#334155" }], // slate-700
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1e293b" }], // slate-800
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#94a3b8" }], // slate-400
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#475569" }], // slate-600
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#334155" }], // slate-700
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#e2e8f0" }], // slate-200
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }], // slate-800
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#818cf8" }], // indigo-400
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0f172a" }], // slate-900
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#475569" }], // slate-600
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#0f172a" }], // slate-900
  },
];
