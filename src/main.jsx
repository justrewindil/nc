import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ── PWA: register service worker (installable app) ──
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// ── Optional privacy-friendly analytics (Plausible) ──
// Set VITE_PLAUSIBLE_DOMAIN in .env to enable; otherwise this is a no-op.
const PLAUSIBLE = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
if (PLAUSIBLE) {
  const s = document.createElement('script');
  s.defer = true;
  s.setAttribute('data-domain', PLAUSIBLE);
  s.src = 'https://plausible.io/js/script.hash.js';
  document.head.appendChild(s);
}
