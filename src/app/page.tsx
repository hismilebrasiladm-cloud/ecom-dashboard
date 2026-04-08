"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatBRL, formatBRLFull, formatPct, getMesLabel } from "@/lib/utils";
import KPICard from "@/components/KPICard";
import ProgressBar from "@/components/ProgressBar";
import MonthSelector from "@/components/MonthSelector";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line
} from "recharts";

interface GeralRow {
  mes: string;
  faturamento_total: number;
  faturamento_closing: number;
  faturamento_inside: number;
  inside_planos: number;
  inside_assiny: number;
  vendas_totais: number;
  closing_conv_pct: number;
  closing_show_pct: number;
  closing_tmf: number;
  closing_tmf_reuniao: number;
  media_por_closer: number;
  media_por_inside: number;
  meta_total: number;
  meta_closing: number;
  meta_inside: number;
  pct_meta_total: number;
  projecao_total: number;
  pct_projecao: number;
  qtd_closers: number;
  qtd_sdrs: number;
  qtd_inside: number;
}

export default function Overview() {
  const [data, setData] = useState<GeralRow[]>([]);
  const [selected, setSelected] = useState("");
  const [acum, setAcum] = useState({ total: 0, closing: 0, inside: 0, pct: 0 });

  useEffect(() => {
    async function load() {
      const { data: geral } = await supabase
        .from("view_performance_geral")
        .select("*")
        .gte("mes", "2025-11-01")
        .lte("mes", "2026-12-01")
        .order("mes");

      if (geral) {
        const parsed = geral.map((r: Record<string, unknown>) => ({
          ...r,
          faturamento_total: Number(r.faturamento_total) || 0,
          faturamento_closing: Number(r.faturamento_closing) || 0,
          faturamento_inside: Number(r.faturamento_inside) || 0,
          inside_planos: Number(r.inside_planos) || 0,
          inside_assiny: Number(r.inside_assiny) || 0,
          vendas_totais: Number(r.vendas_totais) || 0,
          closing_conv_pct: Number(r.closing_conv_pct) || 0,
          closing_show_pct: Number(r.closing_show_pct) || 0,
          closing_tmf: Number(r.closing_tmf) || 0,
          closing_tmf_reuniao: Number(r.closing_tmf_reuniao) || 0,
          media_por_closer: Number(r.media_por_closer) || 0,
          media_por_inside: Number(r.media_por_inside) || 0,
          meta_total: Number(r.meta_total) || 0,
          meta_closing: Number(r.meta_closing) || 0,
          meta_inside: Number(r.meta_inside) || 0,
          pct_meta_total: Number(r.pct_meta_total) || 0,
          projecao_total: Number(r.projecao_total) || 0,
          pct_projecao: Number(r.pct_projecao) || 0,
          qtd_closers: Number(r.qtd_closers) || 0,
          qtd_sdrs: Number(r.qtd_sdrs) || 0,
          qtd_inside: Number(r.qtd_inside) || 0,
        })) as GeralRow[];
        setData(parsed);

        const withData = parsed.filter((r) => r.faturamento_total > 0);
        if (withData.length > 0) {
          setSelected(withData[withData.length - 1].mes);
        }

        const total2026 = parsed
          .filter((r) => r.mes >= "2026-01-01")
          .reduce((s, r) => s + r.faturamento_total, 0);
        const clo2026 = parsed
          .filter((r) => r.mes >= "2026-01-01")
          .reduce((s, r) => s + r.faturamento_closing, 0);
        const ins2026 = parsed
          .filter((r) => r.mes >= "2026-01-01")
          .reduce((s, r) => s + r.faturamento_inside, 0);
        setAcum({
          total: total2026,
          closing: clo2026,
          inside: ins2026,
          pct: (total2026 / 20_000_000) * 100,
        });
      }
    }
    load();
  }, []);

  const cur = data.find((r) => r.mes === selected);
  const mesesComDados = data.filter((r) => r.faturamento_total > 0).map((r) => r.mes);

  const chartData = data
    .filter((r) => r.faturamento_total > 0 || r.meta_total > 0)
    .filter((r) => r.mes <= "2026-06-01")
    .map((r) => ({
      mes: getMesLabel(r.mes),
      Closing: Math.round(r.faturamento_closing / 1000),
      Inside: Math.round(r.faturamento_inside / 1000),
      Meta: Math.round(r.meta_total / 1000),
    }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[9px] font-bold tracking-[.35em] uppercase text-[#F5A623]/50 mb-1">
            bottrel · ecom club
          </div>
          <h1 className="text-xl font-black tracking-tight">Dashboard Comercial</h1>
        </div>
        <MonthSelector meses={mesesComDados} selected={selected} onChange={setSelected} />
      </div>

      {/* Meta Anual */}
      <div className="bg-[#F5A623]/[.04] border border-[#F5A623]/20 rounded p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[9px] font-bold tracking-[.3em] uppercase text-[#F5A623]/50">Meta Anual 2026</div>
            <div className="text-4xl font-black text-[#F5A623]">R$20<span className="text-xl opacity-50">MM</span></div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-[#3DBA7A]">{formatBRL(acum.total)}</div>
            <div className="text-[10px] text-[#555]">{acum.pct.toFixed(1)}% concluido</div>
          </div>
        </div>
        <ProgressBar value={acum.total} max={20_000_000} />
        <div className="flex gap-6 mt-3">
          <div className="text-[10px]">
            <span className="text-[#555]">Closing: </span>
            <span className="text-[#F5A623] font-bold">{formatBRL(acum.closing)}</span>
          </div>
          <div className="text-[10px]">
            <span className="text-[#555]">Inside: </span>
            <span className="text-[#3DBA7A] font-bold">{formatBRL(acum.inside)}</span>
          </div>
          <div className="text-[10px]">
            <span className="text-[#555]">Restante: </span>
            <span className="text-[#2DBFBF] font-bold">{formatBRL(20_000_000 - acum.total)}</span>
          </div>
        </div>
      </div>

      {/* KPIs do mês selecionado */}
      {cur && (
        <>
          <div className="text-[8px] font-bold tracking-[.25em] uppercase text-[#555] mb-3 pb-2 border-b border-[#1c1c1c]">
            {getMesLabel(selected)} — Resumo
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
            <KPICard label="Faturamento" value={formatBRL(cur.faturamento_total)} accent="gold" sub={`Meta: ${formatBRL(cur.meta_total)}`} />
            <KPICard label="Closing" value={formatBRL(cur.faturamento_closing)} accent="blue" sub={`${formatPct(cur.pct_meta_total)} da meta`} />
            <KPICard label="Inside" value={formatBRL(cur.faturamento_inside)} accent="green" sub={`Planos ${formatBRL(cur.inside_planos)} · Assiny ${formatBRL(cur.inside_assiny)}`} />
            <KPICard label="Vendas" value={String(cur.vendas_totais)} accent="white" />
            <KPICard label="TMF Closing" value={formatBRLFull(cur.closing_tmf)} accent="gold" />
            <KPICard label="R$/Closer" value={formatBRL(cur.media_por_closer)} accent="teal" sub={`${cur.qtd_closers} closers`} />
          </div>
        </>
      )}

      {/* Chart */}
      <div className="bg-[#0f0f0f] border border-[#1c1c1c] rounded p-4 mb-6">
        <div className="text-[8px] font-bold tracking-[.22em] uppercase text-[#555] mb-4">
          Faturamento Mensal (R$k)
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1c" />
            <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "#555" }} />
            <YAxis tick={{ fontSize: 10, fill: "#555" }} />
            <Tooltip
              contentStyle={{ background: "#141414", border: "1px solid #1c1c1c", borderRadius: 4, fontSize: 11 }}
              labelStyle={{ color: "#F0F0F0" }}
            />
            <Bar dataKey="Closing" fill="#F5A623" stackId="a" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Inside" fill="#3DBA7A" stackId="a" radius={[2, 2, 0, 0]} />
            <Line type="monotone" dataKey="Meta" stroke="#2DBFBF" strokeWidth={2} strokeDasharray="5 3" dot={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
