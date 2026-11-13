import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './lib/AuthContext.jsx'
import { ContentProvider } from './lib/ContentContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ContentProvider>
          <App />
        </ContentProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)

// Fades out the launch splash (the installed app only - see index.html) once
// the page has really painted, not merely when React.render() returns. A short
// minimum keeps it from flickering on a fast, already-cached launch.
const MIN_SPLASH_MS = 500;
const splashShownAt = performance.now();
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const splash = document.getElementById('splash');
    if (!splash) return;
    const wait = Math.max(0, MIN_SPLASH_MS - (performance.now() - splashShownAt));
    setTimeout(() => {
      splash.classList.add('splash-hidden');
      splash.addEventListener('transitionend', () => splash.remove(), { once: true });
      setTimeout(() => splash.remove(), 1000); // in case the transition never reports back
    }, wait);
  });
});

// Registers the service worker (public/sw.js) that makes the site installable.
// Only in the real, built site - not while developing - and only after the page
// has loaded, so it never competes with the page's own first requests.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
