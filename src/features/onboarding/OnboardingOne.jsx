import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';

import Typography from '../../components/atoms/Typography';
import RIcon from '../../components/icons/rIcon';
import PButton from '../../components/molecules/PButton';
import Card from '../../components/molecules/Card';
import ScreenWrapper from '../../components/molecules/ScreenWrapper';
import { radii, spacing } from '../../constants/color';
import { useTheme } from '../../contex/ThemeContext';
import useAlert from '../../hooks/useAlert';
import { markOnboardingSeen } from '../../services/storage';

const OnboardingOne = ({ navigation, onComplete }) => {
  const { theme, isDark } = useTheme();
  const { showAlert } = useAlert();
  const [isStarting, setIsStarting] = useState(false);

  const handleComplete = async () => {
    if (isStarting) return;
    setIsStarting(true);
    try {
      const saved = await markOnboardingSeen();
      if (!saved) {
        showAlert({
          title: 'Could not finish setup',
          message: 'Please try again.',
          leftText: null,
          rightText: 'OK',
        });
        return;
      }
      onComplete?.();
    } catch (error) {
      console.error('Unable to complete onboarding:', error);
      showAlert({
        title: 'Could not finish setup',
        message: 'Please try again.',
        leftText: null,
        rightText: 'OK',
      });
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <ScreenWrapper
      scrollable={false}
      contentContainerStyle={styles.screen}
      safeAreaEdges={['top', 'bottom', 'left', 'right']}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <View style={styles.content}>
        <View style={[styles.logo, { backgroundColor: theme.colors.primarySoft }]}>
          <RIcon name="ION_CHECK" size={38} fill={theme.colors.primary} />
        </View>
        <Typography variant="h4" color="secondary" align="center" style={styles.title}>
          Welcome to TaskFlow
        </Typography>
        <Typography variant="body1" color="muted" align="center" style={styles.subtitle}>
          TaskFlow helps you turn busy days into a clear, manageable plan. Create tasks with
          descriptions, categories, priorities, and start and due dates.
        </Typography>

      
      </View>

      <View style={styles.actions}>
        <PButton
          title="Skip"
          variant="text"
          color="primary"
          disabled={isStarting}
          onPress={handleComplete}
          style={styles.skipButton}
        />
        <PButton
          title="Next"
          color="primary"
          loading={isStarting}
          disabled={isStarting}
          onPress={() => navigation.navigate('OnboardingTwo')}
          style={styles.button}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.md,
  },
  subtitle: {
    maxWidth: 320,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  preview: {
    width: '100%',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  previewIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  button: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  skipButton: {
    minWidth: 88,
  },
});

export default OnboardingOne;
