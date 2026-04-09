"use client";
import { useEffect, useState } from "react";
import { fetchGeral, fetchIndividual } from "@/lib/queries";
import { formatBRL, formatBRLFull, formatPct, getMesLabel } from "@/lib/utils";
import ProgressBar from "@/components/ProgressBar";
import MonthSelector from "@/components/MonthSelector";

interface GeralRow {
  mes: string;
  faturamento_total: number;
  faturamento_closing: number;
  faturamento_inside: number;
  vendas_totais: number;
  closing_tmf: number;
  meta_total: number;
  meta_closing: number;
  meta_inside: number;
  pct_meta_total: number;
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
  meta_individual: number;
  pct_meta: number;
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

export default function Overview() {
  const [data, setData] = useState<GeralRow[]>([]);
  const [selected, setSelected] = useState("");
  const [acum, setAcum] = useState({ total: 0, closing: 0, inside: 0, pct: 0 });
  const [closers, setClosers] = useState<IndRow[]>([]);
  const [inside, setInside] = useState<IndRow[]>([]);
  const [sdrs, setSDRs] = useState<IndRow[]>([]);

  useEffect(() => {
    async function load() {
      const geral = await fetchGeral();
      if (geral && geral.length > 0) {
        const parsed = geral.map((r: Record<string, unknown>) => ({
          mes: String(r.mes),
          faturamento_total: Number(r.faturamento_total) || 0,
          faturamento_closing: Number(r.faturamento_closing) || 0,
          faturamento_inside: Number(r.faturamento_inside) || 0,
          vendas_totais: Number(r.vendas_totais) || 0,
          closing_tmf: Number(r.closing_tmf) || 0,
          meta_total: Number(r.meta_total) || 0,
          meta_closing: Number(r.meta_closing) || 0,
          meta_inside: Number(r.meta_inside) || 0,
          pct_meta_total: Number(r.pct_meta_total) || 0,
          qtd_closers: Number(r.qtd_closers) || 0,
          qtd_sdrs: Number(r.qtd_sdrs) || 0,
          qtd_inside: Number(r.qtd_inside) || 0,
        })) as GeralRow[];
        setData(parsed);

        const withData = parsed.filter((r) => r.faturamento_total > 0);
        if (withData.length > 0) {
          const latest = withData[withData.length - 1].mes;
          setSelected(latest);
          loadInd(latest);
        }

        const t26 = parsed.filter((r) => r.mes >= "2026-01-01");
        setAcum({
          total: t26.reduce((s, r) => s + r.faturamento_total, 0),
          closing: t26.reduce((s, r) => s + r.faturamento_closing, 0),
          inside: t26.reduce((s, r) => s + r.faturamento_inside, 0),
          pct: (t26.reduce((s, r) => s + r.faturamento_total, 0) / 20_000_000) * 100,
        });
      }
    }
    load();
  }, []);

  async function loadInd(mes: string) {
    const ind = await fetchIndividual(mes);
    if (!ind) return;
    const p = ind.map((r: Record<string, unknown>) => ({
      vendedor: String(r.vendedor),
      equipe: String(r.equipe),
      valor_coletado: Number(r.valor_coletado) || 0,
      vendas: Number(r.vendas) || 0,
      calls_agendadas: Number(r.calls_agendadas) || 0,
      meta_individual: Number(r.meta_individual) || 0,
      pct_meta: Number(r.pct_meta) || 0,
    }));
    setClosers(p.filter((r: IndRow) => r.equipe === "closer").sort((a: IndRow, b: IndRow) => b.valor_coletado - a.valor_coletado));
    setInside(p.filter((r: IndRow) => r.equipe === "inside").sort((a: IndRow, b: IndRow) => b.valor_coletado - a.valor_coletado));
    setSDRs(p.filter((r: IndRow) => r.equipe === "sdr").sort((a: IndRow, b: IndRow) => b.calls_agendadas - a.calls_agendadas));
  }

  function handleMonth(mes: string) {
    setSelected(mes);
    loadInd(mes);
  }

  const cur = data.find((r) => r.mes === selected);
  const mesesComDados = data.filter((r) => r.faturamento_total > 0).map((r) => r.mes);

  // Cálculos diários
  const diasRestantes = getBusinessDaysRemaining();
  const diasTotal = getBusinessDaysTotal();
  const diasPassados = getBusinessDaysElapsed();
  const pctTempo = diasTotal > 0 ? (diasPassados / diasTotal) * 100 : 0;

  const faltaClosing = cur ? Math.max(0, cur.meta_closing - cur.faturamento_closing) : 0;
  const faltaInside = cur ? Math.max(0, cur.meta_inside - cur.faturamento_inside) : 0;
  const faltaTotal = faltaClosing + faltaInside;

  const metaSDR = 880;
  const sdrFeito = sdrs.reduce((s, r) => s + r.calls_agendadas, 0);
  const faltaSDR = Math.max(0, metaSDR - sdrFeito);

  const diarioClosing = diasRestantes > 0 ? faltaClosing / diasRestantes : 0;
  const diarioInside = diasRestantes > 0 ? faltaInside / diasRestantes : 0;
  const diarioTotal = diarioClosing + diarioInside;
  const diarioSDR = diasRestantes > 0 ? Math.ceil(faltaSDR / diasRestantes) : 0;

  // Diário por closer e por inside
  const qtdClosers = cur?.qtd_closers || closers.filter((c) => c.meta_individual > 0).length || 7;
  const qtdInside = cur?.qtd_inside || inside.filter((c) => c.meta_individual > 0).length || 8;
  const diarioPorCloser = qtdClosers > 0 ? diarioClosing / qtdClosers : 0;
  const diarioPorInside = qtdInside > 0 ? diarioInside / qtdInside : 0;
  const diarioPorSDR = sdrs.length > 0 ? diarioSDR : 0;

  const pctClosing = cur && cur.meta_closing > 0 ? (cur.faturamento_closing / cur.meta_closing) * 100 : 0;
  const pctInside = cur && cur.meta_inside > 0 ? (cur.faturamento_inside / cur.meta_inside) * 100 : 0;
  const pctTotal = cur && cur.meta_total > 0 ? (cur.faturamento_total / cur.meta_total) * 100 : 0;

  // TMF geral
  const tmfGeral = cur && cur.vendas_totais > 0 ? cur.faturamento_total / cur.vendas_totais : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[9px] font-bold tracking-[.35em] uppercase text-[#F5A623]/50 mb-1">bottrel · ecom club</div>
          <h1 className="text-xl font-black tracking-tight">Dashboard Comercial</h1>
        </div>
        <MonthSelector meses={mesesComDados} selected={selected} onChange={handleMonth} />
      </div>

      {/* ============================================ */}
      {/* 1. META ANUAL 2026 */}
      {/* ============================================ */}
      <div className="bg-[#F5A623]/[.04] border border-[#F5A623]/20 rounded-lg p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[9px] font-bold tracking-[.3em] uppercase text-[#F5A623]/50">Meta Anual 2026</div>
            <div className="text-4xl font-black text-[#F5A623]">R$20<span className="text-xl opacity-50">MM</span></div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-[#3DBA7A]">{formatBRL(acum.total)}</div>
            <div className="text-[11px] text-[#555]">{acum.pct.toFixed(1)}% concluido</div>
          </div>
        </div>
        <ProgressBar value={acum.total} max={20_000_000} />
        <div className="flex gap-8 mt-3">
          <div className="text-[11px]"><span className="text-[#555]">Closing: </span><span className="text-[#F5A623] font-bold">{formatBRL(acum.closing)}</span></div>
          <div className="text-[11px]"><span className="text-[#555]">Inside: </span><span className="text-[#3DBA7A] font-bold">{formatBRL(acum.inside)}</span></div>
          <div className="text-[11px]"><span className="text-[#555]">Restante: </span><span className="text-[#E05050] font-bold">{formatBRL(20_000_000 - acum.total)}</span></div>
        </div>
      </div>

      {cur && (
        <>
          {/* ============================================ */}
          {/* 2. FATURAMENTO MÊS — 3 cards grandes */}
          {/* ============================================ */}
          <div className="text-[8px] font-bold tracking-[.25em] uppercase text-[#555] mb-3 pb-2 border-b border-[#1c1c1c]">
            {getMesLabel(selected)} — Faturamento
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* TOTAL */}
            <div className="bg-[#0f0f0f] border border-[#F5A623]/20 rounded-lg p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#F5A623]" />
              <div className="text-[8px] font-bold tracking-[.2em] uppercase text-[#F5A623]/50 mb-1">Faturamento Total</div>
              <div className="text-3xl font-black text-[#F0F0F0]">{formatBRLFull(cur.faturamento_total)}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="text-[10px] text-[#555]">Meta: {formatBRL(cur.meta_total)}</div>
                <div className="text-[10px] font-bold" style={{ color: pctTotal >= pctTempo ? "#3DBA7A" : "#E05050" }}>
                  {formatPct(pctTotal)}
                </div>
              </div>
              <div className="mt-2"><ProgressBar value={cur.faturamento_total} max={cur.meta_total} color="#F5A623" /></div>
            </div>

            {/* CLOSING */}
            <div className="bg-[#0f0f0f] border border-[#1c1c1c] rounded-lg p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#5B8DEF]" />
              <div className="text-[8px] font-bold tracking-[.2em] uppercase text-[#5B8DEF]/50 mb-1">Closing</div>
              <div className="text-3xl font-black text-[#5B8DEF]">{formatBRLFull(cur.faturamento_closing)}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="text-[10px] text-[#555]">Meta: {formatBRL(cur.meta_closing)}</div>
                <div className="text-[10px] font-bold" style={{ color: pctClosing >= pctTempo ? "#3DBA7A" : "#E05050" }}>
                  {formatPct(pctClosing)}
                </div>
              </div>
              <div className="mt-2"><ProgressBar value={cur.faturamento_closing} max={cur.meta_closing} color="#5B8DEF" /></div>
            </div>

            {/* INSIDE */}
            <div className="bg-[#0f0f0f] border border-[#1c1c1c] rounded-lg p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#3DBA7A]" />
              <div className="text-[8px] font-bold tracking-[.2em] uppercase text-[#3DBA7A]/50 mb-1">Inside Sales</div>
              <div className="text-3xl font-black text-[#3DBA7A]">{formatBRLFull(cur.faturamento_inside)}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="text-[10px] text-[#555]">Meta: {formatBRL(cur.meta_inside)}</div>
                <div className="text-[10px] font-bold" style={{ color: pctInside >= pctTempo ? "#3DBA7A" : "#E05050" }}>
                  {formatPct(pctInside)}
                </div>
              </div>
              <div className="mt-2"><ProgressBar value={cur.faturamento_inside} max={cur.meta_inside} color="#3DBA7A" /></div>
            </div>
          </div>

          {/* ============================================ */}
          {/* 3. TMF GERAL + VENDAS */}
          {/* ============================================ */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-[#0f0f0f] border border-[#1c1c1c] rounded p-4">
              <div className="text-[8px] font-bold tracking-[.2em] uppercase text-[#F5A623]/50 mb-1">TMF Geral</div>
              <div className="text-2xl font-black text-[#F5A623]">{formatBRLFull(tmfGeral)}</div>
              <div className="text-[10px] text-[#555] mt-1">{cur.vendas_totais} vendas no mes</div>
            </div>
            <div className="bg-[#0f0f0f] border border-[#1c1c1c] rounded p-4">
              <div className="text-[8px] font-bold tracking-[.2em] uppercase text-[#555] mb-1">TMF Closing</div>
              <div className="text-2xl font-black text-[#5B8DEF]">{formatBRLFull(cur.closing_tmf)}</div>
            </div>
            <div className="bg-[#0f0f0f] border border-[#1c1c1c] rounded p-4">
              <div className="text-[8px] font-bold tracking-[.2em] uppercase text-[#555] mb-1">Tempo do Mes</div>
              <div className="text-2xl font-black text-[#F0F0F0]">
                {diasPassados}<span className="text-[#555]">/{diasTotal}</span>
                <span className="text-sm text-[#555] font-bold ml-2">dias uteis</span>
              </div>
              <div className="mt-2"><ProgressBar value={diasPassados} max={diasTotal} color="#555" /></div>
              <div className="text-[10px] text-[#555] mt-1">{diasRestantes} dias restantes</div>
            </div>
          </div>

          {/* ============================================ */}
          {/* 4. META DIÁRIA NECESSÁRIA */}
          {/* ============================================ */}
          {diasRestantes > 0 && (
            <>
              <div className="text-[8px] font-bold tracking-[.25em] uppercase text-[#E05050]/60 mb-3 pb-2 border-b border-[#E05050]/20">
                Meta Diaria Necessaria — {diasRestantes} dias uteis restantes
              </div>

              {/* Bloco destaque: Total diário */}
              <div className="bg-[#E05050]/[.06] border border-[#E05050]/20 rounded-lg p-5 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-bold tracking-[.2em] uppercase text-[#E05050]/50 mb-1">Total necessario por dia</div>
                    <div className="text-5xl font-black text-[#F0F0F0]">
                      {formatBRL(diarioTotal)}
                      <span className="text-lg text-[#555] font-bold ml-2">/dia</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-[#555]">
                      Falta <span className="text-[#E05050] font-bold">{formatBRL(faltaTotal)}</span>
                    </div>
                    <div className="text-[11px] text-[#555]">
                      Meta: <span className="text-[#F0F0F0] font-bold">{formatBRL(cur.meta_total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 colunas: por closer, por SDR, por inside */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* POR CLOSER */}
                <div className="bg-[#0f0f0f] border border-[#1c1c1c] rounded-lg p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#F5A623]" />
                  <div className="text-[8px] font-bold tracking-[.2em] uppercase text-[#F5A623]/50 mb-1">Diaria por Closer</div>
                  <div className="text-3xl font-black text-[#F5A623]">
                    {formatBRL(diarioPorCloser)}
                    <span className="text-[11px] text-[#555] font-bold ml-1">/closer/dia</span>
                  </div>
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#555]">Area precisa/dia:</span>
                      <span className="text-[#F5A623] font-bold">{formatBRL(diarioClosing)}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#555]">Closers ativos:</span>
                      <span className="text-[#F0F0F0] font-bold">{qtdClosers}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#555]">Falta:</span>
                      <span className="text-[#E05050] font-bold">{formatBRL(faltaClosing)}</span>
                    </div>
                  </div>
                  <div className="mt-3"><ProgressBar value={cur.faturamento_closing} max={cur.meta_closing} color="#F5A623" /></div>
                </div>

                {/* POR SDR */}
                <div className="bg-[#0f0f0f] border border-[#1c1c1c] rounded-lg p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#2DBFBF]" />
                  <div className="text-[8px] font-bold tracking-[.2em] uppercase text-[#2DBFBF]/50 mb-1">Diaria por SDR</div>
                  <div className="text-3xl font-black text-[#2DBFBF]">
                    {diarioPorSDR}
                    <span className="text-[11px] text-[#555] font-bold ml-1">agend./SDR/dia</span>
                  </div>
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#555]">Area precisa/dia:</span>
                      <span className="text-[#2DBFBF] font-bold">{diarioSDR} agend.</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#555]">SDRs ativos:</span>
                      <span className="text-[#F0F0F0] font-bold">{sdrs.length}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#555]">Falta:</span>
                      <span className="text-[#E05050] font-bold">{faltaSDR} agend.</span>
                    </div>
                  </div>
                  <div className="mt-3"><ProgressBar value={sdrFeito} max={metaSDR} color="#2DBFBF" /></div>
                </div>

                {/* POR INSIDE */}
                <div className="bg-[#0f0f0f] border border-[#1c1c1c] rounded-lg p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#3DBA7A]" />
                  <div className="text-[8px] font-bold tracking-[.2em] uppercase text-[#3DBA7A]/50 mb-1">Diaria por Inside</div>
                  <div className="text-3xl font-black text-[#3DBA7A]">
                    {formatBRL(diarioPorInside)}
                    <span className="text-[11px] text-[#555] font-bold ml-1">/inside/dia</span>
                  </div>
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#555]">Area precisa/dia:</span>
                      <span className="text-[#3DBA7A] font-bold">{formatBRL(diarioInside)}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#555]">Inside ativos:</span>
                      <span className="text-[#F0F0F0] font-bold">{qtdInside}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#555]">Falta:</span>
                      <span className="text-[#E05050] font-bold">{formatBRL(faltaInside)}</span>
                    </div>
                  </div>
                  <div className="mt-3"><ProgressBar value={cur.faturamento_inside} max={cur.meta_inside} color="#3DBA7A" /></div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
