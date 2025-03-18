import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
	container: { flex: 1 },
	map: { flex: 1 },
	mapStyleBtnContainer: {
		position: "absolute",
		bottom: 30,
		right: 20,
	},
	mapStyleBtn: {
		backgroundColor: "#fff",
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingVertical: 8,
		elevation: 2,
	},
	mapStyleBtnText: {
		color: "#000",
		fontSize: 16,
		fontWeight: "bold",
	},
	selectContainer: {
		position: "absolute",
		top: 90,
		left: 10,
		right: 10,
		zIndex: 1000,
		width: "50%",
	},
	dropdown: {
		backgroundColor: "white",
		borderRadius: 8,
		borderColor: "#ccc",
	},
	dropdownContainer: {
		backgroundColor: "white",
		borderColor: "#ccc",
	},
	filterBtnContainer: {
		position: "absolute",
		top: 90,
		right: 20,
	},
	filterBtn: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: "#fff",
		elevation: 2,
		alignItems: "center",
		justifyContent: "center",
	},
	filterBtnText: {
		fontSize: 24,
		color: "#000",
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "flex-end",
	},
	modalContainer: {
		backgroundColor: "#fff",
		borderTopRightRadius: 16,
		borderTopLeftRadius: 16,
		padding: 16,
		height: "40%",
		maxHeight: "70%",
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 12,
	},
	checkboxRow: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 4,
	},
	infoLine: {
		fontSize: 16,
		marginBottom: 6,
	},
	infoLabel: {
		fontWeight: "600",
	},

	userCenterBtnContainer: {
		position: "absolute",
		bottom: 150, // Above the 2D/3D button
		right: 20,
		zIndex: 10,
	},

	userCenterBtn: {
		backgroundColor: "white", // White background
		padding: 13,
		borderRadius: 25,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 5, // Adds shadow for Android
	},

	centerCameraBtnContainer: {
		position: "absolute",
		bottom: 85, // Above the 2D/3D button
		right: 20,
		zIndex: 10,
	},

	centerCameraBtn: {
		backgroundColor: "white", // White background
		padding: 11,
		borderRadius: 25,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 5, // Adds shadow for Android
	},
	mapLoadingOverlay: {
		position: "absolute",
		top: "50%",
		left: "50%",
		zIndex: 15,
		transform: [{ translateX: -50 }, { translateY: -50 }], // Adjust based on box size
		width: 100, // Ensure enough space
		height: 100,
		justifyContent: "center",
		alignItems: "center",
	},

	mapLoadingContainer: {
		width: 75, // Actual box size
		height: 75,
		backgroundColor: "rgba(255, 255, 255, 0.9)", // Slightly transparent
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
		elevation: 5, // Shadow for Android
		shadowColor: "#000", // Shadow for iOS
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.3,
		shadowRadius: 3,
	},

	clearCacheBtnContainer: {
		position: "absolute",
		bottom: 160, // Above the 2D/3D button
		right: 20,
		zIndex: 10,
	},

	clearCacheBtn: {
		backgroundColor: "white", // White background
		padding: 11,
		borderRadius: 25,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 5, // Adds shadow for Android
	},
	searchBarContainer: {
		position: "absolute",
		top: 40,
		left: 10,
		right: 10,
		zIndex: 3,
	},
	searchBar: {
		width: "100%",
		padding: 10,
		backgroundColor: "#fff",
		borderRadius: 8,
	},
	searchBarText: {
		color: "#999",
	},
	searchModalContainer: {
		flex: 1,
		backgroundColor: "#fff",
	},
	searchModalHeader: {
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
		backgroundColor: "#f2f2f2",
	},
	searchModalInput: {
		flex: 1,
		marginLeft: 10,
		backgroundColor: "#fff",
		borderRadius: 8,
		paddingHorizontal: 10,
	},
});

export default styles;
