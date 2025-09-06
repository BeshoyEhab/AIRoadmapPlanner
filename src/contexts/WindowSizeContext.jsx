import React, { createContext, useContext } from 'react';
import { useWindowSize } from '../hooks/useWindowSize';

const WindowSizeContext = createContext({
  width: window.innerWidth,
  height: window.innerHeight,
});

export function WindowSizeProvider({ children }) {
  const windowSize = useWindowSize();

  return (
    <WindowSizeContext.Provider value={windowSize}>
      {children}
    </WindowSizeContext.Provider>
  );
}

export function useWindowSizeContext() {
  const context = useContext(WindowSizeContext);
  if (!context) {
    throw new Error('useWindowSizeContext must be used within a WindowSizeProvider');
  }
  return context;
}
