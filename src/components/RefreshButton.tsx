"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RefreshButton() {
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  async function handleRefresh() {
    setLoading(true);
    try {
      const { error } = await supabase.rpc("atualizar_performance_mensal");
      if (error) throw error;
      setLastUpdate(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
      window.location.reload();
    } catch (err) {
      console.error("Erro ao atualizar:", err);
      alert("Erro ao atualizar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {lastUpdate && (
        <span className="text-[9px] text-[#555]">
          atualizado {lastUpdate}
        </span>
      )}
      <button
        onClick={handleRefresh}
        disabled={loading}
        className={`px-3 py-1.5 rounded text-[10px] font-bold tracking-wide uppercase transition-all border ${
          loading
            ? "bg-[#141414] text-[#333] border-[#1c1c1c] cursor-wait"
            : "bg-[#3DBA7A]/10 text-[#3DBA7A] border-[#3DBA7A]/30 hover:bg-[#3DBA7A]/20 cursor-pointer"
        }`}
      >
        {loading ? "ATUALIZANDO..." : "ATUALIZAR DADOS"}
      </button>
    </div>
  );
}
