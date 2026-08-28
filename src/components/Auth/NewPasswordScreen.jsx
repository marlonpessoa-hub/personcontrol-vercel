import { useState } from 'react';

const NewPasswordScreen = ({ onUpdatePassword, onCancel, loading, error, isDarkTheme, onToggleTheme }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (password !== confirmPassword) {
      setLocalError('As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      setLocalError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    const result = await onUpdatePassword(password);
    if (result && !result.success) {
      setLocalError(result.error || 'Erro ao atualizar a senha.');
    }
  };

  const erroExibido = localError || error;

  return (
    <div className="auth-container" data-od-id="new-password-screen">
      {onToggleTheme && (
        <button 
          className="btn-icon" 
          onClick={onToggleTheme}
          title={isDarkTheme ? "Mudar para tema claro" : "Mudar para tema escuro"}
          data-od-id="btn-toggle-theme-new-password"
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

      <div className="auth-logo scale-in" data-od-id="new-password-logo">
        <img src="/logo.png" alt="PersonControl" style={{ height: '160px', width: 'auto' }} />
      </div>

      <div className="auth-card scale-in">
        <h1 className="auth-title">Nova Senha</h1>
        <p style={{ textAlign: 'center', marginBottom: 'var(--space-4)', color: 'var(--muted)', fontSize: '0.9rem' }}>
          Defina sua nova senha abaixo para acessar sua conta.
        </p>

        {erroExibido && (
          <div className="auth-error" data-od-id="new-password-error">{erroExibido}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nova Senha</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              data-od-id="input-new-password"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar Nova Senha</label>
            <input
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              data-od-id="input-confirm-new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-press"
            disabled={loading}
            data-od-id="btn-save-new-password"
            style={{ width: '100%' }}
          >
            {loading ? 'SALVANDO...' : 'SALVAR NOVA SENHA'}
          </button>
        </form>

        <div className="auth-footer">
          <button 
            onClick={onCancel} 
            data-od-id="btn-cancel-recovery" 
            type="button"
            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0, font: 'inherit' }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewPasswordScreen;