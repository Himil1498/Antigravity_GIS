import { useState, useEffect, useRef, useCallback } from "react";

interface UseScrollNavReturn {
  navScrollRef: React.RefObject<HTMLDivElement>;
  showScrollButtons: {
    left: boolean;
    right: boolean;
  };
  handleScroll: (direction: "left" | "right") => void;
}

/**
 * useScrollNav - Advanced hook for managing horizontal scroll containers
 * Uses ResizeObserver for robust layout detection and memoized callbacks.
 */
export const useScrollNav = (): UseScrollNavReturn => {
  const navScrollRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState({
    left: false,
    right: false,
  });

  const checkScrollButtons = useCallback(() => {
    const el = navScrollRef.current;
    if (el) {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      // Use small threshold (5px) for sub-pixel rendering stability
      setShowScrollButtons({
        left: scrollLeft > 5,
        right: scrollLeft < scrollWidth - clientWidth - 5,
      });
    }
  }, []);

  const handleScroll = useCallback((direction: "left" | "right") => {
    const el = navScrollRef.current;
    if (el) {
      const scrollAmount = Math.max(200, el.clientWidth * 0.4);
      const target = direction === "left" 
        ? el.scrollLeft - scrollAmount 
        : el.scrollLeft + scrollAmount;
      
      el.scrollTo({ left: target, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const el = navScrollRef.current;
    if (!el) return;

    // Robust measurement using ResizeObserver on the container
    // Changes in children's sizes or quantity correctly trigger parent scroll dimension changes
    const observer = new ResizeObserver(() => checkScrollButtons());
    observer.observe(el);

    // Handle manual scroll events
    el.addEventListener("scroll", checkScrollButtons, { passive: true });

    // Handle Shift + Wheel to scroll horizontally
    const handleWheel = (e: WheelEvent) => {
      if (e.shiftKey) {
        e.preventDefault();
        // Browsers handle Shift+Wheel differently; some automatically map it to deltaX.
        // We capture both to ensure smooth scrolling in all environments.
        const scrollAmount = Math.abs(e.deltaX) > 0 ? e.deltaX : e.deltaY;
        el.scrollLeft += scrollAmount;
      }
    };
    el.addEventListener("wheel", handleWheel, { passive: false });

    // Initial check
    checkScrollButtons();

    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", checkScrollButtons);
      el.removeEventListener("wheel", handleWheel);
    };
  }, [checkScrollButtons]);

  return {
    navScrollRef: navScrollRef as React.RefObject<HTMLDivElement>,
    showScrollButtons,
    handleScroll,
  };
};

