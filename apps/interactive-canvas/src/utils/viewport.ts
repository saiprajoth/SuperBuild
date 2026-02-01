
// // src/utils/viewport.ts
// export type Viewport = {
//   scale: number;
//   offsetX: number;
//   offsetY: number;
// };

// export const MIN_SCALE = 0.3;
// export const MAX_SCALE = 3;

// export function clampScale(s: number) {
//   return Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));
// }

// /**
//  * Convert a screen (clientX, clientY) into world coordinates,
//  * using bounding rect of canvas root and the viewport state.
//  */
// export function screenToWorld(
//   clientX: number,
//   clientY: number,
//   rect: DOMRect,
//   viewport: Viewport
// ) {
//   const screenX = clientX - rect.left;
//   const screenY = clientY - rect.top;
//   const worldX = (screenX - viewport.offsetX) / viewport.scale;
//   const worldY = (screenY - viewport.offsetY) / viewport.scale;
//   return { x: worldX, y: worldY, screenX, screenY };
// }

// /**
//  * Convert world coords -> screen coords
//  */
// export function worldToScreen(x: number, y: number, viewport: Viewport) {
//   return {
//     x: x * viewport.scale + viewport.offsetX,
//     y: y * viewport.scale + viewport.offsetY,
//   };
// }

// /**
//  * Compute a new viewport when zooming around a screen point (mouse),
//  * keeping the world point under the cursor stable.
//  *
//  * - clientX/clientY are screen coordinates (clientX) — pass a rect if you have offsets.
//  * - rect: bounding rect of canvas root (to compute mouse relative to canvas).
//  * - deltaScaleFactor: multiplicative factor to apply to scale (e.g. 1.08 or 0.92)
//  *
//  * Returns new Viewport.
//  */
// export function zoomAroundPoint(
//   clientX: number,
//   clientY: number,
//   rect: DOMRect,
//   viewport: Viewport,
//   factor: number
// ): Viewport {
//   const mouseX = clientX - rect.left;
//   const mouseY = clientY - rect.top;
//   const oldScale = viewport.scale;
//   const newScale = clampScale(oldScale * factor);

//   // world coords of point under cursor before zoom
//   const worldX = (mouseX - viewport.offsetX) / oldScale;
//   const worldY = (mouseY - viewport.offsetY) / oldScale;

//   // compute new offsets so mouse stays over same world point
//   const newOffsetX = mouseX - worldX * newScale;
//   const newOffsetY = mouseY - worldY * newScale;

//   return { scale: newScale, offsetX: newOffsetX, offsetY: newOffsetY };
// }


// src/utils/viewport.ts
export type Viewport = { scale: number; offsetX: number; offsetY: number };

export function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

/**
 * Convert a client (page) pointer position to world coordinates.
 * rect should be obtained from rootRef.current.getBoundingClientRect()
 */
export function screenToWorld(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  viewport: Viewport
) {
  const screenX = clientX - rect.left;
  const screenY = clientY - rect.top;
  const worldX = (screenX - viewport.offsetX) / viewport.scale;
  const worldY = (screenY - viewport.offsetY) / viewport.scale;
  return { x: worldX, y: worldY };
}

/**
 * Convert a world coordinate to screen (client relative to rect.left/top)
 */
export function worldToScreen(
  worldX: number,
  worldY: number,
  rect: DOMRect,
  viewport: Viewport
) {
  const screenX = worldX * viewport.scale + viewport.offsetX;
  const screenY = worldY * viewport.scale + viewport.offsetY;
  return { x: screenX + rect.left, y: screenY + rect.top };
}

/**
 * Compute a new viewport when zooming around a cursor point.
 * - clientX/clientY: event.clientX, event.clientY
 * - deltaY: wheel event deltaY
 * Returns new Viewport object (doesn't set state).
 */
export function zoomAroundPoint(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  viewport: Viewport,
  deltaY: number,
  opts?: { minScale?: number; maxScale?: number; step?: number }
): Viewport {
  const minScale = opts?.minScale ?? 0.3;
  const maxScale = opts?.maxScale ?? 3;
  const step = opts?.step ?? 0.08;

  const mouseX = clientX - rect.left;
  const mouseY = clientY - rect.top;

  const oldScale = viewport.scale;
  const delta = -deltaY;
  const factor = 1 + Math.sign(delta) * step;
  const newScale = clamp(oldScale * factor, minScale, maxScale);

  // keep the world point under cursor stable
  const worldX = (mouseX - viewport.offsetX) / oldScale;
  const worldY = (mouseY - viewport.offsetY) / oldScale;

  const newOffsetX = mouseX - worldX * newScale;
  const newOffsetY = mouseY - worldY * newScale;

  return { scale: newScale, offsetX: newOffsetX, offsetY: newOffsetY };
}
