const Configuracoes = ({ configuracoes, onAtualizar }) => (
  <div className="page page-animate" data-od-id="configuracoes">
    <h1 className="page-title">Configurações</h1>

    <div className="form-group card-animate">
      <label className="form-label" data-od-id="label-nome">
        Nome do Motorista
      </label>
      <input
        type="text"
        className="form-input"
        value={configuracoes.nomeMotorista}
        onChange={(e) => onAtualizar({ nomeMotorista: e.target.value })}
        data-od-id="input-nome"
      />
    </div>

    <div className="form-group card-animate">
      <label className="form-label" data-od-id="label-meta">
        Meta Diária de Ganhos (R$)
      </label>
      <input
        type="number"
        className="form-input"
        value={configuracoes.metaDiaria}
        onChange={(e) => onAtualizar({ metaDiaria: parseFloat(e.target.value) || 0 })}
        step="10"
        min="0"
        data-od-id="input-meta"
      />
      <div className="form-hint">Defina uma meta para acompanhar seu progresso</div>
    </div>

    <div className="divider"></div>

    <div className="settings-item card-animate">
      <span className="settings-label">Moeda</span>
      <span className="settings-value">BRL (R$)</span>
    </div>

    <div className="settings-item card-animate">
      <span className="settings-label">Versão</span>
      <span className="settings-value">1.0.0</span>
    </div>

    <div className="settings-item card-animate">
      <span className="settings-label">Sobre</span>
      <span className="settings-value">PersonControl</span>
    </div>
  </div>
);

export default Configuracoes;
