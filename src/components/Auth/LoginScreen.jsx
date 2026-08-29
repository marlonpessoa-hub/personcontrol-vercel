import { useState } from 'react';
import GoogleIcon from '../UI/GoogleIcon';

const LoginScreen = ({ onLogin, onRegister, onGoogleLogin, onRecovery, isDarkTheme, onToggleTheme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await onLogin(email, password);
    if (!result.success) {
      setError(result.error || 'Erro ao fazer login');
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    const result = await onGoogleLogin();
    if (result && !result.success) {
      setError(result.error || 'Falha ao entrar com Google.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container" data-od-id="login-screen">
      <button 
        className="btn-icon" 
        onClick={onToggleTheme}
        title={isDarkTheme ? "Mudar para tema claro" : "Mudar para tema escuro"}
        data-od-id="btn-toggle-theme-login"
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
      <div className="auth-logo scale-in" data-od-id="login-logo">
        <img src="/logo.png" alt="PersonControl" style={{ height: '160px', width: 'auto' }} />
      </div>
      
      <div className="auth-card scale-in">
        <h1 className="auth-title">Entrar</h1>
        
        {error && (
          <div className="auth-error" data-od-id="login-error">{error}</div>
        )}
        
          <button 
            className="btn-google btn-press" 
            onClick={handleGoogle}
            disabled={loading}
            data-od-id="btn-google-login"
          >
          <GoogleIcon />
          Continuar com Google
        </button>
        
        <div className="auth-divider">
          <span>ou</span>
        </div>
        
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
              data-od-id="input-login-email"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Senha</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              data-od-id="input-login-password"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-press"
            disabled={loading}
            data-od-id="btn-login"
          >
            {loading ? 'ENTRANDO...' : 'ENTRAR'}
          </button>
        </form>

        <div className="auth-footer">
          <button onClick={onRecovery} data-od-id="btn-forgot-password" type="button" style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0, font: 'inherit' }}>
            Esqueceu a senha?
          </button>
          &nbsp;·&nbsp;
          <button onClick={onRegister} data-od-id="link-register" type="button" style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0, font: 'inherit' }}>
            Criar conta
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
