import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

export type ButtonProps = TouchableOpacityProps & {
  label: string;
  loading?: boolean;
};

export function Button({ label, loading, disabled, style, ...rest }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        style,
        isDisabled ? styles.disabled : null,
      ]}
      activeOpacity={0.7}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" size="small" />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 48,
    backgroundColor: "#3366FF",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  disabled: {
    opacity: 0.65,
  },
  label: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
