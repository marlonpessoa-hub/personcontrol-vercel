import { formatarMoeda, formatarData, formatarHora, formatarDuracao, formatarNumero } from '../../utils/formatters';

const DetalhesJornada = ({ jornada, onVoltar, onExcluir, onEditar }) => {
  if (!jornada) return null;

  return (
    <div className="page page-animate" data-od-id="detalhes-jornada">
      <button 
        className="btn btn-ghost btn-sm btn-press" 
        onClick={onVoltar}
        style={{ marginBottom: 'var(--space-6)', width: 'auto' }}
        data-od-id="btn-voltar"
      >
        ← Voltar
      </button>

      <h1 className="page-title">Detalhes da Jornada</h1>

      <div className="card card-animate" data-od-id="card-detalhes">
        <div className="detail-row">
          <span className="detail-label">Data</span>
          <span className="detail-value">{formatarData(jornada.dataInicio)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Início</span>
          <span className="detail-value">{formatarHora(jornada.dataInicio)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Fim</span>
          <span className="detail-value">{jornada.dataFim ? formatarHora(jornada.dataFim) : '--:--'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Duração</span>
          <span className="detail-value">{formatarDuracao(jornada.duracaoMinutos)}</span>
        </div>
        {jornada.minutosPausados > 0 && (
          <div className="detail-row">
            <span className="detail-label">Tempo em Pausa</span>
            <span className="detail-value" style={{ color: '#f59e0b' }}>
              {formatarDuracao(jornada.minutosPausados)}
            </span>
          </div>
        )}
        {(jornada.kmInicial != null || jornada.kmFinal != null) && (
          <>
            {jornada.kmInicial != null && (
              <div className="detail-row">
                <span className="detail-label">KM Inicial</span>
                <span className="detail-value">{formatarNumero(jornada.kmInicial)} km</span>
              </div>
            )}
            {jornada.kmFinal != null && (
              <div className="detail-row">
                <span className="detail-label">KM Final</span>
                <span className="detail-value">{formatarNumero(jornada.kmFinal)} km</span>
              </div>
            )}
            {jornada.kmRodado > 0 && (
              <div className="detail-row">
                <span className="detail-label">KM Rodado</span>
                <span className="detail-value accent">{formatarNumero(jornada.kmRodado)} km</span>
              </div>
            )}
          </>
        )}
        <div className="divider"></div>
        <div className="detail-row">
          <span className="detail-label">Saldo Inicial</span>
          <span className="detail-value">{formatarMoeda(jornada.saldoInicial)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Valor Aplicativo 99</span>
          <span className="detail-value">{formatarMoeda(jornada.valorApp)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Valor Dinheiro</span>
          <span className="detail-value">{formatarMoeda(jornada.valorDinheiro)}</span>
        </div>
        <div className="divider"></div>
        <div className="detail-row">
          <span className="detail-label">Total Ganho</span>
          <span className="detail-value accent">{formatarMoeda(jornada.totalGanho)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Saldo Final</span>
          <span className="detail-value accent">{formatarMoeda(jornada.saldoFinal)}</span>
        </div>
        {jornada.editadoEm && (
          <div className="detail-row">
            <span className="detail-label">Última edição</span>
            <span className="detail-value" style={{ fontSize: 'var(--text-xs)', color: 'var(--meta)' }}>
              {formatarData(jornada.editadoEm)} às {formatarHora(jornada.editadoEm)}
            </span>
          </div>
        )}
        {jornada.observacoes && (
          <>
            <div className="divider"></div>
            <div style={{ marginTop: 'var(--space-2)' }}>
              <span className="detail-label">Observações</span>
              <p style={{ marginTop: 'var(--space-2)', color: 'var(--fg)', fontSize: 'var(--text-sm)' }}>
                {jornada.observacoes}
              </p>
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
        <button 
          className="btn btn-primary btn-press" 
          onClick={() => onEditar(jornada)}
          style={{ flex: 1 }}
          data-od-id="btn-editar-jornada"
        >
          EDITAR
        </button>
        <button 
          className="btn btn-ghost btn-press" 
          onClick={() => onExcluir(jornada.id)}
          style={{ flex: 1 }}
          data-od-id="btn-excluir-jornada"
        >
          EXCLUIR
        </button>
      </div>
    </div>
  );
};

export default DetalhesJornada;
