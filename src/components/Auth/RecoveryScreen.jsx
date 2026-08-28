import { useState } from 'react';

const RecoveryScreen = ({ onRecovery, onBackToLogin, loading, error, isDarkTheme, onToggleTheme }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSent(false);
    setLocalError('');
    const result = await onRecovery(email);
    if (result?.success) {
      setSent(true);
    } else {
      setLocalError(result?.error || 'Erro ao enviar e-mail de recuperação.');
    }
  };

  const erroExibido = localError || error;

  return (
    <div className="auth-container" data-od-id="recovery-screen">
      {onToggleTheme && (
        <button 
          className="btn-icon" 
          onClick={onToggleTheme}
          title={isDarkTheme ? "Mudar para tema claro" : "Mudar para tema escuro"}
          data-od-id="btn-toggle-theme-recovery"
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
      )}

      <div className="auth-logo scale-in" data-od-id="recovery-logo">
        <img src="/logo.png" alt="PersonControl" style={{ height: '160px', width: 'auto' }} />
      </div>

      <div className="auth-card scale-in">
        <h1 className="auth-title">Recuperar Senha</h1>

        {sent ? (
          <div data-od-id="recovery-sent">
            <p style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
              Enviamos um link de recuperação para <strong>{email}</strong>.
            </p>
            <p style={{ textAlign: 'center', marginBottom: 'var(--space-5)', color: 'var(--muted)', fontSize: '0.9rem' }}>
              Verifique sua caixa de entrada e clique no link para redefinir sua senha.
            </p>
            <button
              className="btn btn-primary btn-press"
              onClick={onBackToLogin}
              data-od-id="btn-back-login"
              style={{ width: '100%' }}
            >
              Voltar para o Login
            </button>
          </div>
        ) : (
          <>
            <p style={{ textAlign: 'center', marginBottom: 'var(--space-4)', color: 'var(--muted)', fontSize: '0.9rem' }}>
              Digite seu e-mail cadastrado para receber o link de redefinição de senha.
            </p>

            {erroExibido && (
              <div className="auth-error" data-od-id="recovery-error">{erroExibido}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  data-od-id="input-recovery-email"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-press"
                disabled={loading}
                data-od-id="btn-send-recovery"
                style={{ width: '100%' }}
              >
                {loading ? 'ENVIANDO...' : 'ENVIAR LINK DE RECUPERAÇÃO'}
              </button>
            </form>

            <div className="auth-footer">
              <button 
                onClick={onBackToLogin} 
                data-od-id="btn-back-login" 
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0, font: 'inherit' }}
              >
                Voltar para o Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RecoveryScreen;