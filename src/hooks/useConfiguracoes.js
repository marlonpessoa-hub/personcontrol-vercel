import { useState, useEffect, useCallback } from 'react';

const useConfiguracoes = () => {
  const [configuracoes, setConfiguracoes] = useState(() => {
    const salvas = localStorage.getItem('personcontrol_configuracoes');
    return salvas ? JSON.parse(salvas) : {
      nomeMotorista: 'Motorista',
      metaDiaria: 200,
      moeda: 'BRL'
    };
  });

  useEffect(() => {
    localStorage.setItem('personcontrol_configuracoes', JSON.stringify(configuracoes));
  }, [configuracoes]);

  const atualizarConfiguracoes = useCallback((novas) => {
    setConfiguracoes(prev => ({ ...prev, ...novas }));
  }, []);

  return { configuracoes, atualizarConfiguracoes };
};

export default useConfiguracoes;
