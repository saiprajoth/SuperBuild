



import React, { useRef, useState, useEffect } from "react";
import type { CanvasElementData } from "../App";
import { CanvasElement } from "./CanvasElement";

type Props = {
  elements: CanvasElementData[];
  setElements: React.Dispatch<React.SetStateAction<CanvasElementData[]>>;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
};

export function Canvas({
  elements,
  setElements,
  selectedIds,
  setSelectedIds,
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);


  const [viewport, setViewport] = useState({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });


  const [boxSelect, setBoxSelect] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  
  const panStart = useRef<{ x: number; y: number } | null>(null);
  const spacePressed = useRef(false);

  
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.code === "Space") {
      spacePressed.current = true;
      e.preventDefault();
    }

    if (selectedIds.length === 0) return;

    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      setElements((prev) => prev.filter((el) => !selectedIds.includes(el.id)));
      setSelectedIds([]);
    }
  }

  function handleKeyUp(e: React.KeyboardEvent) {
    if (e.code === "Space") {
      spacePressed.current = false;
    }
  }

  
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const type = e.dataTransfer.getData("component");
    if (!type) return;

    const rect = rootRef.current!.getBoundingClientRect();

    const worldX = (e.clientX - rect.left - viewport.offsetX) / viewport.scale;
    const worldY = (e.clientY - rect.top - viewport.offsetY) / viewport.scale;

    setElements((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type,
        x: worldX,
        y: worldY,
        width: 120,
        height: 60,
      },
    ]);
  }

  // issue-todo we have :   Prevent the browser swipe issue  - code will be added below : reminder for me !!! 
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const handler = (e: WheelEvent) => e.preventDefault();
    el.addEventListener("wheel", handler, { passive: false });

    return () => el.removeEventListener("wheel", handler);
  }, []);

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      style={{
        overscrollBehavior: "none",
        backgroundImage: `
          linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "24px 24px",
      }}
      onMouseDown={(e) => {
        if (e.target !== e.currentTarget) return;

        const rect = rootRef.current!.getBoundingClientRect();

        if (spacePressed.current) {
          panStart.current = { x: e.clientX, y: e.clientY };
          document.body.style.cursor = "grab";
          return;
        }

        const worldX =
          (e.clientX - rect.left - viewport.offsetX) / viewport.scale;
        const worldY =
          (e.clientY - rect.top - viewport.offsetY) / viewport.scale;

        setBoxSelect({
          startX: worldX,
          startY: worldY,
          currentX: worldX,
          currentY: worldY,
        });

        if (!e.shiftKey) setSelectedIds([]);
        rootRef.current!.focus();
      }}
      onMouseMove={(e) => {
        const rect = rootRef.current!.getBoundingClientRect();

        if (panStart.current) {
          setViewport((v) => ({
            ...v,
            offsetX: v.offsetX + (e.clientX - panStart.current!.x),
            offsetY: v.offsetY + (e.clientY - panStart.current!.y),
          }));
          panStart.current = { x: e.clientX, y: e.clientY };
          return;
        }

        if (!boxSelect) return;

        const worldX =
          (e.clientX - rect.left - viewport.offsetX) / viewport.scale;
        const worldY =
          (e.clientY - rect.top - viewport.offsetY) / viewport.scale;

        setBoxSelect((prev) =>
          prev ? { ...prev, currentX: worldX, currentY: worldY } : null
        );
      }}
      onMouseUp={() => {
        document.body.style.cursor = "default";
        panStart.current = null;

        if (!boxSelect) return;

        const x1 = Math.min(boxSelect.startX, boxSelect.currentX);
        const y1 = Math.min(boxSelect.startY, boxSelect.currentY);
        const x2 = Math.max(boxSelect.startX, boxSelect.currentX);
        const y2 = Math.max(boxSelect.startY, boxSelect.currentY);

        const selected = elements
          .filter((el) => {
            const elX2 = el.x + el.width;
            const elY2 = el.y + el.height;
            return elX2 >= x1 && el.x <= x2 && elY2 >= y1 && el.y <= y2;
          })
          .map((el) => el.id);

        setSelectedIds((prev) =>
          prev.length ? Array.from(new Set([...prev, ...selected])) : selected
        );

        setBoxSelect(null);
      }}
      onWheel={(e) => {
        e.preventDefault();

        const rect = rootRef.current!.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (e.ctrlKey || e.metaKey) {
          const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
          const newScale = Math.min(
            3,
            Math.max(0.3, viewport.scale * zoomFactor)
          );
          const ratio = newScale / viewport.scale;

          setViewport((v) => ({
            scale: newScale,
            offsetX: mouseX - (mouseX - v.offsetX) * ratio,
            offsetY: mouseY - (mouseY - v.offsetY) * ratio,
          }));
          return;
        }

        setViewport((v) => ({
          ...v,
          offsetX: v.offsetX - e.deltaX,
          offsetY: v.offsetY - e.deltaY,
        }));
      }}
      className="flex-1 bg-white relative overflow-hidden outline-none"
    >
      <div
        style={{
          transform: `translate(${viewport.offsetX}px, ${viewport.offsetY}px) scale(${viewport.scale})`,
          transformOrigin: "0 0",
        }}
      >
        {elements.map((el) => (
          <CanvasElement
            key={el.id}
            {...el}
            viewportScale={viewport.scale}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            setElements={setElements}
          />
        ))}

        {boxSelect && (
          <div
            className="absolute border border-blue-400 bg-blue-400/10 pointer-events-none"
            style={{
              left: Math.min(boxSelect.startX, boxSelect.currentX),
              top: Math.min(boxSelect.startY, boxSelect.currentY),
              width: Math.abs(boxSelect.currentX - boxSelect.startX),
              height: Math.abs(boxSelect.currentY - boxSelect.startY),
            }}
          />
        )}
      </div>
    </div>
  );
}
