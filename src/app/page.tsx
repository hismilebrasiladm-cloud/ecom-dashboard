"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchGeral, fetchIndividual } from "@/lib/queries";
import { formatBRL, formatBRLFull, formatPct, getMesLabel } from "@/lib/utils";
import KPICard from "@/components/KPICard";
import ProgressBar from "@/components/ProgressBar";
import MonthSelector from "@/components/MonthSelector";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Line
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

interface IndRow {
  vendedor: string;
  equipe: string;
  valor_coletado: number;
  vendas: number;
  calls_agendadas: number;
  pct_meta: number;
  meta_individual: number;
  status_meta: string;
}

function getBusinessDaysRemaining(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  let count = 0;
  for (let d = now.getDate() + 1; d <= lastDay; d++) {
    const day = new Date(year, month, d).getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

function getBusinessDaysTotal(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  let count = 0;
  for (let d = 1; d <= lastDay; d++) {
    const day = new Date(year, month, d).getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

function getBusinessDaysElapsed(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  let count = 0;
  for (let d = 1; d <= now.getDate(); d++) {
    const day = new Date(year, month, d).getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

const medalColors = ["#F5A623", "#C0C0C0", "#CD7F32"];

function Top3Card({ title, accent, data, metricKey, formatFn }: {
  title: string;
  accent: string;
  data: IndRow[];
  metricKey: "valor_coletado" | "calls_agendadas";
  formatFn: (v: number) => string;
}) {
  return (
    <div className="bg-[#0f0f0f] border border-[#1c1c1c] rounded p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: accent }} />
      <div className="text-[8px] font-bold tracking-[.22em] uppercase mb-3" style={{ color: accent + "99" }}>
        {title}
      </div>
      {data.length === 0 && <div className="text-[11px] text-[#333]">Sem dados</div>}
      {data.slice(0, 3).map((r, i) => (
        <div key={r.vendedor} className="flex items-center justify-between py-2 border-b border-white/[.03] last:border-0">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
              style={{ background: medalColors[i] + "22", color: medalColors[i] }}>
              {i + 1}
            </div>
            <div>
              <div className="text-[12px] font-semibold text-[#F0F0F0]">{r.vendedor}</div>
              {r.meta_individual > 0 && (
                <div className="text-[9px] text-[#555]">{formatPct(r.pct_meta)} da meta</div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[14px] font-black" style={{ color: accent }}>
              {formatFn(r[metricKey])}
            </div>
            <div className="text-[9px] text-[#555]">
              {metricKey === "valor_coletado" ? `${r.vendas} vendas` : `${r.vendas} vendas geradas`}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Overview() {
  const [data, setData] = useState<GeralRow[]>([]);
  const [selected, setSelected] = useState("");
  const [acum, setAcum] = useState({ total: 0, closing: 0, inside: 0, pct: 0 });
  const [topClosers, setTopClosers] = useState<IndRow[]>([]);
  const [topInside, setTopInside] = useState<IndRow[]>([]);
  const [topSDRs, setTopSDRs] = useState<IndRow[]>([]);

  useEffect(() => {
    async function load() {
      const geral = await fetchGeral();

      if (geral && geral.length > 0) {
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
          const latestMes = withData[withData.length - 1].mes;
          setSelected(latestMes);
          loadTop3(latestMes);
        }

        const total2026 = parsed.filter((r) => r.mes >= "2026-01-01").reduce((s, r) => s + r.faturamento_total, 0);
        const clo2026 = parsed.filter((r) => r.mes >= "2026-01-01").reduce((s, r) => s + r.faturamento_closing, 0);
        const ins2026 = parsed.filter((r) => r.mes >= "2026-01-01").reduce((s, r) => s + r.faturamento_inside, 0);
        setAcum({ total: total2026, closing: clo2026, inside: ins2026, pct: (total2026 / 20_000_000) * 100 });
      }
    }

    async function loadTop3(mes: string) {
      const ind = await fetchIndividual(mes);
      if (ind) parseIndividuals(ind);
    }

    load();
  }, []);

  function parseIndividuals(ind: Record<string, unknown>[]) {
    const parsed = ind.map((r) => ({
      vendedor: String(r.vendedor),
      equipe: String(r.equipe),
      valor_coletado: Number(r.valor_coletado) || 0,
      vendas: Number(r.vendas) || 0,
      calls_agendadas: Number(r.calls_agendadas) || 0,
      pct_meta: Number(r.pct_meta) || 0,
      meta_individual: Number(r.meta_individual) || 0,
      status_meta: String(r.status_meta),
    }));
    setTopClosers(parsed.filter((r) => r.equipe === "closer").sort((a, b) => b.valor_coletado - a.valor_coletado));
    setTopInside(parsed.filter((r) => r.equipe === "inside").sort((a, b) => b.valor_coletado - a.valor_coletado));
    setTopSDRs(parsed.filter((r) => r.equipe === "sdr").sort((a, b) => b.calls_agendadas - a.calls_agendadas));
  }

  function handleMonthChange(mes: string) {
    setSelected(mes);
    fetchIndividual(mes).then((ind) => { if (ind) parseIndividuals(ind); });
  }

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

  // Daily targets
  const diasUteisRestantes = getBusinessDaysRemaining();
  const diasUteisTotal = getBusinessDaysTotal();
  const diasUteisPassados = getBusinessDaysElapsed();
  const faltaClosing = cur ? Math.max(0, cur.meta_closing - cur.faturamento_closing) : 0;
  const faltaInside = cur ? Math.max(0, cur.meta_inside - cur.faturamento_inside) : 0;
  const faltaTotal = faltaClosing + faltaInside;
  const metaSDRTotal = 880;
  const sdrAgendados = topSDRs.reduce((s, r) => s + r.calls_agendadas, 0);
  const faltaSDR = Math.max(0, metaSDRTotal - sdrAgendados);
  const diarioClosing = diasUteisRestantes > 0 ? faltaClosing / diasUteisRestantes : 0;
  const diarioInside = diasUteisRestantes > 0 ? faltaInside / diasUteisRestantes : 0;
  const diarioTotal = diarioClosing + diarioInside;
  const diarioSDR = diasUteisRestantes > 0 ? Math.ceil(faltaSDR / diasUteisRestantes) : 0;
  const pctClosing = cur && cur.meta_closing > 0 ? (cur.faturamento_closing / cur.meta_closing) * 100 : 0;
  const pctInside = cur && cur.meta_inside > 0 ? (cur.faturamento_inside / cur.meta_inside) * 100 : 0;
  const pctTotal = cur && cur.meta_total > 0 ? (cur.faturamento_total / cur.meta_total) * 100 : 0;
  const pctSDR = metaSDRTotal > 0 ? (sdrAgendados / metaSDRTotal) * 100 : 0;
  const pctTempo = diasUteisTotal > 0 ? (diasUteisPassados / diasUteisTotal) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[9px] font-bold tracking-[.35em] uppercase text-[#F5A623]/50 mb-1">
            bottrel · ecom club
          </div>
          <h1 className="text-xl font-black tracking-tight">Dashboard Comercial</h1>
        </div>
        <MonthSelector meses={mesesComDados} selected={selected} onChange={handleMonthChange} />
      </div>

      {/* BLOCO PRINCIPAL — O que falta por dia */}
      {cur && diasUteisRestantes > 0 && (
        <div className="bg-[#0f0f0f] border border-[#1c1c1c] rounded-lg p-6 mb-6">
          {/* Header com total e tempo */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="text-[9px] font-bold tracking-[.3em] uppercase text-[#E05050]/60 mb-1">
                Precisa faturar por dia util
              </div>
              <div className="text-5xl font-black text-[#F0F0F0]">
                {formatBRL(diarioTotal)}
                <span className="text-lg text-[#555] font-bold ml-2">/dia</span>
              </div>
              <div className="text-[11px] text-[#555] mt-1">
                Falta <span className="text-[#E05050] font-bold">{formatBRL(faltaTotal)}</span> em{" "}
                <span className="text-[#F0F0F0] font-bold">{diasUteisRestantes} dias uteis</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-bold tracking-[.2em] uppercase text-[#555] mb-1">
                Tempo do mes
              </div>
              <div className="text-2xl font-black text-[#F0F0F0]">
                {diasUteisPassados}<span className="text-[#555]">/{diasUteisTotal}</span>
              </div>
              <div className="text-[10px] text-[#555]">
                {formatPct(pctTempo)} do mes
              </div>
              <div className="w-32 mt-1">
                <ProgressBar value={diasUteisPassados} max={diasUteisTotal} color="#555" />
              </div>
            </div>
          </div>

          {/* 4 colunas: Closing, Inside, Total, SDR */}
          <div className="grid grid-cols-4 gap-4">
            {/* Closing */}
            <div className="bg-[#141414] rounded p-4 border border-[#1c1c1c]">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[8px] font-bold tracking-[.2em] uppercase text-[#F5A623]/60">Closing</div>
                <div className="text-[10px] font-bold" style={{ color: pctClosing >= pctTempo ? "#3DBA7A" : "#E05050" }}>
                  {formatPct(pctClosing)}
                </div>
              </div>
              <div className="text-2xl font-black text-[#F5A623] mb-1">{formatBRL(diarioClosing)}<span className="text-[11px] text-[#555] font-bold">/dia</span></div>
              <ProgressBar value={cur.faturamento_closing} max={cur.meta_closing} color="#F5A623" />
              <div className="flex justify-between mt-2 text-[9px]">
                <span className="text-[#555]">Feito: <span className="text-[#F5A623]">{formatBRL(cur.faturamento_closing)}</span></span>
                <span className="text-[#555]">Meta: {formatBRL(cur.meta_closing)}</span>
              </div>
              <div className="text-[9px] text-[#E05050] mt-1">Falta: {formatBRL(faltaClosing)}</div>
            </div>

            {/* Inside */}
            <div className="bg-[#141414] rounded p-4 border border-[#1c1c1c]">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[8px] font-bold tracking-[.2em] uppercase text-[#3DBA7A]/60">Inside</div>
                <div className="text-[10px] font-bold" style={{ color: pctInside >= pctTempo ? "#3DBA7A" : "#E05050" }}>
                  {formatPct(pctInside)}
                </div>
              </div>
              <div className="text-2xl font-black text-[#3DBA7A] mb-1">{formatBRL(diarioInside)}<span className="text-[11px] text-[#555] font-bold">/dia</span></div>
              <ProgressBar value={cur.faturamento_inside} max={cur.meta_inside} color="#3DBA7A" />
              <div className="flex justify-between mt-2 text-[9px]">
                <span className="text-[#555]">Feito: <span className="text-[#3DBA7A]">{formatBRL(cur.faturamento_inside)}</span></span>
                <span className="text-[#555]">Meta: {formatBRL(cur.meta_inside)}</span>
              </div>
              <div className="text-[9px] text-[#E05050] mt-1">Falta: {formatBRL(faltaInside)}</div>
            </div>

            {/* Total */}
            <div className="bg-[#141414] rounded p-4 border border-[#F5A623]/20">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[8px] font-bold tracking-[.2em] uppercase text-[#F0F0F0]/40">Total</div>
                <div className="text-[10px] font-bold" style={{ color: pctTotal >= pctTempo ? "#3DBA7A" : "#E05050" }}>
                  {formatPct(pctTotal)}
                </div>
              </div>
              <div className="text-2xl font-black text-[#F0F0F0] mb-1">{formatBRL(diarioTotal)}<span className="text-[11px] text-[#555] font-bold">/dia</span></div>
              <ProgressBar value={cur.faturamento_total} max={cur.meta_total} color="#F5A623" />
              <div className="flex justify-between mt-2 text-[9px]">
                <span className="text-[#555]">Feito: <span className="text-[#F5A623]">{formatBRL(cur.faturamento_total)}</span></span>
                <span className="text-[#555]">Meta: {formatBRL(cur.meta_total)}</span>
              </div>
              <div className="text-[9px] text-[#E05050] mt-1">Falta: {formatBRL(faltaTotal)}</div>
            </div>

            {/* SDR */}
            <div className="bg-[#141414] rounded p-4 border border-[#1c1c1c]">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[8px] font-bold tracking-[.2em] uppercase text-[#2DBFBF]/60">SDR</div>
                <div className="text-[10px] font-bold" style={{ color: pctSDR >= pctTempo ? "#3DBA7A" : "#E05050" }}>
                  {formatPct(pctSDR)}
                </div>
              </div>
              <div className="text-2xl font-black text-[#2DBFBF] mb-1">{diarioSDR}<span className="text-[11px] text-[#555] font-bold"> agend./dia</span></div>
              <ProgressBar value={sdrAgendados} max={metaSDRTotal} color="#2DBFBF" />
              <div className="flex justify-between mt-2 text-[9px]">
                <span className="text-[#555]">Feito: <span className="text-[#2DBFBF]">{sdrAgendados}</span></span>
                <span className="text-[#555]">Meta: {metaSDRTotal}</span>
              </div>
              <div className="text-[9px] text-[#E05050] mt-1">Falta: {faltaSDR} agend.</div>
            </div>
          </div>
        </div>
      )}

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
          <div className="text-[10px]"><span className="text-[#555]">Closing: </span><span className="text-[#F5A623] font-bold">{formatBRL(acum.closing)}</span></div>
          <div className="text-[10px]"><span className="text-[#555]">Inside: </span><span className="text-[#3DBA7A] font-bold">{formatBRL(acum.inside)}</span></div>
          <div className="text-[10px]"><span className="text-[#555]">Restante: </span><span className="text-[#2DBFBF] font-bold">{formatBRL(20_000_000 - acum.total)}</span></div>
        </div>
      </div>

      {/* KPIs do mês */}
      {cur && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          <KPICard label="Faturamento" value={formatBRL(cur.faturamento_total)} accent="gold" sub={`Meta: ${formatBRL(cur.meta_total)}`} />
          <KPICard label="Closing" value={formatBRL(cur.faturamento_closing)} accent="blue" sub={`Meta: ${formatBRL(cur.meta_closing)}`} />
          <KPICard label="Inside" value={formatBRL(cur.faturamento_inside)} accent="green" sub={`Meta: ${formatBRL(cur.meta_inside)}`} />
          <KPICard label="Vendas" value={String(cur.vendas_totais)} accent="white" />
          <KPICard label="TMF Closing" value={formatBRLFull(cur.closing_tmf)} accent="gold" />
          <KPICard label="% Meta" value={formatPct(cur.pct_meta_total)} accent={cur.pct_meta_total >= 80 ? "green" : cur.pct_meta_total >= 50 ? "gold" : "red"} />
        </div>
      )}

      {/* TOP 3 por área */}
      <div className="text-[8px] font-bold tracking-[.25em] uppercase text-[#555] mb-3 pb-2 border-b border-[#1c1c1c]">
        Top 3 — {getMesLabel(selected)}
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Top3Card title="Closers" accent="#F5A623" data={topClosers} metricKey="valor_coletado" formatFn={formatBRL} />
        <Top3Card title="Inside Sales" accent="#3DBA7A" data={topInside} metricKey="valor_coletado" formatFn={formatBRL} />
        <Top3Card title="SDRs" accent="#2DBFBF" data={topSDRs} metricKey="calls_agendadas" formatFn={(v) => `${v} calls`} />
      </div>

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
