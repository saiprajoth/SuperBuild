# ADR 0001: A002 — Component Registry, Viewport Model, Inspector, Exporter, and Performance Guardrails

Status: Accepted  
Date: 2026-01-28

## Context
We are evolving the interactive canvas editor from A001 (drag/select/resize/history) to A002:
- Typed component registry with defaults and prop validation
- Viewport/world-space model (zoom/pan stable)
- Renderer that draws registered components onto canvas nodes
- Inspector to edit node props
- Exporter skeleton to generate runnable React output
- Performance + history coalescing for smooth interactions at scale
- Tests to prevent regressions

A001 features must remain intact throughout.

## Decision
1. **Single Source of Truth + History**
   - `App` owns the canonical list of nodes/elements.
   - Undo/redo uses snapshot history with bounded limit.
   - Interactive actions use coalescing (one undo step per drag/resize).

2. **Registry-Driven Components**
   - A `REGISTRY[type]` defines:
     - `component`
     - `defaultProps`
     - `propsSchema` (zod)
     - optional preview/export hints
   - Node creation (drop) uses `defaultProps`.

3. **World-Space Geometry + Viewport**
   - Node geometry (`x,y,width,height`) is stored in world coordinates.
   - Screen input deltas convert to world deltas using `dxWorld = dxScreen / scale`.
   - Zoom anchors to cursor to avoid “jumping”.

4. **Renderer Separation**
   - Canvas wrapper handles selection/drag/resize.
   - Renderer maps `node.type` → registry component.
   - Editor wrappers stay separate from primitive UI components.

5. **Inspector (Schema-Driven)**
   - Inspector reads schema/registry and edits props.
   - Debounced updates to avoid flooding history.
   - Validation errors shown in UI (dev-friendly).

6. **Exporter Skeleton**
   - Export button generates a minimal runnable React project (zip/download).
   - Uses registry export hints & node tree to generate JSX.

7. **Performance Guardrails**
   - rAF-batched pointermove updates.
   - Coalesced history commit on pointerup.
   - Snapping in world coordinates.
   - Quadtree candidate pruning enabled above threshold (e.g., >200 nodes).

## Rationale (Why this is not trivial)
- Registry + schemas prevents invalid node states and enables reliable export.
- World-space model is required for correct snapping/zoom/pan consistency.
- Coalesced history is required to keep undo usable and memory bounded.
- rAF batching prevents React re-render storms during pointermove.
- Exporter + docs converts the editor from “toy” to “shippable” system.
- Tests/CI guardrails prevent regressions as the codebase grows.

## Alternatives Considered
- Store geometry in screen coordinates → breaks under zoom/pan and export.
- No runtime validation → invalid projects, export failures, hard-to-debug issues.
- Per-move undo snapshots → unusable history and huge memory growth.
- No renderer separation → primitive components get polluted with editor logic.

## Consequences
- Slightly more upfront structure (registry, schema, exporter, docs).
- Clear separation of layers improves maintainability and interview-readability.
- CI/tests become mandatory for safe iteration.

## Rollout / Safety
- Keep A001 flows tested (smoke) after each change.
- Stepwise A002 rollout to avoid breaking existing editing UX.

## Files Added/Changed (high level)
- Registry: `src/renderer/registry.tsx`
- Inspector: `src/components/Inspector.tsx`
- Exporter: `src/utils/exporter.ts`
- Tests: `src/test/*`, `tests/e2e/*`
- Docs/CI: this ADR, README updates, PR template, smoke script
