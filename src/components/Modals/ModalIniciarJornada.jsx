import { useState } from 'react';
import Modal from './Modal';

const ModalIniciarJornada = ({ isOpen, onClose, onConfirm }) => {
  const [saldo, setSaldo] = useState('');

  const handleConfirm = () => {
    if (saldo && parseFloat(saldo) >= 0) {
      onConfirm(saldo);
      setSaldo('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Jornada">
      <div className="form-group">
        <label className="form-label" data-od-id="label-saldo-inicial">
          Saldo Inicial (R$)
        </label>
        <input
          type="number"
          className="form-input"
          value={saldo}
          onChange={(e) => setSaldo(e.target.value)}
          placeholder="0,00"
          step="0.01"
          min="0"
          data-od-id="input-saldo-inicial"
        />
        <div className="form-hint" data-od-id="hint-saldo">
          Valor disponível para troco aos passageiros
        </div>
      </div>

      <button 
        className="btn btn-primary"
        onClick={handleConfirm}
        disabled={!saldo || parseFloat(saldo) < 0}
        data-od-id="btn-confirmar-inicio"
      >
        CONFIRMAR INÍCIO
      </button>
    </Modal>
  );
};

export default ModalIniciarJornada;
