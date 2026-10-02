import { Platform } from 'react-native';
import { parseDateValue } from '../constants/dateHelper';

const PRIORITY_ORDER = { urgent: 4, high: 3, medium: 2, low: 1 };
const TASK_CSV_FIELDS = [
  'id',
  'title',
  'description',
  'category',
  'priority',
  'start_date',
  'due_date',
  'status',
];
const TASK_STATUSES = new Set(['to do', 'in progress', 'completed', 'cancelled', 'done']);
const TASK_PRIORITIES = new Set(['low', 'medium', 'high', 'urgent']);

const normalizeValue = (value) => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ');
  return normalized === 'todo' ? 'to do' : normalized;
};

export const validateTaskDetails = (task, { requireDates = true } = {}) => {
  const errors = {};
  const title = String(task.title || '').trim();
  const category = String(task.category || '').trim();
  const description = String(task.description || '').trim();
  const startDate = String(task.start_date || '').trim();
  const dueDate = String(task.due_date || '').trim();

  if (!title) errors.title = 'Enter a title for your task.';
  else if (title.length > 120) errors.title = 'Title must be 120 characters or fewer.';
  if (!category) errors.category = 'Choose a category for your task.';
  if (description.length > 1000) {
    errors.description = 'Description must be 1,000 characters or fewer.';
  }
  if (!TASK_PRIORITIES.has(normalizeValue(task.priority))) {
    errors.priority = 'Choose a valid priority.';
  }
  if (!TASK_STATUSES.has(normalizeValue(task.status))) {
    errors.status = 'Choose a valid status.';
  }
  if (requireDates && !startDate) errors.start_date = 'Choose a start date.';
  else if (!isValidTaskDate(startDate)) errors.start_date = 'Choose a valid start date.';
  if (requireDates && !dueDate) errors.due_date = 'Choose a due date.';
  else if (!isValidTaskDate(dueDate)) errors.due_date = 'Choose a valid due date.';
  if (
    !errors.start_date &&
    !errors.due_date &&
    startDate &&
    dueDate &&
    startDate > dueDate
  ) {
    errors.due_date = 'Due date must be on or after the start date.';
  }
  return errors;
};

const isValidTaskDate = (value) => {
  if (!value) return true;
  return parseDateValue(value) !== null;
};

export const filterAndSortTasks = (
  tasks,
  { category = 'all', query = '', status = 'all', priority = 'all', sortBy = 'default' } = {}
) => {
  const normalizedQuery = query.trim().toLowerCase();
  const filteredTasks = tasks.filter((task) => {
    const matchesCategory =
      category === 'all' ||
      String(task.category || '').trim().toLowerCase() === category;
    const matchesQuery =
      !normalizedQuery ||
      [
        task.title,
        task.description,
        task.category,
        task.status,
        task.priority,
        task.start_date,
        task.due_date,
      ].some((field) => String(field || '').toLowerCase().includes(normalizedQuery));
    const matchesStatus =
      status === 'all' ||
      normalizeValue(task.status || 'To do') === normalizeValue(status);
    const matchesPriority =
      priority === 'all' ||
      normalizeValue(task.priority) === normalizeValue(priority);

    return matchesCategory && matchesQuery && matchesStatus && matchesPriority;
  });

  if (sortBy === 'dueDate') {
    filteredTasks.sort((first, second) => {
      const firstDate = String(first.due_date || '');
      const secondDate = String(second.due_date || '');
      if (!firstDate) return secondDate ? 1 : 0;
      if (!secondDate) return -1;
      return firstDate.localeCompare(secondDate);
    });
  } else if (sortBy === 'priority') {
    filteredTasks.sort(
      (first, second) =>
        (PRIORITY_ORDER[normalizeValue(second.priority)] || 0) -
        (PRIORITY_ORDER[normalizeValue(first.priority)] || 0)
    );
  } else if (sortBy === 'title') {
    filteredTasks.sort((first, second) =>
      String(first.title || '').localeCompare(String(second.title || ''))
    );
  }

  return filteredTasks;
};

const escapeCsvCell = (value) => {
  const cell = String(value ?? '');
  return `"${cell.replace(/"/g, '""')}"`;
};

export const createTasksCsv = (tasks) => [
  TASK_CSV_FIELDS.join(','),
  ...tasks.map((task) =>
    TASK_CSV_FIELDS.map((field) => escapeCsvCell(task[field])).join(',')
  ),
].join('\r\n');

export const exportTasksToCsv = async (tasks) => {
  if (!tasks.length) {
    throw new Error('There are no tasks to export.');
  }

  const csv = `\uFEFF${createTasksCsv(tasks)}`;
  const dateStamp = new Date().toISOString().slice(0, 10);
  const fileName = `taskflow-tasks-${dateStamp}.csv`;

  if (Platform.OS === 'web') {
    if (
      typeof document === 'undefined' ||
      typeof URL === 'undefined' ||
      typeof URL.createObjectURL !== 'function'
    ) {
      throw new Error('CSV downloads are not available in this browser.');
    }

    const file = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const fileUrl = URL.createObjectURL(file);
    const downloadLink = document.createElement('a');
    downloadLink.href = fileUrl;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
    return;
  }

  const [{ File, Paths }, Sharing] = await Promise.all([
    import('expo-file-system'),
    import('expo-sharing'),
  ]);
  const outputFile = new File(
    Paths.cache,
    `taskflow-tasks-${Date.now()}.csv`
  );
  outputFile.create();
  outputFile.write(csv);

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('File sharing is not available on this device.');
  }

  await Sharing.shareAsync(outputFile.uri, {
    dialogTitle: 'Export tasks',
    mimeType: 'text/csv',
    UTI: 'public.comma-separated-values-text',
  });
};
