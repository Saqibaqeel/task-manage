import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

import Typography from '../../components/atoms/Typography';
import Card from '../../components/molecules/Card';
import PButton from '../../components/molecules/PButton';
import RIcon from '../../components/icons/rIcon';
import ScreenWrapper from '../../components/molecules/ScreenWrapper';
import { useTasks } from '../../contex/TaskProvider';
import useAlert from '../../hooks/useAlert';
import { validateTaskCsv } from '../../services/storage';
import { COLORS, radii, spacing } from '../../constants/color';
import { useTheme } from '../../contex/ThemeContext';

const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes)) return 'Size unavailable';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const BulkUpload = () => {
  const { importTasksFromCsv } = useTasks();
  const { showAlert } = useAlert();
  const { theme } = useTheme();
  const [selectedFile, setSelectedFile] = useState(null);
  const [csvText, setCsvText] = useState('');
  const [validation, setValidation] = useState(null);
  const [fileError, setFileError] = useState('');
  const [summary, setSummary] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const readFileText = async (asset) => {
    if (Platform.OS === 'web') {
      if (asset.file?.text) return asset.file.text();
      const response = await fetch(asset.uri);
      if (!response.ok) throw new Error('The selected CSV could not be read.');
      return response.text();
    }

    const { File } = await import('expo-file-system');
    return new File(asset.uri).text();
  };

  const chooseFile = async () => {
    setFileError('');
    setSummary(null);
    setIsReading(true);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      setSelectedFile({
        name: asset.name,
        size: asset.size,
      });

      if (!asset.name.toLowerCase().endsWith('.csv')) {
        setCsvText('');
        setValidation(null);
        setFileError('Choose a file with the .csv extension.');
        return;
      }

      const text = await readFileText(asset);
      const report = validateTaskCsv(text);
      setCsvText(text);
      setValidation(report);
    } catch (error) {
      console.error('Unable to read or validate the selected CSV:', error);
      setCsvText('');
      setValidation(null);
      setFileError(error.message || 'The selected CSV could not be read.');
    } finally {
      setIsReading(false);
    }
  };

  const handleImport = async () => {
    if (!csvText || !validation?.tasks.length || isImporting) return;

    setIsImporting(true);
    setFileError('');
    try {
      const result = await importTasksFromCsv(csvText);
      setSummary(result.summary);
      setValidation({
        tasks: validation.tasks,
        errors: result.errors,
        totalRows: result.summary.totalRows,
      });

      const { importedCount, duplicateCount, invalidRows } = result.summary;
      showAlert({
        title: 'Import finished',
        message: `${importedCount} imported, ${duplicateCount} duplicate${duplicateCount === 1 ? '' : 's'} skipped, ${invalidRows} invalid row${invalidRows === 1 ? '' : 's'}.`,
        leftText: null,
        rightText: 'Done',
      });
    } catch (error) {
      console.error('Unable to import CSV tasks:', error);
      setFileError(error.message || 'The tasks could not be imported. Please try again.');
      showAlert({
        title: 'Import failed',
        message: error.message || 'The tasks could not be imported. Please try again.',
        leftText: null,
        rightText: 'OK',
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <ScreenWrapper contentContainerStyle={styles.screen}>
      <Typography variant="body2" color="muted" style={styles.intro}>
        Select a CSV file to review its records, then import every valid task. Invalid records are skipped.
      </Typography>

      <Card
        variant="elevated"
        style={[styles.card, { borderColor: theme.colors.border }]}
      >
        <Typography variant="subtitle" color="secondary" style={styles.sectionTitle}>
          CSV file
        </Typography>
        <Typography variant="body2" color="muted" style={styles.helpText}>
          Upload a headered CSV with title and category columns, or the supplied eight-column format.
        </Typography>
        <Typography variant="caption" color="muted" style={styles.rulesText}>
          Eight-column order: id, title, description, category, priority, start_date, due_date, status.
        </Typography>
        <Typography variant="caption" color="muted" style={styles.rulesText}>
          IDs are generated by the app. Categories can be any label. Both dates are required and must use YYYY-MM-DD.
        </Typography>
        <Typography variant="caption" color="muted" style={styles.rulesText}>
          Duplicate title, category, start date, and due date combinations are skipped.
        </Typography>
        <View style={[styles.sample, { backgroundColor: theme.colors.surfaceAlt }]}>
          <Typography variant="caption" color="textSecondary">
            title,category,description,priority,start_date,due_date,status
          </Typography>
        </View>

        <PButton
          title={selectedFile ? 'Choose another CSV' : 'Select CSV file'}
          color="primary"
          fullWidth
          loading={isReading}
          disabled={isReading || isImporting}
          startIcon={<RIcon name="OCT_UPLOAD" size={17} fill={theme.colors.white} />}
          onPress={chooseFile}
          style={styles.pickButton}
        />

        {!!selectedFile && (
          <View style={[styles.fileInfo, { backgroundColor: theme.colors.primarySoft }]}>
            <RIcon name="OCT_UPLOAD" size={18} fill={theme.colors.primary} />
            <View style={styles.fileCopy}>
              <Typography variant="body1" color="secondary" numberOfLines={1}>
                {selectedFile.name}
              </Typography>
              <Typography variant="caption" color="muted">
                {formatFileSize(selectedFile.size)}
              </Typography>
            </View>
          </View>
        )}

        {!!fileError && (
          <Typography variant="body2" color="error" style={styles.fileError}>
            {fileError}
          </Typography>
        )}
      </Card>

      {!!validation && (
        <Card
          variant="elevated"
          style={[styles.card, { borderColor: theme.colors.border }]}
        >
          <Typography variant="subtitle" color="secondary" style={styles.sectionTitle}>
            Validation results
          </Typography>
          <View style={styles.counts}>
            <Typography variant="body2" color="success">
              {validation.tasks.length} valid
            </Typography>
            <Typography variant="body2" color={validation.errors.length ? 'error' : 'muted'}>
              {new Set(validation.errors.map((item) => item.row)).size} invalid
            </Typography>
            <Typography variant="body2" color="muted">
              {validation.totalRows} total
            </Typography>
          </View>

          {validation.errors.length > 0 ? (
            <View style={[styles.errorList, { backgroundColor: theme.colors.surfaceAlt }]}>
              {validation.errors.map((error, index) => (
                <Typography
                  key={`${error.row}-${error.field}-${index}`}
                  variant="body2"
                  color="error"
                  style={styles.validationError}
                >
                  Row {error.row} · {error.field}: {error.message}
                </Typography>
              ))}
            </View>
          ) : (
            <Typography variant="body2" color="success">
              All records passed validation.
            </Typography>
          )}

          <PButton
            title={`Import ${validation.tasks.length} valid ${validation.tasks.length === 1 ? 'record' : 'records'}`}
            color="primary"
            fullWidth
            loading={isImporting}
            disabled={!validation.tasks.length || isImporting || isReading}
            onPress={handleImport}
            style={styles.importButton}
          />
        </Card>
      )}

      {!!summary && (
        <Card
          variant="outlined"
          style={[styles.summaryCard, { borderColor: theme.colors.border }]}
        >
          <Typography variant="subtitle" color="secondary" style={styles.sectionTitle}>
            Import summary
          </Typography>
          <Typography variant="body2" color="success">
            Imported: {summary.importedCount}
          </Typography>
          <Typography variant="body2" color="muted">
            Duplicates skipped: {summary.duplicateCount}
          </Typography>
          <Typography variant="body2" color={summary.invalidRows ? 'error' : 'muted'}>
            Invalid rows skipped: {summary.invalidRows}
          </Typography>
        </Card>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  screen: {
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  intro: {
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  card: {
    borderWidth: 1,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  helpText: {
    lineHeight: 18,
  },
  rulesText: {
    marginTop: spacing.xs,
    lineHeight: 16,
  },
  sample: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderRadius: radii.sm,
  },
  pickButton: {
    marginTop: spacing.xs,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
  },
  fileCopy: {
    flex: 1,
    gap: 2,
  },
  fileError: {
    marginTop: spacing.md,
  },
  counts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.sm,
  },
  errorList: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.sm,
  },
  validationError: {
    lineHeight: 18,
  },
  importButton: {
    marginTop: spacing.lg,
  },
  summaryCard: {
    gap: spacing.sm,
    borderWidth: 1,
  },
});

export default BulkUpload;