interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  accent?: "gold" | "green" | "teal" | "red" | "blue" | "white";
}

const accentColors = {
  gold: "#F5A623",
  green: "#3DBA7A",
  teal: "#2DBFBF",
  red: "#E05050",
  blue: "#5B8DEF",
  white: "#F0F0F0",
};

export default function KPICard({ label, value, sub, accent = "gold" }: KPICardProps) {
  const color = accentColors[accent];
  return (
    <div className="bg-[#0f0f0f] border border-[#1c1c1c] rounded p-4 relative overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: color }}
      />
      <div className="text-[8px] font-bold tracking-[.2em] uppercase text-[#555] mb-1">
        {label}
      </div>
      <div className="text-2xl font-black leading-none" style={{ color }}>
        {value}
      </div>
      {sub && <div className="text-[10px] text-[#555] mt-1">{sub}</div>}
    </div>
  );
}
