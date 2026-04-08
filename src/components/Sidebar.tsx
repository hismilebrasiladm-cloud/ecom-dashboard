"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Overview", icon: "chart" },
  { href: "/closers", label: "Closers", icon: "users" },
  { href: "/inside", label: "Inside Sales", icon: "headphones" },
  { href: "/sdrs", label: "SDRs", icon: "phone" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-[#0a0a0a] border-r border-[#1c1c1c] flex flex-col z-50">
      <div className="p-5 border-b border-[#1c1c1c]">
        <div className="text-[9px] font-bold tracking-[.35em] uppercase text-[#F5A623]/50 mb-1">
          bottrel
        </div>
        <div className="text-sm font-bold text-[#F0F0F0] tracking-wide">
          COMERCIAL
        </div>
      </div>

      <nav className="flex-1 py-4">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-2.5 text-xs font-semibold tracking-wide uppercase transition-colors ${
                active
                  ? "text-[#F5A623] bg-[#F5A623]/10 border-r-2 border-[#F5A623]"
                  : "text-[#555] hover:text-[#888] hover:bg-white/[.02]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#1c1c1c]">
        <div className="text-[8px] font-bold tracking-[.2em] uppercase text-[#333]">
          Meta 2026
        </div>
        <div className="text-lg font-black text-[#F5A623]">R$20MM</div>
      </div>
    </aside>
  );
}
