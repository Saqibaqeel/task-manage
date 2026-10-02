import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import MainNavigator from './MainNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import { getOnboardingStatus } from '../services/storage';
import { COLORS } from '../constants/color';

const AppNavigator = () => {
  const [isReady, setIsReady] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      const hasSeenOnboarding = await getOnboardingStatus();
      setIsOnboarded(hasSeenOnboarding);
      setIsReady(true);
    };

    loadSession();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!isOnboarded ? (
        <OnboardingNavigator onComplete={() => setIsOnboarded(true)} />
      ) : (
        <MainNavigator />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});

export default AppNavigator;