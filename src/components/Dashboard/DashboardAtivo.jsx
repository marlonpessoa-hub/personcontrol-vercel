import Cronometro from '../UI/Cronometro';
import { formatarMoeda, formatarHora, formatarNumero } from '../../utils/formatters';

const DashboardAtivo = ({ jornadaAtiva, onEncerrar, onTogglePausa, onAddGasto, onRemoveGasto }) => {
  const emPausa = Boolean(jornadaAtiva?.pausada);
  const gastos = jornadaAtiva?.gastos || [];

  return (
    <div className="page page-animate" data-od-id="dashboard-ativo">
      <div className="greeting">
        Jornada <strong>{emPausa ? 'em pausa' : 'em andamento'}</strong>
      </div>

      <Cronometro inicio={jornadaAtiva.dataInicio} pausado={emPausa} pausas={jornadaAtiva.pausas || []} />

      <div className="stats-grid" data-od-id="stats-jornada-ativa">
        <div className="stat-card card-animate">
          <div className="stat-label">SALDO INICIAL</div>
          <div className="stat-value" data-od-id="stat-saldo-inicial">
            {formatarMoeda(jornadaAtiva.saldoInicial)}
          </div>
        </div>
        <div className="stat-card card-animate">
          <div className="stat-label">INÍCIO</div>
          <div className="stat-value" data-od-id="stat-hora-inicio">
            {formatarHora(jornadaAtiva.dataInicio)}
          </div>
        </div>
        <div className="stat-card card-animate">
          <div className="stat-label">KM INICIAL</div>
          <div className="stat-value" data-od-id="stat-km-inicial">
            {jornadaAtiva.kmInicial != null ? `${formatarNumero(jornadaAtiva.kmInicial)} km` : '--'}
          </div>
        </div>
        <div className="stat-card card-animate">
          <div className="stat-label">GASTOS</div>
          <div
            className="stat-value"
            style={{ color: jornadaAtiva.totalGastos > 0 ? '#ef4444' : undefined }}
            data-od-id="stat-gastos"
          >
            {formatarMoeda(jornadaAtiva.totalGastos || 0)}
          </div>
        </div>
      </div>

      <button
        className={`btn btn-ghost btn-press ${emPausa ? 'btn-primary' : ''}`}
        onClick={onTogglePausa}
        style={{ marginBottom: 'var(--space-3)' }}
        data-od-id="btn-toggle-pausa"
      >
        {emPausa ? 'RETOMAR JORNADA' : 'PAUSAR JORNADA'}
      </button>

      <button
        className="btn btn-ghost btn-press"
        onClick={onAddGasto}
        style={{ marginBottom: 'var(--space-3)' }}
        data-od-id="btn-add-gasto"
      >
        ADICIONAR GASTO
      </button>

      <button
        className="btn btn-danger btn-press"
        onClick={onEncerrar}
        data-od-id="btn-encerrar-jornada"
      >
        ENCERRAR JORNADA
      </button>

      {gastos.length > 0 && (
        <div style={{ marginTop: 'var(--space-5)' }} data-od-id="lista-gastos-jornada">
          <div className="profile-section-title" style={{ marginBottom: 'var(--space-3)' }}>
            Gastos da jornada ({gastos.length})
          </div>
          {gastos.map((gasto) => (
            <div key={gasto.id} className="journey-item" data-od-id={`gasto-${gasto.id}`}>
              <div style={{ minWidth: 0 }}>
                <div className="journey-date">{gasto.descricao}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span className="journey-amount" style={{ color: '#ef4444' }}>
                  −{formatarMoeda(gasto.valor)}
                </span>
                <button
                  className="modal-close"
                  onClick={() => onRemoveGasto(gasto.id)}
                  aria-label={`Remover ${gasto.descricao}`}
                  data-od-id={`btn-remover-gasto-${gasto.id}`}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardAtivo;
