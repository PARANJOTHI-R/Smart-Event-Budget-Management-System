import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function ExpenseTrendLine({ data }) {
    if (!data || data.length === 0) return (
        <div className="empty-state" style={{ padding: '24px' }}>
            <div className="empty-icon">📈</div>
            <p>No expense trend data yet</p>
        </div>
    );

    return (
        <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Total Spent']} contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: 13 }} />
                <Area type="monotone" dataKey="amount" stroke="#4F46E5" strokeWidth={2.5} fill="url(#trendGradient)" dot={{ fill: '#4F46E5', r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
        </ResponsiveContainer>
    );
}
