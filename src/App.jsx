import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
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
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      {location.pathname !== '/' && (
        <div className="mx-auto w-full max-w-6xl px-6">
          <BackButton />
        </div>
      )}
      <main className="flex-1">
        {/* key={pathname} forces every page to fully remount on each
            navigation — including via the Back button or the browser's
            own back/forward — so page state (scroll position, open
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
