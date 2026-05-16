import { ListTodo, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass, iconColorClass }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200 group">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
      </div>
      <div className={`${bgClass} p-3 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
        <Icon className={`w-6 h-6 ${iconColorClass}`} />
      </div>
    </div>
  </div>
);

const StatsDashboard = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        title="Tarefas Totais" 
        value={stats.total} 
        icon={ListTodo} 
        colorClass="text-slate-800"
        bgClass="bg-blue-50"
        iconColorClass="text-blue-600"
      />
      <StatCard 
        title="Em Execução" 
        value={stats.doing} 
        icon={Clock} 
        colorClass="text-slate-800"
        bgClass="bg-amber-50"
        iconColorClass="text-amber-500"
      />
      <StatCard 
        title="Concluídas" 
        value={stats.done} 
        icon={CheckCircle2} 
        colorClass="text-slate-800"
        bgClass="bg-green-50"
        iconColorClass="text-green-600"
      />
      <StatCard 
        title="Em Atraso" 
        value={stats.overdue} 
        icon={AlertCircle} 
        colorClass="text-red-600"
        bgClass="bg-red-50"
        iconColorClass="text-red-600"
      />
    </div>
  );
};

export default StatsDashboard;
