import React from "react";

export type InputProps = {
  placeholder?: string;
  label?: string;
};

export default function Input({ placeholder = "Type here...", label = "Label" }: InputProps) {
  return (
    <div className="w-full h-full flex flex-col gap-2">
      <div className="text-xs font-medium text-slate-700">{label}</div>
      <input
        className="w-full flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
      />
    </div>
  );
}
