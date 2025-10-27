import styles from "@/styles/mapStyles";
import React from "react";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { AppModal } from "@/components/AppModal";
import { InfoModalProps } from "@/interfaces/logic/InfosModal";
import { tr } from "@/constants/map/translations";

type Props = InfoModalProps & { onClear?: () => void };

export const InfoModal = ({
	visible,
	onClose,
	selectedFeature,
	onClear,
}: Props) => {
	if (!selectedFeature) return null;
	const { properties = {} } = selectedFeature;
	const { category, name, difficulty, tags = {} } = properties;
	const isRun = category === "run";
	const isLift = category === "lift";
	const liftType = tr(tags.aerialway, "aerialway");
	const runLit = tr(tags.lit, "lit");
	const difficultyLabel = tr(difficulty, "difficulty");
	const description = tags.description || tags.note || "Inconnu";
	const openingHours = tags.opening_hours || "Inconnu";

	return (
		<AppModal visible={visible} onClose={onClose}>
			<ScrollView>
				<Text style={styles.modalTitle}>
					{isRun
						? "Informations sur la piste"
						: "Informations sur la remontée mécanique"}
				</Text>
				<Text style={styles.infoLine}>
					<Text style={styles.infoLabel}>Nom : </Text>
					{name || "Inconnu"}
				</Text>
				{isRun && (
					<>
						<Text style={styles.infoLine}>
							<Text style={styles.infoLabel}>Diffculté : </Text>
							{difficultyLabel || "Inconnu"}
						</Text>
						<Text style={styles.infoLine}>
							<Text style={styles.infoLabel}>Éclairage : </Text>
							{runLit || "Inconnu"}
						</Text>
						<Text style={styles.infoLine}>
							<Text style={styles.infoLabel}>Description : </Text>
							{description || "Inconnu"}
						</Text>
					</>
				)}
				{isLift && (
					<>
						<Text style={styles.infoLine}>
							<Text style={styles.infoLabel}>Type : </Text>
							{liftType}
						</Text>
						<Text style={styles.infoLine}>
							<Text style={styles.infoLabel}>
								Horaires d'ouverture :{" "}
							</Text>
							{openingHours || "Inconnu"}
						</Text>
						<Text style={styles.infoLine}>
							<Text style={styles.infoLabel}>
								Description / Infos :{" "}
							</Text>
							{description || "Inconnu"}
						</Text>
					</>
				)}
			</ScrollView>
		</AppModal>
	);
};
