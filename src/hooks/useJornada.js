import { useState, useEffect, useCallback, useMemo } from 'react';
import { calcularDuracao, calcularMinutosPausados, paraNumero } from '../utils/formatters';

const useJornada = (userId) => {
  const [jornadas, setJornadas] = useState([]);
  const [jornadaAtiva, setJornadaAtiva] = useState(null);
  const [loadedUserId, setLoadedUserId] = useState(null);

  useEffect(() => {
    if (!userId) {
      setJornadas([]);
      setJornadaAtiva(null);
      setLoadedUserId(null);
      return;
    }

    try {
      let salvas = localStorage.getItem(`personcontrol_jornadas:${userId}`);
      if (salvas === null) {
        const antigas = localStorage.getItem('personcontrol_jornadas');
        if (antigas !== null) {
          localStorage.setItem(`personcontrol_jornadas:${userId}`, antigas);
          localStorage.removeItem('personcontrol_jornadas');
          salvas = antigas;
        }
      }
      setJornadas(salvas ? JSON.parse(salvas) : []);

      let salva = localStorage.getItem(`personcontrol_jornada_ativa:${userId}`);
      if (salva === null) {
        const antiga = localStorage.getItem('personcontrol_jornada_ativa');
        if (antiga !== null) {
          localStorage.setItem(`personcontrol_jornada_ativa:${userId}`, antiga);
          localStorage.removeItem('personcontrol_jornada_ativa');
          salva = antiga;
        }
      }
      setJornadaAtiva(salva ? JSON.parse(salva) : null);
    } catch (err) {
      console.error('Erro ao carregar jornadas:', err);
      setJornadas([]);
      setJornadaAtiva(null);
    }

    setLoadedUserId(userId);
  }, [userId]);

  useEffect(() => {
    if (!userId || loadedUserId !== userId) return;
    const chave = `personcontrol_jornadas:${userId}`;
    if (jornadas.length === 0) {
      localStorage.removeItem(chave);
    } else {
      localStorage.setItem(chave, JSON.stringify(jornadas));
    }
  }, [jornadas, userId, loadedUserId]);

  useEffect(() => {
    if (!userId || loadedUserId !== userId) return;
    const chave = `personcontrol_jornada_ativa:${userId}`;
    if (jornadaAtiva) {
      localStorage.setItem(chave, JSON.stringify(jornadaAtiva));
    } else {
      localStorage.removeItem(chave);
    }
  }, [jornadaAtiva, userId, loadedUserId]);

  const iniciarJornada = useCallback((saldoInicial, kmInicial) => {
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
    return novaJornada;
  }, []);

  const adicionarGasto = useCallback((descricao, valor) => {
    const v = paraNumero(valor);
    if (!jornadaAtiva || v <= 0) return null;
    const gasto = {
      id: crypto.randomUUID(),
      descricao: (descricao || '').trim() || 'Gasto avulso',
      valor: v,
      criadoEm: new Date().toISOString()
    };
    setJornadaAtiva(prev => prev ? {
      ...prev,
      gastos: [...(prev.gastos || []), gasto],
      totalGastos: (prev.totalGastos || 0) + v
    } : prev);
    return gasto;
  }, [jornadaAtiva]);

  const removerGasto = useCallback((id) => {
    setJornadaAtiva(prev => {
      if (!prev) return prev;
      const gastos = (prev.gastos || []).filter(g => g.id !== id);
      return { ...prev, gastos, totalGastos: gastos.reduce((acc, g) => acc + g.valor, 0) };
    });
  }, []);

  const pausarJornada = useCallback(() => {
    setJornadaAtiva(prev => {
      if (!prev || prev.pausada) return prev;
      return {
        ...prev,
        pausada: true,
        pausas: [...(prev.pausas || []), { inicio: new Date().toISOString(), fim: null }]
      };
    });
  }, []);

  const retomarJornada = useCallback(() => {
    setJornadaAtiva(prev => {
      if (!prev || !prev.pausada) return prev;
      const pausas = [...(prev.pausas || [])];
      if (pausas.length > 0) {
        const ultima = pausas[pausas.length - 1];
        pausas[pausas.length - 1] = { ...ultima, fim: new Date().toISOString() };
      }
      return { ...prev, pausada: false, pausas };
    });
  }, []);

  const encerrarJornada = useCallback((valorApp, valorDinheiro, kmFinal) => {
    if (!jornadaAtiva) return null;

    const app = paraNumero(valorApp);
    const dinheiro = paraNumero(valorDinheiro);
    const kmFim = paraNumero(kmFinal);
    const temKmInicial = typeof jornadaAtiva.kmInicial === 'number';

    const agora = new Date();
    const agoraIso = agora.toISOString();

    // Fecha pausa aberta, se houver
    let pausas = [...(jornadaAtiva.pausas || [])];
    if (pausas.length > 0 && !pausas[pausas.length - 1].fim) {
      const ultima = pausas[pausas.length - 1];
      pausas[pausas.length - 1] = { ...ultima, fim: agoraIso };
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
    return jornadaFinalizada;
  }, [jornadaAtiva]);

  const excluirJornada = useCallback((id) => {
    setJornadas(prev => prev.filter(j => j.id !== id));
  }, []);

  const editarJornada = useCallback((id, dadosAtualizados) => {
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

      return {
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
    }));
  }, []);

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
