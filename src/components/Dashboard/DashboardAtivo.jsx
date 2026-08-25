import Cronometro from '../UI/Cronometro';
import { formatarMoeda, formatarHora, formatarNumero } from '../../utils/formatters';

const DashboardAtivo = ({ jornadaAtiva, onEncerrar }) => (
  <div className="page page-animate" data-od-id="dashboard-ativo">
    <div className="greeting">
      Jornada <strong>em andamento</strong>
    </div>

    <Cronometro inicio={jornadaAtiva.dataInicio} />

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
      className="btn btn-danger btn-press" 
      onClick={onEncerrar}
      data-od-id="btn-encerrar-jornada"
    >
      ENCERRAR JORNADA
    </button>
  </div>
);

export default DashboardAtivo;
