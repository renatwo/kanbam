const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHandler');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const tasks = await readData('tasks');
    const userTasks = tasks.filter(t => t.userId === req.userId);
    res.json(userTasks);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar tarefas' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, status, dueDate, priority } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Título é obrigatório' });
    }

    const tasks = await readData('tasks');
    
    const newTask = {
      id: uuidv4(),
      userId: req.userId,
      title,
      description: description || '',
      status: status || 'todo',
      completed: false,
      dueDate: dueDate || null,
      priority: priority || 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    tasks.push(newTask);
    await writeData('tasks', tasks);

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar tarefa' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, dueDate, priority } = req.body;
    const tasks = await readData('tasks');
    const taskIndex = tasks.findIndex(t => t.id === req.params.id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    if (tasks[taskIndex].userId !== req.userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      title: title || tasks[taskIndex].title,
      description: description !== undefined ? description : tasks[taskIndex].description,
      status: status || tasks[taskIndex].status,
      dueDate: dueDate !== undefined ? dueDate : tasks[taskIndex].dueDate,
      priority: priority || tasks[taskIndex].priority,
      updatedAt: new Date().toISOString()
    };

    await writeData('tasks', tasks);
    res.json(tasks[taskIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar tarefa' });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['todo', 'doing', 'done'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const tasks = await readData('tasks');
    const taskIndex = tasks.findIndex(t => t.id === req.params.id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    if (tasks[taskIndex].userId !== req.userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    tasks[taskIndex].status = status;
    tasks[taskIndex].updatedAt = new Date().toISOString();

    await writeData('tasks', tasks);
    res.json(tasks[taskIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar status da tarefa' });
  }
});

router.patch('/:id/complete', async (req, res) => {
  try {
    const { completed } = req.body;
    const tasks = await readData('tasks');
    const taskIndex = tasks.findIndex(t => t.id === req.params.id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    if (tasks[taskIndex].userId !== req.userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    tasks[taskIndex].completed = completed;
    tasks[taskIndex].updatedAt = new Date().toISOString();

    await writeData('tasks', tasks);
    res.json(tasks[taskIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao marcar tarefa como concluída' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const tasks = await readData('tasks');
    const taskIndex = tasks.findIndex(t => t.id === req.params.id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    if (tasks[taskIndex].userId !== req.userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    tasks.splice(taskIndex, 1);
    await writeData('tasks', tasks);
    
    res.json({ message: 'Tarefa excluída com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir tarefa' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const tasks = await readData('tasks');
    const userTasks = tasks.filter(t => t.userId === req.userId);
    
    const stats = {
      total: userTasks.length,
      todo: userTasks.filter(t => t.status === 'todo').length,
      doing: userTasks.filter(t => t.status === 'doing').length,
      done: userTasks.filter(t => t.status === 'done').length,
      overdue: 0
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    stats.overdue = userTasks.filter(t => {
      if (t.completed || t.status === 'done' || !t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      return dueDate < today;
    }).length;

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

module.exports = router;
