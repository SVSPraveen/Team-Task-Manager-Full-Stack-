import { useEffect, useState } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const STATUS_COLORS = { TODO: '#6366f1', IN_PROGRESS: '#f59e0b', DONE: '#10b981' };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/dashboard')
      .then(res => setData(res.data))
      .catch(err => setError('Failed to load dashboard data'));
  }, []);

  if (!data) return (
    <>
      <Navbar />
      <div className="flex items-center justify-center h-64 text-gray-500">
        {error ? error : 'Loading dashboard...'}
      </div>
    </>
  );

  const pieData = data.by_status.map(s => ({
    name: s.status.replace('_', ' '),
    value: s.count,
    color: STATUS_COLORS[s.status] || '#94a3b8'
  }));

  const barData = data.tasks_by_user.map(u => ({
    name: u.user_name,
    tasks: u.count
  }));

  const doneCount = data.by_status.find(s => s.status === 'DONE')?.count || 0;

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Tasks', value: data.total_tasks, color: 'text-gray-900', bg: 'bg-white' },
            { label: 'Overdue', value: data.overdue_tasks, color: 'text-red-500', bg: 'bg-red-50' },
            { label: 'Completed', value: doneCount, color: 'text-green-600', bg: 'bg-green-50' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-5 border border-gray-200`}>
              <p className="text-sm text-gray-500 mb-1">{label}</p>
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-700 mb-4">Tasks by Status</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-700 mb-4">Tasks per User</h2>
            {barData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No assigned tasks yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
