import { formatBRLFull, formatPct } from "@/lib/utils";

interface Row {
  vendedor: string;
  valor_coletado: number;
  vendas: number;
  tmf: number;
  conv_pct: number;
  show_pct: number;
  tmf_reuniao: number;
  pct_meta: number;
  meta_individual: number;
  status_meta: string;
  calls_agendadas?: number;
  calls_realizadas?: number;
  inside_planos?: number;
  inside_assiny?: number;
  negocios_trabalhados?: number;
  conv_negocios_pct?: number;
}

interface Props {
  data: Row[];
  equipe: "closer" | "sdr" | "inside";
}

export default function RankingTable({ data, equipe }: Props) {
  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      acima_meta: { bg: "rgba(61,186,122,.15)", text: "#3DBA7A", label: "TOP" },
      proximo_meta: { bg: "rgba(245,166,35,.12)", text: "#F5A623", label: "OK" },
      abaixo_meta: { bg: "rgba(224,80,80,.12)", text: "#E05050", label: "ATENCAO" },
      critico: { bg: "rgba(255,50,50,.15)", text: "#FF3333", label: "CRITICO" },
      sem_meta: { bg: "rgba(85,85,85,.1)", text: "#555", label: "-" },
    };
    const s = map[status] || map.sem_meta;
    return (
      <span
        className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wide"
        style={{ background: s.bg, color: s.text }}
      >
        {s.label}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px] min-w-[800px]">
        <thead>
          <tr className="border-b border-[#1c1c1c]">
            <th className="text-left text-[8px] font-bold tracking-[.14em] uppercase text-[#555] py-2 px-2">#</th>
            <th className="text-left text-[8px] font-bold tracking-[.14em] uppercase text-[#555] py-2 px-2">Vendedor</th>
            <th className="text-right text-[8px] font-bold tracking-[.14em] uppercase text-[#F5A623]/60 py-2 px-2">Valor</th>
            {equipe === "inside" && (
              <>
                <th className="text-right text-[8px] font-bold tracking-[.14em] uppercase text-[#5B8DEF]/60 py-2 px-2">Planos</th>
                <th className="text-right text-[8px] font-bold tracking-[.14em] uppercase text-[#3DBA7A]/60 py-2 px-2">Assiny</th>
              </>
            )}
            <th className="text-right text-[8px] font-bold tracking-[.14em] uppercase text-[#555] py-2 px-2">Vendas</th>
            {equipe !== "inside" && (
              <>
                <th className="text-right text-[8px] font-bold tracking-[.14em] uppercase text-[#555] py-2 px-2">Calls</th>
                <th className="text-right text-[8px] font-bold tracking-[.14em] uppercase text-[#2DBFBF]/60 py-2 px-2">Conv%</th>
                <th className="text-right text-[8px] font-bold tracking-[.14em] uppercase text-[#555] py-2 px-2">Show%</th>
              </>
            )}
            {equipe === "inside" && (
              <>
                <th className="text-right text-[8px] font-bold tracking-[.14em] uppercase text-[#555] py-2 px-2">Negocios</th>
                <th className="text-right text-[8px] font-bold tracking-[.14em] uppercase text-[#2DBFBF]/60 py-2 px-2">Conv%</th>
              </>
            )}
            <th className="text-right text-[8px] font-bold tracking-[.14em] uppercase text-[#F5A623]/60 py-2 px-2">TMF</th>
            <th className="text-right text-[8px] font-bold tracking-[.14em] uppercase text-[#555] py-2 px-2">Meta</th>
            <th className="text-right text-[8px] font-bold tracking-[.14em] uppercase text-[#555] py-2 px-2">%Meta</th>
            <th className="text-center text-[8px] font-bold tracking-[.14em] uppercase text-[#555] py-2 px-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.vendedor} className="border-b border-white/[.03] hover:bg-white/[.02]">
              <td className="py-2 px-2 text-[#555] font-bold">{i + 1}</td>
              <td className="py-2 px-2 font-semibold text-[#F0F0F0]">{row.vendedor}</td>
              <td className="py-2 px-2 text-right font-bold text-[#F5A623]">{formatBRLFull(row.valor_coletado)}</td>
              {equipe === "inside" && (
                <>
                  <td className="py-2 px-2 text-right text-[#5B8DEF]">{formatBRLFull(row.inside_planos || 0)}</td>
                  <td className="py-2 px-2 text-right text-[#3DBA7A]">{formatBRLFull(row.inside_assiny || 0)}</td>
                </>
              )}
              <td className="py-2 px-2 text-right">{row.vendas}</td>
              {equipe !== "inside" && (
                <>
                  <td className="py-2 px-2 text-right text-[#555]">
                    {row.calls_realizadas || 0}/{row.calls_agendadas || 0}
                  </td>
                  <td className="py-2 px-2 text-right text-[#2DBFBF]">{formatPct(row.conv_pct)}</td>
                  <td className="py-2 px-2 text-right">{formatPct(row.show_pct)}</td>
                </>
              )}
              {equipe === "inside" && (
                <>
                  <td className="py-2 px-2 text-right text-[#555]">{row.negocios_trabalhados || 0}</td>
                  <td className="py-2 px-2 text-right text-[#2DBFBF]">{formatPct(row.conv_negocios_pct || 0)}</td>
                </>
              )}
              <td className="py-2 px-2 text-right text-[#F5A623]">{formatBRLFull(row.tmf)}</td>
              <td className="py-2 px-2 text-right text-[#555]">
                {row.meta_individual > 0 ? formatBRLFull(row.meta_individual) : "-"}
              </td>
              <td className="py-2 px-2 text-right">
                {row.meta_individual > 0 ? formatPct(row.pct_meta) : "-"}
              </td>
              <td className="py-2 px-2 text-center">{statusBadge(row.status_meta)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
