import { useState, useEffect } from "react";

type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

// Breakpoint pixel values matching our Tailwind config
const breakpoints = {
  xs: 375,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1440,
};

interface UseResponsiveReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  breakpoint: Breakpoint;
  width: number;
  height: number;
  isPortrait: boolean;
  isLandscape: boolean;
  is: (breakpoint: Breakpoint) => boolean;
  greaterThan: (breakpoint: Breakpoint) => boolean;
  lessThan: (breakpoint: Breakpoint) => boolean;
  between: (minBreakpoint: Breakpoint, maxBreakpoint: Breakpoint) => boolean;
}

export function useResponsive(): UseResponsiveReturn {
  // Initialize with sensible defaults to prevent hydration issues
  const [state, setState] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
    breakpoint: "lg" as Breakpoint,
  });

  useEffect(() => {
    // Function to update dimensions and breakpoint
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Determine current breakpoint
      let breakpoint: Breakpoint = "xs";
      if (width >= breakpoints["2xl"]) breakpoint = "2xl";
      else if (width >= breakpoints.xl) breakpoint = "xl";
      else if (width >= breakpoints.lg) breakpoint = "lg";
      else if (width >= breakpoints.md) breakpoint = "md";
      else if (width >= breakpoints.sm) breakpoint = "sm";

      setState({ width, height, breakpoint });
    };

    // Call once to set initial values
    updateDimensions();

    // Set up event listener
    window.addEventListener("resize", updateDimensions);

    // Clean up event listener
    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  // Helper functions to check breakpoints
  const is = (breakpoint: Breakpoint) => state.breakpoint === breakpoint;
  const greaterThan = (breakpoint: Breakpoint) =>
    state.width >= breakpoints[breakpoint];
  const lessThan = (breakpoint: Breakpoint) =>
    state.width < breakpoints[breakpoint];
  const between = (minBreakpoint: Breakpoint, maxBreakpoint: Breakpoint) =>
    state.width >= breakpoints[minBreakpoint] &&
    state.width < breakpoints[maxBreakpoint];

  // Convenience booleans
  const isMobile = lessThan("md");
  const isTablet = between("md", "lg");
  const isDesktop = greaterThan("lg");
  const isLargeDesktop = greaterThan("xl");
  const isPortrait = state.height > state.width;
  const isLandscape = state.width > state.height;

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    breakpoint: state.breakpoint,
    width: state.width,
    height: state.height,
    isPortrait,
    isLandscape,
    is,
    greaterThan,
    lessThan,
    between,
  };
}
