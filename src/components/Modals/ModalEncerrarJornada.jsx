import { useState } from 'react';
import Modal from './Modal';
import { formatarMoeda, formatarHora, formatarDuracao, calcularDuracao, calcularMinutosPausados, formatarNumero } from '../../utils/formatters';

const ModalEncerrarJornada = ({ isOpen, onClose, onConfirm, jornadaAtiva }) => {
  const [valorApp, setValorApp] = useState('');
  const [valorDinheiro, setValorDinheiro] = useState('');
  const [kmFinal, setKmFinal] = useState('');

  const totalGanho = (parseFloat(valorApp) || 0) + (parseFloat(valorDinheiro) || 0) + (jornadaAtiva?.totalGorjetas || 0);
  const totalGastos = jornadaAtiva?.totalGastos || 0;
  const lucroLiquido = totalGanho - totalGastos;
  const saldoFinal = jornadaAtiva ? jornadaAtiva.saldoInicial + lucroLiquido : 0;

  const agora = new Date();
  const duracaoBruta = jornadaAtiva ? calcularDuracao(jornadaAtiva.dataInicio, agora) : 0;
  const minutosPausados = jornadaAtiva ? calcularMinutosPausados(jornadaAtiva, agora) : 0;
  const duracao = Math.max(0, duracaoBruta - minutosPausados);

  const kmInicial = typeof jornadaAtiva?.kmInicial === 'number' ? jornadaAtiva.kmInicial : null;
  const kmFinalNum = parseFloat(kmFinal);
  const kmValido = kmFinal !== '' && Number.isFinite(kmFinalNum) && (kmInicial === null || kmFinalNum >= kmInicial);
  const kmRodadoPrevisto = kmValido && kmInicial !== null ? kmFinalNum - kmInicial : null;
  const valorPorKm = kmRodadoPrevisto != null && kmRodadoPrevisto > 0 ? totalGanho / kmRodadoPrevisto : null;

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
        {minutosPausados > 0 && (
          <div className="detail-row">
            <span className="detail-label">Tempo em Pausa</span>
            <span className="detail-value" data-od-id="detail-tempo-pausa">
              {formatarDuracao(minutosPausados)}
            </span>
          </div>
        )}
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
      {valorPorKm !== null && (
        <div className="detail-row">
          <span className="detail-label">Valor por KM</span>
          <span className="detail-value accent" data-od-id="detail-valor-por-km">
            {formatarMoeda(valorPorKm)}
          </span>
        </div>
      )}
      <div className="detail-row">
        <span className="detail-label">Total Ganho</span>
        <span className="detail-value accent" data-od-id="detail-total-ganho">
          {formatarMoeda(totalGanho)}
        </span>
      </div>
      {(jornadaAtiva?.totalGorjetas || 0) > 0 && (
        <div className="detail-row">
          <span className="detail-label">Gorjetas</span>
          <span className="detail-value" style={{ color: '#22c55e' }} data-od-id="detail-gorjetas">
            {formatarMoeda(jornadaAtiva.totalGorjetas || 0)}
          </span>
        </div>
      )}
      <div className="detail-row">
        <span className="detail-label">Gastos</span>
        <span
          className="detail-value"
          style={{ color: (jornadaAtiva?.totalGastos || 0) > 0 ? '#ef4444' : undefined }}
          data-od-id="detail-gastos"
        >
          {formatarMoeda(totalGastos)}
        </span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Lucro Líquido</span>
        <span className="detail-value" data-od-id="detail-lucro-liquido">
          {formatarMoeda(lucroLiquido)}
        </span>
      </div>

      <div className="card" style={{ marginTop: 'var(--space-5)', padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)', background: '#0a1128', color: '#fff', border: 'none', textAlign: 'center' }} data-od-id="resumo-saldo-final">
        <div style={{ fontSize: 'var(--text-xs)', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Saldo Final</div>
        <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#4ade80', lineHeight: 1.1 }} data-od-id="detail-saldo-final">
          {formatarMoeda(saldoFinal)}
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: '#94a3b8', marginTop: 'var(--space-1)' }}>
          Saldo inicial + ganhos − gastos
        </div>
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
