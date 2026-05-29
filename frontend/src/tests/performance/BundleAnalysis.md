# Bundle Analysis Report

## Overview

Analysis of the production build artifacts generated on 2026-01-21.

## Largest Chunks

| Chunk ID | Size   | Description                                                                  |
| -------- | ------ | ---------------------------------------------------------------------------- |
| `302`    | 972 KB | Likely Core Libraries (React, Redux, Deck.gl core)                           |
| `676`    | 839 KB | Likely Visualization Libraries (Chart.js, Recharts, or heavy Deck.gl layers) |
| `main`   | 675 KB | Main application bundle                                                      |
| `951`    | 461 KB | Secondary features                                                           |
| `100`    | 407 KB | Map-related heavy logic                                                      |

## Insights

1. **High Fragmentation**: There are 57 js files in the build. This indicates aggressive code splitting is working (good), but the total size is still significant.
2. **Lazy Loading Impact**: The presence of many smaller chunks (`<50KB`) confirms that our `React.lazy` implementation for Modals and Side Panels is successfully isolating code.
3. **Optimized Initial Load**: By deferring the load of `ElevationGraphModal`, `StreetView360Modal`, and `NetworkDataCatalog`, we saved the initial bundle from including their dependencies.

## Recommendations

1. **Analyze Chunk 302**: Determine if `deck.gl` can be tree-shaken further.
2. **Analyze Chunk 676**: Check if `chart.js` and `recharts` are both needed, or if they can be unified.
