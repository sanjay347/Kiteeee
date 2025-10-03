import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#38bdf8', '#a855f7', '#f97316', '#22c55e', '#f43f5e', '#eab308', '#14b8a6'];

function SectorPie({ data, loading }) {
  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border border-slate-800 bg-surface">
        <span className="text-slate-300">Loading sector distribution…</span>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-surface/40">
        <span className="text-slate-400">Sector data unavailable.</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-surface p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-white">Sector Allocation</h3>
      <div className="mt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="weight" nameKey="sector" outerRadius={100} label>
              {data.map((entry, index) => (
                <Cell key={`cell-${entry.sector}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, props) => [`${Number(value).toFixed(2)}%`, props.payload.sector]}
              contentStyle={{ backgroundColor: '#1e293b', borderRadius: '0.75rem', border: '1px solid #1e293b' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-slate-300">
        {data.map((item) => (
          <li key={item.sector} className="flex justify-between">
            <span>{item.sector}</span>
            <span>{item.weight.toFixed(2)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SectorPie;
