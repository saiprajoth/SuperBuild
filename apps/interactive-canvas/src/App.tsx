
// import React, { useEffect, useRef, useState } from "react";
// import Canvas from "./components/Canvas";
// import ComponentBar from "./components/ComponentBar";
// import useHistory from "./hooks/useHistory";
// import type { CanvasElementData } from "./types";
// import REGISTRY from "./renderer/registry";
// import { exportProjectZip } from "./utils/exporter";

// // Minimal INSPECTOR implemented inline to avoid creating new files
// function Inspector({
//   elements,
//   selectedIds,
//   setElements,
// }: {
//   elements: CanvasElementData[];
//   selectedIds: string[];
//   setElements: React.Dispatch<React.SetStateAction<CanvasElementData[]>>;
// }) {
//   const selectedId = selectedIds && selectedIds.length ? selectedIds[0] : null;
//   const node = elements.find((e) => e.id === selectedId) ?? null;
//   const [localProps, setLocalProps] = useState<Record<string, any> | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const commitTimer = useRef<number | null>(null);

//   useEffect(() => {
//     setError(null);
//     if (!node) {
//       setLocalProps(null);
//       return;
//     }
//     setLocalProps({ ...(node.props ?? {}) });
//   }, [node?.id]);

//   useEffect(() => {
//     return () => {
//       if (commitTimer.current) {
//         window.clearTimeout(commitTimer.current);
//         commitTimer.current = null;
//       }
//     };
//   }, []);

//   if (!node) {
//     return (
//       <aside
//         aria-label="inspector"
//         style={{
//           width: 320,
//           background: "rgba(255,255,255,0.02)",
//           padding: 12,
//           borderLeft: "1px solid rgba(255,255,255,0.04)",
//         }}
//       >
//         <div style={{ color: "#d1d5db", fontWeight: 600 }}>Inspector</div>
//         <div style={{ marginTop: 12, color: "#9ca3af" }}>Select an element</div>
//       </aside>
//     );
//   }

//   const entry = (REGISTRY as any)[node.type];
//   const schema = entry?.propsSchema as any | undefined;
//   const keys = Object.keys(entry?.defaultProps ?? node.props ?? {});

//   function commitChanges(nextProps: Record<string, any>) {
//     if (schema) {
//       try {
//         schema.parse(nextProps);
//         setError(null);
//       } catch (err: any) {
//         setError(err?.message ?? String(err));
//         return;
//       }
//     }

//     setElements((prev) =>
//       prev.map((it) =>
//         it.id === node.id ? { ...it, props: { ...(it.props ?? {}), ...nextProps } } : it
//       )
//     );
//   }

//   function onFieldChange(key: string, rawValue: string) {
//     if (localProps === null) return;

//     const defaultVal = (entry?.defaultProps ?? node.props ?? {})[key];
//     let parsed: any = rawValue;

//     if (typeof defaultVal === "number") {
//       const n = Number(rawValue);
//       parsed = Number.isNaN(n) ? 0 : n;
//     } else if (typeof defaultVal === "boolean") {
//       parsed = rawValue === "true" || rawValue === "1";
//     } else {
//       parsed = rawValue;
//     }

//     const nextLocal = { ...localProps, [key]: parsed };
//     setLocalProps(nextLocal);
//     setError(null);

//     if (commitTimer.current) {
//       window.clearTimeout(commitTimer.current);
//     }
//     commitTimer.current = window.setTimeout(() => {
//       commitTimer.current = null;
//       commitChanges(nextLocal);
//     }, 200);
//   }

//   return (
//     <aside
//       aria-label="inspector"
//       style={{
//         width: 320,
//         background: "rgba(255,255,255,0.02)",
//         padding: 12,
//         borderLeft: "1px solid rgba(255,255,255,0.04)",
//         overflow: "auto",
//       }}
//     >
//       <div style={{ color: "#d1d5db", fontWeight: 700, marginBottom: 8 }}>Inspector</div>
//       <div style={{ color: "#9ca3af", marginBottom: 8 }}>{entry?.displayName ?? node.type}</div>

//       {keys.map((key) => {
//         const val = localProps ? localProps[key] : "";
//         const defaultVal = (entry?.defaultProps ?? {})[key];
//         const inputType =
//           typeof defaultVal === "number" ? "number" : typeof defaultVal === "boolean" ? "text" : "text";

//         return (
//           <div key={key} style={{ marginBottom: 10 }}>
//             <label style={{ display: "block", color: "#cbd5e1", fontSize: 13, marginBottom: 6 }}>
//               {key}
//             </label>
//             <input
//               value={val ?? ""}
//               type={inputType}
//               onChange={(e) => onFieldChange(key, e.target.value)}
//               style={{
//                 width: "100%",
//                 padding: "8px 10px",
//                 borderRadius: 6,
//                 border: "1px solid rgba(255,255,255,0.06)",
//                 background: "rgba(0,0,0,0.35)",
//                 color: "white",
//               }}
//             />
//           </div>
//         );
//       })}

//       {error && <div style={{ color: "#fca5a5", marginTop: 8 }}>{error}</div>}
//     </aside>
//   );
// }

// function App() {
//   const initialElements: CanvasElementData[] = [];

//   const history = useHistory<CanvasElementData[]>(initialElements, { limit: 200 });
//   const elements = history.present;
//   const setElements = history.set;

//   const selectedIdsRef = useRef<string[]>([]);
//   const [selectedIds, setSelectedIds] = useState<string[]>([]);

//   useEffect(() => {
//     selectedIdsRef.current = selectedIds;
//   }, [selectedIds]);

//   // Keyboard shortcuts for undo/redo and delete
//   useEffect(() => {
//     function onKey(e: KeyboardEvent) {
//       const key = e.key.toLowerCase();
//       const mod = e.metaKey || e.ctrlKey;

//       if (mod && key === "z" && !e.shiftKey) {
//         e.preventDefault();
//         history.undo();
//         return;
//       }
//       if ((mod && key === "z" && e.shiftKey) || (e.ctrlKey && key === "y")) {
//         e.preventDefault();
//         history.redo();
//         return;
//       }

//       if (e.key === "Delete" || e.key === "Backspace") {
//         const active = document.activeElement;
//         const isTyping =
//           active &&
//           (active.tagName === "INPUT" ||
//             active.tagName === "TEXTAREA" ||
//             (active as HTMLElement).isContentEditable);
//         if (isTyping) return;

//         if (selectedIdsRef.current && selectedIdsRef.current.length > 0) {
//           e.preventDefault();
//           setElements((prev) => prev.filter((item) => !selectedIdsRef.current.includes(item.id)));
//           setSelectedIds([]);
//         }
//       }
//     }

//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [history, setElements]);

//   async function onExport() {
//     // Export current canvas state as runnable Vite+React+TS+Tailwind ZIP
//     await exportProjectZip({
//       elements,
//       registry: REGISTRY as any,
//       projectName: "superbuild-export",
//     });
//   }

//   return (
//     <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
//       <ComponentBar />
//       <Canvas elements={elements} setElements={setElements} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />
//       <Inspector elements={elements} selectedIds={selectedIds} setElements={setElements} />

//       {/* Export button */}
//       <button
//         onClick={onExport}
//         style={{
//           position: "fixed",
//           right: 16,
//           top: 16,
//           zIndex: 9999,
//           padding: "10px 14px",
//           borderRadius: 10,
//           background: "rgba(17,24,39,0.9)",
//           color: "white",
//           border: "1px solid rgba(255,255,255,0.08)",
//           cursor: "pointer",
//         }}
//       >
//         Export ZIP
//       </button>
//     </div>
//   );
// }

// export default App;





// src/App.tsx
import React, { useEffect, useRef, useState } from "react";
import Canvas from "./components/Canvas";
import ComponentBar from "./components/ComponentBar";
import useHistory from "./hooks/useHistory";
import type { CanvasElementData } from "./types";
import REGISTRY from "./renderer/registry";
import { exportProjectZip } from "./utils/exporter";

// Minimal INSPECTOR implemented inline to avoid creating new files
function Inspector({
  elements,
  selectedIds,
  setElements,
}: {
  elements: CanvasElementData[];
  selectedIds: string[];
  setElements: React.Dispatch<React.SetStateAction<CanvasElementData[]>>;
}) {
  const selectedId = selectedIds && selectedIds.length ? selectedIds[0] : null;
  const node = elements.find((e) => e.id === selectedId) ?? null;
  const [localProps, setLocalProps] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const commitTimer = useRef<number | null>(null);

  useEffect(() => {
    setError(null);
    if (!node) {
      setLocalProps(null);
      return;
    }
    setLocalProps({ ...(node.props ?? {}) });
  }, [node?.id]);

  useEffect(() => {
    return () => {
      if (commitTimer.current) {
        window.clearTimeout(commitTimer.current);
        commitTimer.current = null;
      }
    };
  }, []);

  if (!node) {
    return (
      <aside
        aria-label="inspector"
        style={{
          width: 320,
          background: "rgba(255,255,255,0.02)",
          padding: 12,
          borderLeft: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div style={{ color: "#d1d5db", fontWeight: 600 }}>Inspector</div>
        <div style={{ marginTop: 12, color: "#9ca3af" }}>Select an element</div>
      </aside>
    );
  }

  const entry = (REGISTRY as any)[node.type];
  const schema = entry?.propsSchema as any | undefined;
  const keys = Object.keys(entry?.defaultProps ?? node.props ?? {});

  function commitChanges(nextProps: Record<string, any>) {
    if (schema) {
      try {
        schema.parse(nextProps);
        setError(null);
      } catch (err: any) {
        setError(err?.message ?? String(err));
        return;
      }
    }

    setElements((prev) =>
      prev.map((it) =>
        it.id === node.id ? { ...it, props: { ...(it.props ?? {}), ...nextProps } } : it
      )
    );
  }

  function onFieldChange(key: string, rawValue: string) {
    if (localProps === null) return;

    const defaultVal = (entry?.defaultProps ?? node.props ?? {})[key];
    let parsed: any = rawValue;

    if (typeof defaultVal === "number") {
      const n = Number(rawValue);
      parsed = Number.isNaN(n) ? 0 : n;
    } else if (typeof defaultVal === "boolean") {
      parsed = rawValue === "true" || rawValue === "1";
    } else {
      parsed = rawValue;
    }

    const nextLocal = { ...localProps, [key]: parsed };
    setLocalProps(nextLocal);
    setError(null);

    if (commitTimer.current) {
      window.clearTimeout(commitTimer.current);
    }
    commitTimer.current = window.setTimeout(() => {
      commitTimer.current = null;
      commitChanges(nextLocal);
    }, 200);
  }

  return (
    <aside
      aria-label="inspector"
      style={{
        width: 320,
        background: "rgba(255,255,255,0.02)",
        padding: 12,
        borderLeft: "1px solid rgba(255,255,255,0.04)",
        overflow: "auto",
      }}
    >
      <div style={{ color: "#d1d5db", fontWeight: 700, marginBottom: 8 }}>Inspector</div>
      <div style={{ color: "#9ca3af", marginBottom: 8 }}>{entry?.displayName ?? node.type}</div>

      {keys.map((key) => {
        const val = localProps ? localProps[key] : "";
        const defaultVal = (entry?.defaultProps ?? {})[key];
        const inputType =
          typeof defaultVal === "number" ? "number" : typeof defaultVal === "boolean" ? "text" : "text";

        return (
          <div key={key} style={{ marginBottom: 10 }}>
            <label style={{ display: "block", color: "#cbd5e1", fontSize: 13, marginBottom: 6 }}>
              {key}
            </label>
            <input
              value={val ?? ""}
              type={inputType}
              onChange={(e) => onFieldChange(key, e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(0,0,0,0.35)",
                color: "white",
              }}
            />
          </div>
        );
      })}

      {error && <div style={{ color: "#fca5a5", marginTop: 8 }}>{error}</div>}
    </aside>
  );
}

function App() {
  const initialElements: CanvasElementData[] = [];

  const history = useHistory<CanvasElementData[]>(initialElements, { limit: 200 });
  const elements = history.present;
  const setElements = history.set;

  const selectedIdsRef = useRef<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    selectedIdsRef.current = selectedIds;
  }, [selectedIds]);

  // Keyboard shortcuts for undo/redo and delete
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      const mod = e.metaKey || e.ctrlKey;

      if (mod && key === "z" && !e.shiftKey) {
        e.preventDefault();
        history.undo();
        return;
      }
      if ((mod && key === "z" && e.shiftKey) || (e.ctrlKey && key === "y")) {
        e.preventDefault();
        history.redo();
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        const active = document.activeElement;
        const isTyping =
          active &&
          (active.tagName === "INPUT" ||
            active.tagName === "TEXTAREA" ||
            (active as HTMLElement).isContentEditable);
        if (isTyping) return;

        if (selectedIdsRef.current && selectedIdsRef.current.length > 0) {
          e.preventDefault();
          setElements((prev) => prev.filter((item) => !selectedIdsRef.current.includes(item.id)));
          setSelectedIds([]);
        }
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [history, setElements]);

  async function onExport() {
    // Export current canvas state as runnable Vite+React+TS+Tailwind ZIP
    await exportProjectZip({
      elements,
      registry: REGISTRY as any,
      projectName: "superbuild-export",
    });
  }

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      <ComponentBar />
      <Canvas elements={elements} setElements={setElements} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />
      <Inspector elements={elements} selectedIds={selectedIds} setElements={setElements} />

      {/* Export button */}
      <button
        onClick={onExport}
        style={{
          position: "fixed",
          right: 16,
          top: 16,
          zIndex: 9999,
          padding: "10px 14px",
          borderRadius: 10,
          background: "rgba(17,24,39,0.9)",
          color: "white",
          border: "1px solid rgba(255,255,255,0.08)",
          cursor: "pointer",
        }}
      >
        Export ZIP
      </button>
    </div>
  );
}

export default App;