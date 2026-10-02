
import React from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { COLORS } from '../../constants/color';
import { useTheme } from '../../contex/ThemeContext';

const BUTTON_COLORS = {
  primary: COLORS.primary,
  secondary: COLORS.secondary,
  success: COLORS.success,
  error: COLORS.error,
  warning: COLORS.warning,
  gray: '#B2B9C0',
  white: COLORS.white,
  red: '#BC1414',
  primaryOutline: '#DDE7FF',
};

const styles = StyleSheet.create({
  container: {
    minHeight: 44,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOnly: {
    width: 40,
    height: 40,
    paddingHorizontal: 0,
  },
  label: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  startIcon: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endIcon: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const PButton = ({
  title,
  variant = 'contained',
  color = 'secondary',
  disabled = false,
  loading = false,
  fullWidth = false,
  startIcon,
  endIcon,
  onPress,
  style,
  textStyle,
  textColor,
  fontWeight,
  activeOpacity = 0.7,
}) => {
  const { theme } = useTheme();
  const isIconButton = variant === 'icon';

  const getBackgroundColor = () => {
    if (color === 'red') return BUTTON_COLORS.red;
    if (color === 'secondary') return theme.colors.text;
    if (color === 'gray') return BUTTON_COLORS.gray;
    return theme.colors[color] || theme.colors.primary;
  };

  const backgroundColor =
    variant === 'contained' || variant === 'floating'
      ? getBackgroundColor()
      : 'transparent';

  const defaultTextColor =
    variant === 'contained' || variant === 'floating'
    ? theme.colors.white
      : color === 'secondary'
    ? theme.colors.primary
      : getBackgroundColor();

  const finalTextColor = textColor || defaultTextColor;

  const floatingShadow = {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
        shadowColor: '#000',
      },
    }),
  };

  const variantStyle = (() => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: getBackgroundColor(),
        };
      case 'text':
        return { backgroundColor: 'transparent', paddingHorizontal: 12 };
      case 'icon':
        return { backgroundColor: 'transparent' };
      case 'floating':
        return { backgroundColor, ...floatingShadow };
      default:
        return { backgroundColor };
    }
  })();

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      disabled={disabled || loading}
      onPress={disabled || loading ? undefined : onPress}
      style={[
        styles.container,
        variantStyle,
        isIconButton && styles.iconOnly,
        fullWidth ? { width: '100%' } : { alignSelf: 'flex-start' },
        { opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      <View style={styles.contentRow}>
        {loading ? (
          <ActivityIndicator size="small" color={finalTextColor} />
        ) : (
          <>
            {startIcon && <View style={styles.startIcon}>{startIcon}</View>}

            {!isIconButton && title && (
              <Text
                numberOfLines={1}
                style={[styles.label, { color: finalTextColor, fontWeight }, textStyle]}
              >
                {title}
              </Text>
            )}

            {endIcon && <View style={styles.endIcon}>{endIcon}</View>}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default PButton;
