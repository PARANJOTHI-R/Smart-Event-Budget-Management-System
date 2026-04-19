import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899'];

export default function CategoryPieChart({ data }) {
    if (!data || data.length === 0) return (
        <div className="empty-state" style={{ padding: '24px' }}>
            <div className="empty-icon">🥧</div>
            <p>No approved expenses yet</p>
        </div>
    );

    return (
        <ResponsiveContainer width="100%" height={240}>
            <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={95}
                    dataKey="value" nameKey="name" paddingAngle={3}>
                    {data.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: 13 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
        </ResponsiveContainer>
    );
}
