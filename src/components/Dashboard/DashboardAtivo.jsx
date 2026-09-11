import Cronometro from '../UI/Cronometro';
import { formatarMoeda, formatarHora, formatarNumero } from '../../utils/formatters';

const DashboardAtivo = ({ jornadaAtiva, onEncerrar, onTogglePausa, onAddGasto, onRemoveGasto, onAddGorjeta, onRemoveGorjeta }) => {
  const emPausa = Boolean(jornadaAtiva?.pausada);
  const gastos = jornadaAtiva?.gastos || [];
  const gorjetas = jornadaAtiva?.gorjetas || [];
  const totalGorjetas = jornadaAtiva?.totalGorjetas || 0;

  return (
    <div className="page page-animate" data-od-id="dashboard-ativo">
      
      <div className="card card-animate" style={{ background: '#0a1128', color: '#fff', border: 'none', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', textAlign: 'center', marginBottom: 'var(--space-6)' }} data-od-id="card-cronometro">
        <div style={{ fontSize: 'var(--text-sm)', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-2)' }}>
          Jornada {emPausa ? 'em pausa' : 'em andamento'}
        </div>
        <Cronometro inicio={jornadaAtiva.dataInicio} pausado={emPausa} pausas={jornadaAtiva.pausas || []} />
      </div>

      <div className="stats-grid" data-od-id="stats-jornada-ativa" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <div className="card card-animate" style={{ padding: 'var(--space-4)', margin: 0, border: 'none', boxShadow: 'var(--elev-raised)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>SALDO INICIAL</div>
          <div style={{ fontSize: 'var(--text-lg)', fontWeight: '700', color: 'var(--fg)' }} data-od-id="stat-saldo-inicial">
            {formatarMoeda(jornadaAtiva.saldoInicial)}
          </div>
        </div>
        <div className="card card-animate" style={{ padding: 'var(--space-4)', margin: 0, border: 'none', boxShadow: 'var(--elev-raised)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>INÍCIO</div>
          <div style={{ fontSize: 'var(--text-lg)', fontWeight: '700', color: 'var(--fg)' }} data-od-id="stat-hora-inicio">
            {formatarHora(jornadaAtiva.dataInicio)}
          </div>
        </div>
        <div className="card card-animate" style={{ padding: 'var(--space-4)', margin: 0, border: 'none', boxShadow: 'var(--elev-raised)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>KM INICIAL</div>
          <div style={{ fontSize: 'var(--text-lg)', fontWeight: '700', color: 'var(--fg)' }} data-od-id="stat-km-inicial">
            {jornadaAtiva.kmInicial != null ? `${formatarNumero(jornadaAtiva.kmInicial)} km` : '--'}
          </div>
        </div>
        <div className="card card-animate" style={{ padding: 'var(--space-4)', margin: 0, border: 'none', boxShadow: 'var(--elev-raised)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>GASTOS</div>
          <div
            style={{ fontSize: 'var(--text-lg)', fontWeight: '700', color: jornadaAtiva.totalGastos > 0 ? '#ef4444' : 'var(--fg)' }}
            data-od-id="stat-gastos"
          >
            {formatarMoeda(jornadaAtiva.totalGastos || 0)}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <button
          className={`btn btn-press ${emPausa ? 'btn-primary' : 'btn-ghost'}`}
          onClick={onTogglePausa}
          data-od-id="btn-toggle-pausa"
          style={{ padding: 'var(--space-4)', fontSize: 'var(--text-base)', borderRadius: 'var(--radius-lg)' }}
        >
          {emPausa ? '▶ RETOMAR JORNADA' : '⏸ PAUSAR JORNADA'}
        </button>

        <button
          className="btn btn-ghost btn-press"
          onClick={onAddGasto}
          data-od-id="btn-add-gasto"
          style={{ padding: 'var(--space-4)', fontSize: 'var(--text-base)', borderRadius: 'var(--radius-lg)' }}
        >
          + ADICIONAR GASTO
        </button>

        <button
          className="btn btn-ghost btn-press"
          onClick={onAddGorjeta}
          data-od-id="btn-add-gorjeta"
          style={{ padding: 'var(--space-4)', fontSize: 'var(--text-base)', borderRadius: 'var(--radius-lg)', color: '#22c55e' }}
        >
          + ADICIONAR GORJETA
        </button>

        <button
          className="btn btn-danger btn-press"
          onClick={onEncerrar}
          data-od-id="btn-encerrar-jornada"
          style={{ padding: 'var(--space-4)', fontSize: 'var(--text-base)', borderRadius: 'var(--radius-lg)' }}
        >
          ⏹ ENCERRAR JORNADA
        </button>
      </div>

      {gorjetas.length > 0 && (
        <div style={{ marginTop: 'var(--space-5)' }} data-od-id="lista-gorjetas-jornada">
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: '600', color: 'var(--muted)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Gorjetas da jornada ({gorjetas.length} · {formatarMoeda(totalGorjetas)})
          </div>
          {gorjetas.map((gorjeta) => (
            <div key={gorjeta.id} className="journey-item" data-od-id={`gorjeta-${gorjeta.id}`} style={{ border: 'none', boxShadow: 'var(--elev-raised)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 'var(--text-base)', fontWeight: '600', color: '#22c55e' }}>Gorjeta</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span style={{ fontSize: 'var(--text-lg)', fontWeight: '700', color: '#22c55e' }}>
                  +{formatarMoeda(gorjeta.valor)}
                </span>
                <button
                  className="modal-close"
                  onClick={() => onRemoveGorjeta(gorjeta.id)}
                  aria-label="Remover gorjeta"
                  data-od-id={`btn-remover-gorjeta-${gorjeta.id}`}
                  style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {gastos.length > 0 && (
        <div style={{ marginTop: 'var(--space-5)' }} data-od-id="lista-gastos-jornada">
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: '600', color: 'var(--muted)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Gastos da jornada ({gastos.length})
          </div>
          {gastos.map((gasto) => (
            <div key={gasto.id} className="journey-item" data-od-id={`gasto-${gasto.id}`} style={{ border: 'none', boxShadow: 'var(--elev-raised)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 'var(--text-base)', fontWeight: '600', color: 'var(--fg)' }}>{gasto.descricao}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span style={{ fontSize: 'var(--text-lg)', fontWeight: '700', color: '#ef4444' }}>
                  −{formatarMoeda(gasto.valor)}
                </span>
                <button
                  className="modal-close"
                  onClick={() => onRemoveGasto(gasto.id)}
                  aria-label={`Remover ${gasto.descricao}`}
                  data-od-id={`btn-remover-gasto-${gasto.id}`}
                  style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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