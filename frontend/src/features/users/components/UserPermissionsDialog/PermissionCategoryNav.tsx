import React from "react";

export interface CategoryConfig {
  id: string;
  label: string;
  icon: string;
}

interface PermissionCategoryNavProps {
  categories: CategoryConfig[];
  activeCategory: string;
  setActiveCategory: (id: string) => void;
  onGlobalToggle: () => void;
  isAllGloballySelected: boolean;
}

export const PermissionCategoryNav: React.FC<PermissionCategoryNavProps> = ({
  categories,
  activeCategory,
  setActiveCategory,
  onGlobalToggle,
  isAllGloballySelected,
}) => {
  return (
    <div className="pg-sidebar">
      <div className="pg-sidebar-header">
        <button
          type="button"
          onClick={onGlobalToggle}
          className="pg-global-toggle-btn"
        >
          {isAllGloballySelected ? "Deselect Everything" : "Global Select All"}
        </button>
      </div>

      <div className="pg-nav-list custom-scrollbar">
        <h4 className="pg-nav-heading">Categories</h4>
        <nav className="pg-nav-items">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`pg-nav-btn ${isActive ? "active" : ""}`}
              >
                <span className="pg-nav-icon">{cat.icon}</span>
                {cat.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
