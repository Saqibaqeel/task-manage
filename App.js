import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import AppNavigator from "./src/navigation/AppNavigator";
import { TaskProvider } from "./src/contex/TaskProvider";
import { ThemeProvider, useTheme } from "./src/contex/ThemeContext";
import RenderAlert from "./src/components/organism/RenderAlert";

const ThemedStatusBar = () => {
  const { isDark, theme } = useTheme();
  return (
    <StatusBar
      style={isDark ? "light" : "dark"}
      backgroundColor={theme.colors.background}
    />
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedStatusBar />
        <TaskProvider>
          <AppNavigator />
          <RenderAlert />
        </TaskProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}