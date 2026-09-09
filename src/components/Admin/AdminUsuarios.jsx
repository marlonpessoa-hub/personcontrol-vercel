import { useState, useEffect } from 'react';
import useAdminUsuarios from '../../hooks/useAdminUsuarios';
import { formatarData } from '../../utils/formatters';

const OPCOES_DURACAO = [
  { valor: 30, rotulo: '30 dias' },
  { valor: 60, rotulo: '60 dias' },
  { valor: 90, rotulo: '90 dias' },
  { valor: 180, rotulo: '180 dias' },
  { valor: 365, rotulo: '1 ano' }
];

const statusUsuario = (usuario) => {
  if (!usuario.expira_em) return { label: 'Sem acesso', classe: 'badge-blocked' };
  const expira = new Date(usuario.expira_em);
  const agora = new Date();
  if (expira < agora) return { label: 'Expirado', classe: 'badge-expired' };
  const dias = Math.ceil((expira - agora) / 86400000);
  if (dias <= 7) return { label: `${dias}d restante${dias > 1 ? 's' : ''}`, classe: 'badge-warning' };
  return { label: `${dias}d restantes`, classe: 'badge-active' };
};

const AdminUsuarios = () => {
  const {
    usuarios,
    carregando,
    erro,
    listarUsuarios,
    bloquearUsuario,
    liberarUsuario,
    toggleAdmin,
    excluirUsuario
  } = useAdminUsuarios();

  const [confirmacao, setConfirmacao] = useState(null);
  const [liberarDias, setLiberarDias] = useState({});
  const [processando, setProcessando] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    listarUsuarios();
  }, [listarUsuarios]);

  const mostrarFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleBloquear = async (userId, email) => {
    setConfirmacao({
      tipo: 'bloquear',
      titulo: 'Bloquear usuário',
      mensagem: `Tem certeza que deseja bloquear ${email}? O acesso será revogado imediatamente.`,
      acao: async () => {
        setProcessando(userId);
        const result = await bloquearUsuario(userId);
        setProcessando(null);
        if (result.success) mostrarFeedback(`${email} bloqueado.`);
        else mostrarFeedback(`Erro: ${result.error}`);
      }
    });
  };

  const handleLiberar = async (userId, email) => {
    const dias = liberarDias[userId] || 30;
    setProcessando(userId);
    const result = await liberarUsuario(userId, dias);
    setProcessando(null);
    if (result.success) mostrarFeedback(`${email} liberado por ${dias} dias.`);
    else mostrarFeedback(`Erro: ${result.error}`);
  };

  const handleToggleAdmin = async (userId, email, isAdmin) => {
    const acao = isAdmin ? 'remover admin de' : 'promover a admin';
    setConfirmacao({
      tipo: 'admin',
      titulo: isAdmin ? 'Remover admin' : 'Promover a admin',
      mensagem: `Tem certeza que deseja ${acao} ${email}?`,
      acao: async () => {
        setProcessando(userId);
        const result = await toggleAdmin(userId);
        setProcessando(null);
        if (result.success) {
          mostrarFeedback(`${email} ${result.isAdmin ? 'promovido a admin' : 'removido de admin'}.`);
        } else {
          mostrarFeedback(`Erro: ${result.error}`);
        }
      }
    });
  };

  const handleExcluir = async (userId, email) => {
    setConfirmacao({
      tipo: 'excluir',
      titulo: 'Excluir usuário',
      mensagem: `Tem certeza que deseja EXCLUIR ${email}? Todos os dados (jornadas, acesso) serão removidos permanentemente. Esta ação não pode ser desfeita.`,
      acao: async () => {
        setProcessando(userId);
        const result = await excluirUsuario(userId);
        setProcessando(null);
        if (result.success) mostrarFeedback(`${email} excluído permanentemente.`);
        else mostrarFeedback(`Erro: ${result.error}`);
      }
    });
  };

  const confirmarAcao = async () => {
    if (confirmacao?.acao) await confirmacao.acao();
    setConfirmacao(null);
  };

  const totalAtivos = usuarios.filter(u => {
    const exp = u.expira_em ? new Date(u.expira_em) : null;
    return exp && exp > new Date();
  }).length;

  const totalExpirados = usuarios.filter(u => {
    const exp = u.expira_em ? new Date(u.expira_em) : null;
    return !exp || exp <= new Date();
  }).length;

  const totalAdmins = usuarios.filter(u => u.is_admin).length;

  return (
    <div data-od-id="admin-usuarios">
      {erro && (
        <div className="auth-error" style={{ marginBottom: 'var(--space-4)' }} data-od-id="admin-usuarios-error">
          {erro}
        </div>
      )}

      {feedback && (
        <div className="admin-feedback" data-od-id="admin-usuarios-feedback">
          {feedback}
        </div>
      )}

      <div className="profile-stat-grid admin-stat-grid" data-od-id="admin-usuarios-stats">
        <div className="profile-stat-card">
          <div className="profile-stat-value" data-od-id="stat-total-usuarios">{usuarios.length}</div>
          <div className="profile-stat-label">Total</div>
        </div>
        <div className="profile-stat-card">
          <div className="profile-stat-value accent" data-od-id="stat-ativos">{totalAtivos}</div>
          <div className="profile-stat-label">Ativos</div>
        </div>
        <div className="profile-stat-card">
          <div className="profile-stat-value" style={{ color: 'var(--warn)' }} data-od-id="stat-expirados">{totalExpirados}</div>
          <div className="profile-stat-label">Expirados</div>
        </div>
        <div className="profile-stat-card">
          <div className="profile-stat-value" style={{ color: 'var(--info, #60a5fa)' }} data-od-id="stat-admins">{totalAdmins}</div>
          <div className="profile-stat-label">Admins</div>
        </div>
      </div>

      <div className="profile-section-title" style={{ margin: 'var(--space-5) 0 var(--space-3)' }}>
        Usuários cadastrados
      </div>

      {carregando ? (
        <div className="empty-state">
          <div className="empty-title">Carregando...</div>
        </div>
      ) : usuarios.length === 0 ? (
        <div className="empty-state scale-in" data-od-id="admin-usuarios-vazio">
          <div className="empty-icon">👥</div>
          <div className="empty-title">Nenhum usuário cadastrado</div>
        </div>
      ) : (
        <div className="admin-user-list">
          {usuarios.map((usuario) => {
            const status = statusUsuario(usuario);
            const isProcessando = processando === usuario.user_id;

            return (
              <div key={usuario.user_id} className="admin-user-card" data-od-id={`admin-user-${usuario.user_id}`}>
                <div className="admin-user-header">
                  <div className="admin-user-info">
                    <div className="admin-user-email">
                      {usuario.email}
                      {usuario.is_admin && (
                        <span className="badge badge-admin">ADMIN</span>
                      )}
                    </div>
                    <div className="admin-user-meta">
                      <span className={`badge ${status.classe}`}>{status.label}</span>
                      {usuario.expira_em && (
                        <span className="admin-user-date">
                          Expira: {formatarData(usuario.expira_em)}
                        </span>
                      )}
                      {usuario.criado_em && (
                        <span className="admin-user-date">
                          Cadastro: {formatarData(usuario.criado_em)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="admin-user-actions">
                  <div className="admin-user-liberar">
                    <select
                      className="form-input admin-select"
                      value={liberarDias[usuario.user_id] || 30}
                      onChange={(e) => setLiberarDias(prev => ({
                        ...prev,
                        [usuario.user_id]: Number(e.target.value)
                      }))}
                      data-od-id={`select-dias-${usuario.user_id}`}
                    >
                      {OPCOES_DURACAO.map(o => (
                        <option key={o.valor} value={o.valor}>{o.rotulo}</option>
                      ))}
                    </select>
                    <button
                      className="btn btn-primary btn-sm btn-press"
                      onClick={() => handleLiberar(usuario.user_id, usuario.email)}
                      disabled={isProcessando}
                      data-od-id={`btn-liberar-${usuario.user_id}`}
                    >
                      {isProcessando ? '...' : 'LIBERAR'}
                    </button>
                  </div>

                  <div className="admin-user-btns">
                    <button
                      className="btn btn-ghost btn-sm btn-press"
                      onClick={() => handleBloquear(usuario.user_id, usuario.email)}
                      disabled={isProcessando}
                      data-od-id={`btn-bloquear-${usuario.user_id}`}
                    >
                      BLOQUEAR
                    </button>
                    <button
                      className="btn btn-ghost btn-sm btn-press"
                      onClick={() => handleToggleAdmin(usuario.user_id, usuario.email, usuario.is_admin)}
                      disabled={isProcessando}
                      data-od-id={`btn-toggle-admin-${usuario.user_id}`}
                    >
                      {usuario.is_admin ? 'REMOVER ADMIN' : 'TORNAR ADMIN'}
                    </button>
                    <button
                      className="btn btn-danger-outline btn-sm btn-press"
                      onClick={() => handleExcluir(usuario.user_id, usuario.email)}
                      disabled={isProcessando}
                      data-od-id={`btn-excluir-${usuario.user_id}`}
                    >
                      EXCLUIR
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de confirmação */}
      {confirmacao && (
        <div className="photo-modal-overlay" onClick={() => setConfirmacao(null)} data-od-id="modal-confirmacao">
          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="photo-modal-title">{confirmacao.titulo}</div>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--muted)',
              lineHeight: 1.5,
              marginBottom: 'var(--space-5)',
              textAlign: 'center'
            }}>
              {confirmacao.mensagem}
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button
                className="btn btn-ghost btn-press"
                onClick={() => setConfirmacao(null)}
                style={{ flex: 1 }}
              >
                CANCELAR
              </button>
              <button
                className={`btn btn-press ${confirmacao.tipo === 'excluir' || confirmacao.tipo === 'bloquear' ? 'btn-danger' : 'btn-primary'}`}
                onClick={confirmarAcao}
                style={{ flex: 1 }}
              >
                CONFIRMAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios;
