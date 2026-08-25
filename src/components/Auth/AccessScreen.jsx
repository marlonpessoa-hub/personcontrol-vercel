import { useState } from 'react';
import { formatarData, formatarHora } from '../../utils/formatters';

const AccessScreen = ({ modo, erro, expiraEm, detalheTecnico, onAtivar, onRecarregar, onSignOut, isDarkTheme, onToggleTheme }) => {
  const [chave, setChave] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgErro, setMsgErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsgErro('');
    setLoading(true);
    const result = await onAtivar(chave);
    if (!result.success) {
      setMsgErro(result.error || 'Erro ao ativar a chave');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" data-od-id="access-screen">
      <button
        className="btn-icon"
        onClick={onToggleTheme}
        title={isDarkTheme ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
        data-od-id="btn-toggle-theme-access"
        style={{ position: 'absolute', top: 'var(--space-5)', right: 'var(--space-5)' }}
      >
        {isDarkTheme ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        )}
      </button>

      <div className="auth-logo scale-in" data-od-id="access-logo">
        Person<span>Control</span>
      </div>

      <div className="auth-card scale-in" style={{ maxWidth: '26rem', margin: '0 auto' }}>
        <h1 className="auth-title" data-od-id="access-title">
          {modo === 'erro' ? 'Verificação indisponível' : expiraEm ? 'Acesso expirado' : 'Ativação necessária'}
        </h1>

        {modo === 'erro' ? (
          <>
            <div className="auth-error" data-od-id="access-erro-sistema">{erro}</div>
            <p style={{ color: 'var(--meta)', fontSize: 'var(--text-sm)', textAlign: 'center', margin: 'var(--space-3) 0 var(--space-5)' }}>
              Não foi possível verificar seu acesso. Tente novamente ou ative uma chave.
            </p>
            <button
              className="btn btn-primary"
              onClick={onRecarregar}
              disabled={loading}
              style={{ width: '100%', marginBottom: 'var(--space-3)' }}
              data-od-id="btn-recarregar-acesso"
            >
              TENTAR NOVAMENTE
            </button>
          </>
        ) : (
          <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
            <div className="detail-row">
              <span className="detail-label">Expirou em</span>
              <span className="detail-value" data-od-id="access-expirou-em">
                {expiraEm ? `${formatarData(expiraEm)} às ${formatarHora(expiraEm)}` : '--'}
              </span>
            </div>
          </div>
        )}

        {msgErro && <div className="auth-error" data-od-id="access-error">{msgErro}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="chave-acesso">Chave de acesso</label>
            <input
              id="chave-acesso"
              type="text"
              className="form-input"
              value={chave}
              onChange={(e) => setChave(e.target.value.toUpperCase())}
              placeholder="PC-XXXX-XXXX"
              style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
              data-od-id="input-chave-acesso"
            />
            <div className="form-hint" data-od-id="hint-chave">
              Adquira uma chave com o administrador do sistema
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-press"
            disabled={loading || !chave.trim()}
            style={{ width: '100%' }}
            data-od-id="btn-ativar-chave"
          >
            {loading ? 'ATIVANDO...' : 'ATIVAR CHAVE'}
          </button>
        </form>

        <button
          className="btn btn-ghost btn-press"
          onClick={onSignOut}
          style={{ width: '100%', marginTop: 'var(--space-3)' }}
          data-od-id="btn-access-signout"
        >
          SAIR DA CONTA
        </button>
      </div>

      <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', color: 'var(--meta)', fontSize: 'var(--text-xs)' }}>
        Build {__BUILD__}
        {detalheTecnico && (
          <pre
            style={{
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              marginTop: 'var(--space-2)',
              padding: 'var(--space-3)',
              borderRadius: '8px',
              background: 'rgba(128, 128, 128, 0.12)',
              maxHeight: '9em',
              overflow: 'auto'
            }}
            data-od-id="access-detalhe-tecnico"
          >
            {detalheTecnico}
          </pre>
        )}
      </div>
    </div>
  );
};

export default AccessScreen;
