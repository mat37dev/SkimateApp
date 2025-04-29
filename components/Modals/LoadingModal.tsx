import React from "react";
import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import { AppModal } from "../AppModal";
import { LoadingModalProps } from "@/interfaces/logic/LoadingModal";

export const LoadingModal = ({ visible, onClose }: LoadingModalProps) => {
	return (
		<AppModal visible={visible} onClose={onClose}>
			<View style={styles.loadingModalContainer}>
				<View style={styles.loadingAnimation}>
					<ActivityIndicator size='large' />
				</View>
				<View style={styles.loadingMessage}>
					<Text>Chargement des données…</Text>
				</View>
			</View>
		</AppModal>
	);
};

const styles = StyleSheet.create({
	loadingModalContainer: {
		flex: 1,
		padding: 10,
		backgroundColor: "#fff",
		justifyContent: "center",
		alignItems: "center",
		gap: 10,
	},
	loadingAnimation: {
		// you can add fixed width/height if you like
	},
	loadingMessage: {
		// e.g. marginTop: 8
	},
});
