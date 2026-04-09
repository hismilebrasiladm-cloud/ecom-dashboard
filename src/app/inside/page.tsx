"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatBRL, getMesLabel } from "@/lib/utils";
import KPICard from "@/components/KPICard";
import MonthSelector from "@/components/MonthSelector";
import RankingTable from "@/components/RankingTable";

async function fetchAll(equipe: string) {
  const { data, error } = await supabase
    .from("view_performance_individual")
    .select("*")
    .eq("equipe", equipe)
    .order("mes", { ascending: true });
  if (!error && data && data.length > 0) return data;
  const { data: fb } = await supabase
    .from("performance_comercial")
    .select("*")
    .eq("equipe", equipe)
    .order("mes", { ascending: true });
  return fb || [];
}

export default function InsidePage() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [meses, setMeses] = useState<string[]>([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    async function load() {
      const rows = await fetchAll("inside");
      if (rows) {
        setData(rows);
        const uniqueMeses = [...new Set(rows.map((r: Record<string, unknown>) => r.mes as string))];
        setMeses(uniqueMeses);
        if (uniqueMeses.length > 0) setSelected(uniqueMeses[uniqueMeses.length - 1]);
      }
    }
    load();
  }, []);

  const filtered = data
    .filter((r) => r.mes === selected)
    .map((r) => ({
      vendedor: String(r.vendedor),
      valor_coletado: Number(r.valor_coletado) || 0,
      inside_planos: Number(r.inside_planos) || 0,
      inside_assiny: Number(r.inside_assiny) || 0,
      vendas: Number(r.vendas) || 0,
      tmf: Number(r.tmf || (Number(r.vendas) > 0 ? Number(r.valor_coletado) / Number(r.vendas) : 0)),
      conv_pct: 0, show_pct: 0, tmf_reuniao: 0,
      pct_meta: Number(r.pct_meta || (Number(r.meta_individual) > 0 ? Number(r.valor_coletado) / Number(r.meta_individual) * 100 : 0)),
      meta_individual: Number(r.meta_individual) || 0,
      status_meta: String(r.status_meta || "sem_meta"),
      negocios_trabalhados: Number(r.negocios_trabalhados) || 0,
      conv_negocios_pct: Number(r.conv_negocios_pct || (Number(r.negocios_trabalhados) > 0 ? Number(r.vendas) / Number(r.negocios_trabalhados) * 100 : 0)),
    }))
    .sort((a, b) => b.valor_coletado - a.valor_coletado);

  const totalFat = filtered.reduce((s, r) => s + r.valor_coletado, 0);
  const totalPlanos = filtered.reduce((s, r) => s + r.inside_planos, 0);
  const totalAssiny = filtered.reduce((s, r) => s + r.inside_assiny, 0);
  const totalVendas = filtered.reduce((s, r) => s + r.vendas, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[9px] font-bold tracking-[.35em] uppercase text-[#3DBA7A]/50 mb-1">inside sales</div>
          <h1 className="text-xl font-black tracking-tight">Inside Sales</h1>
        </div>
        <MonthSelector meses={meses} selected={selected} onChange={setSelected} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard label="Faturamento" value={formatBRL(totalFat)} accent="green" />
        <KPICard label="Planos (Wix)" value={formatBRL(totalPlanos)} accent="blue" />
        <KPICard label="Assiny" value={formatBRL(totalAssiny)} accent="teal" />
        <KPICard label="Vendas" value={String(totalVendas)} accent="white" />
      </div>

      <div className="bg-[#0f0f0f] border border-[#1c1c1c] rounded p-4">
        <div className="text-[8px] font-bold tracking-[.22em] uppercase text-[#555] mb-3">
          Ranking {selected ? getMesLabel(selected) : ""}
        </div>
        <RankingTable data={filtered} equipe="inside" />
      </div>
    </div>
  );
}
