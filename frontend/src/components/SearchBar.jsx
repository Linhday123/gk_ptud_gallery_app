import React from "react";

export default function SearchBar({ value, onChange, disabled }) {
  return (
    <div className="relative w-full">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Tim theo ten anh..."
        className="field pr-14 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        Tim
      </div>
    </div>
  );
}
