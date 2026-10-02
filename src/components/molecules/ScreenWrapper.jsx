
import React from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useTheme } from "../../contex/ThemeContext";

const ScreenWrapper = ({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
  backgroundColor = "transparent",
  safeAreaEdges = ["bottom", "left", "right"],
}) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const scrollContentStyle = [
    styles.scrollContent,
    {
      paddingBottom: Math.max(insets.bottom + 20, 20),
    },
    contentContainerStyle,
  ];

  return (
    <ImageBackground
      source={isDark ? undefined : require("../../../assets/bcgWrapper.png")}
      style={[styles.background, { backgroundColor: theme.colors.background }]}
      resizeMode="cover"
    >
      <SafeAreaView
        style={[
          styles.safeArea,
          { backgroundColor: isDark ? theme.colors.background : backgroundColor },
        ]}
        edges={safeAreaEdges}
      >
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          {scrollable ? (
            <KeyboardAwareScrollView
              style={styles.scrollView}
              contentContainerStyle={scrollContentStyle}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={
                Platform.OS === "ios" ? "interactive" : "on-drag"
              }
              enableOnAndroid
              enableAutomaticScroll
              extraScrollHeight={Platform.OS === "ios" ? 20 : 80}
              extraHeight={Platform.OS === "ios" ? 20 : 80}
              nestedScrollEnabled
              bounces={Platform.OS === "ios"}
              overScrollMode="never"
            >
              {children}
            </KeyboardAwareScrollView>
          ) : (
            <View
              style={[
                styles.content,
                style,
                contentContainerStyle,
              ]}
            >
              {children}
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  safeArea: {
    flex: 1,
  },

  keyboardAvoidingView: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});

export default ScreenWrapper;
