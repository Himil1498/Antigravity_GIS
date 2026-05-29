import React from 'react';

// Import Getting Started guides
import LoginPageInteractive from '../../../interactive-guides/LoginPageInteractive';
import MainNavigationInteractive from '../../../interactive-guides/MainNavigationInteractive';
import MapFeaturesInteractive from '../../../interactive-guides/MapFeaturesInteractive';
import LayersInteractive from '../../../interactive-guides/LayersInteractive';
import GlobalSearchInteractive from '../../../interactive-guides/GlobalSearchInteractive';

// Import Interactive guides for main navigation
import AdminInteractive from '../../../interactive-guides/AdminInteractive';
import AnalyticsInteractive from '../../../interactive-guides/AnalyticsInteractive';
import DashboardInteractive from '../../../interactive-guides/DashboardInteractive';
import GISDataHubInteractive from '../../../interactive-guides/GISDataHubInteractive';
import UserManagementInteractive from '../../../interactive-guides/UserManagementInteractive';

// Import Interactive guides for Map/GIS tools
import CircleDrawingInteractive from '../../../interactive-guides/CircleDrawingInteractive';
import DistanceMeasurementInteractive from '../../../interactive-guides/DistanceMeasurementInteractive';
import ElevationProfileInteractive from '../../../interactive-guides/ElevationProfileInteractive';

import PolygonDrawingInteractive from '../../../interactive-guides/PolygonDrawingInteractive';
import SectorRFInteractive from '../../../interactive-guides/SectorRFInteractive';

// Guide type definitions
export interface GettingStartedGuide {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType;
  description: string;
}

export interface NavigationGuide {
  id: string;
  name: string;
  iconColor: string;
  bgColor: string;
  icon: React.ReactNode;
  component: React.ComponentType | null;
  hasSubmenu?: boolean;
}

export interface MapToolGuide {
  id: string;
  name: string;
  icon: string;
  iconColor: string;
  component: React.ComponentType;
}

// Getting Started guides (for new users)
export const gettingStartedGuides: GettingStartedGuide[] = [
  { id: 'login', name: 'Login & Authentication', icon: '🔐', component: LoginPageInteractive, description: 'Learn how to access the platform' },
  { id: 'navigation', name: 'Understanding Navigation', icon: '🧭', component: MainNavigationInteractive, description: 'Master the app structure' },
];

// Map submenu guides (GIS Tools)
export const mapToolGuides: MapToolGuide[] = [
  { id: 'distance', name: 'Distance Measurement', icon: '📏', iconColor: 'text-blue-600 dark:text-blue-400', component: DistanceMeasurementInteractive },
  { id: 'elevation', name: 'Elevation Profile', icon: '📊', iconColor: 'text-green-600 dark:text-green-400', component: ElevationProfileInteractive },
  { id: 'polygon', name: 'Polygon Drawing', icon: '🔺', iconColor: 'text-purple-600 dark:text-purple-400', component: PolygonDrawingInteractive },
  { id: 'circle', name: 'Circle Drawing', icon: '⭕', iconColor: 'text-orange-600 dark:text-orange-400', component: CircleDrawingInteractive },
  { id: 'sector', name: 'RF Sector Tool', icon: '📡', iconColor: 'text-pink-600 dark:text-pink-400', component: SectorRFInteractive },

];

// Helper to render guide component
export const renderGuideComponent = (
  activeGuide: string | null,
  gettingStarted: GettingStartedGuide[],
  navigationGuides: NavigationGuide[],
  mapTools: MapToolGuide[]
): React.ReactNode => {
  if (activeGuide === 'layers') return <LayersInteractive />;
  if (activeGuide === 'globalsearch') return <GlobalSearchInteractive />;
  if (activeGuide === 'mapfeatures') return <MapFeaturesInteractive />;

  let guide: any = gettingStarted.find(g => g.id === activeGuide);
  if (!guide) guide = navigationGuides.find(g => g.id === activeGuide);
  if (!guide) guide = mapTools.find(g => g.id === activeGuide);

  if (!guide || !guide.component) return null;
  const GuideComponent = guide.component;
  return <GuideComponent />;
};

