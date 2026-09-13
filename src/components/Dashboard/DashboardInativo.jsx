import { formatarMoeda, formatarData, formatarDuracao } from '../../utils/formatters';

const DashboardInativo = ({ onIniciar, estatisticas, ultimaJornada, mesReferencia, onMudarMes }) => {
  const mesFormatado = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(mesReferencia);
  const tituloMes = mesFormatado.charAt(0).toUpperCase() + mesFormatado.slice(1);
  const mudarMes = (delta) => {
    onMudarMes(new Date(mesReferencia.getFullYear(), mesReferencia.getMonth() + delta, 1));
  };

  return (
    <div className="page page-animate" data-od-id="dashboard-inativo">
      
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: '700', marginBottom: 'var(--space-4)', color: 'var(--fg)' }}>
          Resumo de {tituloMes}
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-warm)', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-pill)', width: 'fit-content' }}>
          <button onClick={() => mudarMes(-1)} style={{ background: 'none', border: 'none', color: 'var(--fg)', cursor: 'pointer' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <span style={{ margin: '0 var(--space-4)', fontSize: 'var(--text-sm)', fontWeight: '600', color: 'var(--fg)' }}>
            {tituloMes}
          </span>
          <button onClick={() => mudarMes(1)} style={{ background: 'none', border: 'none', color: 'var(--fg)', cursor: 'pointer' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>

      <div className="card card-animate" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--elev-raised)', border: 'none' }} data-od-id="card-total-mes">
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginBottom: 'var(--space-2)' }}>Total do Mês</div>
        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--accent)', marginBottom: 'var(--space-1)' }}>
          {formatarMoeda(estatisticas.totalGanho)}
        </div>
        {estatisticas.totalDizimo > 0 && (
          <div style={{ fontSize: 'var(--text-sm)', color: '#f59e0b', marginBottom: 'var(--space-4)' }}>
            {formatarMoeda(estatisticas.totalDizimo)} separado (10%)
          </div>
        )}
        
        <div style={{ display: 'flex', borderTop: '1px solid var(--border-soft)', paddingTop: 'var(--space-4)', gap: 'var(--space-4)' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: 'var(--accent)' }}>↑</span> Dias trabalhados
            </div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: '600', color: 'var(--accent)', marginTop: '4px' }}>
              {estatisticas.diasTrabalhados}
            </div>
          </div>
          <div style={{ width: '1px', background: 'var(--border-soft)' }}></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: 'var(--fg)' }}>⏱</span> Horas trabalhadas
            </div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: '600', color: 'var(--fg)', marginTop: '4px' }}>
              {estatisticas.totalHoras.toFixed(1)}h
            </div>
          </div>
        </div>
      </div>

      {ultimaJornada && (
        <div className="card card-animate" style={{ background: '#0a1128', color: '#fff', border: 'none', padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)' }} data-od-id="card-ultima-jornada">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
            <div>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: '700', color: '#fff' }}>Última jornada</div>
              <div style={{ fontSize: 'var(--text-sm)', color: '#94a3b8', marginTop: '4px' }}>{formatarData(ultimaJornada.dataInicio)}</div>
            </div>
          </div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: '600', color: '#fff', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {formatarMoeda(ultimaJornada.totalGanho)}
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: '400', color: '#94a3b8' }}>/ {formatarDuracao(ultimaJornada.duracaoMinutos)}</span>
          </div>
          <div style={{ marginTop: 'var(--space-3)', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
             <div style={{ width: '100%', height: '100%', background: '#3b82f6', borderRadius: '4px' }}></div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <div className="card card-animate" style={{ flex: 1, padding: 'var(--space-4)', marginBottom: 0 }}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>Média/Dia</div>
          <div style={{ fontSize: 'var(--text-lg)', fontWeight: '700', color: 'var(--fg)', marginTop: '4px' }}>{formatarMoeda(estatisticas.ganhoMedio)}</div>
        </div>
      </div>

      <button 
        className="btn btn-primary btn-press card-animate" 
        onClick={onIniciar}
        data-od-id="btn-iniciar-jornada"
        style={{ padding: 'var(--space-5)', fontSize: 'var(--text-lg)', borderRadius: 'var(--radius-xl)' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        INICIAR JORNADA
      </button>
    </div>
  );
};

export default DashboardInativo;
