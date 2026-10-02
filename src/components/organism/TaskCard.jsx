import React, { memo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import Typography from '../atoms/Typography';
import RIcon from '../icons/rIcon';
import Card from '../molecules/Card';
import { COLORS, palette, radii, spacing } from '../../constants/color';
import { formatDate } from '../../constants/dateHelper';
import { useTheme } from '../../contex/ThemeContext';

const PRIORITY_STYLES = {
  low: {
    backgroundColor: palette.success[50],
    color: palette.success[600],
  },
  medium: {
    backgroundColor: palette.warning[50],
    color: palette.warning[600],
  },
  high: {
    backgroundColor: palette.error[50],
    color: palette.error[600],
  },
  urgent: {
    backgroundColor: palette.error[50],
    color: palette.error[600],
  },
};

const STATUS_STYLES = {
  todo: {
    backgroundColor: palette.neutral[100],
    color: palette.neutral[600],
    icon: 'ION_TODO',
  },
  pending: {
    backgroundColor: palette.neutral[100],
    color: palette.neutral[600],
    icon: 'ION_TODO',
  },
  'in progress': {
    backgroundColor: palette.info[50],
    color: palette.info[600],
    icon: 'ION_IN_PROGRESS',
  },
  completed: {
    backgroundColor: palette.success[50],
    color: palette.success[600],
    icon: 'ION_COMPLETED',
  },
  done: {
    backgroundColor: palette.success[50],
    color: palette.success[600],
    icon: 'ION_COMPLETED',
  },
  cancelled: {
    backgroundColor: palette.error[50],
    color: palette.error[600],
    icon: 'ION_CANCELLED',
  },
};



const TaskCard = ({
  task,
  onPress,
  onDelete,
  onToggleComplete,
  isCompletionUpdating = false,
  isCompletionDisabled = false,
  style,
}) => {
  const { theme, isDark } = useTheme();

  const statusKey = String(task.status || 'todo')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ');
  const priorityKey = String(task.priority || '').trim().toLowerCase();
  const baseStatusStyle = STATUS_STYLES[statusKey] || STATUS_STYLES.todo;
  const statusColor =
    statusKey === 'completed' || statusKey === 'done'
      ? theme.colors.success
      : statusKey === 'cancelled'
        ? theme.colors.error
        : statusKey === 'in progress'
          ? theme.colors.info
          : theme.colors.textSecondary;
  const statusStyle = isDark
    ? { ...baseStatusStyle, backgroundColor: theme.colors.surfaceAlt, color: statusColor }
    : baseStatusStyle;
  const priorityStyle = isDark
    ? {
        backgroundColor: theme.colors.surfaceAlt,
        color: priorityKey === 'low'
          ? theme.colors.success
          : priorityKey === 'medium'
            ? theme.colors.warning
            : theme.colors.error,
      }
    : PRIORITY_STYLES[priorityKey] || {
        backgroundColor: theme.colors.surfaceAlt,
        color: theme.colors.textSecondary,
      };
  const startDate = formatDate(task.start_date);
  const dueDate = formatDate(task.due_date);
  const isCompleted = statusKey === 'completed' || statusKey === 'done';

  return (
    <Card
      variant="elevated"
      style={[styles.card, { borderColor: theme.colors.border }, style]}
      contentStyle={[styles.content, onDelete && styles.contentWithAction]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Edit ${task.title || 'task'}`}
        onPress={onPress}
        style={({ pressed }) => [styles.details, pressed && styles.pressed]}
      >
        <View style={styles.header}>
          <Typography variant="caption" color="muted" style={styles.taskId}>
            {task.id !== undefined && task.id !== null ? `TASK #${task.id}` : 'TASK'}
          </Typography>
          <View style={styles.headerActions}>
            {!!onToggleComplete && (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityLabel={
                  isCompleted
                    ? `Mark ${task.title || 'task'} incomplete`
                    : `Mark ${task.title || 'task'} complete`
                }
                accessibilityState={{ checked: isCompleted }}
                disabled={isCompletionUpdating || isCompletionDisabled}
                onPress={(event) => {
                  event.stopPropagation();
                  onToggleComplete(task);
                }}
                hitSlop={8}
                style={[styles.completionAction, isCompletionUpdating && styles.pressed]}
              >
                {isCompletionUpdating ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <RIcon
                    name={isCompleted ? 'ION_CHECKBOX' : 'ION_CHECKBOX_OUTLINE'}
                    size={21}
                    fill={isCompleted ? theme.colors.success : theme.colors.textMuted}
                  />
                )}
                <Typography variant="caption" color="muted">
                  {isCompleted ? 'Completed' : 'Mark complete'}
                </Typography>
              </Pressable>
            )}
            <View style={[styles.badge, { backgroundColor: statusStyle.backgroundColor }]}>
              <RIcon name={statusStyle.icon} size={14} fill={statusStyle.color} />
              <Typography
                variant="caption"
                style={[styles.badgeText, { color: statusStyle.color }]}
              >
                {task.status || 'To do'}
              </Typography>
            </View>
          </View>
        </View>

        <Typography variant="h6" color="secondary" style={styles.title} numberOfLines={2}>
          {task.title || 'Untitled task'}
        </Typography>

        {!!task.description && (
          <Typography
            variant="body2"
            color="muted"
            style={styles.description}
            numberOfLines={2}
          >
            {task.description}
          </Typography>
        )}

        {(task.category || task.priority) && (
          <View style={styles.tags}>
            {!!task.category && (
              <View
                style={[
                  styles.badge,
                  styles.categoryBadge,
                  { backgroundColor: theme.colors.surfaceAlt },
                ]}
              >
                <RIcon name="ION_CATEGORY" size={14} fill={theme.colors.textSecondary} />
                <Typography variant="caption" color="textSecondary" style={styles.badgeText}>
                  {task.category}
                </Typography>
              </View>
            )}
            {!!task.priority && (
              <View style={[styles.badge, { backgroundColor: priorityStyle.backgroundColor }]}>
                <RIcon name="ION_PRIORITY" size={14} fill={priorityStyle.color} />
                <Typography
                  variant="caption"
                  style={[styles.badgeText, { color: priorityStyle.color }]}
                >
                  {task.priority}
                </Typography>
              </View>
            )}
          </View>
        )}

        {(startDate || dueDate) && (
          <View style={styles.dates}>
            {startDate && (
              <View style={styles.dateItem}>
                <RIcon name="ION_CALENDAR" size={16} fill={theme.colors.textMuted} />
                <View>
                  <Typography variant="caption" color="muted">Starts</Typography>
                  <Typography variant="body2" color="textSecondary" style={styles.dateValue}>
                    {startDate}
                  </Typography>
                </View>
              </View>
            )}
            {dueDate && (
              <View style={styles.dateItem}>
                <RIcon name="ION_DUE_DATE" size={16} fill={theme.colors.textMuted} />
                <View>
                  <Typography variant="caption" color="muted">Due date</Typography>
                  <Typography variant="body2" color="textSecondary" style={styles.dateValue}>
                    {dueDate}
                  </Typography>
                </View>
              </View>
            )}
          </View>
        )}
      </Pressable>

      {!!onDelete && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Delete ${task.title || 'task'}`}
          onPress={onDelete}
          style={({ pressed }) => [
            styles.deleteAction,
            { borderTopColor: theme.colors.divider },
            pressed && styles.pressed,
          ]}
        >
          <RIcon name="FA_TRASH" size={16} fill={theme.colors.error} />
          <Typography variant="body2" color="error" style={styles.deleteLabel}>
            Delete
          </Typography>
        </Pressable>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: radii.lg,
  },
  content: {
    gap: spacing.md,
  },
  contentWithAction: {
    gap: 0,
  },
  details: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  pressed: {
    opacity: 0.75,
  },
  deleteAction: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: spacing.sm,
  },
  deleteLabel: {
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  completionAction: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  taskId: {
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  title: {
    lineHeight: 26,
  },
  description: {
    lineHeight: 18,
    marginTop: -spacing.xs,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  badgeText: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  categoryBadge: {
    backgroundColor: COLORS.surfaceAlt,
  },
  dates: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.xl,
    rowGap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: spacing.md,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateValue: {
    fontWeight: '600',
  },
});

export default memo(TaskCard);