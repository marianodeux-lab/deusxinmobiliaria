"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

interface MobileNavContextType {
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
  closeMobileNav: () => void;
  openMobileNav: () => void;
}

const MobileNavContext = createContext<MobileNavContextType>({
  isMobileNavOpen: false,
  setIsMobileNavOpen: () => {},
  toggleMobileNav: () => {},
  closeMobileNav: () => {},
  openMobileNav: () => {},
});

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const toggleMobileNav = useCallback(() => {
    setIsMobileNavOpen((prev) => !prev);
  }, []);

  const closeMobileNav = useCallback(() => {
    setIsMobileNavOpen(false);
  }, []);

  const openMobileNav = useCallback(() => {
    setIsMobileNavOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      isMobileNavOpen,
      setIsMobileNavOpen,
      toggleMobileNav,
      closeMobileNav,
      openMobileNav,
    }),
    [isMobileNavOpen, toggleMobileNav, closeMobileNav, openMobileNav]
  );

  return (
    <MobileNavContext.Provider value={value}>
      {children}
    </MobileNavContext.Provider>
  );
}

export function useMobileNav() {
  return useContext(MobileNavContext);
}
