import React, { useState, useMemo } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { KeyboardIcon } from "../../components/NavigationBar/HelpMenu/icons";
import { motion, AnimatePresence } from "framer-motion";
import NavigationBar from "../../components/NavigationBar";

// --- Data ---
const SHORTCUTS = [
  {
    category: "General Map Interactions",
    description: "Essential commands for interacting with the map interface.",
    items: [
      {
        keys: ["Ctrl", "Click"],
        description: "Feature Information",
        detail:
          "Forces the Info Window to open for a specific feature even when a map tool (e.g., Distance, Area) is active.",
      },
      {
        keys: ["Shift", "Click"],
        description: "Address Inspector",
        detail: "Instantly reverse-geocode any location on the map to get its address and coordinates.",
      },
      {
        keys: ["Alt", "Click"],
        description: "Address Inspector",
        detail: "Alternative shortcut for the Address Inspector tool.",
      },
      {
        keys: ["Esc"],
        description: "Cancel / Deselect",
        detail: "Cancels the current active tool or deselects selected items.",
      },
      {
        keys: ["?"],
        description: "Show Help",
        detail: "Opens the help menu.",
      },
    ],
  },
  {
    category: "Map Navigation",
    description: "Navigate the 3D and 2D map environment efficiently.",
    items: [
      {
        keys: ["Shift", "Drag"],
        description: "Rotate & Tilt",
        detail:
          "Hold Shift and drag with the mouse to rotate or tilt the map view.",
      },
      {
        keys: ["Scroll"],
        description: "Zoom",
        detail: "Use the mouse wheel to zoom in and out of the map.",
      },
      {
        keys: ["Double Click"],
        description: "Zoom In",
        detail: "Double click anywhere on the map to zoom in.",
      },
    ],
  },
  {
    category: "Drawing & Editing",
    description: "Shortcuts for creating and modifying network features.",
    items: [
      {
        keys: ["Enter"],
        description: "Complete Shape",
        detail: "Finishes drawing a polygon or line string.",
      },
      {
        keys: ["Del"],
        description: "Delete Selected",
        detail: "Deletes the currently selected node or feature.",
      },
      {
        keys: ["Ctrl", "Z"],
        description: "Undo",
        detail: "Revert the last action (drawing only).",
      },
    ],
  },
  {
    category: "Global Interface",
    description: "General shortcuts for platform-wide UI elements.",
    items: [
      {
        keys: ["Shift", "Scroll"],
        description: "Scroll Navigation Dock",
        detail: "Scroll the top navigation dock horizontally to access hidden tabs.",
      },
    ],
  },
];

// --- Components ---

const KeyCap: React.FC<{ label: string }> = ({ label }) => {
  const isModifier = [
    "Ctrl",
    "Shift",
    "Alt",
    "Cmd",
    "Esc",
    "Enter",
    "Del",
  ].includes(label);

  // Dynamic colors for modifiers
  const getModifierColor = () => {
    if (label === "Ctrl" || label === "Cmd")
      return "bg-indigo-600 border-indigo-800 text-white";
    if (label === "Shift") return "bg-violet-600 border-violet-800 text-white";
    if (label === "Esc" || label === "Del")
      return "bg-rose-500 border-rose-700 text-white";
    if (label === "Enter")
      return "bg-emerald-500 border-emerald-700 text-white";
    return "bg-gray-800 border-black text-white dark:bg-gray-700 dark:border-gray-900";
  };

  return (
    <kbd
      className={`
        inline-flex items-center justify-center min-w-[32px] h-8 px-2.5 rounded-lg text-xs font-bold font-mono transition-transform active:scale-95 select-none
        border-b-[4px] shadow-lg
        ${
          isModifier
            ? getModifierColor()
            : "bg-white text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-950"
        }
      `}
    >
      {label}
    </kbd>
  );
};

const KeyboardShortcutsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredShortcuts = useMemo(() => {
    if (!searchQuery) return SHORTCUTS;
    const lowerQuery = searchQuery.toLowerCase();

    return SHORTCUTS.map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.description.toLowerCase().includes(lowerQuery) ||
          item.detail.toLowerCase().includes(lowerQuery) ||
          item.keys.some((k) => k.toLowerCase().includes(lowerQuery)),
      ),
    })).filter((section) => section.items.length > 0);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      {/* --- Main Navigation --- */}
      <NavigationBar />

      {/* --- Page Content (Padding top for fixed nav) --- */}
      <div className="pt-20 lg:pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
        {/* --- Header Section --- */}
        <div className="relative mb-12 rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 shadow-xl">
          {/* Background Decor */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-blue-400 opacity-20 rounded-full blur-3xl"></div>

          <div className="relative z-10 px-8 py-10 md:py-14 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 text-blue-100 text-xs font-medium uppercase tracking-wider mb-4 border border-blue-400/30">
                <KeyboardIcon className="w-4 h-4" /> Productivity Center
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
                Keyboard Shortcuts
              </h1>
              <p className="text-blue-100 text-lg md:text-xl max-w-2xl text-opacity-90">
                Supercharge your workflow. Master these quick commands to
                navigate and edit like a pro.
              </p>
            </div>

            {/* Search Bar in Header */}
            <div className="w-full md:w-96 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-indigo-300 group-focus-within:text-white transition-colors duration-200" />
              </div>
              <input
                type="text"
                placeholder="Find a shortcut..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-11 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all shadow-lg text-lg"
              />
            </div>
          </div>
        </div>

        {/* --- Results Section --- */}
        {filteredShortcuts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700"
          >
            <div className="inline-flex p-5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 mb-6">
              <MagnifyingGlassIcon className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              No shortcuts found for "{searchQuery}"
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
              Try standard keywords like "zoom", "edit", or "measure".
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredShortcuts.map((section, idx) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  key={section.category}
                  className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                >
                  <div className="p-6 border-b border-gray-50 dark:border-gray-700/50 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {section.category}
                    </h2>
                    {section.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                        {section.description}
                      </p>
                    )}
                  </div>

                  <div className="p-6 flex-1 bg-white dark:bg-gray-800">
                    <ul className="space-y-6">
                      {section.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="group">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {item.description}
                            </span>
                            <div className="flex gap-1.5 shrink-0 pl-4">
                              {item.keys.map((key) => (
                                <KeyCap key={key} label={key} />
                              ))}
                            </div>
                          </div>
                          {item.detail && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors">
                              {item.detail}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="mt-16 text-center pb-8">
          <p className="text-sm text-gray-400 dark:text-gray-600">
            Pro Tip: Press <KeyCap label="Ctrl" /> + <KeyCap label="Click" /> on
            map features to force Info Window overlay.
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsPage;
