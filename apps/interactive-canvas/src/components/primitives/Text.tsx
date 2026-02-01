import React from "react";

export type TextProps = {
  text?: string;
  size?: number;
  weight?: number;
  color?: string;
  align?: "left" | "center" | "right";
};

export default function Text({
  text = "Heading",
  size = 18,
  weight = 700,
  color = "#0f172a",
  align = "left",
}: TextProps) {
  return (
    <div
      style={{
        fontSize: size,
        fontWeight: weight as any,
        color,
        textAlign: align as any,
        lineHeight: 1.15,
      }}
      className="w-full"
    >
      {text}
    </div>
  );
}
