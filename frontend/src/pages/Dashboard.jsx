import { useState } from 'react';
import api from '../lib/api.js';
import HoldingsTable from '../components/HoldingsTable.jsx';
import InsightsCard from '../components/InsightsCard.jsx';
import SectorPie from '../components/SectorPie.jsx';

function Dashboard() {
  const [email, setEmail] = useState('');
  const [portfolio, setPortfolio] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState('');

  const headers = email ? { 'X-User-Email': email } : {};

  const fetchPortfolio = async () => {
    if (!email) {
      setError('Enter the email returned from the Kite authentication callback.');
      return;
    }
    setError('');
    setPortfolioLoading(true);
    try {
      const { data } = await api.get('/portfolio', { headers });
      setPortfolio(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load portfolio.');
      setPortfolio(null);
    } finally {
      setPortfolioLoading(false);
    }
  };

  const fetchAnalysis = async () => {
    if (!email) {
      setError('Enter the email returned from the Kite authentication callback.');
      return;
    }
    setError('');
    setAnalysisLoading(true);
    try {
      const { data } = await api.get('/analysis', { headers });
      setAnalysis(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate analysis.');
      setAnalysis(null);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleSync = async () => {
    await fetchPortfolio();
    await fetchAnalysis();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-surface p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-white">Portfolio Controls</h2>
        <p className="mt-2 text-sm text-slate-400">
          Paste the email shown on the authentication success screen to identify yourself when calling the backend.
        </p>
        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-accent focus:outline-none"
          />
          <div className="flex gap-3">
            <button
              onClick={fetchPortfolio}
              className="rounded-lg bg-slate-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-600"
              disabled={portfolioLoading}
            >
              {portfolioLoading ? 'Syncing…' : 'Sync Holdings'}
            </button>
            <button
              onClick={handleSync}
              className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-slate-900 transition hover:brightness-110"
              disabled={portfolioLoading || analysisLoading}
            >
              {portfolioLoading || analysisLoading ? 'Refreshing…' : 'Sync & Analyze'}
            </button>
          </div>
        </div>
        {error && <p className="mt-3 rounded-md border border-rose-500/50 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
      </section>

      <HoldingsTable holdings={portfolio?.holdings} loading={portfolioLoading} />

      <section className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <InsightsCard
          summary={analysis?.summary}
          recommendations={analysis?.recommendations}
          loading={analysisLoading}
        />
        <SectorPie data={analysis?.sector_breakdown} loading={analysisLoading} />
      </section>

      {analysis?.concentration?.length ? (
        <section className="rounded-2xl border border-slate-800 bg-surface p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white">Holding Concentration</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {analysis.concentration.map((item) => (
              <li
                key={item.symbol}
                className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-300"
              >
                <div className="text-white">{item.symbol}</div>
                <div className="mt-1 flex justify-between text-xs text-slate-400">
                  <span>Value</span>
                  <span>₹{item.value.toLocaleString()}</span>
                </div>
                <div className="mt-1 flex justify-between text-xs text-slate-400">
                  <span>Weight</span>
                  <span>{item.weight}%</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export default Dashboard;
