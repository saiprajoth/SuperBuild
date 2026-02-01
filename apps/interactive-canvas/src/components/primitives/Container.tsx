import React from "react";

export type ContainerProps = {
  padding?: number;
  bg?: string;
  radius?: number;
};

export default function Container({ padding = 12, bg = "#ffffff", radius = 16 }: ContainerProps) {
  return (
    <div
      className="w-full h-full border border-slate-200 shadow-sm"
      style={{ padding, background: bg, borderRadius: radius }}
    />
  );
}
