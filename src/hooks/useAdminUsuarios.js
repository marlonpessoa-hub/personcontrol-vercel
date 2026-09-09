import { useState, useCallback } from 'react';
import supabase from '../supabase';

const useAdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const listarUsuarios = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const { data, error } = await supabase.rpc('admin_listar_usuarios');
      if (error) throw error;
      setUsuarios(data || []);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  const bloquearUsuario = useCallback(async (userId) => {
    try {
      const { error } = await supabase.rpc('admin_bloquear_usuario', { p_user_id: userId });
      if (error) throw error;
      await listarUsuarios();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [listarUsuarios]);

  const liberarUsuario = useCallback(async (userId, dias) => {
    try {
      const { data, error } = await supabase.rpc('admin_liberar_usuario', {
        p_user_id: userId,
        p_dias: dias
      });
      if (error) throw error;
      await listarUsuarios();
      return { success: true, expiraEm: data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [listarUsuarios]);

  const toggleAdmin = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase.rpc('admin_toggle_admin', { p_user_id: userId });
      if (error) throw error;
      await listarUsuarios();
      return { success: true, isAdmin: data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [listarUsuarios]);

  const excluirUsuario = useCallback(async (userId) => {
    try {
      const { error } = await supabase.rpc('admin_excluir_usuario', { p_user_id: userId });
      if (error) throw error;
      await listarUsuarios();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [listarUsuarios]);

  return {
    usuarios,
    carregando,
    erro,
    listarUsuarios,
    bloquearUsuario,
    liberarUsuario,
    toggleAdmin,
    excluirUsuario
  };
};

export default useAdminUsuarios;
