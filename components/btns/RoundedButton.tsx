import React from "react";
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle, View } from "react-native";

interface RoundedButtonProps {
	onPress: () => void;
	style?: StyleProp<ViewStyle>;
	children?: React.ReactNode; // So we can pass icons or text
}

export const RoundedButton = ({ onPress, style, children }: RoundedButtonProps) => {
	return (
		<TouchableOpacity onPress={onPress} style={[styles.button, style]}>
			{children}
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: "#fff",
		justifyContent: "center",
		alignItems: "center",
		// Optional: add shadow/elevation
		shadowColor: "#000",
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 5,
	},
});
