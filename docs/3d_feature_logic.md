# 3D Map Feature: Implementation Logic

This document outlines the architecture and implementation details of the 3D Map functionality within the OptiConnect GIS platform.

## 1. Core Prerequisites (Google Maps Vector Engine)
To enable 3D features (Tilt and Heading), the map must be initialized using the **Google Maps Vector Rendering Engine**.

- **File**: `src/contexts/GoogleMapsContextTypes.ts`
- **Logic**:
  - `mapId`: A unique Cloud-based Map ID (`e8aea2a23d836c7d4bd283d8`) is required to unlock Vector features.
  - `renderingType`: Explicitly set to `"VECTOR"` in the default map options.
  - Without these settings, the `setTilt()` and `setHeading()` methods would have no effect.

## 2. State Management: `useTiltToggle` Hook
The logic for managing 3D state is centralized in a custom hook that interacts directly with the Google Maps instance.

- **File**: `src/features/map/components/MapControls/hooks/useTiltToggle.ts`
- **Key Features**:
  - **Listeners**: Subscribes to `tilt_changed` and `heading_changed` events from the Google Map instance to sync the internal React state when users manipulate the map using keyboard or mouse shortcuts.
  - **Threshold Detection**: Automatically toggles the `is3DEnabled` flag if the tilt exceeds 1 degree.
  - **Tilt Clamping**: Ensures tilt stays between 1° and 45° to prevent accidental exit from 3D mode.
  - **Heading Normalization**: Caps rotation at 359.99° to prevent the UI from "snapping" back to zero abruptly.

## 3. Premium UI: `ThreeDControlsPanel`
When 3D mode is active, a specialized control panel appears below the main toolbar, providing high-precision control over the viewport.

- **File**: `src/features/map/components/MapControls/components/ThreeDControlsPanel.tsx`

### A. Interactivity & Control Logic
- **Hold-to-Repeat Buttons**: To allow smooth adjustment without spam-clicking, the `+` and `-` buttons use a custom `startRepeat` and `stopRepeat` pattern.
  - A `setTimeout` (350ms delay) starts a `setInterval` (60ms frequency) to continuously increment/decrement the value as long as the mouse is held down.
- **Direct Input & Validation**:
  - **Tilt**: Clamped strictly between 1° and 45°.
  - **Heading (Rotation)**: Uses **Wrapping Logic** where values > 360° or < 0° are normalized (e.g., 370° becomes 10°).
- **Safe Commits**: On `Enter` or `onBlur`, inputs are parsed and validated. If invalid (NaN), the input resets to the current map value to prevent state desync.

### B. Mathematical Visualizations
The panel uses dynamic SVG math to represent the map's 3D state visually:
- **Tilt Indicator**: 
  - Calculated as an arc: `tiltAngle = -((tilt / 45) * 58)`.
  - The "camera" needle position is calculated using sine/cosine: 
    - `tx = 10 + Math.sin(tiltAngle * PI/180) * 9`
    - `ty = 16 + Math.cos(tiltAngle * PI/180) * 9`
- **Compass Needle**:
  - The rotation is handled via CSS/SVG transforms: `transform: rotate(${heading}deg)`.
  - The cardinal direction badge uses a 16-point lookup: `DIRS[Math.round(heading / 22.5) % 16]`.

### C. Theming & Glassmorphism
- Uses `backdrop-filter: blur(14px)` and `bg-white/97` (Light) or `bg-slate-900/92` (Dark) for a premium, integrated feel.
- Animations use `transition: all .15s ease` to ensure the needle and sliders move smoothly alongside the map.

## 4. Integration Logic
The 3D feature is integrated into the main map flow via the toolbar.

- **File**: `src/features/map/components/MapToolbar/MapToolbar.tsx`
- **Flow**:
  1. The `useTiltToggle` hook is initialized within the toolbar.
  2. The `MapControlsPanel` (child of toolbar) contains the main **"3D" toggle button**.
  3. Clicking the toggle sets the map tilt to 45°.
  4. The `ThreeDControlsPanel` is conditionally rendered below the toolbar whenever `is3DEnabled` is true.

## 5. File Summary

| File Path | Responsibility |
| :--- | :--- |
| `src/contexts/GoogleMapsContextTypes.ts` | Map ID and Vector engine configuration. |
| `src/features/map/hooks/useMapInitialization.ts` | Injecting 3D options during map instantiation. |
| `src/features/map/components/MapControls/hooks/useTiltToggle.ts` | React state management for tilt and heading. |
| `src/features/map/components/MapControls/components/ThreeDControlsPanel.tsx` | Specialized UI for 3D adjustments. |
| `src/features/map/components/MapToolbar/MapToolbar.tsx` | Orchestration and conditional rendering of controls. |
