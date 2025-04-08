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
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: "#fff",
		justifyContent: "center",
		alignItems: "center",
		// Optional: add shadow/elevation
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		// Shadow Android
		elevation: 4,
	},
});
