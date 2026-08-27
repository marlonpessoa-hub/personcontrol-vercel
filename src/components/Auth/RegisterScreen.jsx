import { useState } from 'react';
import GoogleIcon from '../UI/GoogleIcon';

const RegisterScreen = ({ onRegister, onLogin, onGoogleLogin, onAtivarChave, isDarkTheme, onToggleTheme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [chave, setChave] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);
    const result = await onRegister(email, password);
    if (!result.success) {
      setError(result.error || 'Erro ao criar conta');
      setLoading(false);
      return;
    }
    if (chave.trim() && onAtivarChave) {
      await onAtivarChave(chave.trim());
    }
    setLoading(false);
  };

  return (
    <div className="auth-container" data-od-id="register-screen">
      <button 
        className="btn-icon" 
        onClick={onToggleTheme}
        title={isDarkTheme ? "Mudar para tema claro" : "Mudar para tema escuro"}
        data-od-id="btn-toggle-theme-register"
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
      <div className="auth-logo scale-in" data-od-id="register-logo">
        <img src="/logo.png" alt="PersonControl" style={{ height: '120px', width: 'auto' }} />
      </div>
      
      <div className="auth-card scale-in">
        <h1 className="auth-title">Criar Conta</h1>
        
        {error && (
          <div className="auth-error" data-od-id="register-error">{error}</div>
        )}
        
        <button 
          className="btn-google btn-press" 
          onClick={onGoogleLogin}
          disabled={loading}
          data-od-id="btn-google-register"
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
              data-od-id="input-register-email"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Senha</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              data-od-id="input-register-password"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Confirmar Senha</label>
            <input
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
              required
              minLength={6}
              data-od-id="input-register-confirm"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Chave de acesso (opcional)</label>
            <input
              type="text"
              className="form-input"
              value={chave}
              onChange={(e) => setChave(e.target.value.toUpperCase())}
              placeholder="PC-XXXX-XXXX"
              style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
              data-od-id="input-register-chave"
            />
            <div className="form-hint" data-od-id="hint-register-chave">
              Sem chave, você ganha 30 dias de teste grátis
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            data-od-id="btn-register"
          >
            {loading ? 'CRIANDO...' : 'CRIAR CONTA'}
          </button>
        </form>
        
        <div className="auth-footer">
          Já tem conta?{' '}
          <button onClick={onLogin} data-od-id="link-login" type="button" style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0, font: 'inherit' }}>
            Fazer login
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
