const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

async function supabaseFetch(path: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    console.error(`Supabase fetch error: ${res.status} ${res.statusText} — ${path}`);
    return [];
  }
  return res.json();
}

async function supabaseRpc(fn: string, params: Record<string, unknown> = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    console.error(`Supabase RPC error: ${res.status} — ${fn}`);
    return [];
  }
  return res.json();
}

export async function fetchGeral() {
  // Try view first
  const data = await supabaseFetch(
    "view_performance_geral?mes=gte.2025-11-01&mes=lte.2026-12-01&order=mes"
  );
  if (data && data.length > 0) return data;

  // Fallback: RPC
  const rpcData = await supabaseRpc("get_performance_geral", {
    p_min_mes: "2025-11-01",
    p_max_mes: "2026-12-01",
  });
  return rpcData || [];
}

export async function fetchIndividual(mes: string) {
  const data = await supabaseFetch(
    `view_performance_individual?mes=eq.${mes}`
  );
  if (data && data.length > 0) return data;

  // Fallback: RPC
  const rpcData = await supabaseRpc("get_performance_individual", { p_mes: mes });
  if (rpcData && rpcData.length > 0) return rpcData;

  // Fallback 2: tabela direta
  return supabaseFetch(`performance_comercial?mes=eq.${mes}&order=valor_coletado.desc`);
}
