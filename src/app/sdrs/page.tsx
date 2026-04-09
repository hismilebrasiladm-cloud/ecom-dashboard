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

export default function SDRsPage() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [meses, setMeses] = useState<string[]>([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    async function load() {
      const rows = await fetchAll("sdr");
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
      vendas: Number(r.vendas) || 0,
      tmf: 0, conv_pct: 0, show_pct: 0, tmf_reuniao: 0,
      pct_meta: Number(r.pct_meta || (Number(r.meta_individual) > 0 ? Number(r.calls_agendadas) / Number(r.meta_individual) * 100 : 0)),
      meta_individual: Number(r.meta_individual) || 0,
      status_meta: String(r.status_meta || "sem_meta"),
      calls_agendadas: Number(r.calls_agendadas) || 0,
      calls_realizadas: Number(r.calls_realizadas) || 0,
      negocios_trabalhados: 0,
    }))
    .sort((a, b) => b.calls_agendadas - a.calls_agendadas);

  const totalValor = filtered.reduce((s, r) => s + r.valor_coletado, 0);
  const totalAgendadas = filtered.reduce((s, r) => s + r.calls_agendadas, 0);
  const totalRealizadas = filtered.reduce((s, r) => s + r.calls_realizadas, 0);
  const totalVendas = filtered.reduce((s, r) => s + r.vendas, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[9px] font-bold tracking-[.35em] uppercase text-[#2DBFBF]/50 mb-1">pre-vendas</div>
          <h1 className="text-xl font-black tracking-tight">SDRs</h1>
        </div>
        <MonthSelector meses={meses} selected={selected} onChange={setSelected} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard label="Valor Gerado" value={formatBRL(totalValor)} accent="teal" />
        <KPICard label="Calls Agendadas" value={String(totalAgendadas)} accent="gold" />
        <KPICard label="Calls Realizadas" value={String(totalRealizadas)} accent="white" />
        <KPICard label="Vendas Geradas" value={String(totalVendas)} accent="green" />
      </div>

      <div className="bg-[#0f0f0f] border border-[#1c1c1c] rounded p-4">
        <div className="text-[8px] font-bold tracking-[.22em] uppercase text-[#555] mb-3">
          Ranking {selected ? getMesLabel(selected) : ""}
        </div>
        <RankingTable data={filtered} equipe="sdr" />
      </div>
    </div>
  );
}
