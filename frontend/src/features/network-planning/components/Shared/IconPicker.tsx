import React from "react";
import { ICON_DEFS } from "../NetworkMap/MapIcons";

// Helper to get color string from [r,g,b,a]
const getColor = (id: string) => {
  const def = ICON_DEFS[id.toUpperCase()];
  if (def && def.color) {
    const [r, g, b] = def.color;
    return `rgb(${r},${g},${b})`;
  }
  return "currentColor"; // Default for non-colored icons (inherit from text-gray/indigo)
};

export const ICONS = [
  // Network Infrastructure
  { id: "tower", label: "Tower", category: "infrastructure" },
  { id: "fiber", label: "Fiber Cable", category: "infrastructure" },
  { id: "olt", label: "OLT", category: "infrastructure" },
  { id: "splitter", label: "Splitter", category: "infrastructure" },
  { id: "closure", label: "Closure", category: "infrastructure" },
  { id: "pole", label: "Pole", category: "infrastructure" },
  { id: "handhole", label: "Handhole", category: "infrastructure" },
  { id: "manhole", label: "Manhole", category: "infrastructure" },
  { id: "cabinet", label: "Cabinet", category: "infrastructure" },
  { id: "antenna", label: "Antenna", category: "infrastructure" },
  { id: "router", label: "Router", category: "infrastructure" },
  { id: "switch", label: "Switch", category: "infrastructure" },
  { id: "server", label: "Server", category: "infrastructure" },
  { id: "junction", label: "Junction Box", category: "infrastructure" },
  { id: "duct", label: "Duct", category: "infrastructure" },
  { id: "trench", label: "Trench", category: "infrastructure" },
  { id: "ont", label: "ONT", category: "infrastructure" },

  // Additional Infrastructure Icons
  { id: "repeater", label: "Repeater", category: "infrastructure" },
  { id: "amplifier", label: "Amplifier", category: "infrastructure" },
  { id: "patch-panel", label: "Patch Panel", category: "infrastructure" },
  { id: "bts-station", label: "BTS Station", category: "infrastructure" },
  { id: "microwave", label: "Microwave Link", category: "infrastructure" },
  { id: "satellite", label: "Satellite Dish", category: "infrastructure" },
  { id: "ups", label: "UPS/Power", category: "infrastructure" },
  { id: "generator", label: "Generator", category: "infrastructure" },
  { id: "transformer", label: "Transformer", category: "infrastructure" },
  { id: "pdu", label: "PDU", category: "infrastructure" },
  { id: "rack", label: "Rack", category: "infrastructure" },
  { id: "datacenter", label: "Data Center", category: "infrastructure" },
  { id: "pop", label: "POP Site", category: "infrastructure" },
  { id: "exchange", label: "Exchange", category: "infrastructure" },
  { id: "building", label: "Building", category: "infrastructure" },
  { id: "warehouse", label: "Warehouse", category: "infrastructure" },

  // Generic Customer
  { id: "customer", label: "Customer", category: "customer" },

  // Telecom Operators
  { id: "airtel", label: "Airtel", category: "customer" },
  { id: "tata", label: "Tata", category: "customer" },
  { id: "jio", label: "Jio", category: "customer" },
  { id: "vodafone", label: "Vodafone", category: "customer" },
  { id: "sify", label: "Sify", category: "customer" },
  { id: "ttsl", label: "TTSL", category: "customer" },
  { id: "railtail", label: "RailTel", category: "customer" },
  { id: "rcom", label: "RCOM", category: "customer" },
  { id: "bsnl", label: "BSNL", category: "customer" },

  { id: "pgcil", label: "PGCIL", category: "customer" },
  { id: "jtm", label: "JTM Internet", category: "customer" },
  { id: "optimal", label: "Optimal Telemedia", category: "customer" },

  // Generic Icons — Stars
  { id: "star", label: "Star (Yellow)", category: "generic" },
  { id: "star_blue", label: "Star (Blue)", category: "generic" },
  { id: "star_red", label: "Star (Red)", category: "generic" },
  { id: "star_green", label: "Star (Green)", category: "generic" },

  // Flags
  { id: "flag", label: "Flag (Red)", category: "generic" },
  { id: "flag_blue", label: "Flag (Blue)", category: "generic" },
  { id: "flag_green", label: "Flag (Green)", category: "generic" },
  { id: "flag_yellow", label: "Flag (Yellow)", category: "generic" },

  // Pins
  { id: "pin_red", label: "Pin (Red)", category: "generic" },
  { id: "pin_blue", label: "Pin (Blue)", category: "generic" },
  { id: "pin_green", label: "Pin (Green)", category: "generic" },
  { id: "pin_yellow", label: "Pin (Yellow)", category: "generic" },

  // Targets
  { id: "target", label: "Target (Orange)", category: "generic" },
  { id: "target_blue", label: "Target (Blue)", category: "generic" },
  { id: "target_green", label: "Target (Green)", category: "generic" },

  // Diamonds
  { id: "diamond", label: "Diamond (Violet)", category: "generic" },
  { id: "diamond_blue", label: "Diamond (Blue)", category: "generic" },
  { id: "diamond_red", label: "Diamond (Red)", category: "generic" },
  { id: "diamond_green", label: "Diamond (Green)", category: "generic" },

  // Shields
  { id: "shield", label: "Shield (Green)", category: "generic" },
  { id: "shield_blue", label: "Shield (Blue)", category: "generic" },
  { id: "shield_red", label: "Shield (Red)", category: "generic" },
  { id: "shield_yellow", label: "Shield (Yellow)", category: "generic" },

  // Hexagons
  { id: "hexagon", label: "Hexagon (Sky)", category: "generic" },
  { id: "hexagon_red", label: "Hexagon (Red)", category: "generic" },
  { id: "hexagon_green", label: "Hexagon (Green)", category: "generic" },
  { id: "hexagon_yellow", label: "Hexagon (Yellow)", category: "generic" },

  // Clouds
  { id: "cloud", label: "Cloud (Sky)", category: "generic" },
  { id: "cloud_blue", label: "Cloud (Blue)", category: "generic" },
  { id: "cloud_green", label: "Cloud (Green)", category: "generic" },

  // Rings
  { id: "ring", label: "Ring (Pink)", category: "generic" },
  { id: "ring_blue", label: "Ring (Blue)", category: "generic" },
  { id: "ring_red", label: "Ring (Red)", category: "generic" },
  { id: "ring_green", label: "Ring (Green)", category: "generic" },

  // Octagons
  { id: "octagon", label: "Octagon (Amber)", category: "generic" },
  { id: "octagon_red", label: "Octagon (Red)", category: "generic" },
  { id: "octagon_blue", label: "Octagon (Blue)", category: "generic" },

  // Triangles
  { id: "triangle", label: "Triangle (Indigo)", category: "generic" },
  { id: "triangle_red", label: "Triangle (Red)", category: "generic" },
  { id: "triangle_green", label: "Triangle (Green)", category: "generic" },
  { id: "triangle_yellow", label: "Triangle (Yellow)", category: "generic" },

  // Squares
  { id: "square", label: "Square (Violet)", category: "generic" },
  { id: "square_red", label: "Square (Red)", category: "generic" },
  { id: "square_blue", label: "Square (Blue)", category: "generic" },
  { id: "square_green", label: "Square (Green)", category: "generic" },

  // Drops
  { id: "drop", label: "Drop (Cyan)", category: "generic" },
  { id: "drop_blue", label: "Drop (Blue)", category: "generic" },
  { id: "drop_green", label: "Drop (Green)", category: "generic" },
  { id: "drop_red", label: "Drop (Red)", category: "generic" },

  // Pentagons
  { id: "pentagon", label: "Pentagon (Purple)", category: "generic" },
  { id: "pentagon_blue", label: "Pentagon (Blue)", category: "generic" },
  { id: "pentagon_green", label: "Pentagon (Green)", category: "generic" },

  // Unique Shapes
  { id: "anchor", label: "Anchor", category: "generic" },
  { id: "zap", label: "Zap", category: "generic" },
  { id: "tree", label: "Tree", category: "generic" },
  { id: "wifi", label: "WiFi", category: "generic" },
  { id: "signal", label: "Signal", category: "generic" },
  { id: "cross", label: "Cross", category: "generic" },
  { id: "grid", label: "Grid (Indigo)", category: "generic" },
  { id: "grid_green", label: "Grid (Green)", category: "generic" },
  { id: "arrow_up", label: "Arrow Up", category: "generic" },
  { id: "arrow_down", label: "Arrow Down", category: "generic" },
  { id: "briefcase", label: "Briefcase", category: "generic" },
  { id: "briefcase_blue", label: "Briefcase (Blue)", category: "generic" },
  { id: "map_icon", label: "Map", category: "generic" },
  { id: "home", label: "Home (Orange)", category: "generic" },
  { id: "home_blue", label: "Home (Blue)", category: "generic" },
  { id: "factory", label: "Factory", category: "generic" },
  { id: "factory_red", label: "Factory (Red)", category: "generic" },

  // Utility Icons
  { id: "work", label: "Work", category: "generic" },
  { id: "info", label: "Info", category: "generic" },
  { id: "warning", label: "Warning", category: "generic" },
  { id: "help", label: "Help", category: "generic" },
  { id: "settings", label: "Settings", category: "generic" },
];

interface IconPickerProps {
  selectedIcon: string;
  onSelect: (icon: string) => void;
  folderName?: string;
  genericOnly?: boolean; // New prop for Custom Folder creation
}

const IconPicker: React.FC<IconPickerProps> = ({
  selectedIcon,
  onSelect,
  folderName,
  genericOnly = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Auto-select category based on folder name (only on mount/change)
  React.useEffect(() => {
    if (genericOnly) return;

    if (folderName && folderName.toLowerCase().includes("customer")) {
      setActiveCategory("customer");
    } else {
      setActiveCategory("infrastructure");
    }
  }, [folderName, genericOnly]);

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categories = [
    { id: "all", label: "All" },
    { id: "infrastructure", label: "Infrastructure" },
    { id: "customer", label: "Customers" },
    { id: "generic", label: "General" },
  ];

  // Logic: If genericOnly, show only Generic Icons (STAR, FLAG, etc.) hardcoded for Tier 2
  // Else show existing filtered list
  const getDisplayedIcons = () => {
    if (genericOnly) {
      // Filter ICONS array for generic types
      // Ideally we should mark them in ICONS array, but for now we list IDs
      const genericIds = [
        "STAR", "STAR_BLUE", "STAR_RED", "STAR_GREEN",
        "FLAG", "FLAG_BLUE", "FLAG_GREEN", "FLAG_YELLOW",
        "PIN_RED", "PIN_BLUE", "PIN_GREEN", "PIN_YELLOW",
        "TARGET", "TARGET_BLUE", "TARGET_GREEN",
        "DIAMOND", "DIAMOND_BLUE", "DIAMOND_RED", "DIAMOND_GREEN",
        "SHIELD", "SHIELD_BLUE", "SHIELD_RED", "SHIELD_YELLOW",
        "HEXAGON", "HEXAGON_RED", "HEXAGON_GREEN", "HEXAGON_YELLOW",
        "CLOUD", "CLOUD_BLUE", "CLOUD_GREEN",
        "RING", "RING_BLUE", "RING_RED", "RING_GREEN",
        "OCTAGON", "OCTAGON_RED", "OCTAGON_BLUE",
        "TRIANGLE", "TRIANGLE_RED", "TRIANGLE_GREEN", "TRIANGLE_YELLOW",
        "SQUARE", "SQUARE_RED", "SQUARE_BLUE", "SQUARE_GREEN",
        "DROP", "DROP_BLUE", "DROP_GREEN", "DROP_RED",
        "PENTAGON", "PENTAGON_BLUE", "PENTAGON_GREEN",
        "ANCHOR", "ZAP", "TREE", "WIFI", "SIGNAL", "CROSS",
        "GRID", "GRID_GREEN",
        "ARROW_UP", "ARROW_DOWN",
        "BRIEFCASE", "BRIEFCASE_BLUE",
        "MAP_ICON", "HOME", "HOME_BLUE",
        "FACTORY", "FACTORY_RED",
        "WORK", "INFO", "WARNING", "HELP", "SETTINGS"
      ];
      return ICONS.filter((i) => genericIds.includes(i.id.toUpperCase()));
    }

    // EXCLUDE SYSTEM ICONS (BRANDED) if not genericOnly?
    // Actually, user said "exclude icons that already used by system folders" for the dropdown.
    // So we should probably exclude the specific ISPs and INFRA PROVIDERS from the "All" list too?
    // Or just make sure 'genericOnly' is used in CreateFolderModal.

    return activeCategory === "all"
      ? ICONS
      : ICONS.filter((icon) => icon.category === activeCategory);
  };

  const filteredIcons = getDisplayedIcons();

  // Case-insensitive lookup
  const currentIcon =
    ICONS.find((i) => i.id.toUpperCase() === selectedIcon?.toUpperCase()) ||
    ICONS.find((i) => i.id === "tower") ||
    ICONS[0];

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-400 transition-all shadow-sm group"
      >
        <div className="flex items-center gap-3">
          <div className="bg-gray-50 dark:bg-gray-700 w-10 h-10 flex items-center justify-center rounded-lg group-hover:scale-110 transition-transform">
            {ICON_DEFS[currentIcon.id.toUpperCase()] ? (
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6"
                fill={getColor(currentIcon.id)}
              >
                <path d={ICON_DEFS[currentIcon.id.toUpperCase()].path} />
              </svg>
            ) : (
              <span className="text-xl">?</span>
            )}
          </div>
          <div className="text-left">
            <span className="block text-sm font-medium text-gray-900 dark:text-white">
              {currentIcon.label}
            </span>
            <span className="block text-xs text-gray-500 capitalize">
              {genericOnly ? "Generic" : currentIcon.category}
            </span>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fadeIn">
          {/* Category Tabs - Hide if Generic Only */}
          {!genericOnly && (
            <div className="flex p-1 gap-1 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                    activeCategory === cat.id
                      ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          {/* Icon Grid */}
          <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
            {filteredIcons.map((item) => (
              <button
                key={item.id}
                type="button" // Prevent form submission
                onClick={() => {
                  onSelect(item.id);
                  setIsOpen(false);
                }}
                className={`
                                    flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200
                                    ${
                                      selectedIcon === item.id
                                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500"
                                        : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300"
                                    }
                                `}
                title={item.label}
              >
                {ICON_DEFS[item.id.toUpperCase()] ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="w-8 h-8 mb-1 transform group-hover:scale-110 transition-transform"
                    fill={getColor(item.id)}
                  >
                    <path d={ICON_DEFS[item.id.toUpperCase()].path} />
                  </svg>
                ) : (
                  <span className="text-2xl mb-1 transform group-hover:scale-110 transition-transform">
                    ?
                  </span>
                )}
                <span className="text-[10px] text-center leading-tight w-full truncate">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IconPicker;

