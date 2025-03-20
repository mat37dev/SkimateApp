// components/FilterModal.tsx
import React from "react";
import { ScrollView, Text, View } from "react-native";
import Checkbox from "expo-checkbox";
import { AppModal } from "@/components/AppModal";
import styles from "@/styles/mapStyles";

interface FilterModalProps {
	visible: boolean;
	onClose: () => void;
	showLifts: boolean;
	setShowLifts: (value: boolean) => void;
	showRuns: boolean;
	setShowRuns: (value: boolean) => void;
	showNovice: boolean;
	setShowNovice: (value: boolean) => void;
	showEasy: boolean;
	setShowEasy: (value: boolean) => void;
	showIntermediate: boolean;
	setShowIntermediate: (value: boolean) => void;
	showExpert: boolean;
	setShowExpert: (value: boolean) => void;
}

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
				<Text style={styles.modalTitle}>Filters</Text>
				<View style={styles.checkboxRow}>
					<Checkbox value={showLifts} onValueChange={setShowLifts} />
					<Text>Show Lifts</Text>
				</View>
				<View style={styles.checkboxRow}>
					<Checkbox value={showRuns} onValueChange={setShowRuns} />
					<Text>Show Runs</Text>
				</View>
				<View style={styles.checkboxRow}>
					<Checkbox value={showNovice} onValueChange={setShowNovice} />
					<Text>Novice</Text>
				</View>
				<View style={styles.checkboxRow}>
					<Checkbox value={showEasy} onValueChange={setShowEasy} />
					<Text>Easy</Text>
				</View>
				<View style={styles.checkboxRow}>
					<Checkbox value={showIntermediate} onValueChange={setShowIntermediate} />
					<Text>Intermediate</Text>
				</View>
				<View style={styles.checkboxRow}>
					<Checkbox value={showExpert} onValueChange={setShowExpert} />
					<Text>Expert</Text>
				</View>
			</ScrollView>
		</AppModal>
	);
};
