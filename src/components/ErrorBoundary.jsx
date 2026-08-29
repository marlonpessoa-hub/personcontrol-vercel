import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { erro: null };
  }

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  componentDidCatch(erro, info) {
    console.error('PersonControl | Erro de render:', erro, info);
  }

  render() {
    if (this.state.erro) {
      return (
        <div className="auth-container" style={{ padding: 24, textAlign: 'left' }}>
          <h2 style={{ color: '#ef4444' }}>Algo deu errado</h2>
          <p style={{ color: '#ccc' }}>
            O app encontrou um erro inesperado. Envie a mensagem abaixo para o suporte:
          </p>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              background: '#1e1e1e',
              color: '#ff8080',
              padding: 12,
              borderRadius: 8,
              fontSize: 12
            }}
          >
            {String(this.state.erro?.stack || this.state.erro?.message || this.state.erro)}
          </pre>
          <button
            className="btn btn-primary"
            onClick={() => this.setState({ erro: null })}
            style={{ marginTop: 12 }}
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
