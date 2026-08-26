import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método não permitido" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Token não fornecido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verifica usuário autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Usuário não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { jornadas } = body;

    if (!Array.isArray(jornadas) || jornadas.length === 0) {
      return new Response(JSON.stringify({ error: "Array 'jornadas' obrigatório e não vazio" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mapeia campos do formato localStorage para formato Supabase
    const jornadasParaInserir = jornadas.map((j) => ({
      id: j.id,
      user_id: user.id,
      data_inicio: j.dataInicio,
      data_fim: j.dataFim || null,
      saldo_inicial: Number(j.saldoInicial || 0),
      km_inicial: j.kmInicial !== undefined && j.kmInicial !== null ? Number(j.kmInicial) : null,
      km_final: j.kmFinal !== undefined && j.kmFinal !== null ? Number(j.kmFinal) : null,
      km_rodado: Number(j.kmRodado || 0),
      valor_app: Number(j.valorApp || 0),
      valor_dinheiro: Number(j.valorDinheiro || 0),
      total_ganho: Number(j.totalGanho || 0),
      total_gastos: Number(j.totalGastos || 0),
      lucro_liquido: j.lucroLiquido !== undefined && j.lucroLiquido !== null ? Number(j.lucroLiquido) : null,
      saldo_final: j.saldoFinal !== undefined && j.saldoFinal !== null ? Number(j.saldoFinal) : null,
      duracao_minutos: Number(j.duracaoMinutos || 0),
      minutos_pausados: Number(j.minutosPausados || 0),
      pausada: Boolean(j.pausada || false),
      pausas: j.pausas || [],
      gastos: j.gastos || [],
      total_gastos: Number(j.totalGastos || 0),
      lucro_liquido: j.lucroLiquido !== undefined && j.lucroLiquido !== null ? Number(j.lucroLiquido) : null,
      observacoes: j.observacoes || "",
      editado_em: j.editadoEm || null,
      criado_em: j.dataInicio,
      atualizado_em: j.editadoEm || j.dataFim || new Date().toISOString(),
    });

    // Upsert (insert ou update se já existe pelo id)
    const { data, error } = await supabase
      .from("jornadas")
      .upsert(jornadasParaInserir, {
        onConflict: "id",
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      console.error("Erro ao inserir jornadas:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        sucesso: true,
        mensagem: `${data.length} jornadas migradas com sucesso`,
        jornadas: data,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Erro inesperado:", err);
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});