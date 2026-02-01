// import React from "react";

// type Props = {
//   label?: string;
//   variant?: "primary" | "secondary";
//   onClick?: () => void;
// };

// export default function Button({
//   label = "Click",
//   variant = "primary",
// }: Props) {
//   const base =
//     "inline-flex items-center justify-center px-3 py-1 rounded-md font-medium select-none";
//   const cls =
//     variant === "primary"
//       ? `${base} bg-blue-600 text-white shadow-sm`
//       : `${base} border border-neutral-300 text-neutral-900 bg-white`;

//   return (
//     <button className={cls} onClick={() => {}}>
//       {label}
//     </button>
//   );
// }


import React from "react";

export type ButtonProps = {
  label?: string;
  variant?: "primary" | "secondary" | "ghost";
};

export default function Button({ label = "Click me", variant = "primary" }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[0.98] select-none";
  const styles: Record<string, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    secondary: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm",
    ghost: "bg-transparent text-slate-900 hover:bg-slate-100 border border-slate-200",
  };

  return (
    <button className={`${base} ${styles[variant]} w-full h-full`}>
      {label}
    </button>
  );
}
