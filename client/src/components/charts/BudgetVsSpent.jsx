import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formatCurrency = (value) => `₹${value.toLocaleString()}`;

export default function BudgetVsSpent({ data }) {
    if (!data || data.length === 0) return (
        <div className="empty-state" style={{ padding: '24px' }}>
            <div className="empty-icon">📊</div>
            <p>No event data yet</p>
        </div>
    );

    return (
        <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                <Tooltip formatter={(value, name) => [formatCurrency(value), name === 'budget' ? 'Budget' : name === 'spent' ? 'Spent' : 'Remaining']} contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: 13 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Bar dataKey="budget" name="Budget" fill="#E0E7FF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" name="Spent" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
