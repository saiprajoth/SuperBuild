

// src/renderer/registry.tsx
import React from "react";
import { z } from "zod";

export type RegistryEntry<T = any> = {
  component: React.ComponentType<any>;
  defaultProps?: T;
  propsSchema?: any;
  allowedChildren?: string[] | "any";
  displayName?: string;
  icon?: React.ReactNode;
  preview?: React.FC;
  exportHints?: { fileName?: string; namedExport?: string };
};

// small schemas for primitives (expand later)
export const TextPropsSchema = z.object({
  text: z.string().optional(),
  size: z.number().optional(),
  weight: z.number().optional(),
});

export const ButtonPropsSchema = z.object({
  label: z.string().optional(),
  variant: z.enum(["primary", "secondary"]).optional(),
});

export const ImagePropsSchema = z.object({
  src: z.string().optional(),
  alt: z.string().optional(),
  objectFit: z.enum(["cover", "contain", "fill"]).optional(),
});

const REGISTRY: Record<string, RegistryEntry> = {
  Text: {
    component: ({ text = "Heading", size = 16, weight = 600 }: { text?: string; size?: number; weight?: number }) => (
      <div style={{ fontSize: size, fontWeight: weight }}>{text}</div>
    ),
    defaultProps: { text: "Heading", size: 16, weight: 600 },
    propsSchema: TextPropsSchema,
    displayName: "Text",
    icon: "T",
    preview: () => <div style={{ fontSize: 14, fontWeight: 600 }}>Aa</div>,
    exportHints: { fileName: "Text.tsx", namedExport: "Text" },
  },

  Button: {
    component: ({ label = "Click", variant = "primary" }: { label?: string; variant?: string }) => (
      <button
        className={variant === "primary" ? "px-3 py-2 rounded bg-blue-600 text-white" : "px-3 py-2 rounded bg-gray-200 text-gray-800"}
      >
        {label}
      </button>
    ),
    defaultProps: { label: "Click", variant: "primary" },
    propsSchema: ButtonPropsSchema,
    displayName: "Button",
    icon: "🔘",
    preview: () => <div style={{ padding: 6, borderRadius: 6, background: "#2563eb", color: "white", fontSize: 12 }}>Btn</div>,
    exportHints: { fileName: "Button.tsx", namedExport: "Button" },
  },

  Image: {
    component: ({ src = "", alt = "", objectFit = "cover" }: { src?: string; alt?: string; objectFit?: string }) => (
      <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: objectFit as any }} />
    ),
    defaultProps: { src: "", alt: "", objectFit: "cover" },
    propsSchema: ImagePropsSchema,
    displayName: "Image",
    icon: "🖼️",
    preview: () => <div style={{ width: 40, height: 24, background: "#e5e7eb", borderRadius: 4 }} />,
    exportHints: { fileName: "Image.tsx", namedExport: "Image" },
  },

  // small example Container - accepts children in the registry model (we're not rendering children here)
  Container: {
    component: ({ children }: { children?: React.ReactNode }) => <div className="p-2">{children}</div>,
    defaultProps: {},
    propsSchema: z.object({}),
    displayName: "Container",
    icon: "▭",
    preview: () => <div style={{ padding: 8, border: "1px dashed #cbd5e1" }}>Container</div>,
    exportHints: { fileName: "Container.tsx", namedExport: "Container" },
  },

  // You can add the remaining primitives similarly:
  // Card, Input, Navbar, Sidebar, List, Form etc.
};

// ensure default export matches imports like `import REGISTRY from "../renderer/registry";`
export default REGISTRY;
