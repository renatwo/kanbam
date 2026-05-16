import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Layout } from 'lucide-react';
import api from '../services/api';
import StatsDashboard from '../components/StatsDashboard';
import KanbanBoard from '../components/KanbanBoard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ total: 0, todo: 0, doing: 0, done: 0, overdue: 0 });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('kanban_user');
    if (userData) setUser(JSON.parse(userData));
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [tasksRes, statsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/tasks/stats')
      ]);
      setTasks(tasksRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('kanban_token');
    localStorage.removeItem('kanban_user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Layout className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">Kanban</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600">
                Olá, {user?.name || 'Usuário'}
              </span>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-8 flex-1 flex flex-col">
            <StatsDashboard stats={stats} />
            <div className="flex-1">
              <KanbanBoard tasks={tasks} refreshData={fetchData} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
