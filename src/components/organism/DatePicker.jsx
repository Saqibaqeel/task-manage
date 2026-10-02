import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import Typography from '../atoms/Typography';
import RIcon from '../icons/rIcon';
import { formatDate, parseDateValue } from '../../constants/dateHelper';
import { radii, spacing } from '../../constants/color';
import { useTheme } from '../../contex/ThemeContext';

const toDateValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DatePicker = ({
  label,
  value = '',
  onChange,
  placeholder = 'Select date',
  minimumDate,
  maximumDate,
  disabled = false,
  containerStyle,
  error,
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(null);
  const currentDate = parseDateValue(value) || new Date();

  const openPicker = () => {
    if (!disabled) {
      setDraftDate(currentDate);
      setIsOpen(true);
    }
  };

  const handleNativeChange = (event, selectedDate) => {
    if (selectedDate) {
      if (Platform.OS === 'ios') {
        setDraftDate(selectedDate);
      } else {
        onChange?.(toDateValue(selectedDate));
      }
    }
    if (Platform.OS === 'android' || event?.type === 'dismissed') {
      setIsOpen(false);
    }
  };

  const picker = (
    <DateTimePicker
      value={Platform.OS === 'ios' && draftDate ? draftDate : currentDate}
      mode="date"
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      minimumDate={minimumDate}
      maximumDate={maximumDate}
      onValueChange={handleNativeChange}
      onDismiss={() => setIsOpen(false)}
      accentColor={theme.colors.primary}
      textColor={theme.colors.text}
    />
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {!!label && (
        <Typography variant="body2" color="textSecondary" style={styles.label}>
          {label}
        </Typography>
      )}

      {Platform.OS === 'web' ? (
        <View
          style={[
            styles.webInput,
            { borderBottomColor: error ? theme.colors.error : theme.colors.inputBorder },
            disabled && styles.disabled,
          ]}
        >
          <RIcon name="ION_CALENDAR" size={18} fill={theme.colors.muted} />
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            accessibilityLabel={label || placeholder}
            editable={!disabled}
            type="date"
            min={minimumDate ? toDateValue(minimumDate) : undefined}
            max={maximumDate ? toDateValue(maximumDate) : undefined}
            style={[styles.webTextInput, { color: theme.colors.text }]}
          />
        </View>
      ) : (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${label || placeholder}${value ? `, ${formatDate(value)}` : ''}`}
            disabled={disabled}
            onPress={openPicker}
            style={({ pressed }) => [
              styles.trigger,
              { borderBottomColor: error ? theme.colors.error : theme.colors.inputBorder },
              disabled && styles.disabled,
              pressed && !disabled && styles.pressed,
            ]}
          >
            <RIcon name="ION_CALENDAR" size={18} fill={theme.colors.muted} />
            <Typography
              variant="body1"
              color={value ? 'text' : 'inputPlaceholder'}
              style={styles.triggerText}
              numberOfLines={1}
            >
              {value ? formatDate(value) : placeholder}
            </Typography>
            <RIcon name="ION_ARROW_DOWN" size={17} fill={theme.colors.textSecondary} />
          </Pressable>

          {Platform.OS === 'android' && isOpen && picker}

          {Platform.OS === 'ios' && (
            <Modal
              transparent
              animationType="slide"
              visible={isOpen}
              onRequestClose={() => setIsOpen(false)}
            >
              <Pressable
                style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]}
                onPress={() => setIsOpen(false)}
              >
                <Pressable
                  style={[styles.sheet, { backgroundColor: theme.colors.surface }]}
                  onPress={() => {}}
                >
                  <View style={styles.sheetHeader}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setIsOpen(false)}
                      hitSlop={8}
                    >
                      <Typography variant="body1" color="muted">Cancel</Typography>
                    </Pressable>
                    <Typography variant="subtitle" color="secondary">
                      {label || 'Select date'}
                    </Typography>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        if (draftDate) onChange?.(toDateValue(draftDate));
                        setIsOpen(false);
                      }}
                      hitSlop={8}
                    >
                      <Typography variant="body1" color="primary">Done</Typography>
                    </Pressable>
                  </View>
                  {picker}
                </Pressable>
              </Pressable>
            </Modal>
          )}
        </>
      )}
      {!!error && (
        <Typography
          variant="caption"
          color="error"
          accessibilityRole="alert"
          style={styles.error}
        >
          {error}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 0,
    marginBottom: spacing.lg,
  },
  label: {
    marginBottom: spacing.xs,
  },
  error: {
    marginTop: spacing.xs,
  },
  trigger: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  triggerText: {
    flex: 1,
  },
  webInput: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  webTextInput: {
    flex: 1,
    minHeight: 48,
    padding: 0,
    fontSize: 15,
    outlineStyle: 'none',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.7,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
});

export default DatePicker;