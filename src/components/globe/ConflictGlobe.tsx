"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import Globe from "react-globe.gl";
import {
  FOCUS_MARKERS,
  CONFLICT_ARCS,
  HIGHLIGHT_COUNTRY_IDS,
  HOME_POV,
  type GlobeMarker,
} from "./globeData";

interface Props {
  initialPov?: { lat: number; lng: number; altitude: number };
  onMarkerClick?: (marker: GlobeMarker) => void;
}

export default function ConflictGlobe({
  initialPov = HOME_POV,
  onMarkerClick,
}: Props) {
  const globeRef = useRef<any>(null);
  const [polygons, setPolygons] = useState<any[]>([]);
  const [hovered, setHovered] = useState<GlobeMarker | null>(null);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

  // Responsive sizing
  useEffect(() => {
    function update() {
      setDimensions({ w: window.innerWidth, h: window.innerHeight });
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Set initial POV after mount
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointOfView(initialPov, 1200);
    }
  }, [initialPov]);

  // Auto-rotate, pause on hover
  useEffect(() => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.2;
    controls.enableZoom = true;
    controls.minDistance = 150;
    controls.maxDistance = 900;
  }, [dimensions]); // re-run after mount

  // Load country polygons lazily
  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((r) => r.json())
      .then((world) => {
        // world-atlas topojson → we need topojson-client, so use fetch for geojson instead
        return fetch(
          "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson"
        );
      })
      .then((r) => r.json())
      .then((geoJson) => {
        // Filter to only our highlighted countries by ISO_N3
        const filtered = geoJson.features.filter((f: any) => {
          const iso = parseInt(f.properties?.ISO_N3 ?? "0", 10);
          return HIGHLIGHT_COUNTRY_IDS.has(iso);
        });
        setPolygons(filtered);
      })
      .catch(() => {
        // Silently fail — globe still works without country highlights
      });
  }, []);

  const handleMouseOver = useCallback(
    (obj: object | null) => {
      const controls = globeRef.current?.controls();
      if (controls) controls.autoRotate = !obj;
      setHovered(obj as GlobeMarker | null);
    },
    []
  );

  const handleMarkerClick = useCallback(
    (obj: object) => {
      const marker = obj as GlobeMarker;
      globeRef.current?.pointOfView(
        { lat: marker.lat, lng: marker.lng, altitude: 1.2 },
        800
      );
      onMarkerClick?.(marker);
    },
    [onMarkerClick]
  );

  if (dimensions.w === 0) return null;

  return (
    <div style={{ position: "relative" }}>
      <Globe
        ref={globeRef}
        width={dimensions.w}
        height={dimensions.h}
        // Globe appearance
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        atmosphereColor="#1a3a5c"
        atmosphereAltitude={0.18}
        // Country highlights
        polygonsData={polygons}
        polygonCapColor={(feat: any) => {
          const iso = parseInt(feat.properties?.ISO_N3 ?? "0", 10);
          if (iso === 376) return "rgba(96,165,250,0.12)"; // Israel — blue
          if (iso === 364) return "rgba(224,62,62,0.12)"; // Iran — red
          if (iso === 422) return "rgba(217,119,6,0.10)"; // Lebanon — amber
          if (iso === 887) return "rgba(251,191,36,0.08)"; // Yemen — gold
          return "rgba(167,139,250,0.06)";
        }}
        polygonSideColor={() => "rgba(0,0,0,0)"}
        polygonStrokeColor={(feat: any) => {
          const iso = parseInt(feat.properties?.ISO_N3 ?? "0", 10);
          if (iso === 376) return "rgba(96,165,250,0.5)";
          if (iso === 364) return "rgba(224,62,62,0.5)";
          if (iso === 422) return "rgba(217,119,6,0.4)";
          return "rgba(96,165,250,0.2)";
        }}
        polygonAltitude={0.005}
        // Conflict markers
        pointsData={FOCUS_MARKERS}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointRadius="radius"
        pointAltitude="altitude"
        pointLabel={(obj: any) =>
          `<div class="globe-tooltip"><strong>${obj.label}</strong><br/>${obj.subLabel}</div>`
        }
        onPointHover={handleMouseOver}
        onPointClick={handleMarkerClick}
        pointsMerge={false}
        // Conflict arcs
        arcsData={CONFLICT_ARCS}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcDashLength="dashLength"
        arcDashGap="dashGap"
        arcDashAnimateTime="animateTime"
        arcAltitude={0.15}
        arcStroke={0.4}
        arcLabel={(obj: any) =>
          `<div class="globe-tooltip">${obj.label}</div>`
        }
        // Renderer
        rendererConfig={{ antialias: true, alpha: false }}
      />

      {/* Hover tooltip overlay */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            bottom: "120px",
            left: "50%",
            transform: "translateX(-50%)",
            pointerEvents: "none",
            zIndex: 200,
          }}
        >
          <div
            style={{
              background: "rgba(10,14,20,0.92)",
              border: `1px solid ${hovered.color}66`,
              borderLeft: `3px solid ${hovered.color}`,
              borderRadius: "3px",
              padding: "8px 14px",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "#e2e8f0",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: hovered.color, fontWeight: 700 }}>
              {hovered.label}
            </span>
            <span style={{ color: "#6b7a8d", marginLeft: "8px" }}>
              {hovered.subLabel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
