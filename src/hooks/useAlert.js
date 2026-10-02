let listener = null;

export const registerAlert = (callback) => {
  listener = callback;

  return () => {
    listener = null;
  };
};

const showAlert = ({
  title = "",
  message = "",

  leftText = "Cancel",
  rightText = "OK",

  leftVariant = "text",
  rightVariant = "contained",

  leftColor = "secondary",
  rightColor = "primary",

  onLeftPress,
  onRightPress,
}) => {
  listener?.({
    visible: true,

    title,
    message,

    leftText,
    rightText,

    leftVariant,
    rightVariant,

    leftColor,
    rightColor,

    onLeftPress,
    onRightPress,
  });
};

const hideAlert = () => {
  listener?.({
    visible: false,
  });
};

export default function useAlert() {
  return {
    showAlert,
    hideAlert,
  };
}