import React, { memo, useDeferredValue, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import Typography from '../../components/atoms/Typography';
import RIcon from '../../components/icons/rIcon';
import PButton from '../../components/molecules/PButton';
import RdropDown from '../../components/molecules/RdropDown';
import ScreenWrapper from '../../components/molecules/ScreenWrapper';
import TaskCard from '../../components/organism/TaskCard';
import { useTasks } from '../../contex/TaskProvider';
import useAlert from '../../hooks/useAlert';
import { radii, spacing } from '../../constants/color';
import { useTheme } from '../../contex/ThemeContext';
import { filterAndSortTasks } from '../../services/taskService';

const DEFAULT_CATEGORIES = [
  { label: 'All', value: 'all' },
  { label: 'Project', value: 'project' },
  { label: 'Task', value: 'task' },
];

const STATUS_FILTERS = [
  { label: 'All statuses', value: 'all' },
  { label: 'To do', value: 'To do' },
  { label: 'In progress', value: 'In progress' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Cancelled', value: 'Cancelled' },
];
const PRIORITY_FILTERS = [
  { label: 'All priorities', value: 'all' },
  { label: 'Urgent', value: 'Urgent' },
  { label: 'High', value: 'High' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Low', value: 'Low' },
];
const SORT_OPTIONS = [
  { label: 'Default order', value: 'default' },
  { label: 'Due date (soonest)', value: 'dueDate' },
  { label: 'Priority (highest)', value: 'priority' },
  { label: 'Title (A-Z)', value: 'title' },
];
const CategoryTabs = memo(({ filters, selected, counts, onSelect, colors }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={styles.tabScroll}
    contentContainerStyle={[styles.tabs, { backgroundColor: colors.surfaceAlt }]}
    accessibilityRole="tablist"
  >
    {filters.map((filter) => {
      const isSelected = selected === filter.value;
      return (
        <Pressable
          key={filter.value}
          accessibilityRole="tab"
          accessibilityState={{ selected: isSelected }}
          onPress={() => onSelect(filter.value)}
          style={[
            styles.tab,
            { backgroundColor: isSelected ? colors.surface : 'transparent' },
            isSelected && styles.selectedTab,
          ]}
        >
          <Typography
            variant="body2"
            color={isSelected ? 'primary' : 'muted'}
            style={styles.tabLabel}
          >
            {filter.label} ({counts[filter.value] || 0})
          </Typography>
        </Pressable>
      );
    })}
  </ScrollView>
));

const DashboardAction = ({
  label,
  icon,
  color,
  onPress,
  disabled = false,
  loading = false,
  colors,
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    disabled={disabled || loading}
    onPress={onPress}
    style={({ pressed }) => [
      styles.actionButton,
      { borderColor: colors.border, backgroundColor: colors.surface },
      (disabled || loading) && styles.disabledAction,
      pressed && !disabled && styles.pressedAction,
    ]}
  >
    {loading ? (
      <ActivityIndicator size="small" color={color} />
    ) : (
      <RIcon name={icon} size={17} fill={color} />
    )}
    <Typography variant="caption" style={{ color }}>
      {label}
    </Typography>
  </Pressable>
);

const DashBoard = ({ navigation }) => {
  const { tasks, isLoading, deleteTask, updateTask, clearTasks } = useTasks();
  const { showAlert } = useAlert();
  const { theme } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [areFiltersVisible, setAreFiltersVisible] = useState(false);
  const [isClearingTasks, setIsClearingTasks] = useState(false);
  const [completionTaskId, setCompletionTaskId] = useState(null);

  const categoryFilters = useMemo(() => {
    const categories = new Map(
      DEFAULT_CATEGORIES.slice(1).map((filter) => [filter.value, filter])
    );
    tasks.forEach((task) => {
      const label = String(task.category || '').trim();
      const value = label.toLowerCase();
      if (label && !categories.has(value)) categories.set(value, { label, value });
    });
    return [DEFAULT_CATEGORIES[0], ...categories.values()];
  }, [tasks]);

  const counts = useMemo(() => {
    const result = { all: tasks.length };
    tasks.forEach((task) => {
      const category = String(task.category || '').trim().toLowerCase();
      if (category) result[category] = (result[category] || 0) + 1;
    });
    return result;
  }, [tasks]);

  const filterOptions = useMemo(
    () => ({
      category: selectedFilter,
      query: searchQuery,
      status: statusFilter,
      priority: priorityFilter,
      sortBy,
    }),
    [priorityFilter, searchQuery, selectedFilter, sortBy, statusFilter]
  );
  const deferredFilterOptions = useDeferredValue(filterOptions);
  const visibleTasks = useMemo(
    () => filterAndSortTasks(tasks, deferredFilterOptions),
    [deferredFilterOptions, tasks]
  );
  const isUpdatingTaskList =
    tasks.length >= 100 && deferredFilterOptions !== filterOptions;

  const selectedCategory = categoryFilters.find(
    (filter) => filter.value === selectedFilter
  )?.label || '';
  const clearFilters = () => {
    setSelectedFilter('all');
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSortBy('default');
  };
  const hasActiveFilters =
    selectedFilter !== 'all' ||
    searchQuery.trim().length > 0 ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    sortBy !== 'default';
  const activeFilterCount = [
    searchQuery.trim().length > 0,
    selectedFilter !== 'all',
    statusFilter !== 'all',
    priorityFilter !== 'all',
    sortBy !== 'default',
  ].filter(Boolean).length;
  const isBusy = isClearingTasks;

  const confirmClearTasks = () => {
    if (!tasks.length || isBusy) return;

    showAlert({
      title: 'Clear all tasks?',
      message: `This will permanently delete all ${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}. This action cannot be undone.`,
      leftText: 'Cancel',
      rightText: 'Clear tasks',
      rightColor: 'red',
      onRightPress: async () => {
        setIsClearingTasks(true);
        try {
          const cleared = await clearTasks();
          if (!cleared) {
            showAlert({
              title: 'Unable to clear tasks',
              message: 'Your tasks could not be cleared. Please try again.',
              leftText: null,
              rightText: 'OK',
            });
            return;
          }
          clearFilters();
        } catch (error) {
          console.error('Unable to clear tasks:', error);
          showAlert({
            title: 'Unable to clear tasks',
            message: 'Your tasks could not be cleared. Please try again.',
            leftText: null,
            rightText: 'OK',
          });
        } finally {
          setIsClearingTasks(false);
        }
      },
    });
  };

  const openCreateTask = () => navigation.navigate('CreateTask', {
    task: null,
    category: selectedFilter === 'all' ? '' : selectedCategory,
  });

  const confirmDeleteTask = (task) => {
    showAlert({
      title: `Delete ${task.category || 'task'}?`,
      message: `"${task.title || 'Untitled task'}" will be permanently deleted.`,
      leftText: 'Keep',
      rightText: 'Delete',
      rightColor: 'red',
      onRightPress: async () => {
        try {
          const deleted = await deleteTask(task.id);
          if (!deleted) {
            showAlert({
              title: 'Unable to delete',
              message: 'The item could not be deleted. Please try again.',
              leftText: null,
              rightText: 'OK',
            });
          }
        } catch (error) {
          console.error('Unable to delete task:', error);
          showAlert({
            title: 'Unable to delete',
            message: 'The item could not be deleted. Please try again.',
            leftText: null,
            rightText: 'OK',
          });
        }
      },
    });
  };

  const updateTaskCompletion = async (task, status) => {
    setCompletionTaskId(String(task.id));
    try {
      const updatedTask = await updateTask(task.id, { status });
      if (!updatedTask) {
        showAlert({
          title: 'Unable to update task',
          message: 'The task status could not be updated. Please try again.',
          leftText: null,
          rightText: 'OK',
        });
      }
    } catch (error) {
      console.error('Unable to update task completion:', error);
      showAlert({
        title: 'Unable to update task',
        message: 'The task status could not be updated. Please try again.',
        leftText: null,
        rightText: 'OK',
      });
    } finally {
      setCompletionTaskId(null);
    }
  };

  const confirmTaskCompletion = (task) => {
    const isCompleted = ['completed', 'done'].includes(
      String(task.status || '').trim().toLowerCase()
    );
    if (completionTaskId !== null) return;

    if (isCompleted) {
      updateTaskCompletion(task, 'To do');
      return;
    }

    showAlert({
      title: 'Mark task complete?',
      message: `"${task.title || 'Untitled task'}" will be marked as completed.`,
      leftText: 'Cancel',
      rightText: 'Mark complete',
      onRightPress: () => updateTaskCompletion(task, 'Completed'),
    });
  };

  const listHeader = (
    <>
      <View style={styles.heading}>
        <View style={styles.headingCopy}>
          <Typography variant="h5" color="secondary">Tasks</Typography>
          <Typography variant="body2" color="muted">
            {isLoading
              ? 'Loading your tasks...'
              : `${visibleTasks.length} of ${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`}
          </Typography>
        </View>
        <PButton
          title="Create"
          color="primary"
          startIcon={<RIcon name="ION_ADD" size={18} fill={theme.colors.white} />}
          onPress={openCreateTask}
        />
      </View>

      <CategoryTabs
        filters={categoryFilters}
        selected={selectedFilter}
        counts={counts}
        onSelect={setSelectedFilter}
        colors={theme.colors}
      />

      <View
        style={[
          styles.searchBox,
          { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
        ]}
      >
        <RIcon name="ION_SEARCH" size={19} fill={theme.colors.textMuted} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search tasks"
          placeholderTextColor={theme.colors.inputPlaceholder}
          accessibilityLabel="Search tasks"
          returnKeyType="search"
          style={[styles.searchInput, { color: theme.colors.text }]}
        />
      </View>

      <View style={styles.utilityRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: areFiltersVisible }}
          onPress={() => setAreFiltersVisible((isVisible) => !isVisible)}
          style={[
            styles.filterToggle,
            {
              backgroundColor: areFiltersVisible ? theme.colors.primarySoft : theme.colors.surface,
              borderColor: areFiltersVisible ? theme.colors.primary : theme.colors.border,
            },
          ]}
        >
          <RIcon name="ION_FILTER" size={16} fill={theme.colors.primary} />
          <Typography variant="body2" color="primary" style={styles.filterToggleLabel}>
            Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
          </Typography>
          <RIcon
            name="ION_ARROW_DOWN"
            size={16}
            fill={theme.colors.primary}
            rotate={areFiltersVisible ? '180deg' : 0}
          />
        </Pressable>
        {hasActiveFilters && !areFiltersVisible && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear filters"
            onPress={clearFilters}
            style={styles.clearFiltersButton}
          >
            <Typography variant="body2" color="muted">Clear</Typography>
          </Pressable>
        )}
      </View>

      {areFiltersVisible && (
        <View
          style={[
            styles.filterPanel,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <View style={styles.filtersRow}>
            <RdropDown
              label="Status"
              value={statusFilter}
              options={STATUS_FILTERS}
              onChange={setStatusFilter}
              containerStyle={styles.filterDropdown}
            />
            <RdropDown
              label="Priority"
              value={priorityFilter}
              options={PRIORITY_FILTERS}
              onChange={setPriorityFilter}
              containerStyle={styles.filterDropdown}
            />
          </View>
          <RdropDown
            label="Sort by"
            value={sortBy}
            options={SORT_OPTIONS}
            onChange={setSortBy}
            containerStyle={styles.sortDropdown}
          />
          {hasActiveFilters && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear filters"
              onPress={clearFilters}
              style={styles.panelClearButton}
            >
              <RIcon name="ION_FILTER_CLEAR" size={16} fill={theme.colors.primary} />
              <Typography variant="body2" color="primary">Clear all filters</Typography>
            </Pressable>
          )}
        </View>
      )}

      <View style={styles.managementActions}>
        <DashboardAction
          label="Import CSV"
          icon="OCT_UPLOAD"
          color={theme.colors.primary}
          onPress={() => navigation.navigate('BulkUpload')}
          disabled={isBusy}
          colors={theme.colors}
        />
        {tasks.length > 0 && (
          <>
            <DashboardAction
              label="Export CSV"
              icon="OCT_DOWNLOAD"
              color={theme.colors.primary}
              onPress={() => navigation.navigate('Export')}
              disabled={isBusy}
              colors={theme.colors}
            />
            <DashboardAction
              label="Clear tasks"
              icon="FA_TRASH"
              color={theme.colors.error}
              onPress={confirmClearTasks}
              disabled={isBusy}
              loading={isClearingTasks}
              colors={theme.colors}
            />
          </>
        )}
      </View>

      {isUpdatingTaskList && (
        <View
          accessibilityRole="progressbar"
          style={[
            styles.filterLoading,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Typography variant="body2" color="muted">
            Updating task list...
          </Typography>
        </View>
      )}
    </>
  );

  const listEmptyComponent = isLoading ? (
    <View style={styles.state}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Typography variant="body2" color="muted" style={styles.stateText}>
        Loading tasks...
      </Typography>
    </View>
  ) : tasks.length === 0 ? (
    <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.colors.primarySoft }]}>
        <RIcon name="ION_CHECK" size={26} fill={theme.colors.primary} />
      </View>
      <Typography variant="subtitle" color="secondary" align="center">
        Nothing on your list yet
      </Typography>
      <Typography variant="body2" color="muted" align="center">
        Create a project or task and it will show up here.
      </Typography>
      <PButton
        title="Create your first task"
        color="primary"
        onPress={openCreateTask}
        style={styles.emptyButton}
      />
    </View>
  ) : visibleTasks.length === 0 ? (
    <View
      style={[
        styles.filteredEmptyState,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
    >
      <Typography variant="subtitle" color="secondary" align="center">
        {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
          ? 'No tasks match these filters'
          : `No ${selectedCategory.toLowerCase()} items yet`}
      </Typography>
      <Typography variant="body2" color="muted" align="center">
        {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
          ? 'Try changing your search or filters.'
          : 'Create one to see it in this list.'}
      </Typography>
      {hasActiveFilters ? (
        <DashboardAction
          label="Clear filters"
          icon="ION_FILTER_CLEAR"
          color={theme.colors.primary}
          onPress={clearFilters}
          colors={theme.colors}
        />
      ) : (
        <PButton
          title={`Create ${selectedCategory}`}
          color="primary"
          onPress={openCreateTask}
          style={styles.emptyButton}
        />
      )}
    </View>
  ) : null;

  return (
    <ScreenWrapper
      scrollable={false}
      contentContainerStyle={styles.screen}
    >
      <FlatList
        style={styles.taskList}
        contentContainerStyle={styles.taskListContent}
        data={isLoading ? [] : visibleTasks}
        keyExtractor={(task) => String(task.id)}
        renderItem={({ item: task }) => (
          <TaskCard
            task={task}
            onPress={() => navigation.navigate('CreateTask', { task, category: '' })}
            onDelete={() => confirmDeleteTask(task)}
            onToggleComplete={confirmTaskCompletion}
            isCompletionUpdating={completionTaskId === String(task.id)}
            isCompletionDisabled={completionTaskId !== null}
          />
        )}
        ItemSeparatorComponent={TaskSeparator}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmptyComponent}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={50}
        windowSize={7}
        extraData={completionTaskId}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </ScreenWrapper>
  );
};

const TaskSeparator = () => <View style={styles.taskSeparator} />;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: spacing.lg,
  },
  taskList: {
    flex: 1,
    width: '100%',
  },
  taskListContent: {
    flexGrow: 1,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  taskSeparator: {
    height: spacing.md,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  headingCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  tabScroll: {
    flexGrow: 0,
    marginBottom: spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    padding: spacing.xs,
    borderRadius: radii.md,
    gap: spacing.xs,
  },
  tab: {
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
  },
  selectedTab: {
    elevation: 1,
  },
  searchBox: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    minHeight: 46,
    paddingVertical: 0,
    fontSize: 15,
  },
  utilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  filterToggle: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: radii.md,
  },
  filterToggleLabel: {
    fontWeight: '600',
  },
  clearFiltersButton: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  filterPanel: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  filterDropdown: {
    flex: 1,
    marginBottom: spacing.sm,
  },
  sortDropdown: {
    marginBottom: spacing.md,
  },
  managementActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  panelClearButton: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  filterLoading: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
    minHeight: 40,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderWidth: 1,
    borderRadius: radii.md,
  },
  disabledAction: {
    opacity: 0.45,
  },
  pressedAction: {
    opacity: 0.7,
  },
  tabLabel: {
    fontWeight: '600',
  },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  stateText: {
    marginTop: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    borderRadius: 20,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    marginBottom: spacing.xs,
  },
  emptyButton: {
    marginTop: spacing.sm,
  },
  filteredEmptyState: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
});

export default DashBoard;
