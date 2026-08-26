import { useState, useEffect, useCallback, useMemo } from 'react';
import supabase, { isSupabaseConfigured } from '../supabase';
import { calcularDuracao, calcularMinutosPausados, paraNumero } from '../utils/formatters';

function chaveJornadas(userId) {
  return `personcontrol_jornadas:${userId}`;
}

function chaveAtiva(userId) {
  return `personcontrol_jornada_ativa:${userId}`;
}

function lerCache(chave) {
  try {
    const raw = localStorage.getItem(chave);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function salvarCache(chave, dados) {
  try {
    if (dados === null || dados === undefined) {
      localStorage.removeItem(chave);
    } else {
      localStorage.setItem(chave, JSON.stringify(dados));
    }
  } catch { /* quota exceeded, ignore */ }
}

// ── helpers: mapeamento camelCase ↔ snake_case (fora do hook para estabilidade) ──
function paraSupabase(j, userId) {
  return {
    id: j.id,
    user_id: userId,
    data_inicio: j.dataInicio,
    data_fim: j.dataFim || null,
    saldo_inicial: paraNumero(j.saldoInicial),
    km_inicial: j.kmInicial != null ? paraNumero(j.kmInicial) : null,
    km_final: j.kmFinal != null ? paraNumero(j.kmFinal) : null,
    km_rodado: paraNumero(j.kmRodado),
    valor_app: paraNumero(j.valorApp),
    valor_dinheiro: paraNumero(j.valorDinheiro),
    total_ganho: paraNumero(j.totalGanho),
    total_gastos: paraNumero(j.totalGastos),
    lucro_liquido: paraNumero(j.lucroLiquido),
    saldo_final: paraNumero(j.saldoFinal),
    duracao_minutos: j.duracaoMinutos || 0,
    minutos_pausados: j.minutosPausados || 0,
    pausada: !!j.pausada,
    pausas: j.pausas || [],
    gastos: j.gastos || [],
    observacoes: j.observacoes || '',
    editado_em: j.editadoEm || null,
    criado_em: j.dataInicio,
  };
}

function paraLocal(j) {
  return {
    id: j.id,
    dataInicio: j.data_inicio,
    dataFim: j.data_fim,
    saldoInicial: j.saldo_inicial,
    kmInicial: j.km_inicial,
    kmFinal: j.km_final,
    kmRodado: j.km_rodado,
    valorApp: j.valor_app,
    valorDinheiro: j.valor_dinheiro,
    totalGanho: j.total_ganho,
    totalGastos: j.total_gastos,
    lucroLiquido: j.lucro_liquido,
    saldoFinal: j.saldo_final,
    duracaoMinutos: j.duracao_minutos,
    minutosPausados: j.minutos_pausados,
    pausada: j.pausada,
    pausas: j.pausas || [],
    gastos: j.gastos || [],
    observacoes: j.observacoes || '',
    editadoEm: j.editado_em,
  };
}

const useJornada = (userId) => {
  const [jornadas, setJornadas] = useState([]);
  const [jornadaAtiva, setJornadaAtiva] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const usarSupabase = isSupabaseConfigured() && !!userId;

  // ── Carregar dados ──
  useEffect(() => {
    if (!userId) {
      setJornadas([]);
      setJornadaAtiva(null);
      setCarregando(false);
      return;
    }

    let cancelado = false;

    async function carregar() {
      // 1. Carrega cache local imediatamente (instantâneo)
      const cacheJornadas = lerCache(chaveJornadas(userId));
      const cacheAtiva = lerCache(chaveAtiva(userId));

      if (cacheJornadas && !cancelado) {
        setJornadas(cacheJornadas);
      }
      if (cacheAtiva && !cancelado) {
        setJornadaAtiva(cacheAtiva);
      }

      // 2. Se não tem Supabase configurado, mantém no cache
      if (!usarSupabase) {
        setCarregando(false);
        return;
      }

      // 3. Busca dados frescos do Supabase
      try {
        const { data: remoteJornadas, error: errJ } = await supabase
          .from('jornadas')
          .select('*')
          .eq('user_id', userId)
          .order('data_inicio', { ascending: false });

        if (!cancelado && !errJ && remoteJornadas) {
          const mapped = remoteJornadas.map(paraLocal);
          setJornadas(mapped);
          salvarCache(chaveJornadas(userId), mapped);

          // Jornada ativa = a mais recente sem data_fim
          const ativa = mapped.find(j => !j.dataFim) || null;
          setJornadaAtiva(ativa);
          salvarCache(chaveAtiva(userId), ativa);
        }
      } catch (err) {
        console.error('Erro ao buscar jornadas do Supabase, usando cache:', err);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    carregar();
    return () => { cancelado = true; };
  }, [userId, usarSupabase]);

  // ── Salvar cache sempre que state muda ──
  useEffect(() => {
    if (!userId) return;
    salvarCache(chaveJornadas(userId), jornadas);
  }, [jornadas, userId]);

  useEffect(() => {
    if (!userId) return;
    salvarCache(chaveAtiva(userId), jornadaAtiva);
  }, [jornadaAtiva, userId]);

  // ── Iniciar jornada ──
  const iniciarJornada = useCallback(async (saldoInicial, kmInicial) => {
    const novaJornada = {
      id: crypto.randomUUID(),
      dataInicio: new Date().toISOString(),
      dataFim: null,
      saldoInicial: paraNumero(saldoInicial),
      kmInicial: paraNumero(kmInicial),
      kmFinal: null,
      kmRodado: 0,
      valorApp: 0,
      valorDinheiro: 0,
      totalGanho: 0,
      saldoFinal: 0,
      duracaoMinutos: 0,
      minutosPausados: 0,
      pausada: false,
      pausas: [],
      gastos: [],
      totalGastos: 0,
      lucroLiquido: 0,
      observacoes: ''
    };

    setJornadaAtiva(novaJornada);

    if (usarSupabase) {
      try {
        const { error } = await supabase.from('jornadas').insert(paraSupabase(novaJornada, userId));
        if (error) console.error('Erro ao criar jornada no Supabase:', error);
      } catch (err) {
        console.error('Erro de rede ao criar jornada:', err);
      }
    }

    return novaJornada;
  }, [usarSupabase, userId]);

  // ── Adicionar gasto ──
  const adicionarGasto = useCallback(async (descricao, valor) => {
    const v = paraNumero(valor);
    if (!jornadaAtiva || v <= 0) return null;

    const gasto = {
      id: crypto.randomUUID(),
      descricao: (descricao || '').trim() || 'Gasto avulso',
      valor: v,
      criadoEm: new Date().toISOString()
    };

    const novosGastos = [...(jornadaAtiva.gastos || []), gasto];
    const totalGastos = novosGastos.reduce((acc, g) => acc + g.valor, 0);
    const atualizada = {
      ...jornadaAtiva,
      gastos: novosGastos,
      totalGastos,
      lucroLiquido: (jornadaAtiva.totalGanho || 0) - totalGastos
    };

    setJornadaAtiva(atualizada);

    if (usarSupabase) {
      try {
        const { error } = await supabase
          .from('jornadas')
          .update({
            gastos: novosGastos,
            total_gastos: totalGastos,
            lucro_liquido: atualizada.lucroLiquido,
          })
          .eq('id', jornadaAtiva.id);
        if (error) console.error('Erro ao salvar gasto:', error);
      } catch (err) {
        console.error('Erro de rede ao salvar gasto:', err);
      }
    }

    return gasto;
  }, [jornadaAtiva, usarSupabase]);

  // ── Remover gasto ──
  const removerGasto = useCallback(async (id) => {
    setJornadaAtiva(prev => {
      if (!prev) return prev;
      const gastos = (prev.gastos || []).filter(g => g.id !== id);
      const totalGastos = gastos.reduce((acc, g) => acc + g.valor, 0);
      const atualizada = {
        ...prev,
        gastos,
        totalGastos,
        lucroLiquido: (prev.totalGanho || 0) - totalGastos
      };

      if (usarSupabase) {
        supabase.from('jornadas').update({
          gastos,
          total_gastos: totalGastos,
          lucro_liquido: atualizada.lucroLiquido,
        }).eq('id', prev.id).then(({ error }) => {
          if (error) console.error('Erro ao remover gasto:', error);
        });
      }

      return atualizada;
    });
  }, [usarSupabase]);

  // ── Pausar jornada ──
  const pausarJornada = useCallback(async () => {
    setJornadaAtiva(prev => {
      if (!prev || prev.pausada) return prev;
      const atualizada = {
        ...prev,
        pausada: true,
        pausas: [...(prev.pausas || []), { inicio: new Date().toISOString(), fim: null }]
      };

      if (usarSupabase) {
        supabase.from('jornadas').update({
          pausada: true,
          pausas: atualizada.pausas,
        }).eq('id', prev.id).then(({ error }) => {
          if (error) console.error('Erro ao pausar jornada:', error);
        });
      }

      return atualizada;
    });
  }, [usarSupabase]);

  // ── Retomar jornada ──
  const retomarJornada = useCallback(async () => {
    setJornadaAtiva(prev => {
      if (!prev || !prev.pausada) return prev;
      const pausas = [...(prev.pausas || [])];
      if (pausas.length > 0) {
        const ultima = pausas[pausas.length - 1];
        pausas[pausas.length - 1] = { ...ultima, fim: new Date().toISOString() };
      }
      const atualizada = { ...prev, pausada: false, pausas };

      if (usarSupabase) {
        supabase.from('jornadas').update({
          pausada: false,
          pausas,
        }).eq('id', prev.id).then(({ error }) => {
          if (error) console.error('Erro ao retomar jornada:', error);
        });
      }

      return atualizada;
    });
  }, [usarSupabase]);

  // ── Encerrar jornada ──
  const encerrarJornada = useCallback(async (valorApp, valorDinheiro, kmFinal) => {
    if (!jornadaAtiva) return null;

    const app = paraNumero(valorApp);
    const dinheiro = paraNumero(valorDinheiro);
    const kmFim = paraNumero(kmFinal);
    const temKmInicial = typeof jornadaAtiva.kmInicial === 'number';

    const agora = new Date();
    const agoraIso = agora.toISOString();

    let pausas = [...(jornadaAtiva.pausas || [])];
    if (pausas.length > 0 && !pausas[pausas.length - 1].fim) {
      pausas[pausas.length - 1] = { ...pausas[pausas.length - 1], fim: agoraIso };
    }

    const duracaoBruta = calcularDuracao(jornadaAtiva.dataInicio, agoraIso);
    const minutosPausados = calcularMinutosPausados({ pausas }, agora);
    const duracaoLiquida = Math.max(0, duracaoBruta - minutosPausados);

    const totalGanho = app + dinheiro;
    const saldoFinal = jornadaAtiva.saldoInicial + totalGanho;
    const totalGastos = jornadaAtiva.totalGastos || 0;

    const jornadaFinalizada = {
      ...jornadaAtiva,
      dataFim: agoraIso,
      valorApp: app,
      valorDinheiro: dinheiro,
      totalGanho,
      saldoFinal,
      gastos: jornadaAtiva.gastos || [],
      totalGastos,
      lucroLiquido: totalGanho - totalGastos,
      duracaoMinutos: duracaoLiquida,
      minutosPausados,
      pausada: false,
      pausas,
      kmFinal: temKmInicial ? kmFim : null,
      kmRodado: temKmInicial ? Math.max(0, kmFim - jornadaAtiva.kmInicial) : 0
    };

    setJornadas(prev => [jornadaFinalizada, ...prev]);
    setJornadaAtiva(null);

    if (usarSupabase) {
      try {
        const { error } = await supabase
          .from('jornadas')
          .update(paraSupabase(jornadaFinalizada, userId))
          .eq('id', jornadaFinalizada.id);
        if (error) console.error('Erro ao encerrar jornada:', error);
      } catch (err) {
        console.error('Erro de rede ao encerrar jornada:', err);
      }
    }

    return jornadaFinalizada;
  }, [jornadaAtiva, usarSupabase, userId]);

  // ── Excluir jornada ──
  const excluirJornada = useCallback(async (id) => {
    setJornadas(prev => prev.filter(j => j.id !== id));

    if (usarSupabase) {
      try {
        const { error } = await supabase.from('jornadas').delete().eq('id', id);
        if (error) console.error('Erro ao excluir jornada:', error);
      } catch (err) {
        console.error('Erro de rede ao excluir jornada:', err);
      }
    }
  }, [usarSupabase]);

  // ── Editar jornada ──
  const editarJornada = useCallback(async (id, dadosAtualizados) => {
    setJornadas(prev => prev.map(jornada => {
      if (jornada.id !== id) return jornada;

      const valorApp = paraNumero(dadosAtualizados.valorApp, jornada.valorApp);
      const valorDinheiro = paraNumero(dadosAtualizados.valorDinheiro, jornada.valorDinheiro);
      const totalGanho = valorApp + valorDinheiro;
      const saldoFinal = jornada.saldoInicial + totalGanho;

      const kmVazio = (v) => v === '' || v === null || v === undefined;
      const kmInicial = kmVazio(dadosAtualizados.kmInicial)
        ? jornada.kmInicial ?? null
        : paraNumero(dadosAtualizados.kmInicial, jornada.kmInicial ?? null);
      const kmFinal = kmVazio(dadosAtualizados.kmFinal)
        ? jornada.kmFinal ?? null
        : paraNumero(dadosAtualizados.kmFinal, jornada.kmFinal ?? null);

      const temKmCompleto =
        typeof kmInicial === 'number' && typeof kmFinal === 'number';
      const kmRodado = temKmCompleto
        ? Math.max(0, kmFinal - kmInicial)
        : jornada.kmRodado ?? 0;

      const atualizada = {
        ...jornada,
        valorApp,
        valorDinheiro,
        totalGanho,
        saldoFinal,
        lucroLiquido: totalGanho - (jornada.totalGastos || 0),
        kmInicial,
        kmFinal,
        kmRodado,
        observacoes: dadosAtualizados.observacoes ?? jornada.observacoes,
        editadoEm: new Date().toISOString()
      };

      if (usarSupabase) {
        supabase.from('jornadas').update({
          valor_app: valorApp,
          valor_dinheiro: valorDinheiro,
          total_ganho: totalGanho,
          saldo_final: saldoFinal,
          lucro_liquido: atualizada.lucroLiquido,
          km_inicial: kmInicial,
          km_final: kmFinal,
          km_rodado: kmRodado,
          observacoes: atualizada.observacoes,
          editado_em: atualizada.editadoEm,
        }).eq('id', id).then(({ error }) => {
          if (error) console.error('Erro ao editar jornada:', error);
        });
      }

      return atualizada;
    }));
  }, [usarSupabase]);

  // ── Estatísticas do mês ──
  const estatisticasMes = useMemo(() => {
    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();

    const jornadasMes = jornadas.filter(j => {
      const data = new Date(j.dataInicio);
      return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
    });

    return {
      diasTrabalhados: jornadasMes.length,
      totalGanho: jornadasMes.reduce((acc, j) => acc + j.totalGanho, 0),
      totalHoras: jornadasMes.reduce((acc, j) => acc + j.duracaoMinutos, 0) / 60,
      ganhoMedio: jornadasMes.length > 0
        ? jornadasMes.reduce((acc, j) => acc + j.totalGanho, 0) / jornadasMes.length
        : 0
    };
  }, [jornadas]);

  return {
    jornadas,
    jornadaAtiva,
    carregando,
    iniciarJornada,
    pausarJornada,
    retomarJornada,
    adicionarGasto,
    removerGasto,
    encerrarJornada,
    excluirJornada,
    editarJornada,
    estatisticasMes
  };
};

export default useJornada;