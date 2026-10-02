import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../contex/ThemeContext';

const RInput = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,

  startIcon,
  endIcon,
  onEndIconPress,

  multiline = false,
  numberOfLines = 3,

  containerStyle,
  inputStyle,

  editable = true,
  animatePlaceholder = false,
  error,
  onFocus,
  onBlur,

  ...props
}) => {
  const { theme } = useTheme();
  const [height, setHeight] = useState(40);
  const [focused, setFocused] = useState(false);

  const hasValue =
    value !== undefined &&
    value !== null &&
    String(value).length > 0;

  const labelProgress = useRef(
    new Animated.Value(hasValue ? 1 : 0)
  ).current;

  useEffect(() => {
    if (!animatePlaceholder) return;

    Animated.timing(labelProgress, {
      toValue: focused || hasValue ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [
    animatePlaceholder,
    focused,
    hasValue,
    labelProgress,
  ]);

  const handleFocus = (event) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event) => {
    setFocused(false);
    onBlur?.(event);
  };

  const borderColor = focused
    ? theme.colors.primary
    : theme.colors.inputBorder;

  const textColor = editable ? theme.colors.text : theme.colors.inputPlaceholder;

  return (
    <View style={[{ width: '100%' }, containerStyle]}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: multiline ? 'flex-start' : 'center',
          borderBottomWidth: 1,
          borderBottomColor: error ? theme.colors.error : borderColor,
          backgroundColor: 'transparent',
          minHeight: multiline ? 60 : 48,
        }}
      >
      {/* Animated Placeholder */}
      {animatePlaceholder && placeholder && (
        <Animated.Text
          pointerEvents="none"
          style={{
            position: 'absolute',

            left: startIcon ? 36 : 0,

            top: multiline ? 18 : 14,

            color: focused
              ? theme.colors.primary
              : theme.colors.inputPlaceholder,

            fontSize: labelProgress.interpolate({
              inputRange: [0, 1],
              outputRange: [15, 11],
            }),

            transform: [
              {
                translateY: labelProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -18],
                }),
              },
            ],

            backgroundColor: 'transparent',
          }}
        >
          {placeholder}
        </Animated.Text>
      )}

      {/* Start Icon */}
      {startIcon && (
        <View
          style={{
            marginRight: 10,
            marginTop: multiline ? 10 : 0,
          }}
        >
          {startIcon}
        </View>
      )}

      {/* Input */}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={
          animatePlaceholder ? '' : placeholder
        }
        placeholderTextColor={theme.colors.inputPlaceholder}

        secureTextEntry={secureTextEntry}

        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={
          multiline ? 'top' : 'center'
        }

        editable={editable}

        onFocus={handleFocus}
        onBlur={handleBlur}

        onContentSizeChange={(event) => {
          if (multiline) {
            setHeight(
              event.nativeEvent.contentSize.height
            );
          }
        }}

        style={[
          {
            flex: 1,

            minHeight: multiline ? 50 : 48,

            height: multiline
              ? Math.max(50, height)
              : 48,

            paddingHorizontal: 0,
            paddingVertical: multiline ? 10 : 0,

            color: textColor,

            fontSize: 15,
          },
          inputStyle,
        ]}

        {...props}
      />

      {/* End Icon */}
      {endIcon && (
        <TouchableOpacity
          onPress={onEndIconPress}
          disabled={!onEndIconPress}
          activeOpacity={0.7}
          style={{
            marginLeft: 10,
            marginTop: multiline ? 10 : 0,
          }}
        >
          {endIcon}
        </TouchableOpacity>
      )}
      </View>
      {!!error && (
        <Text
          accessibilityRole="alert"
          style={{ marginTop: 3, color: theme.colors.error, fontSize: 12 }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

export default RInput;