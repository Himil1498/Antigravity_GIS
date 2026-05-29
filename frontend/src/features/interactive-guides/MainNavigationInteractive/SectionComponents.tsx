import React from "react";
import { Step } from "./types";
import { getColorClasses } from "./utils";
import { stepsFirstHalf } from "./stepsData";
import { stepsSecondHalf } from "./stepsDataContinued";
import {
  navigationTabs,
  roles,
  gisTools,
  keyFeatures,
  quickRefItems,
  proTips,
  navigationFlowDiagram,
  accessTableData,
} from "./uiData";
import FlowStepCard from "./FlowStepCard";

// Combine steps from both files
const steps: Step[] = [...stepsFirstHalf, ...stepsSecondHalf];

// Header Component
export const GuideHeader: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
    <div className="text-center">
      <div className="text-6xl mb-4">🧭</div>
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
        Main Navigation Hub
      </h1>
      <p className="text-gray-600 dark:text-gray-400 text-lg">
        Complete Guide to OptiConnect GIS Navigation & Access Control
      </p>
    </div>
  </div>
);

// Flow Steps Section
interface FlowStepsSectionProps {
  showDetails: number | null;
  setShowDetails: React.Dispatch<React.SetStateAction<number | null>>;
}

export const FlowStepsSection: React.FC<FlowStepsSectionProps> = ({
  showDetails,
  setShowDetails,
}) => (
  <div className="space-y-4">
    {steps.map((step, index) => (
      <FlowStepCard
        key={step.id}
        step={step}
        showDetails={showDetails}
        setShowDetails={setShowDetails}
        isLast={index === steps.length - 1}
      />
    ))}
  </div>
);

// Navigation Tabs Section
export const NavigationTabsSection: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
      🔝 8 Navigation Tabs Overview
    </h2>
    <div className="grid md:grid-cols-2 gap-4">
      {navigationTabs.map((tab, idx) => {
        const detailsClasses = getColorClasses(tab.color)
          .split(" ")
          .slice(2)
          .join(" ");
        return (
          <div
            key={idx}
            className={`p-4 rounded-lg border-l-4 ${detailsClasses}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{tab.icon}</span>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {tab.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Access: {tab.access}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tab.desc}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// Role-Based Access Section
export const RoleBasedAccessSection: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
      🔒 Role-Based Access Control
    </h2>
    <div className="space-y-4">
      {roles.map((role, idx) => {
        const detailsClasses = getColorClasses(role.color)
          .split(" ")
          .slice(2)
          .join(" ");
        return (
          <div
            key={idx}
            className={`p-6 rounded-lg border-l-4 ${detailsClasses}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{role.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    {role.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {role.access} • {role.tabs} Tabs
                  </p>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              {role.permissions.map((perm, pidx) => (
                <div key={pidx} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {perm}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// GIS Tools Section
export const GISToolsSection: React.FC = () => (
  <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 mt-8 text-white">
    <h2 className="text-2xl font-bold mb-6 text-center">
      🛠️ GIS Tools & Network Features (7 Items)
    </h2>
    <div className="grid md:grid-cols-2 gap-4">
      {gisTools.map((tool, idx) => (
        <div key={idx} className="bg-white bg-opacity-10 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-3xl">{tool.icon}</span>
            <div>
              <p className="font-bold mb-1">{tool.name}</p>
              <p className="text-sm text-blue-100">{tool.desc}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Key Features Section
export const KeyFeaturesSection: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
      ✨ Key System Features
    </h2>
    <div className="grid md:grid-cols-2 gap-4">
      {keyFeatures.map((feature, idx) => {
        const detailsClasses = getColorClasses(feature.color)
          .split(" ")
          .slice(2)
          .join(" ");
        return (
          <div
            key={idx}
            className={`p-4 rounded-lg border-l-4 ${detailsClasses}`}
          >
            <h3 className="font-bold mb-2 flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <span className="text-2xl">{feature.icon}</span>
              <span>{feature.title}</span>
            </h3>
            <ul className="space-y-1">
              {feature.points.map((point, pidx) => (
                <li key={pidx} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  </div>
);

// Visual Flow Diagrams Section (Mermaid)
export const VisualFlowSection: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
      🎨 Visual Application Flow
    </h2>
    
    {/* Login to Map Flow */}
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
        📍 User Journey: Login → Map Page
      </h3>
      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg overflow-x-auto">
        <pre className="mermaid text-sm">
{`graph LR
    A[🔐 User Login] --> B{Authentication}
    B -->|Success| C[🗺️ Map Page]
    B -->|Failure| A
    C --> D[Load User Preferences]
    D --> E[Load Assigned Regions]
    E --> F[Initialize Map View]
    F --> G[🎉 Ready to Use]
    
    style A fill:#3b82f6,stroke:#1e40af,color:#fff
    style C fill:#10b981,stroke:#047857,color:#fff
    style G fill:#f59e0b,stroke:#d97706,color:#fff`}
        </pre>
      </div>
    </div>

    {/* Navigation Structure */}
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
        🧭 Navigation Structure (8 Tabs)
      </h3>
      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg overflow-x-auto">
        <pre className="mermaid text-sm">
{`graph TD
    NAV[Navigation Bar] --> TAB1[🗺️ Map]
    NAV --> TAB2[🗂️ GIS Data Hub]
    NAV --> TAB3[🌐 Network Planning]
    NAV --> TAB4[📈 Dashboard]
    NAV --> TAB5[👥 Users]
    NAV --> TAB6[👥 Groups]
    NAV --> TAB7[⚙️ Admin]
    NAV --> TAB8[📊 Analytics]
    
    TAB5 -.->|Admin/Manager Only| R1[Role Check]
    TAB6 -.->|Admin/Manager Only| R1
    TAB7 -.->|Admin Only| R2[Admin Check]
    
    style TAB1 fill:#10b981,stroke:#047857,color:#fff
    style TAB3 fill:#6366f1,stroke:#4338ca,color:#fff
    style TAB7 fill:#ef4444,stroke:#dc2626,color:#fff`}
        </pre>
      </div>
    </div>

    {/* Map Features Diagram */}
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
        🛠️ Map Page Features
      </h3>
      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg overflow-x-auto">
        <pre className="mermaid text-sm">
{`graph TD
    MAP[🗺️ Map Page] --> TOOLS[GIS Tools]
    MAP --> NETWORK[Network Features]
    MAP --> CONTROLS[Map Controls]
    
    TOOLS --> T1[📏 Distance]
    TOOLS --> T2[📊 Elevation]
    TOOLS --> T3[🔺 Polygon]
    TOOLS --> T4[⭕ Circle]
    TOOLS --> T5[📡 RF Sector]
    
    NETWORK --> N1[🌐 Network Catalog]
    NETWORK --> N2[✅ Feasibility Panel]
    
    CONTROLS --> C1[Zoom/Pan]
    CONTROLS --> C2[Layers Toggle]
    CONTROLS --> C3[3D View]
    
    style MAP fill:#10b981,stroke:#047857,color:#fff
    style TOOLS fill:#8b5cf6,stroke:#6d28d9,color:#fff
    style NETWORK fill:#6366f1,stroke:#4338ca,color:#fff
    style CONTROLS fill:#0ea5e9,stroke:#0284c7,color:#fff`}
        </pre>
      </div>
    </div>

    {/* Network Planning Flow */}
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
        🌐 Network Planning Workflow
      </h3>
      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg overflow-x-auto">
        <pre className="mermaid text-sm">
{`graph TD
    NP[🌐 Network Planning] --> FR[Feasibility Reviews]
    NP --> IM[Infrastructure Manager]
    
    FR --> FR1[Create Report]
    FR --> FR2[Select Features]
    FR --> FR3[Link Infrastructure]
    FR --> FR4[Generate/Export]
    
    IM --> IM1[Browse Folders]
    IM --> IM2[Upload Files]
    IM --> IM3[Manage Categories]
    
    IM1 --> F1[🏗️ Infrastructure]
    IM1 --> F2[👥 Customer Data]
    
    IM2 --> FT1[KML Files]
    IM2 --> FT2[CSV Files]
    IM2 --> FT3[Shapefiles]
    
    style NP fill:#6366f1,stroke:#4338ca,color:#fff
    style FR fill:#10b981,stroke:#047857,color:#fff
    style IM fill:#f59e0b,stroke:#d97706,color:#fff`}
        </pre>
      </div>
    </div>

    {/* Role-Based Access Flow */}
    <div>
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
        🔒 Role-Based Access Control
      </h3>
      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg overflow-x-auto">
        <pre className="mermaid text-sm">
{`graph TD
    USER[User] --> ROLE{User Role}
    
    ROLE -->|Admin| A[👑 Admin Access]
    ROLE -->|Manager| M[👔 Manager Access]
    ROLE -->|Technician| T[🔧 Technician Access]
    ROLE -->|Viewer| V[👁️ Viewer Access]
    
    A --> A1[All 8 Tabs]
    A --> A2[Full CRUD]
    A --> A3[User Management]
    A --> A4[System Settings]
    
    M --> M1[7 Tabs No Admin]
    M --> M2[Full CRUD]
    M --> M3[Team View]
    
    T --> T1[5 Tabs]
    T --> T2[Own Data Only]
    T --> T3[All GIS Tools]
    
    V --> V1[5 Tabs]
    V --> V2[Read Only]
    V --> V3[No Export]
    
    style A fill:#ef4444,stroke:#dc2626,color:#fff
    style M fill:#f97316,stroke:#ea580c,color:#fff
    style T fill:#3b82f6,stroke:#1e40af,color:#fff
    style V fill:#6b7280,stroke:#4b5563,color:#fff`}
        </pre>
      </div>
    </div>

    {/* Mermaid Initialization Script */}
    <script type="module" dangerouslySetInnerHTML={{__html: `
      import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
      mermaid.initialize({ 
        startOnLoad: true,
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default'
      });
    `}} />
  </div>
);

// Navigation Flow Diagram Section
export const NavigationFlowSection: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
      📋 Complete Navigation Flow
    </h2>
    <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg">
      <pre className="text-sm overflow-x-auto whitespace-pre-wrap text-gray-800 dark:text-gray-200">
        {navigationFlowDiagram}
      </pre>
    </div>
  </div>
);

// Access Comparison Table Section
export const AccessComparisonSection: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
      📊 Tab Access by Role
    </h2>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200 dark:border-gray-700">
            <th className="text-left p-4 text-gray-600 dark:text-gray-400">
              Tab
            </th>
            <th className="text-center p-4 text-red-600 dark:text-red-400">
              👑 Admin
            </th>
            <th className="text-center p-4 text-orange-600 dark:text-orange-400">
              👔 Manager
            </th>
            <th className="text-center p-4 text-blue-600 dark:text-blue-400">
              🔧 Technician
            </th>
            <th className="text-center p-4 text-gray-600 dark:text-gray-400">
              👁️ Viewer
            </th>
          </tr>
        </thead>
        <tbody>
          {accessTableData.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-gray-100 dark:border-gray-700"
            >
              <td className="p-4 font-semibold text-gray-700 dark:text-gray-300">
                {row.tab}
              </td>
              <td
                className={`p-4 text-center ${row.admin === "Full" ? "text-green-600" : "text-red-600"}`}
              >
                {row.admin === "Full"
                  ? "✅ Full"
                  : row.admin === "View"
                    ? "👁️ View"
                    : "❌ No"}
              </td>
              <td
                className={`p-4 text-center ${row.manager === "Full" ? "text-green-600" : row.manager === "View" ? "text-yellow-600" : "text-red-600"}`}
              >
                {row.manager === "Full"
                  ? "✅ Full"
                  : row.manager === "View"
                    ? "👁️ View"
                    : "❌ No"}
              </td>
              <td
                className={`p-4 text-center ${row.technician === "Full" ? "text-green-600" : row.technician === "View" ? "text-yellow-600" : "text-red-600"}`}
              >
                {row.technician === "Full"
                  ? "✅ Full"
                  : row.technician === "View"
                    ? "👁️ View"
                    : "❌ No"}
              </td>
              <td
                className={`p-4 text-center ${row.viewer === "Full" ? "text-green-600" : row.viewer === "View" ? "text-yellow-600" : "text-red-600"}`}
              >
                {row.viewer === "Full"
                  ? "✅ Full"
                  : row.viewer === "View"
                    ? "👁️ View"
                    : "❌ No"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Quick Reference Section
export const QuickReferenceSection: React.FC = () => (
  <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl shadow-xl p-8 mt-8 text-white">
    <h2 className="text-2xl font-bold mb-6 text-center">⚡ Quick Reference</h2>
    <div className="grid md:grid-cols-3 gap-4">
      {quickRefItems.map((item, idx) => (
        <div key={idx} className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <span className="text-2xl">{item.icon}</span>
            <span>{item.title}</span>
          </h3>
          <ul className="text-sm space-y-1">
            {item.items.map((point, pidx) => (
              <li key={pidx}>• {point}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

// Pro Tips Section
export const ProTipsSection: React.FC = () => (
  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-xl p-8 mt-8 mb-8 text-white">
    <h2 className="text-2xl font-bold mb-6 text-center">💡 Pro Tips</h2>
    <div className="space-y-3">
      {proTips.map((tip, idx) => (
        <div key={idx} className="bg-white bg-opacity-10 p-4 rounded-lg">
          <p className="font-bold mb-1">{tip.title}</p>
          <p className="text-sm">{tip.content}</p>
        </div>
      ))}
    </div>
  </div>
);

