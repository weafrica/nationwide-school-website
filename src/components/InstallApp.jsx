import { useEffect, useState } from 'react';
import { useContent } from '../lib/ContentContext';

// True when the site is already running as an installed app.
const runningAsApp = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

// iPhones and iPads (including iPads that pretend to be Macs) cannot show an
// install pop-up. People there use Share -> Add to Home Screen instead.
const isApple = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// A small "Install the app" link. It only appears where installing is actually
// possible, and disappears once the app is installed:
//   * Chrome / Edge / Android: runs the browser's real install pop-up
//     (index.html catches the browser's "can be installed" signal early)
//   * iPhone / iPad: shows the Share -> Add to Home Screen instructions
export default function InstallApp({ className = 'hover:text-white' }) {
  const { get } = useContent();
  const [promptEvent, setPromptEvent] = useState(null);
  const [apple, setApple] = useState(false);
  // Starts "installed" so nothing is drawn until the browser has been asked.
  // (This also keeps the server-rendered and test output empty.)
  const [installed, setInstalled] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    setInstalled(runningAsApp());
    setApple(isApple());
    setPromptEvent(window.__installPrompt || null);

    const onReady = () => setPromptEvent(window.__installPrompt || null);
    const onInstalled = () => {
      window.__installPrompt = null;
      setPromptEvent(null);
      setInstalled(true);
    };
    window.addEventListener('install-prompt-ready', onReady);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('install-prompt-ready', onReady);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed || (!promptEvent && !apple)) return null;

  const install = async () => {
    if (!promptEvent) {
      setHelpOpen((open) => !open);
      return;
    }
    promptEvent.prompt();
    await promptEvent.userChoice?.catch(() => null);
    // A browser install prompt can only be used once.
    window.__installPrompt = null;
    setPromptEvent(null);
  };

  return (
    <span className="block">
      <button
        type="button"
        onClick={install}
        className={`text-left ${className}`}
        aria-expanded={promptEvent ? undefined : helpOpen}
      >
        {get('footer.link.install', 'Install the app')}
      </button>
      {helpOpen && !promptEvent && (
        <span role="note" className="mt-2 block text-xs text-white/60">
          {get('footer.install.help', 'To install: tap the Share button, then “Add to Home Screen”.')}
        </span>
      )}
    </span>
  );
}
