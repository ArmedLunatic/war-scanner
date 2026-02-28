"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

const TOUR_STEPS = [
  {
    target: "step-globe",
    title: "Welcome to Warspy",
    description:
      "Real-time conflict intelligence. Explore the globe to see active hotspots around the world.",
    position: "center" as const,
  },
  {
    target: "step-panels",
    title: "Your Intel Panels",
    description:
      "Toggle Live Events, Social Feed, Briefings, and Escalation data from these buttons.",
    position: "below" as const,
  },
  {
    target: "step-search",
    title: "Quick Navigation",
    description:
      "Search locations, panels, and intelligence — or press Cmd+K anytime.",
    position: "below" as const,
  },
  {
    target: "step-threatcon",
    title: "Threat Level",
    description:
      "Current threat assessment based on event frequency and severity over the past week.",
    position: "below" as const,
  },
];

export default function WelcomeTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (localStorage.getItem("warspy:toured") === "1") return;
    const timer = setTimeout(() => setActive(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!active) return;
    const currentStep = TOUR_STEPS[step];
    const el = document.querySelector(`[data-tour="${currentStep.target}"]`);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [active, step]);

  const dismiss = useCallback(() => {
    setActive(false);
    localStorage.setItem("warspy:toured", "1");
  }, []);

  const next = useCallback(() => {
    if (step >= TOUR_STEPS.length - 1) {
      dismiss();
    } else {
      setStep((s) => s + 1);
    }
  }, [step, dismiss]);

  if (!active) return null;

  const currentStep = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;
  const padding = 8;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9000 }}>
      {/* Full-screen dimmed backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
        }}
        onClick={dismiss}
      />

      {/* Spotlight cutout — only if we have a target rect */}
      {targetRect && (
        <div
          style={{
            position: "absolute",
            top: targetRect.top - padding,
            left: targetRect.left - padding,
            width: targetRect.width + padding * 2,
            height: targetRect.height + padding * 2,
            borderRadius: "8px",
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.75)",
            zIndex: 9001,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Tooltip card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "absolute",
            zIndex: 9002,
            ...(currentStep.position === "center" || !targetRect
              ? {
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }
              : {
                  top: targetRect.bottom + padding + 12,
                  left: Math.max(
                    16,
                    Math.min(targetRect.left, window.innerWidth - 320)
                  ),
                }),
            width: "300px",
            maxWidth: "calc(100vw - 32px)",
            background: "rgba(10,14,20,0.98)",
            border: "1px solid rgba(96,165,250,0.3)",
            borderRadius: "8px",
            padding: "20px",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(96,165,250,0.1)",
          }}
        >
          {/* Step counter */}
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              color: "#3d4f63",
              letterSpacing: "0.12em",
              marginBottom: "8px",
            }}
          >
            {step + 1} OF {TOUR_STEPS.length}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#e2e8f0",
              marginBottom: "8px",
              lineHeight: 1.3,
            }}
          >
            {currentStep.title}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: "13px",
              color: "#94a3b8",
              lineHeight: 1.5,
              marginBottom: "20px",
            }}
          >
            {currentStep.description}
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <button
              onClick={dismiss}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "#3d4f63",
                letterSpacing: "0.06em",
                padding: "4px 0",
              }}
            >
              Skip tour
            </button>
            <button
              onClick={next}
              style={{
                background: "rgba(96,165,250,0.15)",
                border: "1px solid rgba(96,165,250,0.4)",
                borderRadius: "4px",
                cursor: "pointer",
                padding: "8px 20px",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 600,
                color: "#60a5fa",
                letterSpacing: "0.06em",
                transition: "background 0.12s",
              }}
            >
              {isLast ? "Get Started" : "Next"}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
