import { useState, useEffect, useCallback } from 'react';
import supabase from '../supabase';

const ALFABETO_CODIGO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const gerarCodigoChave = () => {
  const segmento = () =>
    Array.from(
      { length: 4 },
      () => ALFABETO_CODIGO[Math.floor(Math.random() * ALFABETO_CODIGO.length)]
    ).join('');
  return `PC-${segmento()}-${segmento()}`;
};

const useAccess = (user) => {
  const [acesso, setAcesso] = useState(null);
  const [carregandoAcesso, setCarregandoAcesso] = useState(true);
  const [erroAcesso, setErroAcesso] = useState(null);

  const carregarAcesso = useCallback(async () => {
    if (!user?.id) {
      setAcesso(null);
      setCarregandoAcesso(false);
      return;
    }
    setCarregandoAcesso(true);
    try {
      const { data, error } = await supabase
        .from('user_access')
        .select('user_id, email, expira_em, is_admin')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      setErroAcesso(null);
      setAcesso(data || { user_id: user.id, email: user.email, expira_em: null, is_admin: false });
    } catch (err) {
      console.error('Erro ao carregar acesso:', err);
      setErroAcesso(err.message);
      setAcesso(null);
    } finally {
      setCarregandoAcesso(false);
    }
  }, [user?.id, user?.email]);

  useEffect(() => {
    carregarAcesso();
  }, [carregarAcesso]);

  const ativarChave = useCallback(async (codigo) => {
    if (!codigo || !codigo.trim()) {
      return { success: false, error: 'Digite uma chave de acesso.' };
    }
    try {
      const { data, error } = await supabase.rpc('ativar_chave', { p_codigo: codigo.trim() });
      if (error) throw error;
      await carregarAcesso();
      return { success: true, expiraEm: data };
    } catch (err) {
      let mensagem = err.message;
      if (err.message?.includes('CHAVE_INVALIDA')) {
        mensagem = 'Chave inválida ou já utilizada.';
      } else if (err.message?.includes('NAO_AUTENTICADO')) {
        mensagem = 'Faça login para ativar a chave.';
      }
      return { success: false, error: mensagem };
    }
  }, [carregarAcesso]);

  const listarChaves = useCallback(async () => {
    const { data, error } = await supabase
      .from('access_keys')
      .select('*')
      .order('criado_em', { ascending: false });
    if (error) throw error;
    return data || [];
  }, []);

  const criarChave = useCallback(async (duracaoDias) => {
    const codigo = gerarCodigoChave();
    const { data, error } = await supabase
      .from('access_keys')
      .insert({ codigo, duracao_dias: Number(duracaoDias), criado_por: user?.email || null })
      .select()
      .single();
    if (error) throw error;
    return data;
  }, [user?.email]);

  const excluirChave = useCallback(async (id) => {
    const { error } = await supabase.from('access_keys').delete().eq('id', id);
    if (error) throw error;
  }, []);

  const expiraEmDate = acesso?.expira_em ? new Date(acesso.expira_em) : null;
  const expirado = !acesso?.expira_em || expiraEmDate < new Date();
  const diasRestantes = expiraEmDate
    ? Math.max(0, Math.ceil((expiraEmDate.getTime() - Date.now()) / 86400000))
    : 0;

  return {
    acesso,
    carregandoAcesso,
    erroAcesso,
    bloqueado: !carregandoAcesso && (!!erroAcesso || expirado),
    expirado,
    expiraEm: expiraEmDate,
    diasRestantes,
    isAdmin: Boolean(acesso?.is_admin) && !expirado,
    carregarAcesso,
    ativarChave,
    listarChaves,
    criarChave,
    excluirChave
  };
};

export default useAccess;
