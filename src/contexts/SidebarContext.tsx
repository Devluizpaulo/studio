"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

// Use a specific breakpoint for mobile
const MOBILE_BREAKPOINT = 768; // Corresponds to Tailwind's `md` breakpoint

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(!isMobile);

  useEffect(() => {
    const checkDeviceSize = () => {
      const isMobileSize = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(isMobileSize);
      // Collapse sidebar by default on desktop, open on mobile if triggered
      if (!isMobileSize) {
         setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    
    checkDeviceSize();
    window.addEventListener("resize", checkDeviceSize);
    return () => window.removeEventListener("resize", checkDeviceSize);
  }, []);


  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, isMobile }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
