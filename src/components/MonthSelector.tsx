"use client";
import { getMesLabel } from "@/lib/utils";

interface Props {
  meses: string[];
  selected: string;
  onChange: (mes: string) => void;
}

export default function MonthSelector({ meses, selected, onChange }: Props) {
  return (
    <div className="flex gap-1 flex-wrap">
      {meses.map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`px-3 py-1.5 rounded text-[10px] font-bold tracking-wide uppercase transition-colors ${
            m === selected
              ? "bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/40"
              : "bg-[#141414] text-[#555] border border-[#1c1c1c] hover:text-[#888]"
          }`}
        >
          {getMesLabel(m)}
        </button>
      ))}
    </div>
  );
}
