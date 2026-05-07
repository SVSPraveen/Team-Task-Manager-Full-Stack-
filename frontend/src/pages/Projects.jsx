import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const load = () => {
    api.get('/api/projects')
      .then(res => setProjects(res.data))
      .catch(err => setError('Failed to load projects'));
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/projects', form);
      setForm({ name: '', description: '' });
      setShowForm(false);
      load();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error creating project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">{error}</div>}
          <button onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
            + New Project
          </button>
        </div>

        {showForm && (
          <form onSubmit={create} className="bg-white border border-gray-200 rounded-xl p-5 mb-6 space-y-3">
            <input placeholder="Project name *" required
              className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Description (optional)"
              className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <button type="submit" disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </form>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No projects yet</p>
            <p className="text-sm mt-1">Create your first project to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map(p => (
              <Link to={`/projects/${p.id}`} key={p.id}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow block">
                <h2 className="font-semibold text-gray-900 mb-1">{p.name}</h2>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{p.description || 'No description'}</p>
                <div className="flex gap-4 text-xs text-gray-400">
                  <span>👥 {p.members?.length || 0} members</span>
                  <span>📋 {p.task_count || 0} tasks</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
