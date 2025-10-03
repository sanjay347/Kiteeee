function HoldingsTable({ holdings, loading }) {
  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-slate-800 bg-surface">
        <span className="text-slate-300">Loading holdings…</span>
      </div>
    );
  }

  if (!holdings?.length) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-surface/40">
        <span className="text-slate-400">No holdings found. Sync your portfolio to see data.</span>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 shadow-lg">
      <table className="min-w-full divide-y divide-slate-800 bg-surface text-sm">
        <thead className="bg-slate-900/60 text-left uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-4 py-3">Symbol</th>
            <th className="px-4 py-3">Quantity</th>
            <th className="px-4 py-3">Avg. Price</th>
            <th className="px-4 py-3">LTP</th>
            <th className="px-4 py-3">PnL</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 text-slate-200">
          {holdings.map((holding) => (
            <tr key={holding.symbol} className="hover:bg-slate-900/40">
              <td className="px-4 py-3 font-medium text-white">{holding.symbol}</td>
              <td className="px-4 py-3">{holding.quantity.toFixed(2)}</td>
              <td className="px-4 py-3">₹{holding.avg_price.toFixed(2)}</td>
              <td className="px-4 py-3">₹{holding.ltp.toFixed(2)}</td>
              <td
                className={`px-4 py-3 font-semibold ${
                  holding.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {holding.pnl >= 0 ? '+' : '-'}₹{Math.abs(holding.pnl).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HoldingsTable;
