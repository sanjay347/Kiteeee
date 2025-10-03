import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive ? 'bg-accent text-slate-900' : 'text-slate-200 hover:text-white hover:bg-slate-700'
  }`;

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-slate-800 bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-semibold text-white">
            AI Portfolio Analyzer
          </Link>
          <nav className="flex gap-2">
            <NavLink to="/" className={navLinkClass} end>
              Login
            </NavLink>
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Routes location={location}>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
