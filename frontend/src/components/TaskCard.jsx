import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { isBefore, startOfDay, parseISO } from 'date-fns';
import api from '../services/api';
import toast from 'react-hot-toast';

const TaskCard = ({ task, refreshData, onEdit }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'Task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isOverdue = () => {
    if (task.completed || task.status === 'done' || !task.dueDate) return false;
    const today = startOfDay(new Date());
    const dueDate = startOfDay(parseISO(task.dueDate));
    return isBefore(dueDate, today);
  };

  const overdue = isOverdue();

  const handleCompleteToggle = async (e) => {
    e.stopPropagation();
    setIsCompleting(true);
    try {
      await api.patch(`/tasks/${task.id}/complete`, { completed: !task.completed });
      refreshData();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        await api.delete(`/tasks/${task.id}`);
        toast.success('Tarefa excluída');
        refreshData();
      } catch (error) {
        toast.error('Erro ao excluir tarefa');
      }
    }
  };

  const getPriorityColors = () => {
    switch (task.priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityLabel = () => {
    switch (task.priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return task.priority;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-white rounded-xl shadow-sm border p-4 mb-3 group transition-all cursor-grab active:cursor-grabbing
        ${overdue ? 'border-l-4 border-l-red-500 bg-red-50 border-y-red-200 border-r-red-200' : 'border-slate-200 hover:shadow-md'}
        ${task.completed ? 'opacity-60' : ''}
      `}
      {...attributes}
      {...listeners}
    >
      {overdue && (
        <div className="absolute -top-2.5 right-4 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
          ATRASADA
        </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-2">
          <button 
            onPointerDown={(e) => e.stopPropagation()} 
            onClick={handleCompleteToggle}
            disabled={isCompleting}
            className="mt-0.5 flex-shrink-0"
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
              ${task.completed ? 'bg-blue-500 border-blue-500' : 'border-slate-300 hover:border-blue-500'}
            `}>
              {task.completed && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
          </button>
          <h3 className={`font-semibold text-slate-800 line-clamp-1 ${task.completed ? 'line-through text-slate-500' : ''}`}>
            {task.title}
          </h3>
        </div>

        <div className="relative">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div 
              className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-20"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onEdit(task);
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" /> Editar
              </button>
              <button
                onClick={handleDelete}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      {task.description && (
        <p className={`text-sm text-slate-500 line-clamp-2 mb-3 ml-7 ${task.completed ? 'line-through' : ''}`}>
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-3 ml-7">
        <span className={`text-xs font-medium px-2 py-1 rounded-md ${getPriorityColors()} ${task.completed ? 'opacity-70' : ''}`}>
          {getPriorityLabel()}
        </span>

        {task.dueDate && (
          <div className={`flex items-center gap-1 text-xs font-medium
            ${overdue ? 'text-red-600' : 'text-slate-500'}
            ${task.completed ? 'opacity-70' : ''}
          `}>
            <Calendar className="w-3 h-3" />
            {new Date(task.dueDate).toLocaleDateString('pt-BR')}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
