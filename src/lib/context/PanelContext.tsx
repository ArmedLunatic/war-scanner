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

const STORAGE_KEY = "warspy:openPanels";

function isMobileWidth() {
  return typeof window !== "undefined" && window.innerWidth < 769;
}

function readPersistedPanels(): Set<PanelId> {
  if (typeof window === "undefined") return new Set(["live"]);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const ids = JSON.parse(raw) as PanelId[];
      return new Set(ids);
    }
  } catch {
    // ignore parse errors
  }
  // Default: mobile = none, desktop = live
  return new Set(isMobileWidth() ? [] : ["live"]);
}

function persistPanels(panels: Set<PanelId>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...panels]));
  } catch {
    // ignore storage errors
  }
}

export function PanelProvider({ children }: { children: React.ReactNode }) {
  const [openPanels, setOpenPanels] = useState<Set<PanelId>>(readPersistedPanels);

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
      persistPanels(next);
      return next;
    });
  }, []);

  const isOpen = useCallback((id: PanelId) => openPanels.has(id), [openPanels]);

  const close = useCallback((id: PanelId) => {
    setOpenPanels((prev) => {
      const next = new Set(prev);
      next.delete(id);
      persistPanels(next);
      return next;
    });
  }, []);

  const closeAll = useCallback(() => {
    const empty = new Set<PanelId>();
    persistPanels(empty);
    setOpenPanels(empty);
  }, []);

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
