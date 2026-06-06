import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('App error:', error, info); }
  reset = () => { this.setState({ error: null }); window.location.hash = '#/'; };
  render() {
    if (this.state.error) {
      return (
        <div className="boundary">
          <div className="boundary-card">
            <div className="boundary-icon">⚠️</div>
            <h1>Something went wrong</h1>
            <p>An unexpected error occurred. Try reloading the page.</p>
            <div className="boundary-actions">
              <button className="btn-accent" onClick={() => window.location.reload()}>Reload</button>
              <button className="btn-ghost" onClick={this.reset}>Go Home</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
