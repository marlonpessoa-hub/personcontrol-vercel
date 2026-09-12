import { useState } from 'react';
import Modal from './Modal';
import MoneyInput from '../UI/MoneyInput';

const ModalGorjeta = ({ isOpen, onClose, onConfirm }) => {
  const [valor, setValor] = useState('');

  const valorValido = valor !== '' && parseFloat(valor) > 0;

  const handleConfirm = () => {
    if (!valorValido) return;
    onConfirm(valor);
    setValor('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Gorjeta">
      <div className="form-group">
        <label className="form-label" data-od-id="label-gorjeta-valor">Valor da Gorjeta (R$)</label>
        <MoneyInput
          className="form-input"
          value={valor}
          onChange={setValor}
          placeholder="0,00"
          data-od-id="input-gorjeta-valor"
          autoFocus
        />
      </div>

      <button
        className="btn btn-primary btn-press"
        onClick={handleConfirm}
        disabled={!valorValido}
        style={{ width: '100%' }}
        data-od-id="btn-confirmar-gorjeta"
      >
        ADICIONAR GORJETA
      </button>
    </Modal>
  );
};

export default ModalGorjeta;