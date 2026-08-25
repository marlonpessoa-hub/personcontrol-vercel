import { formatarMoeda, formatarData, formatarHora, formatarDuracao, formatarNumero } from '../../utils/formatters';

const Historico = ({ jornadas, onVerDetalhes }) => {
  if (jornadas.length === 0) {
    return (
      <div className="page page-animate" data-od-id="historico-vazio">
        <h1 className="page-title">Histórico</h1>
        <div className="empty-state scale-in">
          <div className="empty-icon">📋</div>
          <div className="empty-title">Nenhuma jornada registrada</div>
          <div className="empty-description">
            Suas jornadas de trabalho aparecerão aqui após serem finalizadas.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page page-animate" data-od-id="historico">
      <h1 className="page-title">Histórico</h1>
      {jornadas.map((jornada, index) => (
        <div 
          key={jornada.id} 
          className="journey-item list-item-animate"
          style={{ animationDelay: `${index * 50}ms` }}
          onClick={() => onVerDetalhes(jornada)}
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onVerDetalhes(jornada)}
          data-od-id={`journey-item-${jornada.id}`}
        >
          <div>
            <div className="journey-date">{formatarData(jornada.dataInicio)}</div>
            <div className="journey-duration">
              {formatarDuracao(jornada.duracaoMinutos)} • {formatarHora(jornada.dataInicio)} - {jornada.dataFim ? formatarHora(jornada.dataFim) : '--:--'}
              {jornada.kmRodado > 0 && <> • {formatarNumero(jornada.kmRodado)} km</>}
            </div>
          </div>
          <div className="journey-amount">{formatarMoeda(jornada.totalGanho)}</div>
        </div>
      ))}
    </div>
  );
};

export default Historico;
