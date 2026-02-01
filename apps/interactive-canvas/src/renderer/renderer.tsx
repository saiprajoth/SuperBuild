
// import React from "react";
// import type { CanvasElementData } from "../App";
// import { CanvasElement } from "../components/CanvasElement";
// import { REGISTRY } from "./registry";

// type Props = {
//   nodes: CanvasElementData[];
//   mode?: "editor" | "preview";
//   selectedIds: string[];
//   setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
//   setElements: React.Dispatch<React.SetStateAction<CanvasElementData[]>>;
//   viewportScale: number;
// };

// export function Renderer({
//   nodes,
//   mode = "editor",
//   selectedIds,
//   setSelectedIds,
//   setElements,
//   viewportScale,
// }: Props) {
//   // In editor mode, wrap with CanvasElement so drag/resize/selection works.
//   // In preview mode, we render primitives plainly (no pointer handlers).
//   if (mode === "editor") {
//     return (
//       <>
//         {nodes.map((n) => (
//           <CanvasElement
//             key={n.id}
//             {...n}
//             viewportScale={viewportScale}
//             selectedIds={selectedIds}
//             setSelectedIds={setSelectedIds}
//             setElements={setElements}
//           />
//         ))}
//       </>
//     );
//   }

//   // preview
//   return (
//     <>
//       {nodes.map((n) => {
//         const entry = REGISTRY[n.type];
//         const Primitive = entry?.component;
//         const props = entry?.defaultProps ?? {};
//         const style: React.CSSProperties = {
//           position: "absolute",
//           left: n.x,
//           top: n.y,
//           width: n.width,
//           height: n.height,
//           overflow: "hidden",
//         };

//         return (
//           <div key={n.id} style={style}>
//             {Primitive ? <Primitive {...(n as any).props} {...props} /> : <div>{n.type}</div>}
//           </div>
//         );
//       })}
//     </>
//   );
// }



// src/renderer/renderer.tsx
import React from "react";
import { REGISTRY } from "./registry";

export type RenderMode = "editor" | "preview";

export type CanvasNode = {
  id: string;
  type: string;
  props?: Record<string, any>;
  children?: CanvasNode[];
};

function mergeProps(entry: any, props?: Record<string, any>) {
  const base = entry?.defaultProps ?? {};
  return { ...base, ...(props ?? {}) };
}

function canRenderChildren(entry: any, children?: CanvasNode[]) {
  if (!children || children.length === 0) return false;
  const allow = entry?.allowedChildren;
  if (!allow) return false;
  if (allow === "any") return true;
  // allow is string[]
  return children.every((c) => allow.includes(c.type));
}

export const Renderer = React.memo(function Renderer({
  node,
  mode = "editor",
}: {
  node: CanvasNode;
  mode?: RenderMode;
}) {
  const entry = REGISTRY[node.type];

  if (!entry || !entry.component) {
    return (
      <div
        className="w-full h-full rounded-md bg-red-50 text-red-700 text-xs p-2"
        style={{ border: "1px solid rgba(239,68,68,0.3)" }}
      >
        Unknown component: <b>{node.type}</b>
      </div>
    );
  }

  const Comp = entry.component as React.ComponentType<any>;
  const merged = mergeProps(entry, node.props);

  // In editor mode we usually disable pointer events in CanvasElement to keep
  // selection/drag stable. So renderer stays pure.
  const childOk = canRenderChildren(entry, node.children);

  if (childOk) {
    return (
      <Comp {...merged}>
        {node.children!.map((c) => (
          <Renderer key={c.id} node={c} mode={mode} />
        ))}
      </Comp>
    );
  }

  return <Comp {...merged} />;
});
