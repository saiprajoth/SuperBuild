


// import React from "react";
// import REGISTRY from "../renderer/registry";

// export function ComponentBar() {
//   const entries = Object.entries(REGISTRY);

//   function handleDragStart(type: string) {
//     return (e: React.DragEvent) => {
//       const payload = { type };
//       e.dataTransfer.setData("application/superbuild-node", JSON.stringify(payload));
//       (window as any).__SB_DRAGGING = payload;
//       e.dataTransfer.effectAllowed = "copy";
//     };
//   }

//   function handleDragEnd() {
//     // cleanup fallback
//     (window as any).__SB_DRAGGING = null;
//   }

//   return (
//     <aside
//       className="
//         fixed left-6 top-6 bottom-6 z-50 w-72
//         rounded-2xl bg-neutral-900/60 backdrop-blur-md
//         border border-neutral-700/30 shadow-2xl
//         p-4 overflow-auto
//       "
//       aria-label="component-bar"
//     >
//       <div className="flex flex-col gap-3">
//         <h2 className="text-lg font-semibold text-white/95">Components</h2>

//         <div className="mt-2 flex flex-col gap-2">
//           {entries.map(([key, entry]) => (
//             <div
//               key={key}
//               draggable
//               onDragStart={handleDragStart(key)}
//               onDragEnd={handleDragEnd}
//               className="
//                 flex items-center gap-3
//                 bg-neutral-800/60 hover:bg-neutral-800/80
//                 border border-white/5 rounded-lg
//                 p-3 cursor-grab select-none transition
//               "
//               title={entry.displayName}
//             >
//               <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/90">
//                 {entry.preview ? <entry.preview /> : <span>{entry.icon ?? "⬚"}</span>}
//               </div>

//               <div className="flex flex-col leading-tight">
//                 <span className="text-sm text-white/90">{entry.displayName}</span>
//                 <span className="text-[11px] text-white/50">{key}</span>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </aside>
//   );
// }

// export default ComponentBar;



import React from "react";
import REGISTRY from "../renderer/registry";

export function ComponentBar() {
  const entries = React.useMemo(() => {
    // stable order (nice UX + predictable tests)
    return Object.entries(REGISTRY).sort(([a], [b]) => a.localeCompare(b));
  }, []);

  function onDragStart(type: string) {
    return (e: React.DragEvent) => {
      const payload = { type };

      // robust drag payload (primary)
      try {
        e.dataTransfer.setData("application/superbuild-node", JSON.stringify(payload));
      } catch {}

      // Safari / older fallback
      try {
        e.dataTransfer.setData("text/plain", type);
      } catch {}

      // global fallback if dataTransfer is blocked
      (window as any).__SB_DRAGGING = payload;

      e.dataTransfer.effectAllowed = "copy";
    };
  }

  function onDragEnd() {
    (window as any).__SB_DRAGGING = null;
  }

  return (
    <aside
      className="
        fixed left-6 top-6 bottom-6 z-50 w-72
        rounded-2xl bg-neutral-900/60 backdrop-blur-md
        border border-neutral-700/30 shadow-2xl
        p-4 overflow-auto
      "
      aria-label="component-bar"
    >
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-white/95">Components</h2>

        <div className="mt-2 flex flex-col gap-2">
          {entries.map(([key, entry]) => (
            <div
              key={key}
              draggable
              onDragStart={onDragStart(key)}
              onDragEnd={onDragEnd}
              className="
                group flex items-center gap-3
                bg-neutral-800/60 hover:bg-neutral-800/80
                border border-white/5 rounded-lg
                p-3 cursor-grab select-none transition
              "
              title={entry.displayName}
              role="button"
              aria-label={`palette-${key}`}
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/90">
                {entry.preview ? <entry.preview /> : <span>{entry.icon ?? "⬚"}</span>}
              </div>

              <div className="flex flex-col leading-tight">
                <span className="text-sm text-white/90">{entry.displayName}</span>
                <span className="text-[11px] text-white/50">{key}</span>
              </div>

              <div className="ml-auto text-[10px] text-white/35 opacity-0 group-hover:opacity-100 transition">
                drag →
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default ComponentBar;
