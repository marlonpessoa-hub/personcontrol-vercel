import { useState } from 'react';
import Modal from './Modal';
import MoneyInput from '../UI/MoneyInput';

const SUGESTOES = ['Combustível', 'Alimentação', 'Lavagem', 'Pedágio', 'Estacionamento'];

const ModalGasto = ({ isOpen, onClose, onConfirm }) => {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');

  const valorValido = valor !== '' && parseFloat(valor) > 0;

  const handleConfirm = () => {
    if (!valorValido) return;
    onConfirm(descricao.trim(), valor);
    setDescricao('');
    setValor('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Gasto">
      <div className="form-group">
        <label className="form-label" data-od-id="label-gasto-descricao">Descrição</label>
        <input
          type="text"
          className="form-input"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Ex.: Combustível"
          data-od-id="input-gasto-descricao"
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
          {SUGESTOES.map((sugestao) => (
            <button
              key={sugestao}
              type="button"
              className="btn btn-ghost btn-sm btn-press"
              onClick={() => setDescricao(sugestao)}
              style={{ width: 'auto', fontSize: 'var(--text-xs)' }}
              data-od-id={`sugestao-gasto-${sugestao.toLowerCase()}`}
            >
              {sugestao}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" data-od-id="label-gasto-valor">Valor (R$)</label>
        <MoneyInput
          className="form-input"
          value={valor}
          onChange={setValor}
          placeholder="0,00"
          data-od-id="input-gasto-valor"
        />
      </div>

      <button
        className="btn btn-primary btn-press"
        onClick={handleConfirm}
        disabled={!valorValido}
        style={{ width: '100%' }}
        data-od-id="btn-confirmar-gasto"
      >
        ADICIONAR GASTO
      </button>
    </Modal>
  );
};

export default ModalGasto;
