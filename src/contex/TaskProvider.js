import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  addTask as saveTask,
  clearAllTasks as removeAllTasks,
  deleteTask as removeTask,
  getTasks,
  importTasksFromCsv as saveTasksFromCsv,
  updateTask as saveUpdatedTask,
} from '../services/storage';

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshTasks = useCallback(async () => {
    setIsLoading(true);
    const storedTasks = await getTasks();
    setTasks(storedTasks);
    setIsLoading(false);
    return storedTasks;
  }, []);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  const addTask = useCallback(async (task) => {
    const savedTask = await saveTask(task);

    if (savedTask) {
      setTasks((currentTasks) => [...currentTasks, savedTask]);
    }

    return savedTask;
  }, []);

  const updateTask = useCallback(async (taskId, changes) => {
    const updatedTask = await saveUpdatedTask(taskId, changes);

    if (updatedTask) {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          String(task.id) === String(taskId) ? updatedTask : task
        )
      );
    }

    return updatedTask;
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    const deleted = await removeTask(taskId);

    if (deleted) {
      setTasks((currentTasks) =>
        currentTasks.filter((task) => String(task.id) !== String(taskId))
      );
    }

    return deleted;
  }, []);

  const clearTasks = useCallback(async () => {
    const cleared = await removeAllTasks();

    if (cleared) {
      setTasks([]);
    }

    return cleared;
  }, []);

  const importTasksFromCsv = useCallback(async (csvText) => {
    const result = await saveTasksFromCsv(csvText);
    setTasks(result.allTasks);
    return result;
  }, []);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading,
        addTask,
        updateTask,
        deleteTask,
        clearTasks,
        importTasksFromCsv,
        refreshTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error('useTasks must be used inside TaskProvider');
  }

  return context;
};
