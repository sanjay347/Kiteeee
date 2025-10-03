function InsightsCard({ summary, recommendations, loading }) {
  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-slate-800 bg-surface">
        <span className="text-slate-300">Generating insights…</span>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-surface/40">
        <span className="text-slate-400">Run an analysis to see AI-driven insights.</span>
      </div>
    );
  }

  return (
    <div className="grid gap-6 rounded-2xl border border-slate-800 bg-surface p-6 shadow-lg md:grid-cols-2">
      <div>
        <h3 className="text-lg font-semibold text-white">Portfolio Overview</h3>
        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          <li className="flex justify-between">
            <span>Total Invested</span>
            <span className="font-semibold text-white">₹{summary.total_invested.toLocaleString()}</span>
          </li>
          <li className="flex justify-between">
            <span>Total Value</span>
            <span className="font-semibold text-white">₹{summary.total_value.toLocaleString()}</span>
          </li>
          <li className="flex justify-between">
            <span>Total PnL</span>
            <span
              className={`font-semibold ${summary.total_pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
            >
              {summary.total_pnl >= 0 ? '+' : '-'}₹{Math.abs(summary.total_pnl).toLocaleString()}
            </span>
          </li>
        </ul>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">AI Recommendations</h3>
        <div className="mt-4 space-y-3">
          {recommendations?.length ? (
            recommendations.map((item) => (
              <div key={item.symbol} className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span className="font-semibold text-white">{item.symbol}</span>
                  <span className="text-xs uppercase tracking-wide text-slate-400">{item.risk} risk</span>
                </div>
                <div className="mt-2 text-xs text-slate-400">AI Score: {item.ai_score}</div>
                <p className="mt-2 text-sm text-slate-200">{item.recommendation}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">No recommendations available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default InsightsCard;
