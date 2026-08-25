const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} data-od-id="modal-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()}
        data-od-id="modal-content"
      >
        <div className="modal-header">
          <h2 className="modal-title" data-od-id="modal-title">{title}</h2>
          <button 
            className="modal-close" 
            onClick={onClose}
            data-od-id="modal-close"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
