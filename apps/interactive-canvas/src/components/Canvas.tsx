


// // src/components/Canvas.tsx
// import React, { useEffect, useRef, useState } from "react";
// import type { CanvasElementData } from "../App";
// import CanvasElement from "./CanvasElement";
// import REGISTRY from "../renderer/registry";
// import { screenToWorld, zoomAroundPoint } from "../utils/viewport";
// import type{ Viewport } from "../utils/viewport";

// type Props = {
//   elements: CanvasElementData[];
//   setElements: React.Dispatch<React.SetStateAction<CanvasElementData[]>>;
//   selectedIds: string[];
//   setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
// };

// export function Canvas({ elements, setElements, selectedIds, setSelectedIds }: Props) {
//   const rootRef = useRef<HTMLDivElement | null>(null);
//   const [viewport, setViewport] = useState<Viewport>({ scale: 1, offsetX: 0, offsetY: 0 });

//   // box selection state
//   const boxRef = useRef<HTMLDivElement | null>(null);
//   const selectionStart = useRef<{ x: number; y: number } | null>(null);

//   useEffect(() => {
//     const root = rootRef.current;
//     if (!root) return;

//     const onWheel = (e: WheelEvent) => {
//       const rect = root.getBoundingClientRect();

//       // ctrl/cmd + wheel => zoom around cursor
//       if (e.ctrlKey || e.metaKey) {
//         e.preventDefault();
//         const next = zoomAroundPoint(e.clientX, e.clientY, rect, viewport, e.deltaY);
//         setViewport(next);
//         return;
//       }

//       // otherwise interpret wheel as pan (two-finger)
//       if (Math.abs(e.deltaX) > 0 || Math.abs(e.deltaY) > 0) {
//         e.preventDefault();
//         setViewport((v) => ({ ...v, offsetX: v.offsetX - e.deltaX, offsetY: v.offsetY - e.deltaY }));
//       }
//     };

//     root.addEventListener("wheel", onWheel, { passive: false });
//     return () => root.removeEventListener("wheel", onWheel);
//   }, [viewport]);

//   // handle drop from palette -> create new element at world coords
//   function onDrop(e: React.DragEvent) {
//     e.preventDefault();
//     const root = rootRef.current;
//     if (!root) return;
//     const rect = root.getBoundingClientRect();

//     let payload: any = null;
//     try {
//       const text = e.dataTransfer.getData("application/superbuild-node");
//       if (text) payload = JSON.parse(text);
//     } catch {}
//     if (!payload && (window as any).__SB_DRAGGING) {
//       payload = (window as any).__SB_DRAGGING;
//     }
//     if (!payload) return;

//     const world = screenToWorld(e.clientX, e.clientY, rect, viewport);
//     const type = payload.type;
//     const entry = REGISTRY[type];
//     const defaultProps = entry?.defaultProps ?? {};

//     const node: CanvasElementData = {
//       id: crypto.randomUUID(),
//       type,
//       x: Math.round(world.x),
//       y: Math.round(world.y),
//       width: 160,
//       height: 60,
//       props: defaultProps,
//     };

//     setElements((prev) => [...prev, node]);
//     setSelectedIds([node.id]);
//   }

//   function onDragOver(e: React.DragEvent) {
//     e.preventDefault();
//   }

//   // Canvas pointer events to handle box select and click-to-clear
//   function onPointerDown(e: React.PointerEvent) {
//     // only left button starts box select
//     if (e.button !== 0) return;
//     const root = rootRef.current;
//     if (!root) return;
//     const rect = root.getBoundingClientRect();
//     const startX = e.clientX - rect.left;
//     const startY = e.clientY - rect.top;

//     // if click on empty canvas - start box select
//     // set selectionStart; show boxRef and track pointer moves
//     selectionStart.current = { x: startX, y: startY };

//     // clear selection immediately (so dragging selects new elements)
//     setSelectedIds([]);

//     const box = document.createElement("div");
//     box.style.position = "absolute";
//     box.style.left = `${startX}px`;
//     box.style.top = `${startY}px`;
//     box.style.width = "0px";
//     box.style.height = "0px";
//     box.style.background = "rgba(59,130,246,0.15)"; // blue-500/15
//     box.style.border = "1px solid rgba(59,130,246,0.35)";
//     box.style.zIndex = "60";
//     boxRef.current = box;
//     root.appendChild(box);

//     function onMove(ev: PointerEvent) {
//       if (!selectionStart.current) return;
//       const curX = ev.clientX - rect.left;
//       const curY = ev.clientY - rect.top;
//       const left = Math.min(selectionStart.current.x, curX);
//       const top = Math.min(selectionStart.current.y, curY);
//       const w = Math.abs(curX - selectionStart.current.x);
//       const h = Math.abs(curY - selectionStart.current.y);
//       box.style.left = `${left}px`;
//       box.style.top = `${top}px`;
//       box.style.width = `${w}px`;
//       box.style.height = `${h}px`;
//     }

//     function onUp(ev: PointerEvent) {
//       if (!selectionStart.current) return;
//       const endX = ev.clientX - rect.left;
//       const endY = ev.clientY - rect.top;
//       const left = Math.min(selectionStart.current.x, endX);
//       const top = Math.min(selectionStart.current.y, endY);
//       const right = Math.max(selectionStart.current.x, endX);
//       const bottom = Math.max(selectionStart.current.y, endY);

//       // compute selected elements in world coords
//       const selected: string[] = [];
//       elements.forEach((el) => {
//         // element screen coords = world * scale + offset
//         const sx = el.x * viewport.scale + viewport.offsetX;
//         const sy = el.y * viewport.scale + viewport.offsetY;
//         const sw = (el.width ?? 0) * viewport.scale;
//         const sh = (el.height ?? 0) * viewport.scale;

//         const elLeft = sx;
//         const elTop = sy;
//         const elRight = sx + sw;
//         const elBottom = sy + sh;

//         if (!(elRight < left || elLeft > right || elBottom < top || elTop > bottom)) {
//           selected.push(el.id);
//         }
//       });

//       setSelectedIds(selected);

//       // cleanup
//       selectionStart.current = null;
//       if (boxRef.current && boxRef.current.parentElement) {
//         boxRef.current.parentElement.removeChild(boxRef.current);
//       }
//       boxRef.current = null;
//       window.removeEventListener("pointermove", onMove);
//       window.removeEventListener("pointerup", onUp);
//     }

//     window.addEventListener("pointermove", onMove);
//     window.addEventListener("pointerup", onUp);
//   }

//   const canvasStyle: React.CSSProperties = {
//     width: "100%",
//     height: "100%",
//     position: "relative",
//     overflow: "hidden",
//     background:
//       "repeating-linear-gradient(0deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 24px), repeating-linear-gradient(90deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 24px), #fff",
//   };

//   return (
//     <div
//       ref={rootRef}
//       style={canvasStyle}
//       onDrop={onDrop}
//       onDragOver={onDragOver}
//       onPointerDown={onPointerDown}
//       tabIndex={0}
//     >
//       {/* world group that applies scale & offset */}
//       <div
//         style={{
//           transformOrigin: "0 0",
//           transform: `translate(${viewport.offsetX}px, ${viewport.offsetY}px) scale(${viewport.scale})`,
//           width: "100%",
//           height: "100%",
//           position: "absolute",
//           left: 0,
//           top: 0,
//         }}
//       >
//         {elements.map((el) => (
//           <CanvasElement
//             key={el.id}
//             {...el}
//             selectedIds={selectedIds}
//             setSelectedIds={setSelectedIds}
//             setElements={setElements}
//             viewportScale={viewport.scale}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// export default Canvas;


// src/components/Canvas.tsx
import React, { useEffect, useRef, useState } from "react";
import type { CanvasElementData } from "../App";
import CanvasElement from "./CanvasElement";
import REGISTRY from "../renderer/registry";
import { screenToWorld, zoomAroundPoint } from "../utils/viewport";
import type { Viewport } from "../utils/viewport";

type Props = {
  elements: CanvasElementData[];
  setElements: React.Dispatch<React.SetStateAction<CanvasElementData[]>>;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
};

export function Canvas({ elements, setElements, selectedIds, setSelectedIds }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState<Viewport>({ scale: 1, offsetX: 0, offsetY: 0 });

  // box selection state
  const boxRef = useRef<HTMLDivElement | null>(null);
  const selectionStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onWheel = (e: WheelEvent) => {
      const rect = root.getBoundingClientRect();

      // ctrl/cmd + wheel => zoom around cursor
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const next = zoomAroundPoint(e.clientX, e.clientY, rect, viewport, e.deltaY);
        setViewport(next);
        return;
      }

      // otherwise interpret wheel as pan (two-finger)
      if (Math.abs(e.deltaX) > 0 || Math.abs(e.deltaY) > 0) {
        e.preventDefault();
        setViewport((v) => ({ ...v, offsetX: v.offsetX - e.deltaX, offsetY: v.offsetY - e.deltaY }));
      }
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
  }, [viewport]);

  // handle drop from palette -> create new element at world coords
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const root = rootRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();

    let payload: any = null;
    try {
      const text = e.dataTransfer.getData("application/superbuild-node");
      if (text) payload = JSON.parse(text);
    } catch {}
    if (!payload && (window as any).__SB_DRAGGING) payload = (window as any).__SB_DRAGGING;
    if (!payload) return;

    const world = screenToWorld(e.clientX, e.clientY, rect, viewport);
    const type = payload.type;
    const entry = (REGISTRY as any)[type];
    const defaultProps = entry?.defaultProps ?? {};

    const node: CanvasElementData = {
      id: crypto.randomUUID(),
      type,
      x: Math.round(world.x),
      y: Math.round(world.y),
      width: 160,
      height: 60,
      props: defaultProps,
    };

    setElements((prev) => [...prev, node]);
    setSelectedIds([node.id]);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  // Canvas pointer events to handle box select and click-to-clear
  function onPointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return;
    const root = rootRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    selectionStart.current = { x: startX, y: startY };
    setSelectedIds([]);

    const box = document.createElement("div");
    box.style.position = "absolute";
    box.style.left = `${startX}px`;
    box.style.top = `${startY}px`;
    box.style.width = "0px";
    box.style.height = "0px";
    box.style.background = "rgba(59,130,246,0.15)";
    box.style.border = "1px solid rgba(59,130,246,0.35)";
    box.style.zIndex = "60";
    boxRef.current = box;
    root.appendChild(box);

    function onMove(ev: PointerEvent) {
      if (!selectionStart.current) return;
      const curX = ev.clientX - rect.left;
      const curY = ev.clientY - rect.top;
      const left = Math.min(selectionStart.current.x, curX);
      const top = Math.min(selectionStart.current.y, curY);
      const w = Math.abs(curX - selectionStart.current.x);
      const h = Math.abs(curY - selectionStart.current.y);
      box.style.left = `${left}px`;
      box.style.top = `${top}px`;
      box.style.width = `${w}px`;
      box.style.height = `${h}px`;
    }

    function onUp(ev: PointerEvent) {
      if (!selectionStart.current) return;
      const endX = ev.clientX - rect.left;
      const endY = ev.clientY - rect.top;
      const left = Math.min(selectionStart.current.x, endX);
      const top = Math.min(selectionStart.current.y, endY);
      const right = Math.max(selectionStart.current.x, endX);
      const bottom = Math.max(selectionStart.current.y, endY);

      const selected: string[] = [];
      elements.forEach((el) => {
        const sx = el.x * viewport.scale + viewport.offsetX;
        const sy = el.y * viewport.scale + viewport.offsetY;
        const sw = (el.width ?? 0) * viewport.scale;
        const sh = (el.height ?? 0) * viewport.scale;

        const elLeft = sx;
        const elTop = sy;
        const elRight = sx + sw;
        const elBottom = sy + sh;

        if (!(elRight < left || elLeft > right || elBottom < top || elTop > bottom)) {
          selected.push(el.id);
        }
      });

      setSelectedIds(selected);

      selectionStart.current = null;
      if (boxRef.current?.parentElement) boxRef.current.parentElement.removeChild(boxRef.current);
      boxRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  const canvasStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    position: "relative",
    overflow: "hidden",
    background:
      "repeating-linear-gradient(0deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 24px), repeating-linear-gradient(90deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 24px), #fff",
  };

  return (
    <div
      ref={rootRef}
      style={canvasStyle}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onPointerDown={onPointerDown}
      tabIndex={0}
      aria-label="canvas"
      data-testid="canvas-root"
    >
      <div
        style={{
          transformOrigin: "0 0",
          transform: `translate(${viewport.offsetX}px, ${viewport.offsetY}px) scale(${viewport.scale})`,
          width: "100%",
          height: "100%",
          position: "absolute",
          left: 0,
          top: 0,
        }}
      >
        {elements.map((el) => (
          <CanvasElement
            key={el.id}
            {...(el as any)}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            setElements={setElements as any}
            viewportScale={viewport.scale}
          />
        ))}
      </div>
    </div>
  );
}

export default Canvas;
