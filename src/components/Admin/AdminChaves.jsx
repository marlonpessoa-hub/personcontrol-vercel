import { useState, useEffect, useCallback } from 'react';
import { formatarData, formatarHora } from '../../utils/formatters';

const OPCOES_DURACAO = [
  { valor: 30, rotulo: '30 dias' },
  { valor: 60, rotulo: '60 dias' },
  { valor: 90, rotulo: '90 dias' },
  { valor: 180, rotulo: '180 dias' },
  { valor: 365, rotulo: '1 ano' }
];

const rotuloDuracao = (dias) =>
  OPCOES_DURACAO.find((o) => o.valor === dias)?.rotulo || `${dias} dias`;

const copiarTexto = async (texto) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(texto);
    } else {
      const area = document.createElement('textarea');
      area.value = texto;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
    }
    return true;
  } catch {
    return false;
  }
};

const AdminChaves = ({ criarChave, listarChaves, excluirChave }) => {
  const [duracao, setDuracao] = useState(30);
  const [chaves, setChaves] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [novaChave, setNovaChave] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState('');

  const recarregar = useCallback(async () => {
    try {
      const lista = await listarChaves();
      setChaves(lista);
      setErro('');
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }, [listarChaves]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const handleCriar = async () => {
    setGerando(true);
    setErro('');
    try {
      const chave = await criarChave(duracao);
      setNovaChave(chave);
      setCopiado(false);
      await recarregar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setGerando(false);
    }
  };

  const handleExcluir = async (id) => {
    try {
      await excluirChave(id);
      setChaves((prev) => prev.filter((c) => c.id !== id));
      if (novaChave?.id === id) setNovaChave(null);
    } catch (err) {
      setErro(err.message);
    }
  };

  const handleCopiar = async () => {
    if (!novaChave) return;
    if (await copiarTexto(novaChave.codigo)) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const disponiveis = chaves.filter((c) => !c.usado_por).length;

  return (
    <div className="page page-animate" data-od-id="admin-chaves">
      <h1 className="page-title">Administração</h1>

      {erro && (
        <div className="auth-error" style={{ marginBottom: 'var(--space-4)' }} data-od-id="admin-error">
          {erro}
        </div>
      )}

      <div className="card card-animate" data-od-id="admin-gerar-card">
        <div className="profile-section-title" style={{ marginBottom: 'var(--space-4)' }}>
          Gerar nova chave
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="select-duracao">Duração do acesso</label>
          <select
            id="select-duracao"
            className="form-input"
            value={duracao}
            onChange={(e) => setDuracao(Number(e.target.value))}
            data-od-id="select-duracao-chave"
          >
            {OPCOES_DURACAO.map((opcao) => (
              <option key={opcao.valor} value={opcao.valor}>{opcao.rotulo}</option>
            ))}
          </select>
        </div>
        <button
          className="btn btn-primary btn-press"
          onClick={handleCriar}
          disabled={gerando}
          style={{ width: '100%' }}
          data-od-id="btn-gerar-chave"
        >
          {gerando ? 'GERANDO...' : 'GERAR CHAVE'}
        </button>

        {novaChave && (
          <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md, 8px)', background: 'rgba(59, 130, 246, 0.08)', border: '1px dashed rgba(59, 130, 246, 0.4)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--meta)', marginBottom: 'var(--space-1)' }}>
              Chave gerada ({rotuloDuracao(novaChave.duracao_dias)}) — copie e envie ao usuário:
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 700,
                  letterSpacing: '0.08em'
                }}
                data-od-id="admin-nova-chave-codigo"
              >
                {novaChave.codigo}
              </span>
              <button className="btn btn-ghost btn-sm btn-press" onClick={handleCopiar} data-od-id="btn-copiar-chave">
                {copiado ? 'COPIADO!' : 'COPIAR'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="profile-stat-grid" style={{ margin: 'var(--space-5) 0' }} data-od-id="admin-stats">
        <div className="profile-stat-card">
          <div className="profile-stat-value" data-od-id="admin-total-chaves">{chaves.length}</div>
          <div className="profile-stat-label">Chaves geradas</div>
        </div>
        <div className="profile-stat-card">
          <div className="profile-stat-value accent" data-od-id="admin-disponiveis-chaves">{disponiveis}</div>
          <div className="profile-stat-label">Disponíveis</div>
        </div>
      </div>

      <div className="profile-section-title" style={{ marginBottom: 'var(--space-3)' }}>
        Todas as chaves
      </div>

      {carregando ? (
        <div className="empty-state">
          <div className="empty-title">Carregando...</div>
        </div>
      ) : chaves.length === 0 ? (
        <div className="empty-state scale-in" data-od-id="admin-vazio">
          <div className="empty-icon">🔑</div>
          <div className="empty-title">Nenhuma chave gerada</div>
          <div className="empty-description">
            Gere a primeira chave usando o formulário acima.
          </div>
        </div>
      ) : (
        chaves.map((chave) => (
          <div key={chave.id} className="journey-item" data-od-id={`admin-chave-${chave.id}`}>
            <div style={{ minWidth: 0 }}>
              <div className="journey-date" style={{ fontFamily: 'monospace', letterSpacing: '0.06em' }}>
                {chave.codigo}
              </div>
              <div className="journey-duration">
                {rotuloDuracao(chave.duracao_dias)} •{' '}
                {chave.usado_por
                  ? `Usada em ${formatarData(chave.usado_em)} às ${formatarHora(chave.usado_em)}`
                  : 'Disponível'}
              </div>
            </div>
            <button
              className="btn btn-danger-outline btn-sm btn-press"
              onClick={() => handleExcluir(chave.id)}
              style={{ width: 'auto' }}
              data-od-id={`btn-excluir-chave-${chave.id}`}
            >
              EXCLUIR
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminChaves;
