import React, { useEffect, useState } from "react";
import { ComponentBar } from "./components/ComponentBar";
import { Canvas } from "./components/Canvas";
import { useHistory } from "./hooks/useHistory";

export type CanvasElementData = {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export default function App() {
  // 🔥 SINGLE source of truth for canvas state
  const history = useHistory<CanvasElementData[]>([]);
  const elements = history.present;
  const setElements = history.set;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ⌨️ Undo / Redo
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        history.undo();
      }

      if (
        (e.metaKey && e.shiftKey && e.key === "z") ||
        (e.ctrlKey && e.key === "y")
      ) {
        e.preventDefault();
        history.redo();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <ComponentBar />
      <Canvas
        elements={elements}
        setElements={setElements}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
      />
    </div>
  );
}
