import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { COLORS, typography } from '../../constants/color';
import { useTheme } from '../../contex/ThemeContext';

export const VARIANTS = Object.keys(typography.sizes);
export const COLOR_OPTIONS = Object.keys(COLORS);

const styles = StyleSheet.create({
  caption: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.lineHeights.caption,
    fontWeight: '500',
  },
  body2: {
    fontSize: typography.sizes.body2,
    lineHeight: typography.lineHeights.body2,
    fontWeight: '400',
  },
  body1: {
    fontSize: typography.sizes.body1,
    lineHeight: typography.lineHeights.body1,
    fontWeight: '400',
  },
  subtitle: {
    fontSize: typography.sizes.subtitle,
    lineHeight: typography.lineHeights.subtitle,
    fontWeight: '600',
  },
  h6: {
    fontSize: typography.sizes.h6,
    lineHeight: typography.lineHeights.h6,
    fontWeight: '600',
  },
  h5: {
    fontSize: typography.sizes.h5,
    lineHeight: typography.lineHeights.h5,
    fontWeight: '700',
  },
  h4: {
    fontSize: typography.sizes.h4,
    lineHeight: typography.lineHeights.h4,
    fontWeight: '700',
  },
  h3: {
    fontSize: typography.sizes.h3,
    lineHeight: typography.lineHeights.h3,
    fontWeight: '700',
  },
  h2: {
    fontSize: typography.sizes.h2,
    lineHeight: typography.lineHeights.h2,
    fontWeight: '800',
  },
});

const Typography = ({
  children,
  variant = 'body1',
  color = 'secondary',
  align = 'left',
  numberOfLines,
  ellipsizeMode = 'tail',
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const baseStyle = styles[variant] || styles.body1;
  const resolvedColor = theme.colors[color] || theme.colors.secondary;

  return (
    <Text
      style={[
        baseStyle,
        {
          color: resolvedColor,
          textAlign: align,
          fontFamily: typography.fontFamily[baseStyle.fontWeight === '800' ? 'bold' : baseStyle.fontWeight === '700' ? 'semibold' : 'regular'],
        },
        style,
      ]}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      {...props}
    >
      {children}
    </Text>
  );
};

export default Typography;
