import React, { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";

import PButton from "../molecules/PButton";
import { registerAlert } from "../../hooks/useAlert";
import Typography from "../atoms/Typography";
import { useTheme } from "../../contex/ThemeContext";

const initialState = {
  visible: false,
  title: "",
  message: "",
  leftText: "Cancel",
  rightText: "OK",
  leftVariant: "text",
  rightVariant: "contained",
  leftColor: "secondary",
  rightColor: "primary",
  onLeftPress: null,
  onRightPress: null,
};

export default function RenderAlert() {
  const [alert, setAlert] = useState(initialState);
  const { theme } = useTheme();

  useEffect(() => {
    const unregister = registerAlert((data) => {
      if (!data.visible) {
        setAlert((prev) => ({
          ...prev,
          visible: false,
        }));
        return;
      }

      setAlert(data);
    });

    return unregister;
  }, []);

  const close = () => {
    setAlert((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  return (
    <Modal
      transparent
      visible={alert.visible}
      animationType="fade"
      statusBarTranslucent
    >
      <Pressable
        style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}
        onPress={close}
      >
        <Pressable
          style={[styles.container, { backgroundColor: theme.colors.surface }]}
          onPress={() => {}}
        >
          {!!alert.title && (
            // <Text style={styles.title}>
            //   {alert.title}
            // </Text>
            <Typography variant="h6" color="error" style={{fontWeight: '700'}}>{alert?.title}</Typography>
          )}

          {!!alert.message && (
            <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
              {alert.message}
            </Text>
          )}

          <View style={styles.buttons}>
            {!!alert.leftText && (
              <PButton
                title={alert.leftText}
                variant={alert.leftVariant}
                color={alert.leftColor}
                style={styles.button}
                onPress={() => {
                  close();
                  alert.onLeftPress?.();
                }}
              />
            )}

            <PButton
              title={alert.rightText}
              variant={alert.rightVariant}
              color={alert.rightColor}
              style={[styles.button, !alert.leftText && styles.singleButton]}
              onPress={() => {
                close();
                alert.onRightPress?.();
              }}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  container: {
    width: "100%",
    borderRadius: 12,
    padding: 20,
  },

  title: {
    fontSize: 18,
    fontFamily: "bold",
    color: "#111",
  },

  message: {
    marginTop: 10,
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
    fontFamily: "regular",
  },

  buttons: {
    flexDirection: "row",
    marginTop: 24,
  },

  button: {
    flex: 1,
    alignSelf: "auto",
    marginHorizontal: 4,
  },
  singleButton: {
    marginLeft: 0,
  },
});