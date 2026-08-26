import { useState, useEffect } from 'react';
import useAuth from './hooks/useAuth';
import useJornada from './hooks/useJornada';
import useConfiguracoes from './hooks/useConfiguracoes';
import useAccess from './hooks/useAccess';
import Header from './components/UI/Header';
import Navigation from './components/UI/Navigation';
import LoginScreen from './components/Auth/LoginScreen';
import RegisterScreen from './components/Auth/RegisterScreen';
import AccessScreen from './components/Auth/AccessScreen';
import DashboardInativo from './components/Dashboard/DashboardInativo';
import DashboardAtivo from './components/Dashboard/DashboardAtivo';
import Historico from './components/History/Historico';
import DetalhesJornada from './components/History/DetalhesJornada';
import Configuracoes from './components/Settings/Configuracoes';
import ProfileScreen from './components/Profile/ProfileScreen';
import AdminChaves from './components/Admin/AdminChaves';
import ModalIniciarJornada from './components/Modals/ModalIniciarJornada';
import ModalEncerrarJornada from './components/Modals/ModalEncerrarJornada';
import ModalEditarJornada from './components/Modals/ModalEditarJornada';
import ModalGasto from './components/Modals/ModalGasto';

const App = () => {
  const [pagina, setPagina] = useState('dashboard');
  const [modalIniciar, setModalIniciar] = useState(false);
  const [modalEncerrar, setModalEncerrar] = useState(false);
  const [modalGasto, setModalGasto] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [jornadaDetalhesId, setJornadaDetalhesId] = useState(null);
  const [jornadaEditar, setJornadaEditar] = useState(null);
  const [authScreen, setAuthScreen] = useState('login');
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const saved = localStorage.getItem('personcontrol_theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    localStorage.setItem('personcontrol_theme', isDarkTheme ? 'dark' : 'light');
    if (isDarkTheme) {
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.add('light-theme');
    }
  }, [isDarkTheme]);

  const toggleTheme = () => setIsDarkTheme(prev => !prev);

  const auth = useAuth();
  const {
    jornadas,
    jornadaAtiva,
    carregando: carregandoJornadas,
    iniciarJornada,
    pausarJornada,
    retomarJornada,
    adicionarGasto,
    removerGasto,
    encerrarJornada,
    excluirJornada,
    editarJornada,
    estatisticasMes
  } = useJornada(auth.user?.id);

  const { configuracoes, atualizarConfiguracoes } = useConfiguracoes();
  const access = useAccess(auth.user);
  const autenticado = Boolean(auth.user?.id);

  useEffect(() => {
    if (pagina === 'admin' && !access.isAdmin) {
      setPagina('dashboard');
    }
  }, [pagina, access.isAdmin]);

  useEffect(() => {
    const meta = auth.user?.user_metadata;
    const nomeGoogle = meta?.full_name || meta?.name;
    if (nomeGoogle && (!configuracoes.nomeMotorista || configuracoes.nomeMotorista === 'Motorista')) {
      atualizarConfiguracoes({ nomeMotorista: nomeGoogle });
    }
  }, [auth.user, configuracoes.nomeMotorista, atualizarConfiguracoes]);

  const handleIniciarJornada = (saldo, kmInicial) => {
    iniciarJornada(saldo, kmInicial);
  };

  const handleEncerrarJornada = (valorApp, valorDinheiro, kmFinal) => {
    encerrarJornada(valorApp, valorDinheiro, kmFinal);
    setPagina('dashboard');
  };

  const handleExcluirJornada = (id) => {
    if (confirm('Tem certeza que deseja excluir esta jornada?')) {
      excluirJornada(id);
      setJornadaDetalhesId(null);
      setPagina('historico');
    }
  };

  const handleEditarJornada = (jornada) => {
    setJornadaEditar(jornada);
    setModalEditar(true);
  };

  const handleSalvarEdicao = (id, dados) => {
    editarJornada(id, dados);
    setJornadaEditar(null);
  };

  const jornadaDetalhes = jornadas.find(j => j.id === jornadaDetalhesId) || null;

  const ultimaJornada = jornadas.length > 0 ? jornadas[0] : null;

  if (auth.loading || (autenticado && access.carregandoAcesso) || (autenticado && carregandoJornadas)) {
    return (
      <div className="auth-container" data-od-id="loading-screen">
        <button 
          className="btn-icon" 
          onClick={toggleTheme}
          title={isDarkTheme ? "Mudar para tema claro" : "Mudar para tema escuro"}
          data-od-id="btn-toggle-theme-loading"
          style={{ position: 'absolute', top: 'var(--space-5)', right: 'var(--space-5)' }}
        >
          {isDarkTheme ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>
        <div className="auth-logo">
          Person<span>Control</span>
        </div>
        <div className="auth-subtitle">Carregando...</div>
      </div>
    );
  }

  if (!autenticado) {
    if (authScreen === 'register') {
      return (
        <RegisterScreen
          onRegister={auth.signUp}
          onLogin={() => setAuthScreen('login')}
          onGoogleLogin={auth.signInWithGoogle}
          onAtivarChave={access.ativarChave}
          isDarkTheme={isDarkTheme}
          onToggleTheme={toggleTheme}
        />
      );
    }
    return (
      <LoginScreen
        onLogin={auth.signIn}
        onRegister={() => setAuthScreen('register')}
        onGoogleLogin={auth.signInWithGoogle}
        isDarkTheme={isDarkTheme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (access.bloqueado) {
    return (
      <AccessScreen
        modo={access.erroAcesso ? 'erro' : 'expirado'}
        erro={access.erroAcesso}
        expiraEm={access.expiraEm}
        detalheTecnico={JSON.stringify(
          {
            build: __BUILD__,
            erro: access.erroAcesso,
            acesso: access.acesso,
            userId: auth.user?.id,
            email: auth.user?.email,
            autenticadoFlag: auth.isAuthenticated,
            verificadoEm: new Date().toISOString()
          },
          null,
          2
        )}
        onAtivar={access.ativarChave}
        onRecarregar={access.carregarAcesso}
        onSignOut={auth.signOut}
        isDarkTheme={isDarkTheme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className="container" data-od-id="app">
      <Header 
        paginaAtual={pagina} 
        user={auth.user} 
        onSignOut={auth.signOut}
        isDarkTheme={isDarkTheme}
        onToggleTheme={toggleTheme}
        onNavigate={setPagina}
      />
      <Navigation pagina={pagina} setPagina={setPagina} isAdmin={access.isAdmin} />

      {pagina === 'dashboard' && !jornadaAtiva && (
        <DashboardInativo 
          onIniciar={() => setModalIniciar(true)}
          estatisticas={estatisticasMes}
          ultimaJornada={ultimaJornada}
          nomeMotorista={configuracoes.nomeMotorista}
        />
      )}

      {pagina === 'dashboard' && jornadaAtiva && (
        <DashboardAtivo
          jornadaAtiva={jornadaAtiva}
          onEncerrar={() => setModalEncerrar(true)}
          onTogglePausa={() =>
            jornadaAtiva.pausada ? retomarJornada() : pausarJornada()
          }
          onAddGasto={() => setModalGasto(true)}
          onRemoveGasto={removerGasto}
        />
      )}

      {pagina === 'historico' && !jornadaDetalhes && (
        <Historico 
          jornadas={jornadas}
          onVerDetalhes={(j) => setJornadaDetalhesId(j.id)}
        />
      )}

      {pagina === 'historico' && jornadaDetalhes && (
        <DetalhesJornada 
          jornada={jornadaDetalhes}
          onVoltar={() => setJornadaDetalhesId(null)}
          onExcluir={handleExcluirJornada}
          onEditar={handleEditarJornada}
        />
      )}

      {pagina === 'admin' && access.isAdmin && (
        <AdminChaves
          criarChave={access.criarChave}
          listarChaves={access.listarChaves}
          excluirChave={access.excluirChave}
        />
      )}

      {pagina === 'configuracoes' && (
        <Configuracoes 
          configuracoes={configuracoes}
          onAtualizar={atualizarConfiguracoes}
        />
      )}

      {pagina === 'perfil' && (
        <ProfileScreen
          user={auth.user}
          configuracoes={configuracoes}
          jornadas={jornadas}
          onSignOut={auth.signOut}
          onAtivarChave={access.ativarChave}
          expiraEm={access.expiraEm}
          diasRestantes={access.diasRestantes}
        />
      )}

      <ModalGasto
        isOpen={modalGasto}
        onClose={() => setModalGasto(false)}
        onConfirm={adicionarGasto}
      />

      <ModalIniciarJornada
        isOpen={modalIniciar}
        onClose={() => setModalIniciar(false)}
        onConfirm={handleIniciarJornada}
      />

      <ModalEncerrarJornada 
        isOpen={modalEncerrar}
        onClose={() => setModalEncerrar(false)}
        onConfirm={handleEncerrarJornada}
        jornadaAtiva={jornadaAtiva}
      />

      <ModalEditarJornada 
        isOpen={modalEditar}
        onClose={() => {
          setModalEditar(false);
          setJornadaEditar(null);
        }}
        onConfirm={handleSalvarEdicao}
        jornada={jornadaEditar}
      />
    </div>
  );
};

export default App;
