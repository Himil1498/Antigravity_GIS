import React from "react";
import { ICON_DEFS } from "../../features/network-planning/components/NetworkMap/MapIcons";

interface RenderMapIconProps {
  type?: string;
  name?: string;
  className?: string;
  color?: string;
}

export const RenderMapIcon: React.FC<RenderMapIconProps> = ({
  type,
  name,
  className,
  color: colorOverride,
}) => {
  let key = "DEFAULT";
  const t = (type || name || "").toUpperCase();

  if (ICON_DEFS[t]) key = t;
  else {
    const candidates = Object.keys(ICON_DEFS);
    const match = candidates.find((c) => t.includes(c));
    if (match) key = match;
    else if (t.includes("CUSTOMER")) key = "CUSTOMER";
    else if (t.includes("POP")) key = "POP";
  }

  const def = ICON_DEFS[key] || ICON_DEFS["DEFAULT"];

  // If the icon definition has an external image URL (like our new Telco logos),
  // render an IMG tag instead of an SVG path.
  // Using generic sizing standard based on the SVG view box to fit cleanly into existing layouts.
  if (def.imageUrl) {
    // Determine fallback scale if absolute width/height isn't set via className
    // Typical RenderMapIcon usage expects w-4 h-4 scaling
    return (
      <img
        src={def.imageUrl}
        alt={name || type || key}
        className={className}
        style={{ objectFit: "contain" }}
      />
    );
  }

  const color = `rgba(${def.color?.[0] || 100}, ${def.color?.[1] || 100}, ${
    def.color?.[2] || 100
  }, 1)`;

  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d={def.path} fill={colorOverride || color} />
    </svg>
  );
};

