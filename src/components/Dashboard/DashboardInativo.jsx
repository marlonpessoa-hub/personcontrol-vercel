import { formatarMoeda, formatarData, formatarDuracao } from '../../utils/formatters';

const DashboardInativo = ({ onIniciar, estatisticas, ultimaJornada, nomeMotorista }) => (
  <div className="page page-animate" data-od-id="dashboard-inativo">
    <div className="greeting">
      Bom dia, <strong>{nomeMotorista || 'Motorista'}</strong>
    </div>
    
    {ultimaJornada && (
      <div className="card card-animate" data-od-id="card-ultima-jornada">
        <div className="card-header">
          <span className="card-title">ÚLTIMA JORNADA</span>
          <span className="badge">{formatarData(ultimaJornada.dataInicio)}</span>
        </div>
        <div className="card-value">{formatarMoeda(ultimaJornada.totalGanho)}</div>
        <div className="card-subtitle">
          {formatarDuracao(ultimaJornada.duracaoMinutos)} trabalhadas
        </div>
      </div>
    )}

    <div className="stats-grid" data-od-id="stats-mensal">
      <div className="stat-card card-animate">
        <div className="stat-label">DIAS NO MÊS</div>
        <div className="stat-value" data-od-id="stat-dias">{estatisticas.diasTrabalhados}</div>
      </div>
      <div className="stat-card card-animate">
        <div className="stat-label">TOTAL MÊS</div>
        <div className="stat-value accent" data-od-id="stat-total">{formatarMoeda(estatisticas.totalGanho)}</div>
      </div>
      <div className="stat-card card-animate">
        <div className="stat-label">HORAS TRABALHADAS</div>
        <div className="stat-value" data-od-id="stat-horas">{estatisticas.totalHoras.toFixed(1)}h</div>
      </div>
      <div className="stat-card card-animate">
        <div className="stat-label">MÉDIA/DIA</div>
        <div className="stat-value accent" data-od-id="stat-media">{formatarMoeda(estatisticas.ganhoMedio)}</div>
      </div>
    </div>

    <button 
      className="btn btn-primary btn-press" 
      onClick={onIniciar}
      data-od-id="btn-iniciar-jornada"
    >
      INICIAR JORNADA
    </button>
  </div>
);

export default DashboardInativo;
