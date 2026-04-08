interface Props {
  value: number;
  max: number;
  color?: string;
}

export default function ProgressBar({ value, max, color = "#F5A623" }: Props) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="w-full bg-white/[.06] rounded-sm h-2 overflow-hidden">
      <div
        className="h-full rounded-sm transition-all duration-700"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
        }}
      />
    </div>
  );
}
