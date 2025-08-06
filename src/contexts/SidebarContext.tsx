"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);

  React.useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
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
