"use client";
import dynamic from "next/dynamic";
import type { GlobeMarker, GlobeArc } from "./globeData";

const ConflictGlobe = dynamic(() => import("./ConflictGlobe"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#030508",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          letterSpacing: "0.15em",
          color: "rgba(96,165,250,0.5)",
          textTransform: "uppercase",
          animation: "live-pulse 1.8s ease-in-out infinite",
        }}
      >
        Initializing Globe...
      </div>
    </div>
  ),
});

interface Props {
  initialPov?: { lat: number; lng: number; altitude: number };
  onMarkerClick?: (marker: GlobeMarker) => void;
  customArcs?: GlobeArc[];
  hideDefaultArcs?: boolean;
}

export default function GlobeWrapper(props: Props) {
  return <ConflictGlobe {...props} />;
}
