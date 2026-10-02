import React, { useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contex/ThemeContext';

const Dropdown = ({
  label,
  placeholder = 'Select',
  value,
  options = [],
  onChange,
  disabled = false,
  error,
  containerStyle,
  dropdownStyle,
  optionStyle,
  textStyle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuLayout, setMenuLayout] = useState(null);
  const selectorRef = useRef(null);
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const { theme } = useTheme();

  const selectedOption = options.find(
    (option) => String(option.value) === String(value)
  );

  const displayValue = selectedOption?.label || '';

  const handleSelect = (option) => {
    onChange?.(option.value, option);
    setIsOpen(false);
  };

  const openDropdown = () => {
    if (disabled) return;

    selectorRef.current?.measureInWindow((x, y, width, height) => {
      const desiredHeight = Math.min(Math.max(options.length * 46, 60), 220);
      const availableBelow = Math.max(
        0,
        windowHeight - insets.bottom - y - height - 8
      );
      const availableAbove = Math.max(0, y - insets.top - 8);
      const opensAbove =
        availableBelow < Math.min(desiredHeight, 120) &&
        availableAbove > availableBelow;
      const availableHeight = opensAbove ? availableAbove : availableBelow;
      const menuHeight = Math.min(desiredHeight, availableHeight);

      setMenuLayout({
        left: Math.max(8, Math.min(x, windowWidth - width - 8)),
        top: opensAbove ? y - menuHeight - 4 : y + height + 4,
        width: Math.min(width, windowWidth - 16),
        height: menuHeight,
      });
      setIsOpen(true);
    });
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && (
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          {label}
        </Text>
      )}

      {/* Selector */}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={label || placeholder}
        accessibilityState={{ expanded: isOpen }}
        activeOpacity={0.7}
        disabled={disabled}
        ref={selectorRef}
        onPress={() => (isOpen ? setIsOpen(false) : openDropdown())}
        style={[
          styles.selector,
          { borderBottomColor: theme.colors.inputBorder },
          isOpen && { borderBottomColor: theme.colors.primary },
          error && { borderBottomColor: theme.colors.error },
          disabled && styles.disabled,
        ]}
      >
        <Text
          style={[
            styles.valueText,
            { color: displayValue ? theme.colors.text : theme.colors.inputPlaceholder },
            textStyle,
          ]}
          numberOfLines={1}
        >
          {displayValue || placeholder}
        </Text>

        {/* Arrow */}
        <Text style={[styles.arrow, { color: theme.colors.textSecondary }]}>
          ▼
        </Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={isOpen && !!menuLayout}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setIsOpen(false)}
        >
          {menuLayout && (
            <View
              style={[
                styles.dropdown,
                {
                  left: menuLayout.left,
                  top: menuLayout.top,
                  width: menuLayout.width,
                  height: menuLayout.height,
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
                dropdownStyle,
              ]}
            >
              <FlatList
                data={options}
                keyExtractor={(item, index) => String(item.value ?? index)}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const isSelected = String(item.value) === String(value);

                  return (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleSelect(item)}
                      style={[
                        styles.option,
                        isSelected && { backgroundColor: theme.colors.primarySoft },
                        optionStyle,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          { color: theme.colors.text },
                          isSelected && { color: theme.colors.primary, fontWeight: '600' },
                          textStyle,
                        ]}
                      >
                        {item.label}
                      </Text>

                      {isSelected && (
                        <Text style={[styles.check, { color: theme.colors.primary }]}>
                          ✓
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <Text style={[styles.emptyText, { color: theme.colors.inputPlaceholder }]}>
                    No options available
                  </Text>
                }
              />
            </View>
          )}
        </Pressable>
      </Modal>

      {/* Error */}
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    marginBottom: 16,
  },

  label: {
    fontSize: 13,
    marginBottom: 6,
  },

  selector: {
    width: '100%',
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderBottomWidth: 1,
    borderBottomColor: 'transparent',

    backgroundColor: 'transparent',
  },

  disabled: {
    opacity: 0.5,
  },

  valueText: {
    flex: 1,
    fontSize: 15,
  },

  arrow: {
    marginLeft: 10,
    fontSize: 12,
  },

  modalBackdrop: {
    flex: 1,
  },

  dropdown: {
    position: 'absolute',
    zIndex: 1000,
    borderWidth: 1,
    borderRadius: 6,
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  option: {
    minHeight: 46,
    paddingHorizontal: 14,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  optionText: {
    flex: 1,
    fontSize: 15,
  },

  check: {
    marginLeft: 10,
    fontSize: 17,
    fontWeight: '600',
  },

  emptyText: {
    padding: 15,
    textAlign: 'center',
    fontSize: 14,
  },

  errorText: {
    marginTop: 5,
    fontSize: 12,
  },
});

export default Dropdown;