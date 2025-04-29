import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { RoundedButtonProps } from "@/interfaces/components/RoundedBtn";

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
