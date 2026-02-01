


import React from "react";
import { z } from "zod";

import Text from "../components/primitives/Text";
import Button from "../components/primitives/Button";
import Image from "../components/primitives/Image";
import Container from "../components/primitives/Container";
import Card from "../components/primitives/Card";
import Input from "../components/primitives/Input";
import Navbar from "../components/primitives/Navbar";
import Sidebar from "../components/primitives/SideBar";
import List from "../components/primitives/List";
import Form from "../components/primitives/Form";

export type RegistryEntry<T = any> = {
  component: React.ComponentType<T>;
  defaultProps: T;
  propsSchema: z.ZodType<T>;
  allowedChildren?: string[] | "any";
  displayName: string;
  icon?: React.ReactNode;
  preview?: React.FC;
  exportHints?: { fileName?: string; namedExport?: string };
};

export const REGISTRY: Record<string, RegistryEntry<any>> = {
  Text: {
    component: Text,
    defaultProps: { text: "Heading", size: 22, weight: 800, color: "#0f172a", align: "left" },
    propsSchema: z.object({
      text: z.string().optional(),
      size: z.number().optional(),
      weight: z.number().optional(),
      color: z.string().optional(),
      align: z.enum(["left", "center", "right"]).optional(),
    }),
    displayName: "Text",
    icon: "T",
    preview: () => <div className="text-sm font-semibold text-slate-900">Aa</div>,
    exportHints: { fileName: "Text.tsx", namedExport: "Text" },
  },

  Button: {
    component: Button,
    defaultProps: { label: "Click me", variant: "primary" },
    propsSchema: z.object({
      label: z.string().optional(),
      variant: z.enum(["primary", "secondary", "ghost"]).optional(),
    }),
    displayName: "Button",
    icon: "🔘",
    preview: () => <div className="text-xs px-2 py-1 rounded bg-blue-600 text-white">Btn</div>,
    exportHints: { fileName: "Button.tsx", namedExport: "Button" },
  },

  Image: {
    component: Image,
    defaultProps: { src: "https://picsum.photos/600/400", alt: "Image", fit: "cover", radius: 14 },
    propsSchema: z.object({
      src: z.string().optional(),
      alt: z.string().optional(),
      fit: z.enum(["cover", "contain"]).optional(),
      radius: z.number().optional(),
    }),
    displayName: "Image",
    icon: "🖼️",
    preview: () => <div className="text-xs text-slate-700">Img</div>,
    exportHints: { fileName: "Image.tsx", namedExport: "Image" },
  },

  Container: {
    component: Container,
    defaultProps: { padding: 12, bg: "#ffffff", radius: 16 },
    propsSchema: z.object({
      padding: z.number().optional(),
      bg: z.string().optional(),
      radius: z.number().optional(),
    }),
    displayName: "Container",
    icon: "⬛",
    preview: () => <div className="w-6 h-4 rounded bg-slate-200 border border-slate-300" />,
    exportHints: { fileName: "Container.tsx", namedExport: "Container" },
  },

  Card: {
    component: Card,
    defaultProps: { title: "Card title", body: "This is a card body." },
    propsSchema: z.object({
      title: z.string().optional(),
      body: z.string().optional(),
    }),
    displayName: "Card",
    icon: "🧾",
    preview: () => <div className="text-xs text-slate-700">Card</div>,
    exportHints: { fileName: "Card.tsx", namedExport: "Card" },
  },

  Input: {
    component: Input,
    defaultProps: { label: "Label", placeholder: "Type here..." },
    propsSchema: z.object({
      label: z.string().optional(),
      placeholder: z.string().optional(),
    }),
    displayName: "Input",
    icon: "⌨️",
    preview: () => <div className="text-xs text-slate-700">Input</div>,
    exportHints: { fileName: "Input.tsx", namedExport: "Input" },
  },

  Navbar: {
    component: Navbar,
    defaultProps: { brand: "SuperBuild", item1: "Home", item2: "Docs", item3: "Pricing" },
    propsSchema: z.object({
      brand: z.string().optional(),
      item1: z.string().optional(),
      item2: z.string().optional(),
      item3: z.string().optional(),
    }),
    displayName: "Navbar",
    icon: "🧭",
    preview: () => <div className="text-xs text-slate-700">Nav</div>,
    exportHints: { fileName: "Navbar.tsx", namedExport: "Navbar" },
  },

  Sidebar: {
    component: Sidebar,
    defaultProps: { title: "Menu", a: "Dashboard", b: "Projects", c: "Settings" },
    propsSchema: z.object({
      title: z.string().optional(),
      a: z.string().optional(),
      b: z.string().optional(),
      c: z.string().optional(),
    }),
    displayName: "Sidebar",
    icon: "📚",
    preview: () => <div className="text-xs text-slate-700">Side</div>,
    exportHints: { fileName: "Sidebar.tsx", namedExport: "Sidebar" },
  },

  List: {
    component: List,
    defaultProps: { title: "List", i1: "Item 1", i2: "Item 2", i3: "Item 3" },
    propsSchema: z.object({
      title: z.string().optional(),
      i1: z.string().optional(),
      i2: z.string().optional(),
      i3: z.string().optional(),
    }),
    displayName: "List",
    icon: "📋",
    preview: () => <div className="text-xs text-slate-700">List</div>,
    exportHints: { fileName: "List.tsx", namedExport: "List" },
  },

  Form: {
    component: Form,
    defaultProps: { title: "Sign up", cta: "Create account" },
    propsSchema: z.object({
      title: z.string().optional(),
      cta: z.string().optional(),
    }),
    displayName: "Form",
    icon: "📝",
    preview: () => <div className="text-xs text-slate-700">Form</div>,
    exportHints: { fileName: "Form.tsx", namedExport: "Form" },
  },
};

export default REGISTRY;
