import React from "react";

export type SidebarProps = {
  title?: string;
  a?: string;
  b?: string;
  c?: string;
};

export default function Sidebar({ title = "Menu", a = "Dashboard", b = "Projects", c = "Settings" }: SidebarProps) {
  return (
    <div className="w-full h-full rounded-2xl bg-white border border-slate-200 shadow-sm p-3">
      <div className="text-xs font-semibold text-slate-900 mb-2">{title}</div>
      <div className="space-y-2 text-xs text-slate-700">
        <div className="rounded-xl px-3 py-2 bg-slate-100">{a}</div>
        <div className="rounded-xl px-3 py-2 hover:bg-slate-50">{b}</div>
        <div className="rounded-xl px-3 py-2 hover:bg-slate-50">{c}</div>
      </div>
    </div>
  );
}
