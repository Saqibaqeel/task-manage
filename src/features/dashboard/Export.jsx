import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import Typography from '../../components/atoms/Typography';
import RIcon from '../../components/icons/rIcon';
import PButton from '../../components/molecules/PButton';
import ScreenWrapper from '../../components/molecules/ScreenWrapper';
import { useTasks } from '../../contex/TaskProvider';
import useAlert from '../../hooks/useAlert';
import { useTheme } from '../../contex/ThemeContext';
import { radii, spacing } from '../../constants/color';
import { exportTasksToCsv } from '../../services/taskService';

const COLUMNS = [
  { key: 'id', label: 'ID', width: 76 },
  { key: 'title', label: 'Title', width: 190 },
  { key: 'description', label: 'Description', width: 240 },
  { key: 'category', label: 'Category', width: 130 },
  { key: 'priority', label: 'Priority', width: 100 },
  { key: 'start_date', label: 'Start date', width: 116 },
  { key: 'due_date', label: 'Due date', width: 116 },
  { key: 'status', label: 'Status', width: 130 },
];

const Export = () => {
  const { tasks, isLoading } = useTasks();
  const { theme } = useTheme();
  const { showAlert } = useAlert();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!tasks.length || isExporting) return;

    setIsExporting(true);
    try {
      await exportTasksToCsv(tasks);
      showAlert({
        title: 'CSV exported',
        message: `${tasks.length} ${tasks.length === 1 ? 'task is' : 'tasks are'} ready to save or share.`,
        leftText: null,
        rightText: 'OK',
      });
    } catch (error) {
      console.error('Unable to export tasks to CSV:', error);
      showAlert({
        title: 'Export failed',
        message: error.message || 'The tasks could not be exported. Please try again.',
        leftText: null,
        rightText: 'OK',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ScreenWrapper contentContainerStyle={styles.screen}>
      <Typography variant="body2" color="muted" style={styles.intro}>
        Review your tasks below, then export the full list as a CSV file.
      </Typography>

      <View style={styles.summary}>
        <View>
          <Typography variant="subtitle" color="secondary">All tasks</Typography>
          <Typography variant="caption" color="muted">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </Typography>
        </View>
        <PButton
          title="Export CSV"
          color="primary"
          startIcon={<RIcon name="OCT_DOWNLOAD" size={16} fill={theme.colors.white} />}
          loading={isExporting}
          disabled={isLoading || !tasks.length}
          onPress={handleExport}
          style={styles.exportButton}
        />
      </View>

      {isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Typography variant="body2" color="muted" style={styles.stateText}>
            Loading tasks...
          </Typography>
        </View>
      ) : tasks.length === 0 ? (
        <View
          style={[
            styles.emptyState,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Typography variant="subtitle" color="secondary" align="center">
            No tasks to export
          </Typography>
          <Typography variant="body2" color="muted" align="center">
            Create a task first and it will appear here.
          </Typography>
        </View>
      ) : (
        <View
          style={[
            styles.tableContainer,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View>
              <View
                style={[
                  styles.row,
                  styles.headerRow,
                  { backgroundColor: theme.colors.surfaceAlt },
                ]}
              >
                {COLUMNS.map((column) => (
                  <TableCell
                    key={column.key}
                    label={column.label}
                    width={column.width}
                    header
                    colors={theme.colors}
                  />
                ))}
              </View>
              {tasks.map((task, index) => (
                <View
                  key={String(task.id)}
                  style={[
                    styles.row,
                    index < tasks.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: theme.colors.border,
                    },
                  ]}
                >
                  {COLUMNS.map((column) => (
                    <TableCell
                      key={column.key}
                      label={
                        column.key === 'status'
                          ? task[column.key] || 'To do'
                          : task[column.key] || '—'
                      }
                      width={column.width}
                      colors={theme.colors}
                    />
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </ScreenWrapper>
  );
};

const TableCell = ({ label, width, header = false, colors }) => (
  <View style={[styles.cell, { width }]}>
    <Typography
      variant={header ? 'caption' : 'body2'}
      style={[
        header ? styles.headerText : styles.cellText,
        { color: header ? colors.textSecondary : colors.text },
      ]}
      numberOfLines={header ? 1 : 3}
    >
      {String(label)}
    </Typography>
  </View>
);

const styles = StyleSheet.create({
  screen: {
    paddingTop: spacing.md,
  },
  intro: {
    marginBottom: spacing.lg,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  exportButton: {
    minWidth: 140,
  },
  tableContainer: {
    borderWidth: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  headerRow: {
    minHeight: 42,
  },
  cell: {
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  cellText: {
    lineHeight: 18,
  },
  headerText: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
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
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
});

export default Export;
