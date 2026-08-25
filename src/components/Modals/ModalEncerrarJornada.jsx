import { useState } from 'react';
import Modal from './Modal';
import { formatarMoeda, formatarHora, formatarDuracao, calcularDuracao, formatarNumero } from '../../utils/formatters';

const ModalEncerrarJornada = ({ isOpen, onClose, onConfirm, jornadaAtiva }) => {
  const [valorApp, setValorApp] = useState('');
  const [valorDinheiro, setValorDinheiro] = useState('');
  const [kmFinal, setKmFinal] = useState('');

  const totalGanho = (parseFloat(valorApp) || 0) + (parseFloat(valorDinheiro) || 0);
  const saldoFinal = jornadaAtiva ? jornadaAtiva.saldoInicial + totalGanho : 0;
  const duracao = jornadaAtiva ? calcularDuracao(jornadaAtiva.dataInicio, new Date()) : 0;

  const kmInicial = typeof jornadaAtiva?.kmInicial === 'number' ? jornadaAtiva.kmInicial : null;
  const kmFinalNum = parseFloat(kmFinal);
  const kmValido = kmFinal !== '' && Number.isFinite(kmFinalNum) && (kmInicial === null || kmFinalNum >= kmInicial);
  const kmRodadoPrevisto = kmValido && kmInicial !== null ? kmFinalNum - kmInicial : null;

  const handleConfirm = () => {
    if (!kmValido) return;
    onConfirm(valorApp || '0', valorDinheiro || '0', kmFinal);
    setValorApp('');
    setValorDinheiro('');
    setKmFinal('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Encerrar Jornada">
      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="detail-row">
          <span className="detail-label">Duração</span>
          <span className="detail-value" data-od-id="detail-duracao">
            {formatarDuracao(duracao)}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Início</span>
          <span className="detail-value" data-od-id="detail-inicio">
            {jornadaAtiva ? formatarHora(jornadaAtiva.dataInicio) : '--:--'}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Saldo Inicial</span>
          <span className="detail-value" data-od-id="detail-saldo">
            {jornadaAtiva ? formatarMoeda(jornadaAtiva.saldoInicial) : 'R$ 0,00'}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">KM Inicial</span>
          <span className="detail-value" data-od-id="detail-km-inicial">
            {kmInicial !== null ? `${formatarNumero(kmInicial)} km` : '--'}
          </span>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" data-od-id="label-valor-app">
          Valor recebido pelo aplicativo 99 (R$)
        </label>
        <input
          type="number"
          className="form-input"
          value={valorApp}
          onChange={(e) => setValorApp(e.target.value)}
          placeholder="0,00"
          step="0.01"
          min="0"
          data-od-id="input-valor-app"
        />
      </div>

      <div className="form-group">
        <label className="form-label" data-od-id="label-valor-dinheiro">
          Valor recebido em dinheiro (R$)
        </label>
        <input
          type="number"
          className="form-input"
          value={valorDinheiro}
          onChange={(e) => setValorDinheiro(e.target.value)}
          placeholder="0,00"
          step="0.01"
          min="0"
          data-od-id="input-valor-dinheiro"
        />
      </div>

      <div className="form-group">
        <label className="form-label" data-od-id="label-km-final">
          KM Final do Odômetro
        </label>
        <input
          type="number"
          className="form-input"
          value={kmFinal}
          onChange={(e) => setKmFinal(e.target.value)}
          placeholder="0"
          step="1"
          min={kmInicial !== null ? kmInicial : '0'}
          data-od-id="input-km-final"
        />
        {!kmValido && kmFinal !== '' && (
          <div className="form-hint" style={{ color: 'var(--danger, #ef4444)' }} data-od-id="hint-km-invalido">
            O KM final deve ser maior ou igual ao inicial
          </div>
        )}
      </div>

      <div className="divider"></div>

      {kmRodadoPrevisto !== null && (
        <div className="detail-row">
          <span className="detail-label">KM Rodado</span>
          <span className="detail-value accent" data-od-id="detail-km-rodado-previsto">
            {formatarNumero(kmRodadoPrevisto)} km
          </span>
        </div>
      )}
      <div className="detail-row">
        <span className="detail-label">Total Ganho</span>
        <span className="detail-value accent" data-od-id="detail-total-ganho">
          {formatarMoeda(totalGanho)}
        </span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Saldo Final</span>
        <span className="detail-value accent" data-od-id="detail-saldo-final">
          {formatarMoeda(saldoFinal)}
        </span>
      </div>

      <button
        className="btn btn-primary btn-press"
        onClick={handleConfirm}
        disabled={!kmValido}
        style={{ marginTop: 'var(--space-5)' }}
        data-od-id="btn-salvar-encerrar"
      >
        SALVAR E ENCERRAR
      </button>
    </Modal>
  );
};

export default ModalEncerrarJornada;
