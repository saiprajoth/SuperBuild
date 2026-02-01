// src/types.ts
export type Layout = {
  x: number; // world x
  y: number; // world y
  width: number;
  height: number;
};

export type CanvasNode = {
  id: string;
  type: string; // registry key e.g., "Text", "Button"
  props?: Record<string, any>; // component props
  layout?: Layout; // optional layout info kept in world coords
  children?: CanvasNode[];
  meta?: { locked?: boolean; hidden?: boolean };
};

export type Page = {
  id: string;
  name: string;
  root: CanvasNode[]; // top-level nodes for the page
};

export type Project = {
  id?: string;
  name?: string;
  pages: Page[];
  settings?: Record<string, any>;
};



// src/types.ts

export type CanvasElementType =
  | "rectangle"
  | "circle"
  | "text"
  | "image"
  | "line"
  | "custom";

export interface CanvasPosition {
  x: number;
  y: number;
}

export interface CanvasSize {
  width: number;
  height: number;
}

export interface CanvasStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  borderRadius?: number;
}

export interface CanvasTextData {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number | string;
  color?: string;
  align?: "left" | "center" | "right";
}

export interface CanvasImageData {
  src: string;
  preserveAspectRatio?: boolean;
}

export interface CanvasElementData {
  /** unique id used for selection, deletion, history */
  id: string;

  /** element type */
  type: CanvasElementType;

  /** position on canvas */
  position: CanvasPosition;

  /** size of element */
  size: CanvasSize;

  /** rotation in degrees */
  rotation?: number;

  /** z-index for layering */
  zIndex?: number;

  /** styling info */
  style?: CanvasStyle;

  /** element-specific payload */
  data?: CanvasTextData | CanvasImageData | Record<string, any>;

  /** interaction flags */
  locked?: boolean;
}
