import React from "react";

export type NavbarProps = {
  brand?: string;
  item1?: string;
  item2?: string;
  item3?: string;
};

export default function Navbar({
  brand = "SuperBuild",
  item1 = "Home",
  item2 = "Docs",
  item3 = "Pricing",
}: NavbarProps) {
  return (
    <div className="w-full h-full rounded-2xl bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
      <div className="text-sm font-semibold">{brand}</div>
      <div className="flex items-center gap-4 text-xs text-white/80">
        <span>{item1}</span>
        <span>{item2}</span>
        <span>{item3}</span>
      </div>
    </div>
  );
}
