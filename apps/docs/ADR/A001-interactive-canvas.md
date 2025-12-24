# ADR 0001 — A001: Interactive Canvas (drag/drop editor core + project setup)

**Status:** Accepted / Completed  
**Date:** 2025-12-24  
**File:** `docs/adr/A001-interactive-canvas.md`

---

## Summary

This ADR documents the architectural decisions and implementation approach for **A001 — the Interactive Canvas** feature (the MVP canvas editor). It covers the editor core (drag/drop, multi-select, group drag, resize, snapping), viewport model (pan/zoom world ↔ screen separation), undo/redo history, component palette UI, and recommended documentation structure.

We are recording why we made each choice, what alternatives we considered, and how the feature should be extended and tested so future engineers can confidently continue the work.

---

## Context

We are building a web-based visual low-code editor that allows users to:

- Drag components from a floating palette onto a white canvas  
- Position and resize components precisely  
- Multi-select and group-drag elements  
- Snap elements by edges and centers  
- Pan and zoom the canvas using mouse and trackpad  
- Undo and redo edits reliably

### Stack

- Vite  
- React  
- TypeScript  
- Tailwind CSS

### Core Requirements

- All interactions must remain correct under arbitrary zoom levels.  
- Two-finger trackpad pan must **never trigger browser back/forward navigation**.  
- Undo/redo must be reliable for drag, resize, delete, and drop.  
- The architecture must remain simple, inspectable, and easy to extend.

---

## Decisions

### 1. Single Source of Truth for Canvas Elements

We keep `elements: CanvasElementData[]` in `App.tsx`.

**Rationale:** Centralized state simplifies undo/redo, selection logic, and cross-component coordination (palette, canvas, inspector).

---

### 2. Snapshot-Based Undo/Redo (`useHistory<T>`)

We implement a `useHistory<T>` hook storing `past | present | future` and expose `set`, `undo`, and `redo`. `set` accepts both a value and a functional updater.

**Rationale:** Snapshot history is simple, deterministic, and works well for continuous interactions (drag/resize) where reverse-command semantics become complex.

---

### 3. Pointer Events for Canvas Interactions

We use Pointer Events (`pointerdown`, `pointermove`, `pointerup`, `setPointerCapture`) for element movement and resizing, and HTML5 Drag & Drop only for palette → canvas creation.

**Rationale:** Pointer Events give precise control across mouse, touch, and pen; they are straightforward to make zoom-aware. Generic DnD libraries are optimized for lists and reordering, not freeform spatial movement.

---

### 4. World-Space Coordinate Model

Elements store `x`, `y`, `width`, `height` in world coordinates. The viewport is `{ scale, offsetX, offsetY }`. All pointer deltas are converted from screen space to world space by dividing by `scale`.

**Rationale:** This model keeps element positions stable under pan/zoom and makes snapping and relative math predictable.

---

### 5. Soft Snapping (Edges & Centers)

We implement soft edge-to-edge and center-to-center snapping with a default threshold of `6px`. Snapping assists but does not constrain movement when the user continues dragging.

**Rationale:** It improves alignment without surprising the user.

---

### 6. Group Selection & Group Drag

We support Shift-toggle multi-select and box selection. Before a group drag we snapshot positions in a `Map<id, {x,y}>` and apply the same world delta to each selected element.

**Rationale:** This preserves relative spacing and enables group snapping.

---

### 7. Pan & Zoom Handling

| Action | Behavior |
| ------ | -------- |
| Two-finger scroll | Canvas pan |
| Space + drag | Canvas pan |
| Ctrl/Cmd + wheel | Zoom around cursor |
| Browser gestures | Disabled (we intercept wheel non-passively) |

**Rationale:** This matches professional editors (Figma/Excalidraw) and avoids browser navigation interfering with the editor.

---

### 8. Floating Component Palette

We place the palette as a fixed, translucent, backdrop-blurred panel floating above the canvas on the left.

**Rationale:** This gives a modern, unobtrusive creation surface that visually separates tools from the canvas.

---

### 9. Documentation Placement

We store ADRs under `docs/adr/`.

**Rationale:** ADRs version with code and are discoverable via repository browsing and PR review.

---

## Interaction Model

| Interaction   | Implementation                           |
|---------------|------------------------------------------|
| Drag          | Pointer Events                            |
| Resize        | Pointer Events (resize handles)           |
| Group drag    | Pointer Events + snapshot                 |
| Multi-select  | Shift-click & box select                  |
| Box select    | Pointer-drawn rectangle (world-space)     |
| Snap          | Edge & center comparison (soft, threshold)|
| Pan           | Wheel / Space + drag                      |
| Zoom          | Ctrl/Cmd + wheel (zoom around cursor)     |
| Create        | HTML5 Drag & Drop (palette → canvas)      |

---

## Alternatives Considered

### Drag-and-Drop Libraries (`@dnd-kit`, `react-dnd`)
Rejected — they are better for lists and reordering, not freeform spatial movement with zoom-aware deltas and snapping.

### Command-Based Undo
Rejected for MVP — inverse action correctness for continuous interactions is complex and error-prone.

### Screen-Space Coordinates
Rejected — storing screen-space state complicates pan/zoom invariants and increases conversion errors.

### Canvas Libraries (Konva, Fabric)
Rejected — heavier dependencies and less control; overkill for the MVP we want to keep small and interview-friendly.

---

## Consequences

### Benefits

- Deterministic undo/redo and simple history semantics.  
- Predictable snapping and stability at any zoom level.  
- Lightweight dependency surface and good portability.  
- Code remains readable and suitable for portfolio/interview purposes.

### Costs

- Snapshot history consumes more memory (we cap and coalesce).  
- Snapping is O(N); we will add spatial indexing if N grows.  
- More custom engineering instead of offloading to third-party editors.
