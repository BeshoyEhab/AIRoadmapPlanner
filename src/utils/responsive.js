// Utility functions for responsive calculations and layout adjustments

/**
 * Cached values to prevent unnecessary recalculations
 */
let cachedWidth = null;
let cachedHeight = null;
let cachedIsMobile = null;
let cachedIsTablet = null;
let cachedIsDesktop = null;

// Breakpoint values
export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE_DESKTOP: 1280
};

/**
 * Get viewport dimensions with caching
 */
export function getViewportDimensions() {
  // Use cached values if available and window hasn't been resized
  if (
    cachedWidth === window.innerWidth &&
    cachedHeight === window.innerHeight
  ) {
    return {
      width: cachedWidth,
      height: cachedHeight
    };
  }

  // Update cache and return new values
  cachedWidth = window.innerWidth;
  cachedHeight = window.innerHeight;

  return {
    width: cachedWidth,
    height: cachedHeight
  };
}

/**
 * Check if current viewport is mobile size
 */
export function isMobileViewport() {
  const { width } = getViewportDimensions();

  if (cachedWidth === width && cachedIsMobile !== null) {
    return cachedIsMobile;
  }

  cachedIsMobile = width < BREAKPOINTS.TABLET;
  return cachedIsMobile;
}

/**
 * Check if current viewport is tablet size
 */
export function isTabletViewport() {
  const { width } = getViewportDimensions();

  if (cachedWidth === width && cachedIsTablet !== null) {
    return cachedIsTablet;
  }

  cachedIsTablet = width >= BREAKPOINTS.TABLET && width < BREAKPOINTS.DESKTOP;
  return cachedIsTablet;
}

/**
 * Check if current viewport is desktop size
 */
export function isDesktopViewport() {
  const { width } = getViewportDimensions();

  if (cachedWidth === width && cachedIsDesktop !== null) {
    return cachedIsDesktop;
  }

  cachedIsDesktop = width >= BREAKPOINTS.DESKTOP;
  return cachedIsDesktop;
}

/**
 * Clear cached values (useful when needing to force recalculation)
 */
export function clearResponsiveCache() {
  cachedWidth = null;
  cachedHeight = null;
  cachedIsMobile = null;
  cachedIsTablet = null;
  cachedIsDesktop = null;
}

/**
 * Calculate relative size based on viewport width
 * @param {number} size - Base size in pixels
 * @param {number} min - Minimum size in pixels
 * @param {number} max - Maximum size in pixels
 */
export function getResponsiveSize(size, min, max) {
  const { width } = getViewportDimensions();
  const calculatedSize = (width / BREAKPOINTS.DESKTOP) * size;

  if (min && calculatedSize < min) return min;
  if (max && calculatedSize > max) return max;

  return calculatedSize;
}

/**
 * Get appropriate layout values based on current viewport
 */
export function getLayoutValues() {
  const { width } = getViewportDimensions();

  if (width < BREAKPOINTS.TABLET) {
    return {
      gutter: 16,
      margin: 16,
      columns: 4
    };
  }

  if (width < BREAKPOINTS.DESKTOP) {
    return {
      gutter: 24,
      margin: 32,
      columns: 8
    };
  }

  return {
    gutter: 32,
    margin: 48,
    columns: 12
  };
}

// Export a single object with all utilities
export const responsive = {
  BREAKPOINTS,
  getViewportDimensions,
  isMobileViewport,
  isTabletViewport,
  isDesktopViewport,
  clearResponsiveCache,
  getResponsiveSize,
  getLayoutValues
};
