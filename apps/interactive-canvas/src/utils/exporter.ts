// src/utils/exporter.ts
import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { CanvasElementData } from "../types";

type ExportOptions = {
  elements: CanvasElementData[];
  registry: Record<string, any>;
  projectName?: string;
};

function safeJson(value: any) {
  return JSON.stringify(value, null, 2);
}

function pkgJson(name: string) {
  // Vite + React + TS + Tailwind (in exported project)
  return safeJson({
    name,
    private: true,
    version: "0.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "tsc -b && vite build",
      preview: "vite preview",
    },
    dependencies: {
      react: "^18.3.1",
      "react-dom": "^18.3.1",
    },
    devDependencies: {
      "@types/react": "^18.3.3",
      "@types/react-dom": "^18.3.0",
      "@vitejs/plugin-react": "^4.3.1",
      autoprefixer: "^10.4.20",
      postcss: "^8.4.41",
      tailwindcss: "^3.4.10",
      typescript: "^5.5.4",
      vite: "^5.4.2",
    },
  });
}

function viteConfig() {
  return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`;
}

function tsconfig() {
  return safeJson({
    compilerOptions: {
      target: "ES2020",
      useDefineForClassFields: true,
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      module: "ESNext",
      skipLibCheck: true,
      moduleResolution: "Bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: "react-jsx",
      strict: true,
      types: ["vite/client"],
    },
    include: ["src"],
  });
}

function indexHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Superbuild Export</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

function mainTsx() {
  return `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
`;
}

function tailwindConfig() {
  return `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
}

function postcssConfig() {
  return `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
}

function indexCss() {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root {
  height: 100%;
}
`;
}

// Minimal exportable primitives (safe defaults)
// We generate these regardless of your internal registry implementation.
// The mapping is by element.type.
function componentTemplate(type: string) {
  switch (type) {
    case "Text":
      return `export function Text(props: any) {
  const text = props?.text ?? 'Text';
  const size = props?.size ?? 16;
  const weight = props?.weight ?? 600;
  return <div style={{ fontSize: size, fontWeight: weight }}>{text}</div>;
}
`;
    case "Button":
      return `export function Button(props: any) {
  const label = props?.label ?? 'Button';
  return (
    <button className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800">
      {label}
    </button>
  );
}
`;
    default:
      return `export function ${type}(props: any) {
  return (
    <div className="px-3 py-2 rounded-md bg-gray-200 text-gray-800">
      {props?.label ?? props?.text ?? '${type}'}
    </div>
  );
}
`;
  }
}

function exportedAppTsx(elements: CanvasElementData[], usedTypes: string[]) {
  const imports = usedTypes
    .map((t) => `import { ${t} } from "./components/${t}";`)
    .join("\n");

  const renderSwitch = usedTypes
    .map(
      (t) => `    case "${t}":
      return <${t} {...(el.props ?? {})} />;`
    )
    .join("\n");

  return `import React from "react";
${imports}

type CanvasElementData = {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  props?: Record<string, any>;
};

const elements: CanvasElementData[] = ${safeJson(elements)};

function renderElement(el: CanvasElementData) {
  switch (el.type) {
${renderSwitch}
    default:
      return <div className="px-2 py-1 rounded bg-gray-200 text-gray-800">{el.type}</div>;
  }
}

export default function App() {
  return (
    <div className="w-full h-full bg-white relative overflow-hidden">
      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute"
          style={{
            left: el.x,
            top: el.y,
            width: el.width,
            height: el.height,
          }}
        >
          {renderElement(el)}
        </div>
      ))}
    </div>
  );
}
`;
}

export async function exportProjectZip({
  elements,
  registry,
  projectName = "superbuild-export",
}: ExportOptions) {
  const zip = new JSZip();

  // Determine which types exist in the canvas
  const usedTypes = Array.from(new Set(elements.map((e) => e.type))).filter(Boolean);

  // Root files
  zip.file("package.json", pkgJson(projectName));
  zip.file("vite.config.ts", viteConfig());
  zip.file("tsconfig.json", tsconfig());
  zip.file("index.html", indexHtml());
  zip.file("README.md", `# ${projectName}

This project was exported from Superbuild.

## Run
\`\`\`bash
npm install
npm run dev
\`\`\`
`);

  // src/*
  const src = zip.folder("src")!;
  src.file("main.tsx", mainTsx());
  src.file("App.tsx", exportedAppTsx(elements, usedTypes));
  src.file("index.css", indexCss());

  // Tailwind + PostCSS config (at root)
  zip.file("tailwind.config.js", tailwindConfig());
  zip.file("postcss.config.js", postcssConfig());

  // components/*
  const components = src.folder("components")!;
  usedTypes.forEach((type) => {
    // If registry doesn't have the type, still create a safe component.
    // We are NOT mutating registry, only reading it.
    const fileName = `${type}.tsx`;
    components.file(fileName, componentTemplate(type));
  });

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `${projectName}.zip`);
}
