import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseDateValue } from '../constants/dateHelper';
import { validateTaskDetails } from './taskService';

/* -------------------- STORAGE KEYS -------------------- */

export const storageKeys = {
  onboardingSeen: 'taskflow_onboarding_seen',
  theme: 'taskflow_theme',
  tasks: 'taskflow_tasks',
};

/* -------------------- GENERIC STORAGE -------------------- */

export const safeRead = async (key, fallback = null) => {
  try {
    const value = await AsyncStorage.getItem(key);

    return value === null ? fallback : value;
  } catch (error) {
    console.warn(`Unable to read storage key: ${key}`, error);
    return fallback;
  }
};

export const safeWrite = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Unable to write storage key: ${key}`, error);
    return false;
  }
};

export const safeRemove = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Unable to remove storage key: ${key}`, error);
    return false;
  }
};

/* -------------------- BOOLEAN -------------------- */

export const readBoolean = async (key, fallback = false) => {
  const value = await safeRead(key, String(fallback));

  return value === 'true';
};

export const writeBoolean = async (key, value) => {
  return safeWrite(key, String(Boolean(value)));
};

/* -------------------- ONBOARDING -------------------- */

export const getOnboardingStatus = async () => {
  return readBoolean(storageKeys.onboardingSeen, false);
};

export const markOnboardingSeen = async () => {
  return writeBoolean(storageKeys.onboardingSeen, true);
};

/* -------------------- THEME -------------------- */

export const getPreferredTheme = async () => {
  return (await safeRead(storageKeys.theme, 'light')) || 'light';
};

export const setPreferredTheme = async (themeMode) => {
  return safeWrite(storageKeys.theme, themeMode);
};

/* -------------------- TASKS -------------------- */

export const getTasks = async () => {
  try {
    const tasks = await safeRead(storageKeys.tasks, '[]');

    const parsedTasks = JSON.parse(tasks);

    return Array.isArray(parsedTasks) ? parsedTasks : [];
  } catch (error) {
    console.warn('Unable to parse stored tasks:', error);
    return [];
  }
};

export const saveTasks = async (tasks) => {
  try {
    if (!Array.isArray(tasks)) {
      console.warn('saveTasks expected an array');
      return false;
    }

    return safeWrite(storageKeys.tasks, JSON.stringify(tasks));
  } catch (error) {
    console.warn('Unable to save tasks:', error);
    return false;
  }
};

/* -------------------- TASK CRUD -------------------- */

export const addTask = async (task) => {
  try {
    const validationErrors = validateTaskDetails(task);
    if (Object.keys(validationErrors).length) {
      console.warn('Unable to add invalid task:', validationErrors);
      return null;
    }

    const tasks = await getTasks();

    const savedTask = {
      ...task,
      id: createTaskId(tasks),
    };
    const updatedTasks = [...tasks, savedTask];

    const saved = await saveTasks(updatedTasks);

    return saved ? savedTask : null;
  } catch (error) {
    console.warn('Unable to add task:', error);
    return null;
  }
};

export const updateTask = async (taskId, updatedTask) => {
  try {
    const tasks = await getTasks();

    const taskIndex = tasks.findIndex(
      (task) => String(task.id) === String(taskId)
    );

    if (taskIndex === -1) {
      return null;
    }

    const updatedTasks = [...tasks];
    const mergedTask = {
      ...updatedTasks[taskIndex],
      ...updatedTask,
      id: updatedTasks[taskIndex].id,
    };
    const isStatusOnlyUpdate =
      Object.keys(updatedTask).length === 1 &&
      Object.prototype.hasOwnProperty.call(updatedTask, 'status');
    const validationErrors = validateTaskDetails(mergedTask, {
      requireDates: !isStatusOnlyUpdate,
    });
    if (Object.keys(validationErrors).length) {
      console.warn('Unable to save invalid task changes:', validationErrors);
      return null;
    }
    updatedTasks[taskIndex] = mergedTask;

    const saved = await saveTasks(updatedTasks);

    return saved ? updatedTasks[taskIndex] : null;
  } catch (error) {
    console.warn('Unable to update task:', error);
    return null;
  }
};

export const deleteTask = async (taskId) => {
  try {
    const tasks = await getTasks();

    const updatedTasks = tasks.filter(
      (task) => String(task.id) !== String(taskId)
    );

    if (updatedTasks.length === tasks.length) {
      return false;
    }

    return saveTasks(updatedTasks);
  } catch (error) {
    console.warn('Unable to delete task:', error);
    return false;
  }
};

export const clearAllTasks = async () => {
  return safeRemove(storageKeys.tasks);
};

const createTaskId = (tasks) => {
  const existingIds = new Set(tasks.map((task) => String(task.id)));
  let id = Date.now();
  while (existingIds.has(String(id))) id += 1;
  return String(id);
};

const CSV_FIELDS = new Set([
  'id',
  'title',
  'description',
  'category',
  'priority',
  'start_date',
  'due_date',
  'status',
]);

const CSV_FIELD_ALIASES = {
  startdate: 'start_date',
  duedate: 'due_date',
};

const normalizeCsvHeader = (header) => {
  const normalized = header
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  return CSV_FIELD_ALIASES[normalized.replace(/_/g, '')] || normalized;
};

const HEADERLESS_TASK_COLUMNS = [
  'id',
  'title',
  'description',
  'category',
  'priority',
  'start_date',
  'due_date',
  'status',
];

const parseCsvRows = (csvText) => {
  const source = String(csvText).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let afterQuote = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];

    if (inQuotes) {
      if (character === '"') {
        if (source[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
          afterQuote = true;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (afterQuote && character !== ',' && character !== '\n' && character.trim()) {
      throw new Error(`Unexpected character after a quoted field near character ${index + 1}.`);
    }

    if (character === '"' && field.length === 0 && !afterQuote) {
      inQuotes = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
      afterQuote = false;
    } else if (character === '\n') {
      row.push(field);
      if (row.some((value) => value.trim() !== '')) rows.push(row);
      row = [];
      field = '';
      afterQuote = false;
    } else if (!afterQuote) {
      if (character === '"') {
        throw new Error(`Unexpected quote near character ${index + 1}.`);
      }
      field += character;
    }
  }

  if (inQuotes) {
    throw new Error('The CSV contains a quoted field that was not closed.');
  }

  if (row.length || field.length) {
    row.push(field);
    if (row.some((value) => value.trim() !== '')) rows.push(row);
  }

  return rows;
};

const isValidCsvDate = (value) => {
  return parseDateValue(value) !== null;
};

const canonicalChoice = (value, choices, fallback) => {
  if (!value) return fallback;
  return choices.find((choice) => choice.toLowerCase() === value.toLowerCase()) || null;
};

export const validateTaskCsv = (csvText) => {
  const rows = parseCsvRows(csvText);
  if (!rows.length) {
    throw new Error('The CSV is empty.');
  }

  const firstRowHeaders = rows[0].map(normalizeCsvHeader);
  const hasHeaderRow = firstRowHeaders.includes('title') && firstRowHeaders.includes('category');
  const isHeaderlessTaskCsv = !hasHeaderRow &&
    rows[0].length === HEADERLESS_TASK_COLUMNS.length &&
    /^\d+$/.test(rows[0][0].trim());
  const headers = hasHeaderRow
    ? firstRowHeaders
    : isHeaderlessTaskCsv
      ? HEADERLESS_TASK_COLUMNS
      : firstRowHeaders;
  const dataRows = hasHeaderRow ? rows.slice(1) : isHeaderlessTaskCsv ? rows : [];

  if (!dataRows.length) {
    throw new Error(
      'The CSV must have a title and category header row, or use the eight-column task format.'
    );
  }

  const duplicateHeaders = headers.filter(
    (header, index) => headers.indexOf(header) !== index
  );
  if (duplicateHeaders.length) {
    throw new Error(`The CSV contains duplicate column "${duplicateHeaders[0]}".`);
  }

  const unknownHeader = headers.find((header) => !CSV_FIELDS.has(header));
  if (unknownHeader) {
    throw new Error(
      `Unsupported CSV column "${unknownHeader}". Supported columns: ${Array.from(CSV_FIELDS).join(', ')}.`
    );
  }

  for (const requiredHeader of ['title', 'category']) {
    if (!headers.includes(requiredHeader)) {
      throw new Error(`The CSV is missing the required "${requiredHeader}" column.`);
    }
  }

  const errors = [];
  const tasks = [];
  const addError = (row, fieldName, message) => errors.push({ row, field: fieldName, message });

  dataRows.forEach((cells, rowIndex) => {
    const rowNumber = rowIndex + (hasHeaderRow ? 2 : 1);
    let isValid = true;
    if (cells.length > headers.length) {
      addError(rowNumber, 'row', 'This row has more values than there are CSV columns.');
      isValid = false;
    }
    const values = Object.fromEntries(
      headers.map((header, index) => [header, String(cells[index] || '').trim()])
    );
    const title = values.title || '';
    const category = values.category || '';
    const priority = canonicalChoice(
      values.priority || '',
      ['Low', 'Medium', 'High', 'Urgent'],
      'Medium'
    );
    const status = canonicalChoice(
      values.status || '',
      ['To do', 'In progress', 'Completed', 'Cancelled', 'pending', 'completed'],
      'To do'
    );
    const startDate = values.start_date || '';
    const dueDate = values.due_date || '';
    if (!title) {
      addError(rowNumber, 'title', 'Title is required.');
      isValid = false;
    } else if (title.length > 120) {
      addError(rowNumber, 'title', 'Title must be 120 characters or fewer.');
      isValid = false;
    }

    if (values.description && values.description.length > 1000) {
      addError(rowNumber, 'description', 'Description must be 1000 characters or fewer.');
      isValid = false;
    }

    if (!values.category) {
      addError(rowNumber, 'category', 'Category is required.');
      isValid = false;
    } else if (category.length > 60) {
      addError(rowNumber, 'category', 'Category must be 60 characters or fewer.');
      isValid = false;
    }

    if (values.priority && !priority) {
      addError(rowNumber, 'priority', 'Priority must be Low, Medium, High, or Urgent.');
      isValid = false;
    }

    if (values.status && !status) {
      addError(rowNumber, 'status', 'Status must be To do, In progress, Completed, or Cancelled.');
      isValid = false;
    }

    if (!startDate) {
      addError(rowNumber, 'start_date', 'Start date is required.');
      isValid = false;
    } else if (!isValidCsvDate(startDate)) {
      addError(rowNumber, 'start_date', 'Start date must be a valid YYYY-MM-DD date.');
      isValid = false;
    }

    if (!dueDate) {
      addError(rowNumber, 'due_date', 'Due date is required.');
      isValid = false;
    } else if (!isValidCsvDate(dueDate)) {
      addError(rowNumber, 'due_date', 'Due date must be a valid YYYY-MM-DD date.');
      isValid = false;
    }

    if (startDate && dueDate && startDate > dueDate) {
      addError(rowNumber, 'due_date', 'Due date must be on or after the start date.');
      isValid = false;
    }

    if (isValid) {
      const normalizedStatus = status.toLowerCase() === 'pending'
        ? 'To do'
        : status.toLowerCase() === 'completed'
          ? 'Completed'
          : status;
      tasks.push({
        title,
        description: values.description || '',
        category,
        priority,
        start_date: startDate,
        due_date: dueDate,
        status: normalizedStatus,
      });
    }
  });

  return {
    tasks,
    errors,
    totalRows: dataRows.length,
  };
};

const taskDuplicateKey = (task) =>
  JSON.stringify([
    String(task.title || '').trim().toLowerCase(),
    String(task.category || '').trim().toLowerCase(),
    String(task.start_date || '').trim(),
    String(task.due_date || '').trim(),
  ]);

export const importTasksFromCsv = async (csvText) => {
  const validation = validateTaskCsv(csvText);
  let existingTasks;
  try {
    const storedTasks = await AsyncStorage.getItem(storageKeys.tasks);
    existingTasks = storedTasks === null ? [] : JSON.parse(storedTasks);
    if (!Array.isArray(existingTasks)) {
      throw new Error('Stored tasks data is not a list.');
    }
  } catch (error) {
    console.error('Unable to read existing tasks before CSV import:', error);
    throw new Error('Existing tasks could not be read, so the CSV was not imported.');
  }
  const knownRecords = new Set(existingTasks.map(taskDuplicateKey));
  const importedTasks = [];
  let duplicateCount = 0;

  validation.tasks.forEach((task) => {
    const hasExistingRecord = knownRecords.has(taskDuplicateKey(task));

    if (hasExistingRecord) {
      duplicateCount += 1;
      return;
    }

    const importedTask = { ...task, id: createTaskId([...existingTasks, ...importedTasks]) };

    knownRecords.add(taskDuplicateKey(importedTask));
    importedTasks.push(importedTask);
  });

  const allTasks = [...existingTasks, ...importedTasks];
  if (importedTasks.length && !(await saveTasks(allTasks))) {
    throw new Error('Tasks could not be saved to local storage.');
  }

  const invalidRows = new Set(validation.errors.map((error) => error.row)).size;

  return {
    allTasks,
    importedTasks,
    errors: validation.errors,
    summary: {
      totalRows: validation.totalRows,
      validRows: validation.tasks.length,
      invalidRows,
      importedCount: importedTasks.length,
      duplicateCount,
    },
  };
};