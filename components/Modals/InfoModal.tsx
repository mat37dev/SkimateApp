import styles from "@/styles/mapStyles";

import React from "react";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { AppModal } from "@/components/AppModal";
import { InfoModalProps } from "@/interfaces/logic/InfosModal";

export const InfoModal = ({ visible, onClose, selectedFeature, onTravel }: InfoModalProps) => {
	if (!selectedFeature) return null;
	const { properties = {} } = selectedFeature;
	const { category, name, difficulty, tags = {} } = properties;
	const isRun = category === "run";
	const isLift = category === "lift";
	const liftType = tags.aerialway || "unknown";
	const runLit = tags.lit || "unknown";
	const description = tags.description || tags.note || "unknown";
	const openingHours = tags.opening_hours || "unknown";

	return (
		<AppModal visible={visible} onClose={onClose}>
			<ScrollView>
				<Text style={styles.modalTitle}>{isRun ? "Ski Run Information" : "Lift Information"}</Text>
				<Text style={styles.infoLine}>
					<Text style={styles.infoLabel}>Name: </Text>
					{name || "Unknown"}
				</Text>
				{isRun && (
					<>
						<Text style={styles.infoLine}>
							<Text style={styles.infoLabel}>Difficulty: </Text>
							{difficulty || "unknown"}
						</Text>
						<Text style={styles.infoLine}>
							<Text style={styles.infoLabel}>Lit: </Text>
							{runLit}
						</Text>
						<Text style={styles.infoLine}>
							<Text style={styles.infoLabel}>Description: </Text>
							{description}
						</Text>
					</>
				)}
				{isLift && (
					<>
						<Text style={styles.infoLine}>
							<Text style={styles.infoLabel}>Type: </Text>
							{liftType}
						</Text>
						<Text style={styles.infoLine}>
							<Text style={styles.infoLabel}>Opening Hours: </Text>
							{openingHours}
						</Text>
						<Text style={styles.infoLine}>
							<Text style={styles.infoLabel}>Description / Note: </Text>
							{description}
						</Text>
					</>
				)}
			</ScrollView>
			<View style={{ flexDirection: "row", justifyContent: "space-around", marginVertical: 10 }}>
				<TouchableOpacity style={{ padding: 10, backgroundColor: "#ddd", borderRadius: 5 }} onPress={onTravel}>
					<Text>Travel to</Text>
				</TouchableOpacity>
			</View>
		</AppModal>
	);
};
