"use client";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import type { PanelId } from "@/lib/context/PanelContext";
import { usePanels } from "@/lib/context/PanelContext";

interface Props {
  id: PanelId;
  title: string;
  icon?: string;
  width?: number;
  maxHeight?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}

const variants = {
  hidden: { opacity: 0, x: 20, scale: 0.97 },
  visible: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 20, scale: 0.97 },
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

  return (
    <AnimatePresence>
      {isOpen(id) && (
        <motion.div
          key={id}
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="panel-glass"
          style={{
            width,
            maxHeight,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            ...style,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
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
            <button
              onClick={() => close(id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#3d4f63",
                fontSize: "14px",
                padding: "2px 6px",
                lineHeight: 1,
                borderRadius: "2px",
                transition: "color 0.12s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color = "#e2e8f0")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color = "#3d4f63")
              }
              aria-label="Close panel"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div
            style={{
              overflowY: "auto",
              flexGrow: 1,
              scrollbarWidth: "thin",
              scrollbarColor: "#1e2a38 transparent",
            }}
          >
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
