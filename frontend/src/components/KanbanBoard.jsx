import { useState } from 'react';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import api from '../services/api';
import toast from 'react-hot-toast';

const KanbanBoard = ({ tasks, refreshData }) => {
  const [activeTask, setActiveTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const columns = [
    { id: 'todo', title: 'A Fazer', headerClass: 'border-b-slate-300' },
    { id: 'doing', title: 'Fazendo', headerClass: 'border-b-blue-500' },
    { id: 'done', title: 'Concluído', headerClass: 'border-b-green-500' }
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const overId = over.id;

    // Check if over is a column
    const isOverColumn = columns.some(c => c.id === overId);
    let newStatus;

    if (isOverColumn) {
      newStatus = overId;
    } else {
      // Over a task
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) newStatus = overTask.status;
    }

    const activeTask = tasks.find(t => t.id === taskId);

    if (activeTask && newStatus && activeTask.status !== newStatus) {
      try {
        await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
        refreshData();
      } catch (error) {
        toast.error('Erro ao mover tarefa');
      }
    }
  };

  const openModalForNew = (status = 'todo') => {
    setEditingTask({ status, title: '', description: '', priority: 'medium', dueDate: '' });
    setIsModalOpen(true);
  };

  const openModalForEdit = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  return (
    <>
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCorners} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col sm:flex-row gap-6 h-full overflow-x-auto pb-4">
          {columns.map(col => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              headerClass={col.headerClass}
              tasks={tasks.filter(t => t.status === col.id)}
              refreshData={refreshData}
              onEdit={openModalForEdit}
              onAdd={() => openModalForNew(col.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-3 scale-105 shadow-2xl cursor-grabbing opacity-90">
              <TaskCard task={activeTask} refreshData={() => {}} onEdit={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        task={editingTask?.id ? editingTask : null}
        refreshData={refreshData}
      />
    </>
  );
};

export default KanbanBoard;
