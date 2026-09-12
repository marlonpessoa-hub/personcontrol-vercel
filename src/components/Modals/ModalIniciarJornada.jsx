import { useState } from 'react';
import Modal from './Modal';
import MoneyInput from '../UI/MoneyInput';

const ModalIniciarJornada = ({ isOpen, onClose, onConfirm }) => {
  const [saldo, setSaldo] = useState('');
  const [kmInicial, setKmInicial] = useState('');

  const saldoValido = saldo !== '' && parseFloat(saldo) >= 0;
  const kmValido = kmInicial !== '' && parseFloat(kmInicial) >= 0 && Number.isFinite(parseFloat(kmInicial));
  const podeConfirmar = saldoValido && kmValido;

  const handleConfirm = () => {
    if (podeConfirmar) {
      onConfirm(saldo, kmInicial);
      setSaldo('');
      setKmInicial('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Jornada">
      <div className="form-group">
        <label className="form-label" data-od-id="label-saldo-inicial">
          Saldo Inicial (R$)
        </label>
        <MoneyInput
          className="form-input"
          value={saldo}
          onChange={setSaldo}
          placeholder="0,00"
          data-od-id="input-saldo-inicial"
        />
        <div className="form-hint" data-od-id="hint-saldo">
          Valor disponível para troco aos passageiros
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" data-od-id="label-km-inicial">
          KM Inicial do Odômetro
        </label>
        <input
          type="number"
          className="form-input"
          value={kmInicial}
          onChange={(e) => setKmInicial(e.target.value)}
          placeholder="0"
          step="1"
          min="0"
          data-od-id="input-km-inicial"
        />
        <div className="form-hint" data-od-id="hint-km-inicial">
          Quilometragem atual do veículo
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={handleConfirm}
        disabled={!podeConfirmar}
        data-od-id="btn-confirmar-inicio"
      >
        CONFIRMAR INÍCIO
      </button>
    </Modal>
  );
};

export default ModalIniciarJornada;
