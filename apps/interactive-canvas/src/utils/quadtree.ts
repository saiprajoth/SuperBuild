// src/utils/quadtree.ts
export type Rect = { x: number; y: number; w: number; h: number };
export type QTItem<T = unknown> = { id: string; r: Rect; data?: T };
export type QTNode<T = unknown> = Rect & { items: QTItem<T>[]; children?: QTNode<T>[] };

// NOTE: This is a scaffold file for shared quadtree utilities.
// Current runtime quadtree is implemented inside CanvasElement (Step 7).
// If we later want to reuse it for guides/alignment lines/etc, we migrate the logic here.
