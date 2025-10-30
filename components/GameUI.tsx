"use client";

import React from "react";

export function GameButton({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={[
        "inline-flex items-center justify-center",
        "px-5 py-2",
        "rounded-2xl",
        "font-extrabold tracking-wide",
        "text-white",
        "bg-gradient-to-b from-emerald-400 to-emerald-600",
        "shadow-[0_6px_0_#0f5132] hover:translate-y-[1px] active:translate-y-[2px]",
        "hover:shadow-[0_5px_0_#0f5132] active:shadow-[0_4px_0_#0f5132]",
        "border-4 border-white/60",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function GameCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={[
        "rounded-3xl",
        "p-4",
        "bg-gradient-to-br from-sky-400 to-blue-500",
        "text-white",
        "border-4 border-white/60",
        "shadow-xl",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function GameRadio({ checked, children, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { children?: React.ReactNode }) {
  return (
    <label className={["flex items-center gap-2 cursor-pointer select-none", className].join(" ")}> 
      <input type="radio" {...props} className="sr-only" />
      <span className={["w-5 h-5 rounded-full border-4 border-white/70", checked ? "bg-white" : "bg-white/20"].join(" ")}></span>
      <span className="text-sm font-bold text-white drop-shadow">{children}</span>
    </label>
  );
}

export function GameModal({
  open,
  onClose,
  title,
  children,
  right,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  right?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-5xl">
        <div className="grid md:grid-cols-2 gap-0 rounded-[28px] overflow-hidden border-4 border-white/70 shadow-2xl">
          {/* Left content */}
          <div className="bg-gradient-to-b from-yellow-200 via-yellow-300 to-yellow-400 p-6 min-h-[280px]">
            {title && <h3 className="text-2xl md:text-3xl font-extrabold text-emerald-700 drop-shadow mb-4">{title}</h3>}
            <div className="pr-2 max-h-[60vh] md:max-h-[70vh] overflow-auto custom-scroll">
              {children}
            </div>
          </div>
          {/* Right content */}
          <div className="bg-gradient-to-b from-sky-300 to-blue-500 p-6 flex flex-col gap-3 max-h-[70vh] overflow-auto custom-scroll">
            {right}
          </div>
        </div>
      </div>
    </div>
  );
}

export function GameBadge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={["inline-block px-3 py-1 rounded-full bg-white/30 text-white font-extrabold border-2 border-white/60", className].join(" ")}>{children}</span>
  );
}

