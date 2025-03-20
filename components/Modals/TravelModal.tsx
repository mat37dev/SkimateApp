// components/Modals/TravelModal.tsx
import React from "react";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import Checkbox from "expo-checkbox";
import { AppModal } from "@/components/AppModal";
import styles from "@/styles/mapStyles";

interface TravelModalProps {
	visible: boolean;
	onClose: () => void;
	calculateRoute: (direction: "top" | "bottom") => void;
	travelFilters: {
		runs: boolean;
		lifts: boolean;
		novice: boolean;
		easy: boolean;
		intermediate: boolean;
		expert: boolean;
	};
	setTravelFilters: (filters: {
		runs: boolean;
		lifts: boolean;
		novice: boolean;
		easy: boolean;
		intermediate: boolean;
		expert: boolean;
	}) => void;
}

export const TravelModal = ({ visible, onClose, calculateRoute, travelFilters, setTravelFilters }: TravelModalProps) => {
	// Helper function to update a single filter:
	const updateFilter = (key: keyof typeof travelFilters, value: boolean) => {
		setTravelFilters({ ...travelFilters, [key]: value });
	};

	return (
		<AppModal visible={visible} onClose={onClose}>
			<View style={{ flex: 1 }}>
				{/* Top Section: Travel Filters */}
				<View style={{ flex: 2 }}>
					<ScrollView>
						<Text style={styles.modalTitle}>Travel Filters</Text>
						<View style={{ flexDirection: "row", alignItems: "center", marginVertical: 4 }}>
							<Checkbox value={travelFilters.runs} onValueChange={(val) => updateFilter("runs", val)} />
							<Text style={{ marginLeft: 8 }}>Runs</Text>
						</View>
						<View style={{ flexDirection: "row", alignItems: "center", marginVertical: 4 }}>
							<Checkbox value={travelFilters.lifts} onValueChange={(val) => updateFilter("lifts", val)} />
							<Text style={{ marginLeft: 8 }}>Lifts</Text>
						</View>
						<View style={{ flexDirection: "row", alignItems: "center", marginVertical: 4 }}>
							<Checkbox value={travelFilters.novice} onValueChange={(val) => updateFilter("novice", val)} />
							<Text style={{ marginLeft: 8 }}>Novice</Text>
						</View>
						<View style={{ flexDirection: "row", alignItems: "center", marginVertical: 4 }}>
							<Checkbox value={travelFilters.easy} onValueChange={(val) => updateFilter("easy", val)} />
							<Text style={{ marginLeft: 8 }}>Easy</Text>
						</View>
						<View style={{ flexDirection: "row", alignItems: "center", marginVertical: 4 }}>
							<Checkbox value={travelFilters.intermediate} onValueChange={(val) => updateFilter("intermediate", val)} />
							<Text style={{ marginLeft: 8 }}>Intermediate</Text>
						</View>
						<View style={{ flexDirection: "row", alignItems: "center", marginVertical: 4 }}>
							<Checkbox value={travelFilters.expert} onValueChange={(val) => updateFilter("expert", val)} />
							<Text style={{ marginLeft: 8 }}>Expert</Text>
						</View>
					</ScrollView>
				</View>
				{/* Bottom Section: Route Buttons */}
				<View
					style={{
						flex: 1,
						flexDirection: "row",
						justifyContent: "space-around",
						alignItems: "center",
					}}
				>
					<TouchableOpacity
						style={{ padding: 10, backgroundColor: "#ddd", borderRadius: 5, width: "28%", alignItems: "center" }}
						onPress={() => calculateRoute("top")}
					>
						<Text>Travel to Top</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={{ padding: 10, backgroundColor: "#ddd", borderRadius: 5, width: "28%", alignItems: "center" }}
						onPress={() => calculateRoute("bottom")}
					>
						<Text>Travel to Bottom</Text>
					</TouchableOpacity>
				</View>
			</View>
		</AppModal>
	);
};
