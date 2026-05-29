import React, { useEffect, useState } from "react";
import KPICard from "./KPICard";
import { KPICardData } from "../../types/infrastructure.types";
import { networkPlanningService } from "../../../network-planning/services/api";
import { useAppSelector } from "../../../../store/index";
import { FolderItem, NetworkFile } from "../../../network-planning/types";
import {
  Folder,
  FolderOpen,
  Users,
} from "lucide-react";
import {
  ICON_DEFS,
  getFolderIconKey,
} from "../../../network-planning/components/NetworkMap/MapIcons";

// Helper to calculate recursive feature count (excludes Approved Network Data)
const calculateTotalFeatures = (folder: FolderItem): number => {
  let count = 0;

  // Add counts from files in this folder (exclude outcome files)
  if (folder.files) {
    count += folder.files
      .filter((file: NetworkFile) => {
        const props = file.properties as any;
        const meta = (file as any).metadata;
        return !(props?.is_outcome) && !(meta?.is_outcome);
      })
      .reduce((sum: number, file: NetworkFile) => {
        return sum + (file.feature_count || 0);
      }, 0);
  }

  // Add counts from sub-folders recursively
  if (folder.children) {
    count += folder.children.reduce((sum: number, child: FolderItem) => {
      return sum + calculateTotalFeatures(child);
    }, 0);
  }

  return count;
};

// Helper: Convert RGB array to hex string for inline styles
const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
};

const getSubtitleForFolder = (name: string) => {
  switch (name) {
    case "POP":
      return "Points of Presense";
    case "Sub POP":
      return "Secondary Points";
    case "Office Location":
      return "Corporate Offices";
    case "NNI":
      return "Network Interfaces";
    case "Data Center":
      return "Data Centers";
    case "Infra Provider":
      return "Service Providers";
    case "Node":
      return "Network Nodes";
    case "Bandwidth BTS":
      return "Bandwidth BTS Locations";
    default:
      return "Customer Infrastructure";
  }
};

// Preferred display order for infrastructure cards (for sorting only)
const INFRASTRUCTURE_DISPLAY_ORDER = [
  "POP",
  "Sub POP",
  "Office Location",
  "NNI",
  "Data Center",
  "Infra Provider",
  "Node",
  "Bandwidth BTS",
];

interface StaticInfrastructureCardsProps {
  onCardsLoaded?: (cards: { title: string; value: string }[]) => void;
}

const StaticInfrastructureCards: React.FC<StaticInfrastructureCardsProps> = ({ onCardsLoaded }) => {
  const { user } = useAppSelector((state) => state.auth);
  const [infraCards, setInfraCards] = useState<KPICardData[]>([]);
  const [customerCards, setCustomerCards] = useState<KPICardData[]>([]);
  const [otherCards, setOtherCards] = useState<KPICardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      if (!user?.id) return;

      try {
        const isAdmin = (user as any).role?.toLowerCase() === 'admin';
        const responseData = await networkPlanningService.getUnifiedCatalog(
          Number(user.id),
          null,    // regionIds
          true,    // includeApprovedOutcomes - MUST include so dashboard counts are accurate
          isAdmin, // isAdmin
        );

        const { infrastructure = [], customers = [], others = [] } = responseData;

        // Shared function for creating KPI card from a folder
        const createCardFromFolder = (folder: FolderItem, isCustomerArea: boolean, isOtherArea: boolean = false): KPICardData => {
          const count = calculateTotalFeatures(folder);
          
          // Get dynamic icon configuration using shared logic
          const iconKey = getFolderIconKey({ 
            name: folder.name, 
            default_icon: folder.default_icon 
          }, isCustomerArea ? "CUSTOMER" : (isOtherArea ? "DEFAULT" : undefined));
          
          const iconDef = iconKey ? ICON_DEFS[iconKey.toUpperCase()] : null;

          let rawColorHex: string | undefined;
          let iconNode: React.ReactNode;

          if (iconDef) {
            if (iconDef.color) {
              const [r, g, b] = iconDef.color;
              rawColorHex = rgbToHex(r, g, b);
            } else {
              rawColorHex = isCustomerArea ? "#0891b2" : (isOtherArea ? "#6366f1" : "#4f46e5");
            }

            iconNode = (
              <svg viewBox="0 0 24 24" className="w-12 h-12" fill="currentColor">
                <path d={iconDef.path} />
              </svg>
            );
          } else {
            // Fallbacks if no matching SVG path is found
            rawColorHex = folder.is_system 
               ? (isCustomerArea ? "#0ea5e9" : "#3b82f6") // sky / blue
               : (isCustomerArea ? "#06b6d4" : (isOtherArea ? "#8b5cf6" : "#6366f1")); // cyan / violet / indigo
            
            iconNode = folder.is_system 
              ? <FolderOpen className="w-12 h-12" strokeWidth={1.5} />
              : <Folder className="w-12 h-12" strokeWidth={1.5} />;
          }

          return {
            title: folder.name,
            value: count.toLocaleString(),
            subtitle: isCustomerArea ? "Customer Network" : (isOtherArea ? "Custom Folder" : getSubtitleForFolder(folder.name)),
            icon: iconNode,
            color: "", 
            bgColor: "",
            rawColorHex,
            // Calculate grouped tooltip breakdown
            breakdown: (() => {
              const breakdownData: any[] = [];
              let directCount = 0;
              if (folder.files) {
                directCount = folder.files
                  .filter((f: any) => !(f.properties?.is_outcome) && !(f.metadata?.is_outcome))
                  .reduce((sum: number, f: any) => sum + (f.feature_count || 0), 0);
              }
              if (directCount > 0) {
                breakdownData.push({ label: "Direct Imports", count: directCount, type: "root_files" });
              }
              if (folder.children) {
                folder.children.forEach((child) => {
                  const childCount = calculateTotalFeatures(child);
                  if (childCount === 0) return;
                  const hasDeeperHierarchy = child.children && child.children.some(gc => calculateTotalFeatures(gc) > 0);
                  if (hasDeeperHierarchy) {
                    const subBreakdown = child.children!
                      .map(gc => ({ label: gc.name, count: calculateTotalFeatures(gc) }))
                      .filter(gc => gc.count > 0)
                      .sort((a, b) => b.count - a.count);
                    breakdownData.push({ label: child.name, count: childCount, subItems: subBreakdown, type: "grouped" });
                  } else {
                    breakdownData.push({ label: child.name, count: childCount, type: "leaf" });
                  }
                });
              }
              return breakdownData.length > 0 ? breakdownData.sort((a, b) => b.count - a.count) : undefined;
            })()
          };
        };

        // 1. Process Infrastructure
        const sortedInfra = [...infrastructure].sort((a: FolderItem, b: FolderItem) => {
          const idxA = INFRASTRUCTURE_DISPLAY_ORDER.indexOf(a.name);
          const idxB = INFRASTRUCTURE_DISPLAY_ORDER.indexOf(b.name);
          return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
        });
        const newInfraCards = sortedInfra.map((folder: FolderItem) => createCardFromFolder(folder, false));

        // 2. Process Customers
        const newCustomerCards = customers.map((folder: FolderItem) => createCardFromFolder(folder, true));

        // 3. Process Others (Test folders, custom root folders)
        const newOtherCards = others.map((folder: FolderItem) => createCardFromFolder(folder, false, true));

        setInfraCards(newInfraCards);
        setCustomerCards(newCustomerCards);
        setOtherCards(newOtherCards);
        
        const allLoadedCards = [...newInfraCards, ...newCustomerCards, ...newOtherCards];
        onCardsLoaded?.(allLoadedCards.map(c => ({ title: c.title, value: String(c.value) })));
      } catch (error) {
        console.error("Failed to fetch network catalog for dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [user?.id]);

  if (loading && infraCards.length === 0) {
    return (
      <div className="space-y-12 animate-pulse">
        {[1, 2, 3].map((section) => (
          <div key={section} className="space-y-6">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* 1. Infrastructure Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="mb-2">
            <h2 className="text-lg font-bold flex items-center gap-2.5">
              <div className="h-5 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
              <span 
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #3b82f6, #4f46e5)' }}
              >
                Infrastructure Assets
              </span>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 ml-1">
                Core Assets
              </span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-3.5">
              Summary of backbone infrastructure, POPs, and technical nodes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {infraCards.map((card, index) => (
            <KPICard key={`infra-${card.title}-${index}`} card={card} />
          ))}
          {infraCards.length === 0 && (
            <div className="col-span-full py-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
               <p className="text-sm text-gray-400">No infrastructure data available</p>
            </div>
          )}
        </div>
      </section>

      {/* 2. Customer Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="mb-2">
            <h2 className="text-lg font-bold flex items-center gap-2.5">
              <div className="h-5 w-1 bg-gradient-to-b from-cyan-500 to-teal-600 rounded-full"></div>
              <span 
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #06b6d4, #0d9488)' }}
              >
                Customer Networks
              </span>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-800 ml-1">
                Client Base
              </span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-3.5">
              Enterprise customer connections and distributed network endpoints
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {customerCards.map((card, index) => (
            <KPICard key={`customer-${card.title}-${index}`} card={card} />
          ))}
          {customerCards.length === 0 && (
            <div className="col-span-full py-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
               <p className="text-sm text-gray-400">No customer network data available</p>
            </div>
          )}
        </div>
      </section>

      {/* 3. Additional Assets Section (Custom root folders) */}
      {otherCards.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="mb-2">
              <h2 className="text-lg font-bold flex items-center gap-2.5">
                <div className="h-5 w-1 bg-gradient-to-b from-purple-500 to-violet-600 rounded-full"></div>
                <span 
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}
                >
                  Additional Assets
                </span>
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800 ml-1">
                  Custom
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-3.5">
                User-defined categories and temporary root workspace folders
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {otherCards.map((card, index) => (
              <KPICard key={`other-${card.title}-${index}`} card={card} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default StaticInfrastructureCards;

