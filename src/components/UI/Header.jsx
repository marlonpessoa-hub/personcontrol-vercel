import { useState, useEffect } from 'react';
import { getNomeExibicao, getFotoExibicao, chaveFotoPerfil, chaveFotoRemovida } from '../../utils/user';

const Header = ({ user, isDarkTheme, onToggleTheme, onNavigate }) => {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoRemovida, setPhotoRemovida] = useState(false);
  const userId = user?.id;

  // Chaves por usuário + ressincronização ao trocar de conta
  useEffect(() => {
    const sincronizar = () => {
      setProfilePhoto(userId ? localStorage.getItem(chaveFotoPerfil(userId)) : null);
      setPhotoRemovida(userId ? localStorage.getItem(chaveFotoRemovida(userId)) === 'true' : false);
    };
    sincronizar();
    window.addEventListener('storage', sincronizar);
    return () => window.removeEventListener('storage', sincronizar);
  }, [userId]);

  const fotoExibicao = getFotoExibicao(user, profilePhoto, photoRemovida);
  const primeiroNome = user ? getNomeExibicao(user).split(' ')[0] : '';

  return (
    <header className="header" data-od-id="header" style={{ padding: 'var(--space-4) 0', borderBottom: 'none', marginBottom: 'var(--space-2)' }}>
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div className="logo" data-od-id="logo" onClick={() => onNavigate('dashboard')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} role="button" tabIndex="0" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate('dashboard'); } }}>
          <img src="/logo.png" alt="PersonControl" style={{ height: '56px', width: 'auto', borderRadius: '8px' }} />
        </div>
        {user && (
          <span className="greeting-text" style={{ fontSize: 'var(--text-xl)', fontWeight: '700', color: 'var(--fg)', letterSpacing: '-0.02em' }}>
            Olá, {primeiroNome}
          </span>
        )}
      </div>
      
      <div className="user-menu" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <button 
          className="btn-icon" 
          onClick={onToggleTheme}
          title={isDarkTheme ? "Mudar para tema claro" : "Mudar para tema escuro"}
          data-od-id="btn-toggle-theme"
          style={{ background: 'none', border: 'none', color: 'var(--fg)', cursor: 'pointer' }}
        >
          {isDarkTheme ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>
        {user && (
          <div className="user-avatar" data-od-id="user-avatar" onClick={() => onNavigate('perfil')} style={{ cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface-warm)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }} role="button" tabIndex="0" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate('perfil'); } }}>
            {fotoExibicao ? (
              <img src={fotoExibicao} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: '600', color: 'var(--fg)' }}>{primeiroNome.charAt(0).toUpperCase() || 'U'}</span>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
