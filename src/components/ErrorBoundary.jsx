import React from 'react';

/**
 * Rede de segurança: se algum componente quebrar, mostra o erro na tela
 * em vez de deixar o site todo preto. Ajuda a descobrir o que aconteceu,
 * principalmente no celular, onde não dá para abrir o console (F12).
 *
 * Precisa ser uma classe: o React só oferece essa função
 * (componentDidCatch / getDerivedStateFromError) em componentes de classe.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('ARES quebrou:', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="fixed inset-0 bg-black text-zinc-200 p-6 overflow-auto">
        <div className="max-w-xl mx-auto mt-10 border border-red-500/40 bg-red-500/5 rounded-lg p-5">
          <h1 className="text-lg font-bold text-red-400">Algo deu errado no ARES</h1>
          <p className="mt-2 text-sm text-zinc-300">
            Tire um print desta tela e mande para a equipe de informática. A mensagem abaixo mostra o que aconteceu.
          </p>
          <pre className="mt-4 p-3 bg-zinc-900 rounded text-xs text-red-300 whitespace-pre-wrap break-words">
            {String(error?.message || error)}
          </pre>
          <p className="mt-3 text-xs text-zinc-500 break-words">{navigator.userAgent}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold rounded cursor-pointer"
          >
            Recarregar o site
          </button>
        </div>
      </div>
    );
  }
}