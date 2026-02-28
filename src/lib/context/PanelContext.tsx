"use client";
import { createContext, useContext, useState, useCallback } from "react";

export type PanelId = "live" | "social" | "context" | "brief";

interface PanelContextValue {
  openPanels: Set<PanelId>;
  toggle: (id: PanelId) => void;
  isOpen: (id: PanelId) => boolean;
  close: (id: PanelId) => void;
}

const PanelContext = createContext<PanelContextValue | null>(null);

export function PanelProvider({ children }: { children: React.ReactNode }) {
  const [openPanels, setOpenPanels] = useState<Set<PanelId>>(new Set(["live"]));

  const toggle = useCallback((id: PanelId) => {
    setOpenPanels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isOpen = useCallback((id: PanelId) => openPanels.has(id), [openPanels]);

  const close = useCallback((id: PanelId) => {
    setOpenPanels((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  return (
    <PanelContext.Provider value={{ openPanels, toggle, isOpen, close }}>
      {children}
    </PanelContext.Provider>
  );
}

export function usePanels() {
  const ctx = useContext(PanelContext);
  if (!ctx) throw new Error("usePanels must be used inside PanelProvider");
  return ctx;
}
