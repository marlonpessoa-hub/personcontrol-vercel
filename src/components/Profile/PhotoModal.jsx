const PhotoModal = ({ isOpen, onClose, onSelectPhoto, onUseGooglePhoto, onTakePhoto, onRemovePhoto, hasGooglePhoto, hasPhoto }) => {
  if (!isOpen) return null;

  return (
    <div className="photo-modal-overlay" onClick={onClose} data-od-id="photo-modal-overlay">
      <div className="photo-modal-content" onClick={e => e.stopPropagation()} data-od-id="photo-modal-content">
        <div className="photo-modal-title">Alterar Foto</div>
        
        {hasGooglePhoto && (
          <div className="photo-option" onClick={onUseGooglePhoto} data-od-id="photo-option-google">
            <div className="photo-option-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                <path d="M2 12h20"></path>
              </svg>
            </div>
            <div className="photo-option-text">
              <div className="photo-option-title">Usar foto do Google</div>
              <div className="photo-option-desc">Importar da sua conta Google</div>
            </div>
          </div>
        )}

        <div className="photo-option" onClick={onTakePhoto} data-od-id="photo-option-camera">
          <div className="photo-option-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </div>
          <div className="photo-option-text">
            <div className="photo-option-title">Tirar foto</div>
            <div className="photo-option-desc">Usar a câmera do dispositivo</div>
          </div>
        </div>

        <div className="photo-option" onClick={onSelectPhoto} data-od-id="photo-option-gallery">
          <div className="photo-option-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
          <div className="photo-option-text">
            <div className="photo-option-title">Escolher da galeria</div>
            <div className="photo-option-desc">Selecionar imagem existente</div>
          </div>
        </div>

        {hasPhoto && (
          <div className="photo-option" onClick={onRemovePhoto} data-od-id="photo-option-remove">
            <div className="photo-option-icon" style={{ background: 'rgba(255, 107, 107, 0.1)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </div>
            <div className="photo-option-text">
              <div className="photo-option-title" style={{ color: '#ff6b6b' }}>Remover foto</div>
              <div className="photo-option-desc">Voltar para iniciais</div>
            </div>
          </div>
        )}

        <button className="photo-cancel" onClick={onClose} data-od-id="photo-modal-cancel">
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default PhotoModal;
