

// import React, { useRef } from "react";
// import type { CanvasElementData } from "../types";

// type Props = CanvasElementData & {
//   selectedIds: string[];
//   setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
//   setElements: React.Dispatch<React.SetStateAction<CanvasElementData[]>>;
//   viewportScale: number;
// };

// const SNAP_DISTANCE = 6;

// function snap(a: number, b: number) {
//   return Math.abs(a - b) <= SNAP_DISTANCE ? b : a;
// }

// type Rect = { id: string; x: number; y: number; w: number; h: number };

// type QTNode = {
//   bounds: { x: number; y: number; w: number; h: number };
//   items: Rect[];
//   children: QTNode[] | null;
// };

// function rectIntersects(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
//   return !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);
// }

// function buildQuadtree(rects: Rect[], capacity = 16, maxDepth = 8): QTNode | null {
//   if (rects.length === 0) return null;

//   let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
//   for (const r of rects) {
//     minX = Math.min(minX, r.x);
//     minY = Math.min(minY, r.y);
//     maxX = Math.max(maxX, r.x + r.w);
//     maxY = Math.max(maxY, r.y + r.h);
//   }

//   const root: QTNode = {
//     bounds: { x: minX, y: minY, w: Math.max(1, maxX - minX), h: Math.max(1, maxY - minY) },
//     items: [],
//     children: null,
//   };

//   function subdivide(node: QTNode) {
//     const { x, y, w, h } = node.bounds;
//     const hw = w / 2;
//     const hh = h / 2;
//     node.children = [
//       { bounds: { x, y, w: hw, h: hh }, items: [], children: null },                 // NW
//       { bounds: { x: x + hw, y, w: hw, h: hh }, items: [], children: null },         // NE
//       { bounds: { x, y: y + hh, w: hw, h: hh }, items: [], children: null },         // SW
//       { bounds: { x: x + hw, y: y + hh, w: hw, h: hh }, items: [], children: null }, // SE
//     ];
//   }

//   function insert(node: QTNode, r: Rect, depth: number) {
//     if (!rectIntersects(node.bounds, { x: r.x, y: r.y, w: r.w, h: r.h })) return;

//     if (!node.children) {
//       node.items.push(r);
//       if (node.items.length > capacity && depth < maxDepth) {
//         subdivide(node);
//         const existing = node.items;
//         node.items = [];
//         for (const it of existing) insert(node, it, depth); // reinsert into children
//       }
//       return;
//     }

//     // has children
//     for (const ch of node.children) insert(ch, r, depth + 1);
//   }

//   for (const r of rects) insert(root, r, 0);
//   return root;
// }

// function queryQuadtree(node: QTNode | null, range: { x: number; y: number; w: number; h: number }, out: Rect[]) {
//   if (!node) return;
//   if (!rectIntersects(node.bounds, range)) return;

//   if (node.children) {
//     for (const ch of node.children) queryQuadtree(ch, range, out);
//     return;
//   }

//   for (const it of node.items) {
//     if (rectIntersects({ x: it.x, y: it.y, w: it.w, h: it.h }, range)) out.push(it);
//   }
// }

// export default function CanvasElement({
//   id,
//   x,
//   y,
//   width = 120,
//   height = 60,
//   type,
//   selectedIds,
//   setSelectedIds,
//   setElements,
//   viewportScale,
// }: Props) {
//   const elRef = useRef<HTMLDivElement | null>(null);

//   // drag state
//   const dragStart = useRef<{ x: number; y: number } | null>(null);
//   const dragDelta = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
//   const groupStart = useRef<Map<string, { x: number; y: number }>>(new Map());
//   const rafDrag = useRef<number | null>(null);

//   // resize state
//   const resizeStart = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
//   const resizeDelta = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
//   const rafResize = useRef<number | null>(null);

//   // snapshot for quadtree + candidate pruning
//   const snapshotRects = useRef<Rect[]>([]);
//   const qtRef = useRef<QTNode | null>(null);

//   const isSelected = selectedIds.includes(id);

//   function getCoalesceHelpers() {
//     const anySet = setElements as any;
//     const setWithCoalesce = anySet?.setWithCoalesce as
//       | ((key: string, updater: (prev: CanvasElementData[]) => CanvasElementData[]) => void)
//       | undefined;
//     const commitCoalesce = anySet?.commitCoalesce as ((key?: string) => void) | undefined;
//     return { setWithCoalesce, commitCoalesce };
//   }

//   function buildSnapshotAndIndex(active: string[]) {
//     snapshotRects.current = [];
//     qtRef.current = null;

//     setElements((prev) => {
//       const rects: Rect[] = prev.map((el) => ({
//         id: el.id,
//         x: el.x,
//         y: el.y,
//         w: el.width ?? 0,
//         h: el.height ?? 0,
//       }));
//       snapshotRects.current = rects;

//       if (rects.length > 200) {
//         qtRef.current = buildQuadtree(rects);
//       } else {
//         qtRef.current = null;
//       }

//       // snapshot group starts
//       groupStart.current.clear();
//       for (const el of prev) {
//         if (active.includes(el.id)) groupStart.current.set(el.id, { x: el.x, y: el.y });
//       }
//       return prev;
//     });
//   }

//   function applySnapping(
//     movingId: string,
//     nx: number,
//     ny: number,
//     w: number,
//     h: number,
//     candidates: Rect[]
//   ) {
//     const cx = nx + w / 2;
//     const cy = ny + h / 2;

//     for (const other of candidates) {
//       if (other.id === movingId) continue;

//       const ox = other.x;
//       const oy = other.y;
//       const ow = other.w;
//       const oh = other.h;

//       // edge snap X
//       nx = snap(nx, ox);
//       nx = snap(nx + w, ox + ow) - w;
//       nx = snap(nx, ox + ow); // left to other's right
//       nx = snap(nx + w, ox) - w; // right to other's left

//       // center snap X
//       nx = snap(nx + w / 2, ox + ow / 2) - w / 2;

//       // edge snap Y
//       ny = snap(ny, oy);
//       ny = snap(ny + h, oy + oh) - h;
//       ny = snap(ny, oy + oh); // top to other's bottom
//       ny = snap(ny + h, oy) - h; // bottom to other's top

//       // center snap Y
//       ny = snap(ny + h / 2, oy + oh / 2) - h;
//     }

//     return { nx, ny };
//   }

//   function getCandidatesFor(moving: { x: number; y: number; w: number; h: number }) {
//     // if no quadtree, just all snapshot rects
//     if (!qtRef.current) return snapshotRects.current;

//     const out: Rect[] = [];
//     const range = {
//       x: moving.x - 50,
//       y: moving.y - 50,
//       w: moving.w + 100,
//       h: moving.h + 100,
//     };
//     queryQuadtree(qtRef.current, range, out);
//     return out.length ? out : snapshotRects.current;
//   }

//   function onPointerDown(e: React.PointerEvent) {
//     e.stopPropagation();

//     const active = e.shiftKey
//       ? selectedIds.includes(id)
//         ? selectedIds.filter((x) => x !== id)
//         : [...selectedIds, id]
//       : selectedIds.includes(id)
//       ? selectedIds
//       : [id];

//     setSelectedIds(active);

//     // snapshot elements + group positions + optional quadtree
//     buildSnapshotAndIndex(active);

//     dragStart.current = { x: e.clientX, y: e.clientY };
//     dragDelta.current = { dx: 0, dy: 0 };

//     try {
//       elRef.current?.setPointerCapture(e.pointerId);
//     } catch {
//       // ignore
//     }

//     const { setWithCoalesce, commitCoalesce } = getCoalesceHelpers();

//     function onMove(ev: PointerEvent) {
//       if (!dragStart.current) return;

//       // store latest delta (screen -> world)
//       dragDelta.current.dx = (ev.clientX - dragStart.current.x) / Math.max(1e-6, viewportScale);
//       dragDelta.current.dy = (ev.clientY - dragStart.current.y) / Math.max(1e-6, viewportScale);

//       if (rafDrag.current) return;
//       rafDrag.current = requestAnimationFrame(() => {
//         rafDrag.current = null;

//         const dx = dragDelta.current.dx;
//         const dy = dragDelta.current.dy;

//         const updater = (prev: CanvasElementData[]) =>
//           prev.map((el) => {
//             const start = groupStart.current.get(el.id);
//             if (!start) return el;

//             const w = el.width ?? 0;
//             const h = el.height ?? 0;

//             let nx = start.x + dx;
//             let ny = start.y + dy;

//             const candidates = getCandidatesFor({ x: nx, y: ny, w, h });
//             const snapped = applySnapping(el.id, nx, ny, w, h, candidates);

//             return { ...el, x: snapped.nx, y: snapped.ny };
//           });

//         // coalesced history path if available (preferred)
//         if (setWithCoalesce) setWithCoalesce("drag", updater);
//         else setElements(updater);
//       });
//     }

//     function onUp() {
//       dragStart.current = null;
//       groupStart.current.clear();

//       if (rafDrag.current) {
//         cancelAnimationFrame(rafDrag.current);
//         rafDrag.current = null;
//       }

//       try {
//         elRef.current?.releasePointerCapture(e.pointerId);
//       } catch {
//         // ignore
//       }

//       window.removeEventListener("pointermove", onMove);
//       window.removeEventListener("pointerup", onUp);

//       // commit coalesce so undo is exactly one step
//       if (commitCoalesce) commitCoalesce("drag");
//     }

//     window.addEventListener("pointermove", onMove);
//     window.addEventListener("pointerup", onUp);
//   }

//   function onResizeDown(e: React.PointerEvent) {
//     e.stopPropagation();

//     resizeStart.current = { x: e.clientX, y: e.clientY, w: width, h: height };
//     resizeDelta.current = { dx: 0, dy: 0 };

//     try {
//       elRef.current?.setPointerCapture(e.pointerId);
//     } catch {
//       // ignore
//     }

//     // snapshot for snapping candidates (resize doesn't move x/y, but keeps index consistent)
//     buildSnapshotAndIndex(selectedIds.includes(id) ? selectedIds : [id]);

//     const { setWithCoalesce, commitCoalesce } = getCoalesceHelpers();

//     function onMove(ev: PointerEvent) {
//       if (!resizeStart.current) return;

//       resizeDelta.current.dx =
//         (ev.clientX - resizeStart.current.x) / Math.max(1e-6, viewportScale);
//       resizeDelta.current.dy =
//         (ev.clientY - resizeStart.current.y) / Math.max(1e-6, viewportScale);

//       if (rafResize.current) return;
//       rafResize.current = requestAnimationFrame(() => {
//         rafResize.current = null;

//         const dx = resizeDelta.current.dx;
//         const dy = resizeDelta.current.dy;

//         const updater = (prev: CanvasElementData[]) =>
//           prev.map((el) =>
//             el.id === id
//               ? {
//                   ...el,
//                   width: Math.max(40, Math.round((resizeStart.current!.w + dx) * 1)),
//                   height: Math.max(30, Math.round((resizeStart.current!.h + dy) * 1)),
//                 }
//               : el
//           );

//         if (setWithCoalesce) setWithCoalesce("resize", updater);
//         else setElements(updater);
//       });
//     }

//     function onUp() {
//       resizeStart.current = null;

//       if (rafResize.current) {
//         cancelAnimationFrame(rafResize.current);
//         rafResize.current = null;
//       }

//       try {
//         elRef.current?.releasePointerCapture(e.pointerId);
//       } catch {
//         // ignore
//       }

//       window.removeEventListener("pointermove", onMove);
//       window.removeEventListener("pointerup", onUp);

//       if (commitCoalesce) commitCoalesce("resize");
//     }

//     window.addEventListener("pointermove", onMove);
//     window.addEventListener("pointerup", onUp);
//   }

//   return (
//     <div
//       ref={elRef}
//       onPointerDown={onPointerDown}
//       className={`absolute rounded-xl bg-neutral-700/70 p-3 border border-white/10 ${
//         isSelected ? "outline outline-2 outline-blue-500 z-50" : ""
//       }`}
//       style={{
//         left: x,
//         top: y,
//         width,
//         height,
//         touchAction: "none",
//         userSelect: "none",
//       }}
//     >
//       <div className="text-sm text-white/90 pointer-events-none">{type}</div>

//       {isSelected && (
//         <div
//           onPointerDown={onResizeDown}
//           className="absolute right-0 bottom-0 w-3 h-3 bg-blue-500 cursor-se-resize"
//         />
//       )}
//     </div>
//   );
// }



// src/components/CanvasElement.tsx
import React, { useMemo, useRef } from "react";
import type { CanvasElementData } from "../types";
import { profileCount,profileSpan } from "../utils/profile";


type Props = CanvasElementData & {
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  setElements: React.Dispatch<React.SetStateAction<CanvasElementData[]>>;
  viewportScale: number;
};

const SNAP_DISTANCE = 6;
const QT_THRESHOLD = 200;

type Rect = { x: number; y: number; w: number; h: number };
type QTNode = {
  x: number;
  y: number;
  w: number;
  h: number;
  items: { id: string; r: Rect }[];
  children?: QTNode[];
};

function snap(a: number, b: number) {
  return Math.abs(a - b) <= SNAP_DISTANCE ? b : a;
}

function rectIntersects(a: Rect, b: Rect) {
  return !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);
}

function buildQuadtree(items: { id: string; r: Rect }[], bounds: Rect, depth = 0): QTNode {
  const node: QTNode = { ...bounds, items: [] };

  if (items.length <= 16 || depth >= 8) {
    node.items = items;
    return node;
  }

  const hw = bounds.w / 2;
  const hh = bounds.h / 2;

  const children: QTNode[] = [
    { x: bounds.x, y: bounds.y, w: hw, h: hh, items: [] },
    { x: bounds.x + hw, y: bounds.y, w: hw, h: hh, items: [] },
    { x: bounds.x, y: bounds.y + hh, w: hw, h: hh, items: [] },
    { x: bounds.x + hw, y: bounds.y + hh, w: hw, h: hh, items: [] },
  ];

  const leftovers: { id: string; r: Rect }[] = [];

  for (const it of items) {
    let placed = false;
    for (const c of children) {
      if (
        it.r.x >= c.x &&
        it.r.y >= c.y &&
        it.r.x + it.r.w <= c.x + c.w &&
        it.r.y + it.r.h <= c.y + c.h
      ) {
        c.items.push(it);
        placed = true;
        break;
      }
    }
    if (!placed) leftovers.push(it);
  }

  node.items = leftovers;
  node.children = children.map((c) => buildQuadtree(c.items, { x: c.x, y: c.y, w: c.w, h: c.h }, depth + 1));
  return node;
}

function queryQuadtree(node: QTNode, area: Rect, out: { id: string; r: Rect }[]) {
  if (!rectIntersects(area, node)) return;
  out.push(...node.items);
  if (node.children) for (const c of node.children) queryQuadtree(c, area, out);
}

export default function CanvasElement({
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

  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const dragDelta = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const groupStart = useRef<Map<string, { x: number; y: number }>>(new Map());
  const rafDrag = useRef<number | null>(null);

  const resizeStart = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const resizeDelta = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const rafResize = useRef<number | null>(null);

  const snapshotRef = useRef<Map<string, Rect>>(new Map());
  const qtRef = useRef<QTNode | null>(null);

  const isSelected = selectedIds.includes(id);

  function getCoalesceHelpers() {
    const anySetter = setElements as any;
    return {
      setWithCoalesce: typeof anySetter?.setWithCoalesce === "function" ? anySetter.setWithCoalesce : null,
      commitCoalesce: typeof anySetter?.commitCoalesce === "function" ? anySetter.commitCoalesce : null,
    };
  }

  function buildSnapshotAndIndex(activeIds: string[]) {
    snapshotRef.current.clear();
    groupStart.current.clear();

    setElements((prev) => {
      for (const el of prev) {
        const w = el.width ?? 0;
        const h = el.height ?? 0;

        snapshotRef.current.set(el.id, { x: el.x, y: el.y, w, h });

        if (activeIds.includes(el.id)) {
          groupStart.current.set(el.id, { x: el.x, y: el.y });
        }
      }

      if (prev.length > QT_THRESHOLD) {
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;

        const items: { id: string; r: Rect }[] = [];
        for (const [eid, r] of snapshotRef.current.entries()) {
          items.push({ id: eid, r });
          minX = Math.min(minX, r.x);
          minY = Math.min(minY, r.y);
          maxX = Math.max(maxX, r.x + r.w);
          maxY = Math.max(maxY, r.y + r.h);
        }

        const bounds: Rect = { x: minX, y: minY, w: Math.max(1, maxX - minX), h: Math.max(1, maxY - minY) };
        qtRef.current = buildQuadtree(items, bounds);
      } else {
        qtRef.current = null;
      }

      return prev;
    });
  }

  function getCandidatesFor(area: Rect) {
    const out: { id: string; r: Rect }[] = [];
    if (qtRef.current) {
      queryQuadtree(qtRef.current, {
        x: area.x - SNAP_DISTANCE,
        y: area.y - SNAP_DISTANCE,
        w: area.w + SNAP_DISTANCE * 2,
        h: area.h + SNAP_DISTANCE * 2,
      }, out);
      return out;
    }

    for (const [eid, r] of snapshotRef.current.entries()) out.push({ id: eid, r });
    return out;
  }

  function applySnapping(selfId: string, nx: number, ny: number, w: number, h: number, candidates: { id: string; r: Rect }[]) {
    return profileSpan("snap", () => {
      profileCount("snapCandidates", candidates.length);

      let x1 = nx;
      let y1 = ny;

      for (const c of candidates) {
        if (c.id === selfId) continue;
        const other = c.r;

        x1 = snap(x1, other.x);
        x1 = snap(x1 + w, other.x + other.w) - w;
        x1 = snap(x1 + w / 2, other.x + other.w / 2) - w / 2;

        y1 = snap(y1, other.y);
        y1 = snap(y1 + h, other.y + other.h) - h;
        y1 = snap(y1 + h / 2, other.y + other.h / 2) - h / 2;
      }

      return { nx: x1, ny: y1 };
    });
  }

  function onPointerDown(e: React.PointerEvent) {
    e.stopPropagation();

    const active = e.shiftKey
      ? selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
      : selectedIds.includes(id)
      ? selectedIds
      : [id];

    setSelectedIds(active);

    buildSnapshotAndIndex(active);

    dragStart.current = { x: e.clientX, y: e.clientY };
    dragDelta.current = { dx: 0, dy: 0 };

    try {
      elRef.current?.setPointerCapture(e.pointerId);
    } catch {}

    const { setWithCoalesce, commitCoalesce } = getCoalesceHelpers();

    function onMove(ev: PointerEvent) {
      if (!dragStart.current) return;

      dragDelta.current.dx = (ev.clientX - dragStart.current.x) / Math.max(1e-6, viewportScale);
      dragDelta.current.dy = (ev.clientY - dragStart.current.y) / Math.max(1e-6, viewportScale);

      if (rafDrag.current) return;
      rafDrag.current = requestAnimationFrame(() => {
        rafDrag.current = null;

        const dx = dragDelta.current.dx;
        const dy = dragDelta.current.dy;

        const updater = (prev: CanvasElementData[]) =>
          prev.map((el) => {
            const start = groupStart.current.get(el.id);
            if (!start) return el;

            const w = el.width ?? 0;
            const h = el.height ?? 0;

            let nx = start.x + dx;
            let ny = start.y + dy;

            const candidates = getCandidatesFor({ x: nx, y: ny, w, h });
            const snapped = applySnapping(el.id, nx, ny, w, h, candidates);

            return { ...el, x: snapped.nx, y: snapped.ny };
          });

        if (setWithCoalesce) setWithCoalesce("drag", updater);
        else setElements(updater);
      });
    }

    function onUp() {
      dragStart.current = null;
      groupStart.current.clear();

      if (rafDrag.current) {
        cancelAnimationFrame(rafDrag.current);
        rafDrag.current = null;
      }

      try {
        elRef.current?.releasePointerCapture(e.pointerId);
      } catch {}

      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);

      if (commitCoalesce) commitCoalesce("drag");
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function onResizeDown(e: React.PointerEvent) {
    e.stopPropagation();

    resizeStart.current = { x: e.clientX, y: e.clientY, w: width, h: height };
    resizeDelta.current = { dx: 0, dy: 0 };

    try {
      elRef.current?.setPointerCapture(e.pointerId);
    } catch {}

    buildSnapshotAndIndex(selectedIds.includes(id) ? selectedIds : [id]);

    const { setWithCoalesce, commitCoalesce } = getCoalesceHelpers();

    function onMove(ev: PointerEvent) {
      if (!resizeStart.current) return;

      resizeDelta.current.dx = (ev.clientX - resizeStart.current.x) / Math.max(1e-6, viewportScale);
      resizeDelta.current.dy = (ev.clientY - resizeStart.current.y) / Math.max(1e-6, viewportScale);

      if (rafResize.current) return;
      rafResize.current = requestAnimationFrame(() => {
        rafResize.current = null;

        const dx = resizeDelta.current.dx;
        const dy = resizeDelta.current.dy;

        const updater = (prev: CanvasElementData[]) =>
          prev.map((el) =>
            el.id === id
              ? {
                  ...el,
                  width: Math.max(40, Math.round((resizeStart.current!.w + dx) * 1)),
                  height: Math.max(30, Math.round((resizeStart.current!.h + dy) * 1)),
                }
              : el
          );

        if (setWithCoalesce) setWithCoalesce("resize", updater);
        else setElements(updater);
      });
    }

    function onUp() {
      resizeStart.current = null;

      if (rafResize.current) {
        cancelAnimationFrame(rafResize.current);
        rafResize.current = null;
      }

      try {
        elRef.current?.releasePointerCapture(e.pointerId);
      } catch {}

      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);

      if (commitCoalesce) commitCoalesce("resize");
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return (
    <div
      ref={elRef}
      onPointerDown={onPointerDown}
      data-testid="canvas-element"
      data-elid={id}
      className={`absolute rounded-xl bg-neutral-700/70 p-3 border border-white/10 ${
        isSelected ? "outline outline-2 outline-blue-500 z-50" : ""
      }`}
      style={{
        left: x,
        top: y,
        width,
        height,
        touchAction: "none",
        userSelect: "none",
      }}
    >
      <div className="text-sm text-white/90 pointer-events-none">{type}</div>

      {isSelected && (
        <div
          onPointerDown={onResizeDown}
          className="absolute right-0 bottom-0 w-3 h-3 bg-blue-500 cursor-se-resize"
        />
      )}
    </div>
  );
}
