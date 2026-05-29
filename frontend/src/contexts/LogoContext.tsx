import React, { createContext, useContext, useState } from 'react';
import { useTheme } from './ThemeContext';

/**
 * LogoContext - Global state for managing the application's brand identity.
 */

interface LogoContextType {
  logoIndex: number;
  totalLogos: number;
  isTransparent: boolean;
  setLogoIndex: (index: number) => void;
  setIsTransparent: (transparent: boolean) => void;
  logoPath: string;
  nextLogo: () => void;
  prevLogo: () => void;
}

const LogoContext = createContext<LogoContextType | undefined>(undefined);

export const LogoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDarkMode } = useTheme();

  // We keep the state variables strictly to satisfy the LogoContextType interface
  // but they are fundamentally dummied out now that the static logo is used.
  const [logoIndex, setLogoIndex] = useState(1);
  const [isTransparent, setIsTransparent] = useState(true);

  // Serve dark mode variant if dark mode is active
  const logoPath = isDarkMode 
    ? '/Logos/Transparent_Dark/logo1.png' 
    : '/Logos/Transparent/logo1.png';

  const nextLogo = () => {};
  const prevLogo = () => {};

  const value = {
    logoIndex,
    totalLogos: 1,
    isTransparent,
    setLogoIndex,
    setIsTransparent,
    logoPath,
    nextLogo,
    prevLogo
  };

  return (
    <LogoContext.Provider value={value}>
      {children}
    </LogoContext.Provider>
  );
};

export const useLogo = () => {
  const context = useContext(LogoContext);
  if (!context) {
    throw new Error('useLogo must be used within a LogoProvider');
  }
  return context;
};
