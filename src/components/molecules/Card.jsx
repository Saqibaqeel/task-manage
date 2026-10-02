import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { COLORS, radii, spacing } from '../../constants/color';
import { useTheme } from '../../contex/ThemeContext';

const Card = ({
  children,
  variant = 'elevated',
  onPress,
  padding = true,
  style,
  contentStyle,
}) => {
  const { theme } = useTheme();
  const cardStyles = [
    styles.base,
    styles[variant],
    { backgroundColor: theme.colors.surface },
    padding && styles.defaultPadding,
    style,
  ];

  const content = <View style={[styles.contentWrapper, contentStyle]}>{children}</View>;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [cardStyles, pressed && styles.pressed]}
        android_ripple={{
          color: theme.colors.surfaceAlt,
          borderless: false,
          foreground: true,
        }}
        accessible={true}
        accessibilityRole="button"
      >
        {content}
      </Pressable>
    );
  }

  return <View style={cardStyles}>{content}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  contentWrapper: {
    flex: 1,
  },
  elevated: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  outlined: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  flat: {
    backgroundColor: '#F9F9F9',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  defaultPadding: {
    padding: spacing.md,
  },
});

export default Card;