import { useState, useEffect, useCallback, useMemo } from 'react';
import { calcularDuracao, paraNumero } from '../utils/formatters';

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

  const iniciarJornada = useCallback((saldoInicial) => {
    const novaJornada = {
      id: crypto.randomUUID(),
      dataInicio: new Date().toISOString(),
      dataFim: null,
      saldoInicial: paraNumero(saldoInicial),
      valorApp: 0,
      valorDinheiro: 0,
      totalGanho: 0,
      saldoFinal: 0,
      duracaoMinutos: 0,
      observacoes: ''
    };
    setJornadaAtiva(novaJornada);
    return novaJornada;
  }, []);

  const encerrarJornada = useCallback((valorApp, valorDinheiro) => {
    if (!jornadaAtiva) return null;

    const app = paraNumero(valorApp);
    const dinheiro = paraNumero(valorDinheiro);

    const agora = new Date().toISOString();
    const duracao = calcularDuracao(jornadaAtiva.dataInicio, agora);
    const totalGanho = app + dinheiro;
    const saldoFinal = jornadaAtiva.saldoInicial + totalGanho;

    const jornadaFinalizada = {
      ...jornadaAtiva,
      dataFim: agora,
      valorApp: app,
      valorDinheiro: dinheiro,
      totalGanho,
      saldoFinal,
      duracaoMinutos: duracao
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

      return {
        ...jornada,
        valorApp,
        valorDinheiro,
        totalGanho,
        saldoFinal,
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
    encerrarJornada,
    excluirJornada,
    editarJornada,
    estatisticasMes
  };
};

export default useJornada;
