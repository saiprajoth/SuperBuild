import React from "react";

export type ListProps = {
  title?: string;
  i1?: string;
  i2?: string;
  i3?: string;
};

export default function List({ title = "List", i1 = "Item 1", i2 = "Item 2", i3 = "Item 3" }: ListProps) {
  return (
    <div className="w-full h-full rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <ul className="mt-2 text-xs text-slate-700 space-y-1 list-disc pl-4">
        <li>{i1}</li>
        <li>{i2}</li>
        <li>{i3}</li>
      </ul>
    </div>
  );
}
