import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

const KanbanColumn = ({ id, title, tasks, headerClass, refreshData, onEdit, onAdd }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: 'Column', columnId: id }
  });

  return (
    <div className="flex flex-col flex-1 min-w-[300px] max-w-[400px]">
      <div className={`p-4 rounded-t-xl border-b-2 flex justify-between items-center bg-white shadow-sm z-10 ${headerClass}`}>
        <h2 className="font-bold text-slate-700 flex items-center gap-2">
          {title}
          <span className="bg-slate-100 text-slate-600 text-xs py-0.5 px-2 rounded-full font-medium">
            {tasks.length}
          </span>
        </h2>
        <button 
          onClick={() => onAdd(id)}
          className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
          title="Nova Tarefa"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div 
        ref={setNodeRef}
        className={`flex-1 p-3 bg-slate-100/50 rounded-b-xl border border-t-0 border-slate-200 transition-colors
          ${isOver ? 'bg-blue-50/50' : ''}
        `}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              refreshData={refreshData}
              onEdit={onEdit}
            />
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-400 font-medium border-2 border-dashed border-slate-200 rounded-xl">
              Nenhuma tarefa
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export default KanbanColumn;
