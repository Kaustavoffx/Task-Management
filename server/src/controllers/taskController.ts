import { Request, Response } from 'express';
import Task from '../models/Task';

// @route   GET /api/tasks
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, priority, search } = req.query;
    
    // Strict scoping to user
    const query: any = { userId: req.user.id };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @route   POST /api/tasks
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    if (!title) {
      res.status(400).json({ message: 'Title is required' });
      return;
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate,
      userId: req.user.id,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(req.user.id).emit('task_created', task);
    }

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @route   PUT /api/tasks/:id
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Strict user isolation check
    if (task.userId.toString() !== req.user.id) {
      res.status(401).json({ message: 'User not authorized to update this task' });
      return;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    const io = req.app.get('io');
    if (io) {
      io.to(req.user.id).emit('task_updated', updatedTask);
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @route   DELETE /api/tasks/:id
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Strict user isolation check
    if (task.userId.toString() !== req.user.id) {
      res.status(401).json({ message: 'User not authorized to delete this task' });
      return;
    }

    await task.deleteOne();

    const io = req.app.get('io');
    if (io) {
      io.to(req.user.id).emit('task_deleted', req.params.id);
    }

    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
