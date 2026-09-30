import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackButton from './components/BackButton';
import Home from './pages/Home';
import About from './pages/About';
import Academics from './pages/Academics';
import Admissions from './pages/Admissions';
import News from './pages/News';
import Contact from './pages/Contact';
import PortalLogin from './pages/PortalLogin';
import PortalGate from './portal/PortalGate';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Notices when a newer version of the site has been deployed while this
// tab is still open. Without this, an open tab keeps running the old
// code until someone reloads by hand. Every minute (and whenever the tab
// comes back into view) it re-reads index.html and compares the name of
// the hashed script file with the one this tab is running. If they
// differ it shows a banner, and the next time the person clicks to
// another page it does a real page load so they land on the new code
// without having to do anything.
function UpdateWatcher() {
  const { pathname } = useLocation();
  const runningBundle = useRef(null);
  const firstRender = useRef(true);
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    const script = document.querySelector('script[type="module"][src*="/assets/index-"]');
    runningBundle.current = script ? new URL(script.src, window.location.href).pathname : null;
    if (!runningBundle.current) return undefined; // dev server: nothing to compare

    const check = async () => {
      try {
        const res = await fetch('/index.html', { cache: 'no-store' });
        const match = (await res.text()).match(/\/assets\/index-[\w-]+\.js/);
        if (match && match[0] !== runningBundle.current) setUpdateReady(true);
      } catch {
        // offline or a blip: try again next time
      }
    };
    const onVisible = () => { if (document.visibilityState === 'visible') check(); };
    const timer = setInterval(check, 60000);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (updateReady) window.location.reload();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!updateReady) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center justify-between gap-4 rounded-sm bg-purple-900 px-5 py-3 text-sm text-white shadow-lg"
    >
      <span>A newer version of the site is available.</span>
      <button
        onClick={() => window.location.reload()}
        className="shrink-0 rounded-sm bg-gold-500 px-3 py-1.5 font-semibold text-purple-900 hover:bg-gold-600"
      >
        Refresh
      </button>
    </div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <UpdateWatcher />
      <Navbar />
      {location.pathname !== '/' && (
        <div className="mx-auto w-full max-w-6xl px-6">
          <BackButton />
        </div>
      )}
      <main className="flex-1">
        {/* key={pathname} forces every page to fully remount on each
            navigation â€” including via the Back button or the browser's
            own back/forward â€” so page state (scroll position, open
            accordions, form fields) always starts fresh rather than
            carrying over stale state from a previous visit. */}
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/academics" element={<Academics />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/news" element={<News />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/portal" element={<PortalLogin />} />
          <Route path="/portal/dashboard" element={<PortalGate />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
