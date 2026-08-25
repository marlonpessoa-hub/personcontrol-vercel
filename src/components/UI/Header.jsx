import { useState, useEffect } from 'react';
import { getNomeExibicao, getFotoExibicao } from '../../utils/user';

const Header = ({ user, onSignOut, isDarkTheme, onToggleTheme, onNavigate }) => {
  const [profilePhoto, setProfilePhoto] = useState(() => {
    return localStorage.getItem('personcontrol_profile_photo');
  });
  const [photoRemovida, setPhotoRemovida] = useState(() => {
    return localStorage.getItem('personcontrol_photo_removida') === 'true';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setProfilePhoto(localStorage.getItem('personcontrol_profile_photo'));
      setPhotoRemovida(localStorage.getItem('personcontrol_photo_removida') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const fotoExibicao = getFotoExibicao(user, profilePhoto, photoRemovida);

  return (
    <header className="header" data-od-id="header">
      <div className="logo" data-od-id="logo">
        Person<span>Control</span>
      </div>
      <div className="user-menu">
        <button 
          className="btn-icon" 
          onClick={onToggleTheme}
          title={isDarkTheme ? "Mudar para tema claro" : "Mudar para tema escuro"}
          data-od-id="btn-toggle-theme"
          style={{ marginRight: 'var(--space-2)' }}
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
        {user && (
          <>
            <div className="user-avatar" data-od-id="user-avatar" onClick={() => onNavigate('perfil')} style={{ cursor: 'pointer' }} role="button" tabIndex="0" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate('perfil'); } }}>
              {fotoExibicao ? (
                <img src={fotoExibicao} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                getNomeExibicao(user).charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <span className="user-name" data-od-id="user-name" onClick={() => onNavigate('perfil')} style={{ cursor: 'pointer' }} role="button" tabIndex="0" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate('perfil'); } }}>
              {getNomeExibicao(user)}
            </span>
            <button 
              className="btn-icon" 
              onClick={onSignOut}
              title="Sair"
              data-od-id="btn-signout"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
