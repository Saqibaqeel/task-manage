import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OnboardingOne from '../features/onboarding/OnboardingOne';
import OnboardingTwo from '../features/onboarding/OnboardingTwo';

const Stack = createNativeStackNavigator();

const OnboardingNavigator = ({ onComplete }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="OnboardingOne">
        {(props) => <OnboardingOne {...props} onComplete={onComplete} />}
      </Stack.Screen>
      <Stack.Screen name="OnboardingTwo">
        {(props) => <OnboardingTwo {...props} onComplete={onComplete} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;