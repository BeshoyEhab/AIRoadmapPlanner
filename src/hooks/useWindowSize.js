import { useState, useEffect, useCallback } from 'react';

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Debounce function to limit resize event handler calls
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  // Memoized resize handler using useCallback
  const handleResize = useCallback(
    debounce(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 100), // 100ms debounce delay
    []
  );

  useEffect(() => {
    // Add event listener with debounced handler
    window.addEventListener('resize', handleResize, { passive: true });

    // Initialize size on mount
    handleResize();

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]); // Only re-run if handleResize changes

  return windowSize;
}
