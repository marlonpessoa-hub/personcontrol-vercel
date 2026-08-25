import { useState, useEffect } from 'react';
import Modal from './Modal';
import { formatarMoeda, formatarData, formatarHora, formatarDuracao, formatarNumero } from '../../utils/formatters';

const ModalEditarJornada = ({ isOpen, onClose, onConfirm, jornada }) => {
  const [valorApp, setValorApp] = useState('');
  const [valorDinheiro, setValorDinheiro] = useState('');
  const [kmInicial, setKmInicial] = useState('');
  const [kmFinal, setKmFinal] = useState('');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (jornada) {
      setValorApp(jornada.valorApp.toString());
      setValorDinheiro(jornada.valorDinheiro.toString());
      setKmInicial(jornada.kmInicial != null ? jornada.kmInicial.toString() : '');
      setKmFinal(jornada.kmFinal != null ? jornada.kmFinal.toString() : '');
      setObservacoes(jornada.observacoes || '');
    }
  }, [jornada]);

  const totalGanho = (parseFloat(valorApp) || 0) + (parseFloat(valorDinheiro) || 0);
  const saldoFinal = jornada ? jornada.saldoInicial + totalGanho : 0;

  const kmIniNum = parseFloat(kmInicial);
  const kmFimNum = parseFloat(kmFinal);
  const kmInvalido =
    kmInicial !== '' && kmFinal !== '' &&
    Number.isFinite(kmIniNum) && Number.isFinite(kmFimNum) &&
    kmFimNum < kmIniNum;
  const kmRodadoPrevisto =
    Number.isFinite(kmIniNum) && Number.isFinite(kmFimNum)
      ? Math.max(0, kmFimNum - kmIniNum)
      : null;

  const handleConfirm = () => {
    if (kmInvalido) return;
    onConfirm(jornada.id, {
      valorApp: valorApp || '0',
      valorDinheiro: valorDinheiro || '0',
      kmInicial,
      kmFinal,
      observacoes
    });
    onClose();
  };

  if (!jornada) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Jornada">
      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="detail-row">
          <span className="detail-label">Data</span>
          <span className="detail-value" data-od-id="edit-detail-data">
            {formatarData(jornada.dataInicio)}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Início</span>
          <span className="detail-value" data-od-id="edit-detail-inicio">
            {formatarHora(jornada.dataInicio)}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Fim</span>
          <span className="detail-value" data-od-id="edit-detail-fim">
            {jornada.dataFim ? formatarHora(jornada.dataFim) : '--:--'}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Duração</span>
          <span className="detail-value" data-od-id="edit-detail-duracao">
            {formatarDuracao(jornada.duracaoMinutos)}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Saldo Inicial</span>
          <span className="detail-value" data-od-id="edit-detail-saldo">
            {formatarMoeda(jornada.saldoInicial)}
          </span>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" data-od-id="edit-label-valor-app">
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
          data-od-id="edit-input-valor-app"
        />
      </div>

      <div className="form-group">
        <label className="form-label" data-od-id="edit-label-valor-dinheiro">
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
          data-od-id="edit-input-valor-dinheiro"
        />
      </div>

      <div className="form-group">
        <label className="form-label" data-od-id="edit-label-km-inicial">
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
          data-od-id="edit-input-km-inicial"
        />
      </div>

      <div className="form-group">
        <label className="form-label" data-od-id="edit-label-km-final">
          KM Final do Odômetro
        </label>
        <input
          type="number"
          className="form-input"
          value={kmFinal}
          onChange={(e) => setKmFinal(e.target.value)}
          placeholder="0"
          step="1"
          min={kmInicial !== '' ? kmInicial : '0'}
          data-od-id="edit-input-km-final"
        />
        {kmInvalido && (
          <div className="form-hint" style={{ color: 'var(--danger, #ef4444)' }} data-od-id="edit-hint-km-invalido">
            O KM final deve ser maior ou igual ao inicial
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label" data-od-id="edit-label-observacoes">
          Observações
        </label>
        <textarea
          className="form-input"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Adicione observações (opcional)"
          data-od-id="edit-input-observacoes"
          rows={3}
          style={{ resize: 'vertical' }}
        />
      </div>

      <div className="divider"></div>

      <div className="detail-row">
        <span className="detail-label">Total Ganho</span>
        <span className="detail-value accent" data-od-id="edit-detail-total-ganho">
          {formatarMoeda(totalGanho)}
        </span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Saldo Final</span>
        <span className="detail-value accent" data-od-id="edit-detail-saldo-final">
          {formatarMoeda(saldoFinal)}
        </span>
      </div>

      {kmRodadoPrevisto !== null && (
        <div className="detail-row">
          <span className="detail-label">KM Rodado</span>
          <span className="detail-value accent" data-od-id="edit-detail-km-rodado">
            {formatarNumero(kmRodadoPrevisto)} km
          </span>
        </div>
      )}

      {jornada.editadoEm && (
        <div style={{ marginTop: 'var(--space-4)', textAlign: 'center' }}>
          <span className="badge" data-od-id="edit-badge">
            Editado em {formatarData(jornada.editadoEm)} às {formatarHora(jornada.editadoEm)}
          </span>
        </div>
      )}

      <button 
        className="btn btn-primary btn-press"
        onClick={handleConfirm}
        disabled={kmInvalido}
        style={{ marginTop: 'var(--space-5)' }}
        data-od-id="btn-salvar-edicao"
      >
        SALVAR ALTERAÇÕES
      </button>
    </Modal>
  );
};

export default ModalEditarJornada;
