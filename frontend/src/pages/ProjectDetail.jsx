import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

const STATUS_STYLE = {
  TODO: 'bg-indigo-100 text-indigo-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  DONE: 'bg-green-100 text-green-700'
};

const PRIORITY_STYLE = {
  LOW: 'bg-gray-100 text-gray-500',
  MEDIUM: 'bg-blue-100 text-blue-600',
  HIGH: 'bg-red-100 text-red-600'
};

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [showTask, setShowTask] = useState(false);
  const [showMember, setShowMember] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', due_date: '', priority: 'MEDIUM', assignee_id: ''
  });
  const [memberEmail, setMemberEmail] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    api.get(`/api/projects/${id}`)
      .then(res => setProject(res.data))
      .catch(err => setError('Failed to load project'));
  };
  useEffect(() => { load(); }, [id]);

  const myRole = project?.members?.find(m => m.user.id === user?.id)?.role;
  const isAdmin = myRole === 'ADMIN';

  const createTask = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/tasks', {
        ...taskForm,
        project_id: id,
        due_date: taskForm.due_date || null,
        assignee_id: taskForm.assignee_id || null
      });
      setTaskForm({ title: '', description: '', due_date: '', priority: 'MEDIUM', assignee_id: '' });
      setShowTask(false);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error creating task');
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      await api.put(`/api/tasks/${taskId}`, { status });
      load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error updating task status');
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/api/projects/${id}/members`, { email: memberEmail });
      setMemberEmail('');
      setShowMember(false);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error adding member');
    }
  };

  if (!project) return (
    <>
      <Navbar />
      <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            {project.description && <p className="text-gray-500 text-sm mt-1">{project.description}</p>}
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <button onClick={() => setShowMember(!showMember)}
                className="border border-gray-300 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50">
                + Member
              </button>
              <button onClick={() => setShowTask(!showTask)}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700">
                + Task
              </button>
            </div>
          )}
        </div>

        {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>}

        {showMember && isAdmin && (
          <form onSubmit={addMember} className="flex gap-3 mb-4 bg-white border border-gray-200 rounded-xl p-4">
            <input type="email" placeholder="Member email address" required
              className="flex-1 border rounded-lg px-4 py-2 outline-none text-sm focus:ring-2 focus:ring-blue-500"
              value={memberEmail} onChange={e => setMemberEmail(e.target.value)} />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              Add Member
            </button>
          </form>
        )}

        {showTask && isAdmin && (
          <form onSubmit={createTask}
            className="bg-white border border-gray-200 rounded-xl p-5 mb-6 grid grid-cols-2 gap-3">
            <input placeholder="Task title *" required
              className="col-span-2 border rounded-lg px-4 py-2 outline-none text-sm focus:ring-2 focus:ring-blue-500"
              value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
            <input placeholder="Description (optional)"
              className="col-span-2 border rounded-lg px-4 py-2 outline-none text-sm focus:ring-2 focus:ring-blue-500"
              value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
            <div>
              <label className="block text-xs text-gray-500 mb-1">Due Date</label>
              <input type="date" className="w-full border rounded-lg px-4 py-2 outline-none text-sm"
                value={taskForm.due_date} onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Priority</label>
              <select className="w-full border rounded-lg px-4 py-2 outline-none text-sm"
                value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Assign To</label>
              <select className="w-full border rounded-lg px-4 py-2 outline-none text-sm"
                value={taskForm.assignee_id} onChange={e => setTaskForm({ ...taskForm, assignee_id: e.target.value })}>
                <option value="">Unassigned</option>
                {project.members?.map(m => (
                  <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700">
                Create Task
              </button>
            </div>
          </form>
        )}

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {STATUSES.map(status => {
            const tasks = project.tasks?.filter(t => t.status === status) || [];
            return (
              <div key={status} className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  {status.replace('_', ' ')}
                  <span className="ml-2 bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                    {tasks.length}
                  </span>
                </h3>
                <div className="space-y-2">
                  {tasks.map(task => (
                    <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${PRIORITY_STYLE[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-2">
                        {task.assignee && <span>👤 {task.assignee.name}</span>}
                        {task.due_date && (
                          <span className={new Date(task.due_date) < new Date() && task.status !== 'DONE' ? 'text-red-500' : ''}>
                            📅 {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <select
                        value={task.status}
                        onChange={e => updateStatus(task.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border-none outline-none cursor-pointer font-medium ${STATUS_STYLE[task.status]}`}>
                        {STATUSES.map(s => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No tasks</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Team Members */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Team Members ({project.members?.length || 0})</h2>
          <div className="space-y-2">
            {project.members?.map(m => (
              <div key={m.id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                  {m.user.name[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{m.user.name}</p>
                  <p className="text-xs text-gray-400">{m.user.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${m.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
