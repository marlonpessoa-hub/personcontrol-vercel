import { useState, useRef, useMemo } from 'react';
import PhotoModal from './PhotoModal';
import { formatarMoeda, formatarData, formatarHora } from '../../utils/formatters';
import { getNomeConta, getFotoGoogle, getFotoExibicao } from '../../utils/user';

const ProfileScreen = ({ user, configuracoes, jornadas, onSignOut, onAtivarChave, expiraEm, diasRestantes }) => {
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [chave, setChave] = useState('');
  const [ativando, setAtivando] = useState(false);
  const [msgChave, setMsgChave] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(() => {
    return localStorage.getItem('personcontrol_profile_photo');
  });
  const [photoRemovida, setPhotoRemovida] = useState(() => {
    return localStorage.getItem('personcontrol_photo_removida') === 'true';
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
        localStorage.removeItem('personcontrol_photo_removida');
        setPhotoRemovida(false);
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
    const googleFoto = getFotoGoogle(user);
    if (googleFoto) {
      setProfilePhoto(googleFoto);
      localStorage.setItem('personcontrol_profile_photo', googleFoto);
      localStorage.removeItem('personcontrol_photo_removida');
      setPhotoRemovida(false);
    }
    setShowPhotoModal(false);
  };

  const removePhoto = () => {
    setProfilePhoto(null);
    setPhotoRemovida(true);
    localStorage.removeItem('personcontrol_profile_photo');
    localStorage.setItem('personcontrol_photo_removida', 'true');
    setShowPhotoModal(false);
  };

  const handleAtivarChave = async () => {
    if (!chave.trim() || !onAtivarChave) return;
    setMsgChave(null);
    setAtivando(true);
    try {
      const result = await onAtivarChave(chave);
      if (result.success) {
        setMsgChave({
          tipo: 'sucesso',
          texto: `Chave ativada! Acesso até ${formatarData(result.expiraEm)} às ${formatarHora(result.expiraEm)}.`
        });
        setChave('');
      } else {
        setMsgChave({ tipo: 'erro', texto: result.error || 'Erro ao ativar a chave.' });
      }
    } finally {
      setAtivando(false);
    }
  };

  const getInitials = () => {
    const nome = getNomeConta(user) || configuracoes?.nomeMotorista || user?.email || 'U';
    return nome.charAt(0).toUpperCase();
  };

  const fotoExibicao = getFotoExibicao(user, profilePhoto, photoRemovida);

  const hasGooglePhoto = Boolean(getFotoGoogle(user));

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
            {fotoExibicao ? (
              <img src={fotoExibicao} alt="Foto do perfil" />
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
              {user?.app_metadata?.provider === 'google' ? 'Google' : 'E-mail'}
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

      <div className="profile-section card-animate" data-od-id="profile-acesso-section">
        <div className="profile-section-title">Acesso</div>
        <div className="profile-card">
          <div className="profile-card-item">
            <span className="profile-card-label">Vencimento</span>
            <span className="profile-card-value accent" data-od-id="profile-vencimento">
              {expiraEm
                ? `${formatarData(expiraEm)}${diasRestantes != null ? ` (${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'})` : ''}`
                : '--'}
            </span>
          </div>
          {msgChave && (
            <div
              style={{
                marginTop: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: '8px',
                fontSize: 'var(--text-sm)',
                background: msgChave.tipo === 'erro' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                color: msgChave.tipo === 'erro' ? '#ef4444' : '#22c55e'
              }}
              data-od-id={msgChave.tipo === 'erro' ? 'profile-chave-erro' : 'profile-chave-sucesso'}
            >
              {msgChave.texto}
            </div>
          )}
        </div>

        {onAtivarChave && (
          <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
            <label className="form-label" htmlFor="perfil-chave">Ativar nova chave</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                id="perfil-chave"
                type="text"
                className="form-input"
                value={chave}
                onChange={(e) => setChave(e.target.value.toUpperCase())}
                placeholder="PC-XXXX-XXXX"
                style={{ textTransform: 'uppercase', letterSpacing: '0.08em', flex: 1 }}
                data-od-id="input-perfil-chave"
              />
              <button
                className="btn btn-primary btn-press"
                onClick={handleAtivarChave}
                disabled={ativando || !chave.trim()}
                style={{ width: 'auto', whiteSpace: 'nowrap' }}
                data-od-id="btn-ativar-chave-perfil"
              >
                {ativando ? 'ATIVANDO...' : 'ATIVAR'}
              </button>
            </div>
            <div className="form-hint" data-od-id="hint-perfil-chave">
              Os dias da nova chave são somados ao tempo restante do seu acesso
            </div>
          </div>
        )}
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
