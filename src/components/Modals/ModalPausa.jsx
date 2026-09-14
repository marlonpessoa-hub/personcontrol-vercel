import { useState } from 'react';
import Modal from './Modal';

const ModalPausa = ({ isOpen, onClose, onConfirm, tipo }) => {
  const [km, setKm] = useState('');

  const kmValido = km !== '' && parseFloat(km) >= 0 && Number.isFinite(parseFloat(km));
  const isPausa = tipo === 'pausar';

  const handleConfirm = () => {
    if (kmValido) {
      onConfirm(parseFloat(km));
      setKm('');
      onClose();
    }
  };

  const handleSkip = () => {
    onConfirm(null);
    setKm('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isPausa ? 'Pausar Jornada' : 'Retomar Jornada'}>
      <div className="form-group">
        <label className="form-label">
          {isPausa ? 'KM ao Pausar' : 'KM ao Retornar'}
        </label>
        <input
          type="number"
          className="form-input"
          value={km}
          onChange={(e) => setKm(e.target.value)}
          placeholder="0"
          step="1"
          min="0"
          autoFocus
        />
        <div className="form-hint">
          Quilometragem atual do odômetro (opcional)
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <button
          className="btn btn-ghost btn-press"
          onClick={handleSkip}
          style={{ flex: 1 }}
        >
          PULAR
        </button>
        <button
          className="btn btn-primary btn-press"
          onClick={handleConfirm}
          disabled={!kmValido}
          style={{ flex: 1 }}
        >
          CONFIRMAR
        </button>
      </div>
    </Modal>
  );
};

export default ModalPausa;
