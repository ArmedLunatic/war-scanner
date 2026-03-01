"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import type { PanelId } from "@/lib/context/PanelContext";
import { usePanels } from "@/lib/context/PanelContext";
import { IconClose } from "@/components/icons";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 769
  );
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 769);
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

interface Props {
  id: PanelId;
  title: ReactNode;
  icon?: ReactNode;
  width?: number;
  maxHeight?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}

const desktopVariants = {
  hidden: { opacity: 0, x: 16, scale: 0.98 },
  visible: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 16, scale: 0.98 },
};

const mobileVariants = {
  hidden: { y: "100%" },
  visible: { y: 0 },
  exit: { y: "100%" },
};

export function PanelShell({
  id,
  title,
  icon,
  width = 360,
  maxHeight = "calc(50vh - 80px)",
  children,
  style,
}: Props) {
  const { isOpen, close } = usePanels();
  const isMobile = useIsMobile();

  return (
    <AnimatePresence>
      {isOpen(id) && (
        <motion.div
          key={id}
          variants={isMobile ? mobileVariants : desktopVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{
            duration: isMobile ? 0.3 : 0.18,
            ease: isMobile ? [0.25, 0.46, 0.45, 0.94] : "easeOut",
          }}
          className="panel-glass"
          style={
            isMobile
              ? {
                  position: "fixed",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 120,
                  maxHeight: "72vh",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  // iOS safe area
                  paddingBottom: "env(safe-area-inset-bottom, 0px)",
                }
              : {
                  width,
                  maxHeight,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  ...style,
                }
          }
        >
          {/* Mobile drag handle */}
          {isMobile && <div className="sheet-handle" />}

          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: isMobile ? "8px 16px 8px 14px" : "10px 14px",
              background: "var(--bg-panel-header)",
              borderBottom: "1px solid rgba(96,165,250,0.12)",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {icon && (
                <span style={{ fontSize: "13px", opacity: 0.8 }}>{icon}</span>
              )}
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#e2e8f0",
                }}
              >
                {title}
              </span>
            </div>
            {/* 44×44 touch target for close */}
            <button
              onClick={() => close(id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6b7a8d",
                fontSize: "20px",
                padding: 0,
                lineHeight: 1,
                minWidth: "44px",
                minHeight: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                transition: "color 0.12s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color = "#e2e8f0")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color = "#6b7a8d")
              }
              aria-label="Close panel"
            >
              <IconClose size={14} />
            </button>
          </div>

          {/* Scrollable content */}
          <div
            style={{
              overflowY: "auto",
              flexGrow: 1,
              scrollbarWidth: "thin",
              scrollbarColor: "#1e2a38 transparent",
              overscrollBehavior: "contain",
              WebkitOverflowScrolling: "touch" as any,
            }}
          >
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
