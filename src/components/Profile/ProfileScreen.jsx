import { useState, useRef, useMemo } from 'react';
import PhotoModal from './PhotoModal';
import { formatarMoeda, formatarData } from '../../utils/formatters';
import { getNomeConta } from '../../utils/user';

const ProfileScreen = ({ user, configuracoes, jornadas, onSignOut }) => {
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(() => {
    return localStorage.getItem('personcontrol_profile_photo') || null;
  });

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const photoUrl = event.target.result;
        setProfilePhoto(photoUrl);
        localStorage.setItem('personcontrol_profile_photo', photoUrl);
      };
      reader.readAsDataURL(file);
    }
    setShowPhotoModal(false);
  };

  const handleTakePhoto = () => {
    cameraInputRef.current?.click();
  };

  const handleSelectPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleUseGooglePhoto = () => {
    if (user?.user_metadata?.avatar_url) {
      setProfilePhoto(user.user_metadata.avatar_url);
      localStorage.setItem('personcontrol_profile_photo', user.user_metadata.avatar_url);
    }
    setShowPhotoModal(false);
  };

  const removePhoto = () => {
    setProfilePhoto(null);
    localStorage.removeItem('personcontrol_profile_photo');
    setShowPhotoModal(false);
  };

  const getInitials = () => {
    const nome = getNomeConta(user) || configuracoes?.nomeMotorista || user?.email || 'U';
    return nome.charAt(0).toUpperCase();
  };

  const hasGooglePhoto = user?.app_metadata?.provider === 'google' && user?.user_metadata?.avatar_url;

  const estatisticas = useMemo(() => {
    const totalJornadas = jornadas.length;
    const totalGanho = jornadas.reduce((acc, j) => acc + j.totalGanho, 0);
    const melhorDia = jornadas.length > 0 
      ? jornadas.reduce((melhor, j) => j.totalGanho > melhor.totalGanho ? j : melhor, jornadas[0])
      : null;
    return { totalJornadas, totalGanho, melhorDia };
  }, [jornadas]);

  return (
    <div className="page page-animate" data-od-id="profile-screen">
      <h1 className="page-title">Meu Perfil</h1>

      <div className="profile-header card-animate" data-od-id="profile-header">
        <div className="profile-avatar-container">
          <div className="profile-avatar" data-od-id="profile-avatar">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Foto do perfil" />
            ) : (
              getInitials()
            )}
          </div>
          <button 
            className="profile-avatar-edit"
            onClick={() => setShowPhotoModal(true)}
            data-od-id="btn-edit-photo"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </button>
        </div>
        <div className="profile-name" data-od-id="profile-name">
          {getNomeConta(user) || configuracoes?.nomeMotorista || 'Motorista'}
        </div>
        <div className="profile-email" data-od-id="profile-email">
          {user?.email || 'email@exemplo.com'}
        </div>
      </div>

      <div className="profile-section card-animate" data-od-id="profile-account-section">
        <div className="profile-section-title">Informações da Conta</div>
        <div className="profile-card">
          <div className="profile-card-item">
            <span className="profile-card-label">E-mail</span>
            <span className="profile-card-value" data-od-id="profile-email-value">
              {user?.email || 'Não informado'}
            </span>
          </div>
          <div className="profile-card-item">
            <span className="profile-card-label">Tipo de Conta</span>
            <span className="profile-card-value accent" data-od-id="profile-account-type">
              {user?.id === 'demo-user-id' ? 'Modo Demo' : 
               user?.app_metadata?.provider === 'google' ? 'Google' : 'E-mail'}
            </span>
          </div>
          <div className="profile-card-item">
            <span className="profile-card-label">Membro desde</span>
            <span className="profile-card-value" data-od-id="profile-member-since">
              {user?.created_at ? formatarData(user.created_at) : 'Hoje'}
            </span>
          </div>
        </div>
      </div>

      <div className="profile-section card-animate" data-od-id="profile-stats-section">
        <div className="profile-section-title">Estatísticas Pessoais</div>
        <div className="profile-stat-grid">
          <div className="profile-stat-card">
            <div className="profile-stat-value" data-od-id="profile-total-journeys">
              {estatisticas.totalJornadas}
            </div>
            <div className="profile-stat-label">Jornadas</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-value" data-od-id="profile-total-earnings">
              {formatarMoeda(estatisticas.totalGanho)}
            </div>
            <div className="profile-stat-label">Total Ganho</div>
          </div>
        </div>
      </div>

      <button 
        className="btn btn-danger-outline btn-press"
        onClick={onSignOut}
        style={{ marginTop: 'var(--space-4)' }}
        data-od-id="btn-signout-profile"
      >
        SAIR DA CONTA
      </button>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden-input"
        onChange={handleFileSelect}
        data-od-id="input-file-gallery"
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="user"
        className="hidden-input"
        onChange={handleFileSelect}
        data-od-id="input-file-camera"
      />

      <PhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        onSelectPhoto={handleSelectPhoto}
        onUseGooglePhoto={handleUseGooglePhoto}
        onTakePhoto={handleTakePhoto}
        onRemovePhoto={removePhoto}
        hasGooglePhoto={hasGooglePhoto}
        hasPhoto={!!profilePhoto}
      />
    </div>
  );
};

export default ProfileScreen;
