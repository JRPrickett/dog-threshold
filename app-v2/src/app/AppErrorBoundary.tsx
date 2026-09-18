import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  failed: boolean;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep private training data out of future remote error reporting.
    console.error("Application render error", error.name, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main className="setup-shell">
        <section className="setup-card error-card" role="alert">
          <div className="brand-orbit" aria-hidden="true"><span /></div>
          <p className="kicker">Something went wrong</p>
          <h1>Your saved training data has not been intentionally cleared.</h1>
          <p className="lead">
            Reload the app to recover. If a session was in progress, the modern app
            will restore its saved timer state where possible.
          </p>
          <button
            className="primary-button"
            onClick={() => window.location.reload()}
          >
            Reload app
          </button>
        </section>
      </main>
    );
  }
}
