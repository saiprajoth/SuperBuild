

import React, { useRef } from "react";
import type { CanvasElementData } from "../App";

type Props = CanvasElementData & {
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  setElements: React.Dispatch<React.SetStateAction<CanvasElementData[]>>;
  viewportScale: number;
};

const SNAP_DISTANCE = 6;

function snap(value: number, target: number) {
  return Math.abs(value - target) <= SNAP_DISTANCE ? target : value;
}

export function CanvasElement({
  id,
  x,
  y,
  width = 120,
  height = 60,
  type,
  selectedIds,
  setSelectedIds,
  setElements,
  viewportScale,
}: Props) {
  const elRef = useRef<HTMLDivElement | null>(null);

  const pointerData = useRef<{ startX: number; startY: number } | null>(null);

  const groupStartPositions = useRef<Map<string, { x: number; y: number }>>(
    new Map()
  );

  const safeSelectedIds = Array.isArray(selectedIds) ? selectedIds : [];
  const isSelected = safeSelectedIds.includes(id);

 
  function onPointerDown(e: React.PointerEvent) {
    e.stopPropagation();

    let activeSelection: string[] = [];

    if (e.shiftKey) {
      setSelectedIds((prev) => {
        const next = prev.includes(id)
          ? prev.filter((x) => x !== id)
          : [...prev, id];
        activeSelection = next;
        return next;
      });
    } else {
      activeSelection = safeSelectedIds.includes(id) ? safeSelectedIds : [id];
      setSelectedIds(activeSelection);
    }

    const el = elRef.current;
    if (!el) return;

    try {
      el.setPointerCapture(e.pointerId);
    } catch {}

  
    groupStartPositions.current.clear();
    setElements((prev) => {
      prev.forEach((item) => {
        if (activeSelection.includes(item.id)) {
          groupStartPositions.current.set(item.id, {
            x: item.x,
            y: item.y,
          });
        }
      });
      return prev;
    });

    pointerData.current = {
      startX: e.clientX,
      startY: e.clientY,
    };

    function onPointerMove(ev: PointerEvent) {
      if (!pointerData.current) return;

      const dx =
        (ev.clientX - pointerData.current.startX) /
        Math.max(1e-6, viewportScale);
      const dy =
        (ev.clientY - pointerData.current.startY) /
        Math.max(1e-6, viewportScale);

      setElements((prev) =>
        prev.map((it) => {
          if (!groupStartPositions.current.has(it.id)) return it;

          let nextX = groupStartPositions.current.get(it.id)!.x + dx;
          let nextY = groupStartPositions.current.get(it.id)!.y + dy;

          prev.forEach((other) => {
            if (other.id === it.id) return;

      
            nextX = snap(nextX, other.x);
            nextX = snap(nextX + it.width, other.x + other.width) - it.width;
            nextX =
              snap(nextX + it.width / 2, other.x + other.width / 2) -
              it.width / 2;

           
            nextY = snap(nextY, other.y);
            nextY = snap(nextY + it.height, other.y + other.height) - it.height;
            nextY =
              snap(nextY + it.height / 2, other.y + other.height / 2) -
              it.height / 2;
          });

          return {
            ...it,
            x: nextX,
            y: nextY,
          };
        })
      );
    }

    function onPointerUp() {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {}

      pointerData.current = null;
      groupStartPositions.current.clear();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  }


  

  function onResizePointerDown(e: React.PointerEvent) {
    e.stopPropagation();

    const el = elRef.current;
    if (!el) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = width;
    const startH = height;

    try {
      el.setPointerCapture(e.pointerId);
    } catch {}

    function onPointerMove(ev: PointerEvent) {
      const dx = (ev.clientX - startX) / Math.max(1e-6, viewportScale);
      const dy = (ev.clientY - startY) / Math.max(1e-6, viewportScale);

      setElements((prev) =>
        prev.map((it) =>
          it.id === id
            ? {
                ...it,
                width: Math.max(40, Math.round(startW + dx)),
                height: Math.max(30, Math.round(startH + dy)),
              }
            : it
        )
      );
    }

    function onPointerUp() {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {}

      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  }




  return (
    <div
      ref={elRef}
      onPointerDown={onPointerDown}
     

      className={`absolute select-none touch-manipulation rounded-xl
  backdrop-blur-sm p-3 pt-4
  bg-neutral-700/70
  shadow-lg
  border border-white/10
  transition-shadow
  ${
    isSelected
      ? "outline outline-2 outline-blue-500 z-50 shadow-blue-500/30"
      : "hover:shadow-xl"
  }
`}
      style={{
        left: x,
        top: y,
        width,
        height,
        userSelect: "none",
        touchAction: "none",
      }}
    >
      <div className="flex items-center gap-2 p-2 pointer-events-none">
        <span className="text-sm">📄</span>
        <span className="text-sm">{type}</span>
      </div>

      {isSelected && (
        <div
          onPointerDown={onResizePointerDown}
          className="absolute right-0 bottom-0 w-3 h-3 bg-blue-500 cursor-se-resize"
        />
      )}
    </div>
  );
}
