import React, { useState, useRef, useCallback } from "react";
import * as icons from "lucide-react";
import * as heroIcons from "@heroicons/react/24/outline";
import * as heroIconsSolid from "@heroicons/react/24/solid";
import PageContainer from "../components/ui/PageContainer";
import { Search, ArrowUp, ArrowDown, Copy, Check, X } from "lucide-react";

type TabKey = "lucide" | "hero-outline" | "hero-solid";

const IconGallery: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("lucide");
  const [copiedName, setCopiedName] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Extract all valid Lucide icon components
  const lucideIconList = Object.keys(icons)
    .filter((name) => /^[A-Z]/.test(name) && name !== "LucideIcon" && name !== "Icon" && name !== "createLucideIcon" && (icons as any)[name]?.$$typeof)
    .map((name) => ({
      name,
      Component: (icons as any)[name] as React.FC<any>,
    }));

  // Extract HeroIcons Outline
  const heroOutlineList = Object.keys(heroIcons)
    .filter((name) => /^[A-Z]/.test(name) && name.endsWith("Icon"))
    .map((name) => ({
      name,
      Component: (heroIcons as any)[name] as React.FC<any>,
    }));

  // Extract HeroIcons Solid
  const heroSolidList = Object.keys(heroIconsSolid)
    .filter((name) => /^[A-Z]/.test(name) && name.endsWith("Icon"))
    .map((name) => ({
      name,
      Component: (heroIconsSolid as any)[name] as React.FC<any>,
    }));

  // Filter based on search
  const filterIcons = (list: { name: string; Component: React.FC<any> }[]) =>
    list
      .filter((icon) => icon.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));

  const filteredLucide = filterIcons(lucideIconList);
  const filteredHeroOutline = filterIcons(heroOutlineList);
  const filteredHeroSolid = filterIcons(heroSolidList);

  const activeIcons =
    activeTab === "lucide"
      ? filteredLucide
      : activeTab === "hero-outline"
        ? filteredHeroOutline
        : filteredHeroSolid;

  const totalCounts = {
    lucide: lucideIconList.length,
    "hero-outline": heroOutlineList.length,
    "hero-solid": heroSolidList.length,
  };

  const tabs: { key: TabKey; label: string; color: string; hoverColor: string; activeColor: string; bgColor: string }[] = [
    { key: "lucide", label: "Lucide", color: "text-indigo-600", hoverColor: "group-hover:text-indigo-600", activeColor: "border-indigo-600 text-indigo-600 bg-indigo-50", bgColor: "hover:border-indigo-500" },
    { key: "hero-outline", label: "HeroIcons Outline", color: "text-emerald-600", hoverColor: "group-hover:text-emerald-600", activeColor: "border-emerald-600 text-emerald-600 bg-emerald-50", bgColor: "hover:border-emerald-500" },
    { key: "hero-solid", label: "HeroIcons Solid", color: "text-amber-600", hoverColor: "group-hover:text-amber-600", activeColor: "border-amber-600 text-amber-600 bg-amber-50", bgColor: "hover:border-amber-500" },
  ];

  const scrollTo = useCallback((direction: "top" | "bottom") => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: direction === "top" ? 0 : scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  const copyToClipboard = useCallback((name: string) => {
    const importStr =
      activeTab === "lucide"
        ? `import { ${name} } from "lucide-react";`
        : activeTab === "hero-outline"
          ? `import { ${name} } from "@heroicons/react/24/outline";`
          : `import { ${name} } from "@heroicons/react/24/solid";`;
    navigator.clipboard.writeText(importStr);
    setCopiedName(name);
    setTimeout(() => setCopiedName(null), 1500);
  }, [activeTab]);

  const currentTabConfig = tabs.find(t => t.key === activeTab)!;

  return (
    <PageContainer>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full h-[calc(100vh-80px)] flex flex-col">
        {/* Header */}
        <div className="mb-4 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Search className="w-5 h-5 text-white" />
            </div>
            Icon Gallery
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Browse and search {totalCounts.lucide + totalCounts["hero-outline"] + totalCounts["hero-solid"]} icons. Click any icon to copy its import statement.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 flex flex-wrap gap-2 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all duration-200 ${
                activeTab === tab.key
                  ? tab.activeColor + " border-current shadow-sm"
                  : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800"
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs opacity-70">
                ({activeTab === tab.key ? activeIcons.length : totalCounts[tab.key]})
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex-shrink-0 relative mb-4">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${tabs.find(t => t.key === activeTab)?.label} icons...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white text-sm shadow-sm transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex-shrink-0 mb-3 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            {activeIcons.length} {activeIcons.length === 1 ? "icon" : "icons"} {searchTerm && `matching "${searchTerm}"`}
          </span>
        </div>

        {/* Icon Grid (Scrollable) */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar rounded-xl">
          {activeIcons.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500">
              <Search className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-lg font-medium">No icons found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
              {activeIcons.map(({ name, Component }) => (
                <div
                  key={`${activeTab}-${name}`}
                  onClick={() => copyToClipboard(name)}
                  className={`group relative flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 ${currentTabConfig.bgColor} hover:shadow-md transition-all cursor-pointer active:scale-95`}
                  title={`Click to copy import for ${name}`}
                >
                  {/* Copy Feedback */}
                  {copiedName === name && (
                    <div className="absolute inset-0 bg-green-500/90 rounded-xl flex items-center justify-center z-10 animate-in fade-in duration-150">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                  )}

                  <Component
                    className={`w-8 h-8 text-gray-500 dark:text-gray-400 ${currentTabConfig.hoverColor} dark:${currentTabConfig.hoverColor} transition-colors mb-2`}
                    strokeWidth={activeTab === "hero-solid" ? undefined : 1.5}
                  />
                  <span className={`text-[10px] text-center font-medium text-gray-400 dark:text-gray-500 break-words w-full ${currentTabConfig.hoverColor} leading-tight`}>
                    {name.replace(/Icon$/, "")}
                  </span>

                  {/* Copy Hint */}
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Copy className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scroll Buttons (Fixed) */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-2 z-50">
          <button
            onClick={() => scrollTo("top")}
            className="w-10 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 hover:text-indigo-600 text-gray-500 transition-all hover:scale-110 active:scale-95"
            title="Scroll to top"
          >
            <ArrowUp className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => scrollTo("bottom")}
            className="w-10 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 hover:text-indigo-600 text-gray-500 transition-all hover:scale-110 active:scale-95"
            title="Scroll to bottom"
          >
            <ArrowDown className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </PageContainer>
  );
};

export default IconGallery;
