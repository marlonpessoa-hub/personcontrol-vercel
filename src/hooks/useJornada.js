import { useState, useEffect, useCallback, useMemo } from 'react';
import supabase, { isSupabaseConfigured } from '../supabase';
import { nativeStorage, vibrar } from './useNative';
import { calcularDuracao, calcularMinutosPausados, paraNumero } from '../utils/formatters';

function chaveJornadas(userId) {
  return `personcontrol_jornadas:${userId}`;
}

function chaveAtiva(userId) {
  return `personcontrol_jornada_ativa:${userId}`;
}

async function lerCache(chave) {
  try {
    const timeout = new Promise((resolve) =>
      setTimeout(() => resolve(null), 3000)
    );
    return await Promise.race([nativeStorage.get(chave), timeout]);
  } catch {
    return null;
  }
}

async function salvarCache(chave, dados) {
  try {
    const operação = async () => {
      if (dados === null || dados === undefined) {
        await nativeStorage.remove(chave);
      } else {
        await nativeStorage.set(chave, dados);
      }
    };
    const timeout = new Promise((resolve) => setTimeout(resolve, 3000));
    await Promise.race([operação(), timeout]);
  } catch { /* storage error, ignore */ }
}

// ── helpers: mapeamento camelCase ↔ snake_case (fora do hook para estabilidade) ──
function chaveDiaLocal(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function gastosParaSupabase(j) {
  const gastos = (j.gastos || []).map(g => ({ ...g, tipo: g.tipo || 'gasto' }));
  const gorjetas = (j.gorjetas || []).map(g => ({ ...g, tipo: g.tipo || 'gorjeta' }));
  return [...gastos, ...gorjetas];
}

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
    valor_por_hora: j.valorPorHora || 0,
    pausada: !!j.pausada,
    pausas: j.pausas || [],
    gastos: gastosParaSupabase(j),
    observacoes: j.observacoes || '',
    editado_em: j.editadoEm || null,
    criado_em: j.dataInicio,
  };
}

function paraLocal(j) {
  const itens = (j.gastos || []).map(g => ({ ...g, tipo: g.tipo || (g.descricao === undefined ? 'gorjeta' : 'gasto') }));
  const gorjetas = [];
  const gastos = [];
  for (const item of itens) {
    if (item.tipo === 'gorjeta') gorjetas.push(item);
    else gastos.push(item);
  }

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
    lucroLiquido: j.lucro_liquido,
    saldoFinal: j.saldo_final,
    duracaoMinutos: j.duracao_minutos,
    minutosPausados: j.minutos_pausados,
    valorPorHora: j.valor_por_hora || 0,
    pausada: j.pausada,
    pausas: j.pausas || [],
    gastos,
    totalGastos: j.total_gastos != null ? j.total_gastos : gastos.reduce((acc, g) => acc + g.valor, 0),
    gorjetas,
    totalGorjetas: gorjetas.reduce((acc, g) => acc + g.valor, 0),
    observacoes: j.observacoes || '',
    editadoEm: j.editado_em,
  };
}

const useJornada = (userId) => {
  const [jornadas, setJornadas] = useState([]);
  const [jornadaAtiva, setJornadaAtiva] = useState(null);
  const [dizimos, setDizimos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const usarSupabase = isSupabaseConfigured && !!userId;

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
      try {
      // 1. Carrega cache local imediatamente (instantâneo)
      const cacheJornadas = await lerCache(chaveJornadas(userId));
      const cacheAtiva = await lerCache(chaveAtiva(userId));

      if (cacheJornadas && !cancelado) {
        setJornadas(cacheJornadas);
      }
      if (cacheAtiva && !cancelado) {
        setJornadaAtiva(cacheAtiva);
      }

      // 2. Se não tem Supabase configurado, mantém no cache
      if (!usarSupabase) {
        return;
      }

      // 3. Busca dados frescos do Supabase
        const timeout = (ms) => new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout ao buscar jornadas')), ms)
        );
        const { data: remoteJornadas, error: errJ } = await Promise.race([
          supabase
            .from('jornadas')
            .select('*')
            .eq('user_id', userId)
            .order('data_inicio', { ascending: false }),
          timeout(15000)
        ]);

        if (!cancelado && !errJ && remoteJornadas) {
          const mapped = remoteJornadas.map(paraLocal);
          setJornadas(mapped);
          await salvarCache(chaveJornadas(userId), mapped);

          // Jornada ativa = a mais recente sem data_fim
          const ativa = mapped.find(j => !j.dataFim) || null;
          setJornadaAtiva(ativa);
          await salvarCache(chaveAtiva(userId), ativa);
        }

        // 4. Buscar dizimos do Supabase
        const { data: remoteDizimos, error: errD } = await Promise.race([
          supabase
            .from('dizimos')
            .select('*')
            .eq('user_id', userId)
            .order('data_jornada', { ascending: false }),
          timeout(15000)
        ]);

        if (!cancelado && !errD && remoteDizimos) {
          setDizimos(remoteDizimos);
          await salvarCache(`personcontrol_dizimos:${userId}`, remoteDizimos);
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

  useEffect(() => {
    if (!userId) return;
    salvarCache(`personcontrol_dizimos:${userId}`, dizimos);
  }, [dizimos, userId]);

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
      valorPorHora: 0,
      pausada: false,
      pausas: [],
      gastos: [],
      totalGastos: 0,
      gorjetas: [],
      totalGorjetas: 0,
      lucroLiquido: 0,
      observacoes: ''
    };

    setJornadaAtiva(novaJornada);
    vibrar();

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
    const totalGorjetas = jornadaAtiva.totalGorjetas || 0;
    const atualizada = {
      ...jornadaAtiva,
      gastos: novosGastos,
      totalGastos,
      lucroLiquido: (jornadaAtiva.totalGanho || 0) + totalGorjetas - totalGastos
    };

    setJornadaAtiva(atualizada);

    if (usarSupabase) {
      try {
        const { error } = await supabase
          .from('jornadas')
          .update({
            gastos: gastosParaSupabase(atualizada),
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

  // ── Adicionar gorjeta ──
  const adicionarGorjeta = useCallback(async (valor) => {
    const v = paraNumero(valor);
    if (!jornadaAtiva || v <= 0) return null;

    const gorjeta = {
      id: crypto.randomUUID(),
      valor: v,
      criadoEm: new Date().toISOString()
    };

    const novasGorjetas = [...(jornadaAtiva.gorjetas || []), gorjeta];
    const totalGorjetas = novasGorjetas.reduce((acc, g) => acc + g.valor, 0);
    const atualizada = {
      ...jornadaAtiva,
      gorjetas: novasGorjetas,
      totalGorjetas,
      lucroLiquido: (jornadaAtiva.totalGanho || 0) + totalGorjetas - (jornadaAtiva.totalGastos || 0)
    };

    setJornadaAtiva(atualizada);

    if (usarSupabase) {
      try {
        const { error } = await supabase
          .from('jornadas')
          .update({
            gastos: gastosParaSupabase(atualizada),
            lucro_liquido: atualizada.lucroLiquido,
          })
          .eq('id', jornadaAtiva.id);
        if (error) console.error('Erro ao salvar gorjeta:', error);
      } catch (err) {
        console.error('Erro de rede ao salvar gorjeta:', err);
      }
    }

    return gorjeta;
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
        lucroLiquido: (prev.totalGanho || 0) + (prev.totalGorjetas || 0) - totalGastos
      };

      if (usarSupabase) {
        supabase.from('jornadas').update({
          gastos: gastosParaSupabase(atualizada),
          total_gastos: totalGastos,
          lucro_liquido: atualizada.lucroLiquido,
        }).eq('id', prev.id).then(({ error }) => {
          if (error) console.error('Erro ao remover gasto:', error);
        });
      }

      return atualizada;
    });
  }, [usarSupabase]);

  // ── Remover gorjeta ──
  const removerGorjeta = useCallback(async (id) => {
    setJornadaAtiva(prev => {
      if (!prev) return prev;
      const gorjetas = (prev.gorjetas || []).filter(g => g.id !== id);
      const totalGorjetas = gorjetas.reduce((acc, g) => acc + g.valor, 0);
      const atualizada = {
        ...prev,
        gorjetas,
        totalGorjetas,
        lucroLiquido: (prev.totalGanho || 0) + totalGorjetas - (prev.totalGastos || 0)
      };

      if (usarSupabase) {
        supabase.from('jornadas').update({
          gastos: gastosParaSupabase(atualizada),
          lucro_liquido: atualizada.lucroLiquido,
        }).eq('id', prev.id).then(({ error }) => {
          if (error) console.error('Erro ao remover gorjeta:', error);
        });
      }

      return atualizada;
    });
  }, [usarSupabase]);

  // ── Pausar jornada ──
  const pausarJornada = useCallback(async () => {
    vibrar();
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
    vibrar();
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
    vibrar();

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

    const totalGorjetas = jornadaAtiva.totalGorjetas || 0;
    const totalGanho = app + dinheiro + totalGorjetas;
    const totalDizimo = totalGanho * 0.10;
    const saldoFinal = jornadaAtiva.saldoInicial + totalGanho - (jornadaAtiva.totalGastos || 0);
    const totalGastos = jornadaAtiva.totalGastos || 0;
    const valorPorHora = duracaoLiquida > 0 ? totalGanho / (duracaoLiquida / 60) : 0;

    const jornadaFinalizada = {
      ...jornadaAtiva,
      dataFim: agoraIso,
      valorApp: app,
      valorDinheiro: dinheiro,
      totalGanho,
      totalDizimo,
      saldoFinal,
      gastos: jornadaAtiva.gastos || [],
      totalGastos,
      gorjetas: jornadaAtiva.gorjetas || [],
      totalGorjetas,
      lucroLiquido: totalGanho - totalGastos,
      duracaoMinutos: duracaoLiquida,
      minutosPausados,
      valorPorHora,
      pausada: false,
      pausas,
      kmFinal: temKmInicial ? kmFim : null,
      kmRodado: temKmInicial ? Math.max(0, kmFim - jornadaAtiva.kmInicial) : 0
    };

    setJornadas(prev => [jornadaFinalizada, ...prev]);
    setJornadaAtiva(null);

    // Salvar dízimo na tabela
    const novoDizimo = {
      id: crypto.randomUUID(),
      user_id: userId,
      jornada_id: jornadaFinalizada.id,
      data_jornada: jornadaFinalizada.dataInicio,
      total_ganho: totalGanho,
      dizimo_valor: totalDizimo,
      criado_em: new Date().toISOString()
    };
    setDizimos(prev => [novoDizimo, ...prev]);

    if (usarSupabase) {
      try {
        const { error } = await supabase
          .from('jornadas')
          .update(paraSupabase(jornadaFinalizada, userId))
          .eq('id', jornadaFinalizada.id);
        if (error) console.error('Erro ao encerrar jornada:', error);

        // Inserir dízimo na tabela
        const { error: errDizimo } = await supabase
          .from('dizimos')
          .insert({
            id: novoDizimo.id,
            user_id: userId,
            jornada_id: jornadaFinalizada.id,
            data_jornada: jornadaFinalizada.dataInicio,
            total_ganho: totalGanho,
            dizimo_valor: totalDizimo
          });
        if (errDizimo) console.error('Erro ao salvar dízimo:', errDizimo);
      } catch (err) {
        console.error('Erro de rede ao encerrar jornada:', err);
      }
    }

    return jornadaFinalizada;
  }, [jornadaAtiva, usarSupabase, userId]);

  // ── Excluir jornada ──
  const excluirJornada = useCallback(async (id) => {
    setJornadas(prev => prev.filter(j => j.id !== id));
    // Remover dízimo associado
    setDizimos(prev => prev.filter(d => d.jornada_id !== id));

    if (usarSupabase) {
      try {
        const { error } = await supabase.from('jornadas').delete().eq('id', id);
        if (error) console.error('Erro ao excluir jornada:', error);

        // Excluir dízimo associado
        const { error: errDizimo } = await supabase.from('dizimos').delete().eq('jornada_id', id);
        if (errDizimo) console.error('Erro ao excluir dízimo:', errDizimo);
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
      const totalGanho = valorApp + valorDinheiro + (jornada.totalGorjetas || 0);
      const totalDizimo = totalGanho * 0.10;
      const saldoFinal = jornada.saldoInicial + totalGanho - (jornada.totalGastos || 0);
      const valorPorHora = (jornada.duracaoMinutos || 0) > 0
        ? totalGanho / (jornada.duracaoMinutos / 60)
        : 0;

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
        totalDizimo,
        saldoFinal,
        lucroLiquido: totalGanho - (jornada.totalGastos || 0),
        valorPorHora,
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
          valor_por_hora: valorPorHora,
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
  const estatisticasMes = useCallback((referencia = new Date()) => {
    const mes = referencia.getMonth();
    const ano = referencia.getFullYear();

    const jornadasMes = jornadas.filter(j => {
      const data = new Date(j.dataInicio);
      return data.getMonth() === mes && data.getFullYear() === ano;
    });

    const diasTrabalhados = new Set(jornadasMes.map(j => chaveDiaLocal(j.dataInicio))).size;
    const totalGanho = jornadasMes.reduce((acc, j) => acc + j.totalGanho, 0);

    // Calcular dízimo mensal (preferência para dados da tabela, fallback para cálculo)
    const dizimosMes = dizimos.filter(d => {
      const data = new Date(d.data_jornada);
      return data.getMonth() === mes && data.getFullYear() === ano;
    });
    const totalDizimo = dizimosMes.length > 0
      ? dizimosMes.reduce((acc, d) => acc + parseFloat(d.dizimo_valor), 0)
      : jornadasMes.reduce((acc, j) => acc + (j.totalDizimo || j.totalGanho * 0.10), 0);

    return {
      diasTrabalhados,
      totalGanho,
      totalDizimo,
      totalHoras: jornadasMes.reduce((acc, j) => acc + j.duracaoMinutos, 0) / 60,
      ganhoMedio: diasTrabalhados > 0 ? totalGanho / diasTrabalhados : 0
    };
  }, [jornadas, dizimos]);

  // ── Total de dízimos (global) ──
  const totalDizimoGlobal = useMemo(() => {
    return dizimos.reduce((acc, d) => acc + parseFloat(d.dizimo_valor), 0);
  }, [dizimos]);

  return {
    jornadas,
    jornadaAtiva,
    dizimos,
    carregando,
    totalDizimoGlobal,
    iniciarJornada,
    pausarJornada,
    retomarJornada,
    adicionarGasto,
    removerGasto,
    adicionarGorjeta,
    removerGorjeta,
    encerrarJornada,
    excluirJornada,
    editarJornada,
    estatisticasMes
  };
};

export default useJornada;