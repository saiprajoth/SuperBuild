import React from "react";

export type FormProps = {
  title?: string;
  cta?: string;
};

export default function Form({ title = "Sign up", cta = "Create account" }: FormProps) {
  return (
    <div className="w-full h-full rounded-2xl bg-white border border-slate-200 shadow-sm p-4 flex flex-col gap-3">
      <div className="text-sm font-semibold text-slate-900">{title}</div>

      <input
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Email"
      />
      <input
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Password"
        type="password"
      />

      <button className="mt-auto rounded-xl bg-blue-600 text-white py-2 text-sm font-semibold hover:bg-blue-700">
        {cta}
      </button>
    </div>
  );
}
