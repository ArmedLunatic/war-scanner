"use client";
import { createContext, useContext, useState, useCallback } from "react";

export type PanelId = "live" | "social" | "context" | "brief" | "escalation";

interface PanelContextValue {
  openPanels: Set<PanelId>;
  toggle: (id: PanelId) => void;
  isOpen: (id: PanelId) => boolean;
  close: (id: PanelId) => void;
  closeAll: () => void;
}

const PanelContext = createContext<PanelContextValue | null>(null);

function isMobileWidth() {
  return typeof window !== "undefined" && window.innerWidth < 769;
}

export function PanelProvider({ children }: { children: React.ReactNode }) {
  // On mobile: start with no panels open (globe loads clean)
  // On desktop: start with live panel open
  const [openPanels, setOpenPanels] = useState<Set<PanelId>>(
    () => new Set(isMobileWidth() ? [] : ["live"])
  );

  const toggle = useCallback((id: PanelId) => {
    setOpenPanels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        // On mobile: only one panel at a time (bottom sheet UX)
        if (isMobileWidth()) next.clear();
        next.add(id);
      }
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

  const closeAll = useCallback(() => setOpenPanels(new Set()), []);

  return (
    <PanelContext.Provider value={{ openPanels, toggle, isOpen, close, closeAll }}>
      {children}
    </PanelContext.Provider>
  );
}

export function usePanels() {
  const ctx = useContext(PanelContext);
  if (!ctx) throw new Error("usePanels must be used inside PanelProvider");
  return ctx;
}
