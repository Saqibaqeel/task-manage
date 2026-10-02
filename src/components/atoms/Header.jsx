import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Typography from './Typography';
import RIcon from '../icons/rIcon';
import { radii, spacing } from '../../constants/color';
import { useTheme } from '../../contex/ThemeContext';

const formatRouteTitle = (name = '') =>
  name.replace(/([a-z])([A-Z])/g, '$1 $2');

const Header = ({ navigation, route, options = {}, back }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const title = options.title || formatRouteTitle(route?.name) || 'TaskFlow';
  const subtitle = options.headerSubtitle;
  const renderRightAction = options.headerRight;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: spacing.sm + insets.top,
        },
      ]}
    >
      {back ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={navigation.goBack}
          hitSlop={8}
          style={({ pressed }) => [
            styles.iconButton,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            pressed && styles.pressed,
          ]}
        >
          <RIcon name="ION_BACK" size={21} fill={theme.colors.secondary} />
        </Pressable>
      ) : (
        <View style={[styles.brandMark, { backgroundColor: theme.colors.primary }]}>
          <RIcon name="ION_HOME" size={19} fill={theme.colors.white} />
        </View>
      )}

      <View style={styles.titleGroup}>
        <Typography variant="subtitle" color="secondary" numberOfLines={1}>
          {title}
        </Typography>
        {!!subtitle && (
          <Typography variant="caption" color="muted" numberOfLines={1}>
            {subtitle}
          </Typography>
        )}
      </View>

      <View style={styles.action}>
        {typeof renderRightAction === 'function'
          ? renderRightAction({ tintColor: theme.colors.primary })
          : (
            <Pressable
              accessibilityRole="switch"
              accessibilityLabel="Dark mode"
              accessibilityState={{ checked: isDark }}
              onPress={toggleTheme}
              hitSlop={8}
              style={({ pressed }) => [
                styles.themeButton,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                pressed && styles.pressed,
              ]}
            >
              <RIcon
                name={isDark ? 'ION_SUN' : 'ION_MOON'}
                size={20}
                fill={theme.colors.primary}
              />
            </Pressable>
          )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  brandMark: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.full,
    borderWidth: 1,
  },
  themeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.full,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  titleGroup: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  action: {
    minWidth: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

export default Header;