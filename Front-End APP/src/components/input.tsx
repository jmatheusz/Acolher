import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

export type InputProps = TextInputProps & {
  error?: string | null;
};

export function Input({ style: customStyle, error, ...rest }: InputProps) {
  return (
    <View style={inputStyle.container}>
      <TextInput
        style={[
          inputStyle.input,
          error ? inputStyle.inputError : null,
          customStyle,
        ]}
        placeholderTextColor="#0000005e"
        autoCorrect={false}
        autoCapitalize="none"
        importantForAutofill="no"
        {...rest}
      />
      {error ? <Text style={inputStyle.errorText}>{error}</Text> : null}
    </View>
  );
}

const inputStyle = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    backgroundColor: "#ffffff",
    borderColor: "#000000",
    borderRadius: 8,
    fontSize: 16,
    paddingLeft: 12,
    color: "#333333",
  },
  inputError: {
    borderColor: "#EF4444",
    borderWidth: 1.5,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: "500",
  },
});
