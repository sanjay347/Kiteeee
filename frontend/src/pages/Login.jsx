import { useState } from 'react';
import api from '../lib/api.js';

function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/auth/kite/login');
      if (data?.auth_url) {
        window.open(data.auth_url, '_blank', 'noopener,noreferrer');
      } else {
        setError('Login URL was not returned by the server.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to start Kite login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-6 rounded-2xl bg-surface p-10 shadow-xl">
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome back</h1>
        <p className="mt-2 text-slate-300">
          Connect your Zerodha Kite account to synchronize your holdings and receive AI-powered insights about your portfolio.
        </p>
      </div>
      {error && <p className="rounded-md border border-red-400 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      <button
        onClick={handleLogin}
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-base font-semibold text-slate-900 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? 'Redirecting…' : 'Login with Kite'}
      </button>
      <p className="text-sm text-slate-400">
        After authorizing, Zerodha will redirect to the backend callback. Use the email returned from the success message as
        <code className="mx-1 rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-200">X-User-Email</code> header when calling protected APIs.
      </p>
    </section>
  );
}

export default Login;
