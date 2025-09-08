// components/FilterModal.tsx
import React from "react";
import { ScrollView, Text, View } from "react-native";
import Checkbox from "expo-checkbox";
import { AppModal } from "@/components/AppModal";
import styles from "@/styles/mapStyles";
import { FilterModalProps } from "@/interfaces/logic/FilterModal";

export const FilterModal = ({
	visible,
	onClose,
	showLifts,
	setShowLifts,
	showRuns,
	setShowRuns,
	showNovice,
	setShowNovice,
	showEasy,
	setShowEasy,
	showIntermediate,
	setShowIntermediate,
	showExpert,
	setShowExpert,
}: FilterModalProps) => {
	return (
		<AppModal visible={visible} onClose={onClose}>
			<ScrollView>
				<Text style={styles.modalTitle}>Filtres</Text>
				<View style={styles.checkboxRow}>
					<Checkbox value={showLifts} onValueChange={setShowLifts} />
					<Text>Afficher les remontées</Text>
				</View>
				<View style={styles.checkboxRow}>
					<Checkbox value={showRuns} onValueChange={setShowRuns} />
					<Text>Afficher les pistes</Text>
				</View>
				<View style={styles.checkboxRow}>
					<Checkbox
						value={showNovice}
						onValueChange={setShowNovice}
					/>
					<Text>Débutant</Text>
				</View>
				<View style={styles.checkboxRow}>
					<Checkbox value={showEasy} onValueChange={setShowEasy} />
					<Text>Facile</Text>
				</View>
				<View style={styles.checkboxRow}>
					<Checkbox
						value={showIntermediate}
						onValueChange={setShowIntermediate}
					/>
					<Text>Intermédiaire</Text>
				</View>
				<View style={styles.checkboxRow}>
					<Checkbox
						value={showExpert}
						onValueChange={setShowExpert}
					/>
					<Text>Expert</Text>
				</View>
			</ScrollView>
		</AppModal>
	);
};
