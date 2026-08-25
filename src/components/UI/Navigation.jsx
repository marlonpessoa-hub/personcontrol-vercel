const Navigation = ({ pagina, setPagina }) => (
  <nav className="nav-tabs" data-od-id="navigation">
    <button 
      className={`nav-tab ${pagina === 'dashboard' ? 'active' : ''}`}
      onClick={() => setPagina('dashboard')}
      data-od-id="nav-dashboard"
    >
      Início
    </button>
    <button 
      className={`nav-tab ${pagina === 'historico' ? 'active' : ''}`}
      onClick={() => setPagina('historico')}
      data-od-id="nav-historico"
    >
      Histórico
    </button>
    <button 
      className={`nav-tab ${pagina === 'configuracoes' ? 'active' : ''}`}
      onClick={() => setPagina('configuracoes')}
      data-od-id="nav-configuracoes"
    >
      Config
    </button>
    <button 
      className={`nav-tab ${pagina === 'perfil' ? 'active' : ''}`}
      onClick={() => setPagina('perfil')}
      data-od-id="nav-perfil"
    >
      Perfil
    </button>
  </nav>
);

export default Navigation;
