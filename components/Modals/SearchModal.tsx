// components/Modals/SearchModal.tsx
import React from "react";
import {
	View,
	Text,
	TouchableOpacity,
	TextInput,
	ActivityIndicator,
	ScrollView,
	StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppModal } from "@/components/AppModal";
import { SearchModalProps } from "@/interfaces/logic/SearchModal";
import { tr } from "@/constants/translations";

export const SearchModal = ({
	visible,
	onClose,
	searchQuery,
	handleSearch,
	isSearching,
	searchResults,
	onSearchItemPress,
}: SearchModalProps) => {
	return (
		<AppModal visible={visible} onClose={onClose}>
			<View style={styles.searchModalContainer}>
				<View style={styles.searchModalHeader}>
					<TouchableOpacity onPress={onClose}>
						<Ionicons name='arrow-back' size={24} color='black' />
					</TouchableOpacity>
					<TextInput
						style={styles.searchModalInput}
						placeholder='Arpette, La Roche, etc.'
						value={searchQuery}
						onChangeText={handleSearch} // call handleSearch on every text change
					/>
				</View>
				{isSearching && (
					<View style={styles.centered}>
						<ActivityIndicator size='small' color='#000' />
					</View>
				)}
				{!isSearching &&
					searchResults.length === 0 &&
					searchQuery !== "" && (
						<View style={styles.centered}>
							<Text>Aucun résultat trouvé</Text>
						</View>
					)}
				<ScrollView style={styles.resultsContainer}>
					{searchResults.map((item, idx) => {
						const featureTranslated = tr(
							item.category,
							"featureTranslation"
						);
						return (
							<TouchableOpacity
								key={idx}
								style={styles.resultItem}
								onPress={() => onSearchItemPress(item)}
							>
								<Text>
									{item.properties?.name} ({featureTranslated}
									)
								</Text>
							</TouchableOpacity>
						);
					})}
				</ScrollView>
			</View>
		</AppModal>
	);
};

const styles = StyleSheet.create({
	searchModalContainer: {
		height: "100%",
		padding: 10,
		backgroundColor: "#fff", // adjust as needed
	},
	searchModalHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
	},
	searchModalInput: {
		flex: 1,
		marginLeft: 10,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 25,
		padding: 8,
	},
	centered: {
		padding: 10,
		alignItems: "center",
	},
	resultItem: {
		marginVertical: 8,
	},
});
