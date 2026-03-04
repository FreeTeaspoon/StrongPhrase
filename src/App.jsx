import { BrowserRouter as Router, Route, Routes, NavLink, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';
import PassphraseGenerator from './PassphraseGenerator';
import PasswordSchemeCard from './PasswordSchemeCard';
import PasscodePage from './passcode/PasscodePage';
import PassphraseFAQ from './PassphraseFAQ';
import logo from './img/logo.png';
import EntropyCrackTimeTable from './EntropyCrackTable';
import EntropyPerCharTable from './EntropyPerChar';
import ScrollToTop from './helpers/ScrollToTop';
import UsernamePage from './username/UsernamePage';
import IdentityPage from './identity/IdentityPage';
import MorePassphrasesPage from './more-passphrases/MorePassphrasesPage';

const Home = () => (
  <>
    <PassphraseGenerator />
    <PasswordSchemeCard />
    <PassphraseFAQ />
  </>
);

/** Redirect old hash URLs (/#/more, /#/passcode, etc.) to clean paths (/more, /passcode). */
function HashRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#/')) {
      const path = hash.slice(1) || '/';
      navigate(path, { replace: true });
    }
  }, [navigate]);
  return null;
}

const App = () => {
  return (
    <Router basename='/'>
      <HashRedirect />
      <ScrollToTop />
      <div className="font-body">
        <div className="max-w-screen-lg mx-auto px-2 py-4 md:px-4 md:py-8">

          <header className="mb-2">
            <div className="title flex-col flex-initial w-1/">
              <img className="float-start max-w-8 md:max-w-16 mr-4" alt="Lock icon" src={logo} />
              <h1 className="text-2xl md:text-4xl font-header mb-2">StrongPhrase.net</h1>
              <p className="text-md md:text-xl">Create strong, memorable passphrases</p>
            </div>

            <div className="navbar bg-slate-100 rounded-xl mt-3 p-1">
              <div className="navbar-start flex w-full">
                <ul className="menu menu-horizontal">
                  <li><NavLink activeClassName="active" to="/">Passphrase</NavLink></li>
                  <li><NavLink activeClassName="active" to="/more">More</NavLink></li>
                  <li><NavLink activeClassName="active" to="/passcode">Phone Passcode</NavLink></li>
                  <li><NavLink activeClassName="active" to="/username">Username</NavLink></li>
                  <li><NavLink activeClassName="active" to="/identity">Identity</NavLink></li>
                  <li><NavLink activeClassName="active" to="/table">Cracking Times</NavLink></li>
                </ul>
              </div>
            </div>
          </header>





          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/more" element={<MorePassphrasesPage />} />
            <Route path="/passcode" element={<PasscodePage />} />
            <Route path="/username" element={<UsernamePage />} />
            <Route path="/identity" element={<IdentityPage />} />
            <Route path="/table" element={<EntropyCrackTimeTable />} />
            <Route path="/entropy-per-char" element={<EntropyPerCharTable />} />
          </Routes>

        </div>

        <div className="bg-blue-950 text-neutral-content p-10 w-full">
          <footer className="footer max-w-screen-lg mx-auto py-4">
            <aside className="flex items-start space-x-2">
              <img className="float-left max-w-10" alt="Lock icon" src={logo} />
              <div>
                <h6 className="font-header text-xl">StrongPhrase.net</h6>
                <p><em>Create a memorable passphrase to use as your master password</em></p>
                <p className="mt-4">This site does not collect any data. The server we host on <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer">stores your IP address</a> for security purposes. There are no trackers or calls to external services/sites. All interactions and passphrase generation happen directly in your browser and stay on your computer.</p>
                <p className="mt-4">Passphrase code <a href="https://github.com/openidauthority/getapassphrase" target="_blank" rel="noreferrer">originally written by Ryan Foster</a>. Re-designed and expanded by <a href="https://gitlab.com/strongphrase/strongphrase.net" target="_blank" rel="noreferrer">Solar Kazoo</a>.</p>
              </div>
            </aside>
            <nav className="">
            <h6 className="footer-title">Connect</h6>
              <a className="link link-hover" href="https://gitlab.com/strongphrase/strongphrase.net" target="_blank" rel="noreferrer">Code on GitLab</a>
              <a className="link link-hover" href="https://gitlab.com/strongphrase/strongphrase.net/issues" target="_blank" rel="noreferrer">Submit a bug or request</a>
              <a className="link link-hover" href="https://forms.gle/pu1vqi8Mc1VYirGz6" target="_blank" rel="noreferrer">Contact</a>
            </nav>
          </footer>
        </div>

      </div>
    </Router>
  );
};

export default App;