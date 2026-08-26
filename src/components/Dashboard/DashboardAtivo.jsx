import Cronometro from '../UI/Cronometro';
import { formatarMoeda, formatarHora, formatarNumero } from '../../utils/formatters';

const DashboardAtivo = ({ jornadaAtiva, onEncerrar, onTogglePausa }) => {
  const emPausa = Boolean(jornadaAtiva?.pausada);

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
      className="btn btn-danger btn-press"
      onClick={onEncerrar}
      data-od-id="btn-encerrar-jornada"
    >
      ENCERRAR JORNADA
    </button>
  </div>
  );
};

export default DashboardAtivo;
