import React from "react";

export type CardProps = {
  title?: string;
  body?: string;
};

export default function Card({ title = "Card title", body = "This is a card body." }: CardProps) {
  return (
    <div className="w-full h-full rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-2 text-xs text-slate-600 leading-relaxed">{body}</div>
    </div>
  );
}
