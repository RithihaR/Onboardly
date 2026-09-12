// This page is the OnboardlyWidget.tsx file 
// ../../components/onboardly-widget/OnboardlyWidget that is this file 

// components/onboardly-widget/OnboardlyWidget.tsx
// This REPLACES whatever is currently in this file. This is the actual
// widget: a small floating button, bottom-right, that opens a panel
// containing the FAQ. It does not fetch modules or know anything about
// the onboarding page — that separation is the whole point.

// components/onboardly-widget/OnboardlyWidget.tsx
// The real widget: draggable (grab the header, move it anywhere),
// shrinks down to a small circular bubble, expands back into a panel
// showing the FAQ. Uses the same color palette as FaqPanel.tsx so the
// two visually match.

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import FaqPanel from "./FaqPanel";

const OB = {
  border: "#E4DFD3",
  cream: "#FFFFFF",
  text: "#2B2620",
  textMuted: "#8A8271",
  dotRed: "#8B3A2E",
};

const body = { fontFamily: "'IBM Plex Sans', sans-serif" };

export default function OnboardlyWidget() {
  // Default position: bottom-right-ish. Recalculated safely on first
  // client render since `window` isn't available during SSR.
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setPos({ x: window.innerWidth - 380, y: window.innerHeight - 480 });
    setReady(true);
  }, []);

  const onDragStart = useCallback(
    (e: React.MouseEvent) => {
      dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
      setDragging(true);
    },
    [pos]
  );

  useEffect(() => {
    if (!dragging) return;
    function onMove(e: MouseEvent) {
      setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    }
    function onUp() {
      setDragging(false);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  if (!ready) return null;

  if (!expanded) {
    return (
      <div
        onMouseDown={onDragStart}
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: OB.dotRed,
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: dragging ? "grabbing" : "grab",
          zIndex: 50,
          ...body,
        }}
      >
        <button
          onClick={() => setExpanded(true)}
          aria-label="Open onboarding assistant"
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: 22,
            fontWeight: 700,
            cursor: "pointer",
            width: "100%",
            height: "100%",
          }}
        >
          ?
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: 340,
        background: OB.cream,
        border: `1px solid ${OB.border}`,
        borderRadius: 14,
        boxShadow: "0 16px 48px rgba(0,0,0,0.28)",
        overflow: "hidden",
        zIndex: 50,
        ...body,
      }}
    >
      {/* Drag handle / header */}
      <div
        onMouseDown={onDragStart}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: `1px solid ${OB.border}`,
          cursor: dragging ? "grabbing" : "grab",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: OB.textMuted, fontSize: 13 }}>⠿</span>
          <span style={{ fontWeight: 700, fontSize: 13.5, color: OB.text }}>
            Onboarding Assistant
          </span>
        </div>
        <button
          onClick={() => setExpanded(false)}
          aria-label="Minimize"
          style={{
            background: "none",
            border: "none",
            color: OB.textMuted,
            fontSize: 18,
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          −
        </button>
      </div>

      <div style={{ paddingTop: 14, maxHeight: 420, overflowY: "auto" }}>
        <FaqPanel />
      </div>
    </div>
  );
}