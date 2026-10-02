import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import Typography from '../../components/atoms/Typography';
import Card from '../../components/molecules/Card';
import PButton from '../../components/molecules/PButton';
import RdropDown from '../../components/molecules/RdropDown';
import RInput from '../../components/molecules/RInput';
import ScreenWrapper from '../../components/molecules/ScreenWrapper';
import DatePicker from '../../components/organism/DatePicker';
import { useTasks } from '../../contex/TaskProvider';
import useAlert from '../../hooks/useAlert';
import { spacing } from '../../constants/color';
import { parseDateValue } from '../../constants/dateHelper';
import { useTheme } from '../../contex/ThemeContext';
import { validateTaskDetails } from '../../services/taskService';

const CATEGORIES = [
  'Project',
  'Task',
  'Work',
  'Development',
  'Planning',
  'Meetings',
  'Testing',
  'Release',
  'Personal',
  'Finance',
  'Design',
  'Travel',
  'Health',
  'Learning',
  'Documentation',
];

const PRIORITIES = [
  { label: 'Low', value: 'Low' },
  { label: 'Medium', value: 'Medium' },
  { label: 'High', value: 'High' },
  { label: 'Urgent', value: 'Urgent' },
];

const STATUSES = [
  { label: 'To do', value: 'To do' },
  { label: 'In progress', value: 'In progress' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Cancelled', value: 'Cancelled' },
];

const CreateTask = ({ navigation, route }) => {
  const task = route.params?.task || null;
  const initialCategory = route.params?.category || '';
  const isEditing = Boolean(task);
  const { tasks, addTask, updateTask } = useTasks();
  const { theme } = useTheme();
  const { showAlert } = useAlert();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [priority, setPriority] = useState('Medium');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('To do');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const categoryOptions = useMemo(() => {
    const values = new Map(CATEGORIES.map((value) => [value.toLowerCase(), value]));
    tasks.forEach((existingTask) => {
      const value = String(existingTask.category || '').trim();
      if (value) values.set(value.toLowerCase(), value);
    });
    if (task?.category) {
      values.set(String(task.category).toLowerCase(), String(task.category));
    }
    return Array.from(values.values()).map((value) => ({ label: value, value }));
  }, [task, tasks]);

  useEffect(() => {
    setTitle(task?.title || '');
    setDescription(task?.description || '');
    setCategory(task?.category || initialCategory);
    setPriority(task?.priority || 'Medium');
    setStartDate(task?.start_date || '');
    setDueDate(task?.due_date || '');
    setStatus(task?.status || 'To do');
    setErrors({});

    navigation.setOptions({
      title: isEditing ? `Edit ${task.category || 'task'}` : 'Create task',
      headerSubtitle: isEditing ? 'Update the details below' : 'Add something to your list',
    });
  }, [initialCategory, isEditing, navigation, task]);

  const showFormAlert = (message) => {
    showAlert({
      title: isEditing ? 'Unable to update task' : 'Unable to create task',
      message,
      leftText: null,
      rightText: 'OK',
    });
  };

  const clearFieldError = (field) => {
    setErrors((currentErrors) => {
      if (!currentErrors[field]) return currentErrors;
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      if (field === 'start_date' || field === 'due_date') {
        delete nextErrors.due_date;
      }
      return nextErrors;
    });
  };

  const handleCreateTask = async () => {
    const normalizedTitle = title.trim();
    const normalizedStartDate = startDate.trim();
    const normalizedDueDate = dueDate.trim();
    const taskDetails = {
      title: normalizedTitle,
      description: description.trim(),
      category: category.trim(),
      priority,
      start_date: normalizedStartDate,
      due_date: normalizedDueDate,
      status,
    };
    const validationErrors = validateTaskDetails(taskDetails);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSaving(true);

    try {
      const savedTask = isEditing
        ? await updateTask(task.id, taskDetails)
        : await addTask(taskDetails);

      if (!savedTask) {
        showFormAlert('Your task could not be saved. Please try again.');
        return;
      }

      showAlert({
        title: isEditing ? 'Task updated' : 'Task created',
        message: `"${normalizedTitle}" has been ${isEditing ? 'updated' : 'added'}.`,
        leftText: null,
        rightText: 'Done',
        onRightPress: () => navigation.goBack(),
      });
    } catch (saveError) {
      console.error(`Unable to ${isEditing ? 'update' : 'create'} task:`, saveError);
      showFormAlert('Your task could not be saved. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenWrapper contentContainerStyle={styles.screen}>
      <Typography variant="body2" color="muted" style={styles.intro}>
        {isEditing
          ? 'Update the details below to keep your work organized.'
          : 'Add the details below to keep your work organized.'}
      </Typography>

      <Card
        variant="elevated"
        style={[styles.formCard, { borderColor: theme.colors.border }]}
      >
        <Typography variant="subtitle" color="secondary" style={styles.sectionTitle}>
          {isEditing ? 'Edit details' : 'Task details'}
        </Typography>

        <RInput
          value={title}
          onChangeText={(value) => {
            setTitle(value);
            clearFieldError('title');
          }}
          placeholder="Title"
          returnKeyType="next"
          maxLength={120}
          containerStyle={styles.input}
          error={errors.title}
        />

        <RInput
          value={description}
          onChangeText={(value) => {
            setDescription(value);
            clearFieldError('description');
          }}
          placeholder="Description (optional)"
          multiline
          numberOfLines={3}
          maxLength={1000}
          containerStyle={styles.input}
          inputStyle={styles.descriptionInput}
          error={errors.description}
        />

        <RdropDown
          label="Category"
          placeholder="Choose category"
          value={category}
          options={categoryOptions}
          onChange={(value) => {
            setCategory(value);
            clearFieldError('category');
          }}
          error={errors.category}
        />

        <RdropDown
          label="Priority"
          value={priority}
          options={PRIORITIES}
          onChange={(value) => {
            setPriority(value);
            clearFieldError('priority');
          }}
          error={errors.priority}
        />

        <View style={styles.dateRow}>
          <DatePicker
            label="Start date (required)"
            value={startDate}
            onChange={(value) => {
              setStartDate(value);
              clearFieldError('start_date');
              clearFieldError('due_date');
            }}
            error={errors.start_date}
            placeholder="Choose start date"
            maximumDate={parseDateValue(dueDate) || undefined}
          />
          <DatePicker
            label="Due date (required)"
            value={dueDate}
            onChange={(value) => {
              setDueDate(value);
              clearFieldError('due_date');
            }}
            error={errors.due_date}
            placeholder="Choose due date"
            minimumDate={parseDateValue(startDate) || undefined}
          />
        </View>

        <RdropDown
          label="Status"
          value={status}
          options={STATUSES}
          onChange={(value) => {
            setStatus(value);
            clearFieldError('status');
          }}
          error={errors.status}
        />

        <PButton
          title={isEditing ? 'Update task' : 'Create task'}
          color="primary"
          fullWidth
          loading={isSaving}
          disabled={isSaving}
          onPress={handleCreateTask}
          style={styles.submitButton}
        />
      </Card>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  screen: {
    paddingTop: spacing.md,
  },
  intro: {
    marginBottom: spacing.lg,
  },
  formCard: {
    borderWidth: 1,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  input: {
    marginBottom: spacing.lg,
  },
  descriptionInput: {
    minHeight: 72,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  submitButton: {
    marginTop: spacing.xs,
  },
});

export default CreateTask;
