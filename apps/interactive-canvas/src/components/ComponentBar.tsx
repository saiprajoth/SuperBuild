
import React from "react";

export function ComponentBar() {
  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData("component", "duplicate");
  }

  return (
    <aside
      className="
        fixed
        left-6
        top-6
        bottom-6
        z-50
        w-72
        rounded-2xl
        bg-neutral-900/60
        backdrop-blur-md
        border
        border-neutral-700/30
        shadow-2xl
        p-4
        overflow-auto
      "
      aria-label="component-bar"
    >
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-white/95">
          Components
        </h2>

        <div className="mt-2 flex flex-col gap-2">
          <div
            draggable
            onDragStart={handleDragStart}
            className="
              flex items-center gap-3
              bg-neutral-800/60
              hover:bg-neutral-800/80
              border border-white/5
              rounded-lg
              p-3
              cursor-grab
              select-none
              transition
            "
          >
            <span className="text-sm">📄</span>
            <span className="text-sm text-white/90">
              Duplicate
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
