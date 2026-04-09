import { supabase } from "./supabase";

export async function fetchGeral() {
  // Tenta view primeiro, fallback pra RPC
  const { data, error } = await supabase
    .from("view_performance_geral")
    .select("*")
    .gte("mes", "2025-11-01")
    .lte("mes", "2026-12-01")
    .order("mes");

  if (!error && data && data.length > 0) return data;

  // Fallback: RPC
  const { data: rpcData } = await supabase.rpc("get_performance_geral", {
    p_min_mes: "2025-11-01",
    p_max_mes: "2026-12-01",
  });
  return rpcData || [];
}

export async function fetchIndividual(mes: string) {
  const { data, error } = await supabase
    .from("view_performance_individual")
    .select("*")
    .eq("mes", mes);

  if (!error && data && data.length > 0) return data;

  // Fallback: RPC
  const { data: rpcData } = await supabase.rpc("get_performance_individual", {
    p_mes: mes,
  });
  return rpcData || [];
}
