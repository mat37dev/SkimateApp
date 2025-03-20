import MapboxGL from "@rnmapbox/maps";
import { useEffect, useState, useRef, useMemo } from "react";
import { View, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import DropDownPicker from "react-native-dropdown-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useModal } from "@/hooks/useModal";
import { FilterModal } from "@/components/Modals/FilterModal";
import { InfoModal } from "@/components/Modals/InfoModal";
import { TravelModal } from "@/components/Modals/TravelModal";
import { SearchModal } from "@/components/Modals/SearchModal";
// Data fetching hooks
import { useStations } from "@/hooks/useStations";
import { useStationData } from "@/hooks/useStationData";

// Styles
import styles from "@/styles/mapStyles";
import { calculateRouteForFeature, getGraph, preprocessFeatures } from "@/hooks/calculateRoute";
import { CollapsibleRouteSheet } from "@/components/Modals/CollapsibleRouteSheet";
import { RoundedButton } from "@/components/btns/RoundedButton";
import { SkiMap } from "@/components/SkiMap";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useSkiMap } from "@/hooks/useSkiMap";

export default function MapScreen() {
	const backgroundColor = useThemeColor({}, "background");
	const mapCameraRef = useRef<any>(null);

	// State for modals and map loading
	const [travelModalVisible, setTravelModalVisible] = useState(false);
	const [isSearching, setIsSearching] = useState(false);
	const [mapLoading, setMapLoading] = useState(true);
	const [routeFeature, setRouteFeature] = useState<any>(null);

	// Set Mapbox token on mount
	useEffect(() => {
		MapboxGL.setAccessToken("pk.eyJ1IjoiYmFwdGxhYiIsImEiOiJjbHdvcTEzc3cxM2NjMmlyem11ZHF4MWh2In0.KmT1eerA8ZSQaREGnkaN2A");
	}, []);

	// Data fetching hooks
	const { stations, dropdownItems, selectedStation, setSelectedStation } = useStations();
	const { stationData, stationCoordinates, assets } = useStationData(selectedStation);

	// Extract search/filter & graph logic from useSkiMap hook
	const { searchQuery, setSearchQuery, searchResults, isSearching: hookIsSearching, handleSearch, combinedList } = useSkiMap(assets);

	// Local UI state
	const [open, setOpen] = useState(false);
	const [is3D, setIs3D] = useState(false);
	const toggleMapStyle = () => setIs3D((prev) => !prev);
	const filterModal = useModal();

	// Toggles for runs and lifts display
	const [showRuns, setShowRuns] = useState(true);
	const [showLifts, setShowLifts] = useState(true);
	const [showNovice, setShowNovice] = useState(true);
	const [showEasy, setShowEasy] = useState(true);
	const [showIntermediate, setShowIntermediate] = useState(true);
	const [showExpert, setShowExpert] = useState(true);

	const [infoModalVisible, setInfoModalVisible] = useState(false);
	const [selectedFeature, setSelectedFeature] = useState<any>(null);
	const [searchModalVisible, setSearchModalVisible] = useState(false);
	const [routeSegments, setRouteSegments] = useState<any[]>([]);
	const [sheetOpen, setSheetOpen] = useState(false);

	const [travelFilters, setTravelFilters] = useState({
		runs: true,
		lifts: true,
		novice: true,
		easy: true,
		intermediate: true,
		expert: true,
	});

	// Calculate camera center (default to station if available)
	const cameraCenter = selectedStation ? [selectedStation.longitude, selectedStation.latitude] : [6.7483232, 45.5203648];
	const stationGeoJson: { type: string; features: any[] } = stationCoordinates ?? { type: "FeatureCollection", features: [] };

	const centerCameraOnStation = () => {
		if (selectedStation?.longitude && selectedStation?.latitude) {
			mapCameraRef.current?.setCamera({
				centerCoordinate: [Number(selectedStation.longitude), Number(selectedStation.latitude)],
				zoomLevel: 11,
				animationDuration: 1000,
			});
		} else {
			console.warn("No valid coordinates for the selected station.");
		}
	};

	const centerCameraOnUser = () => {
		mapCameraRef.current?.setCamera({
			centerCoordinate: userLocation,
			zoomLevel: 15,
			animationDuration: 1000,
		});
	};

	// Mocked user location
	const [userLocation] = useState<[number, number]>([6.6771972, 45.5052883]);

	// Handle dropdown changes (Station Select)
	const handleStationChange = (osmId: string) => {
		const station = stations.find((s) => String(s.osmId) === String(osmId));
		if (station) {
			setSelectedStation(station);
		} else {
			console.warn(`Station with osmId ${osmId} not found.`);
		}
	};

	function onCancelTravel() {
		setRouteSegments([]);
		setRouteFeature(null);
		setSheetOpen(false);
	}

	const clearStorage = async () => {
		try {
			await AsyncStorage.clear();
		} catch (error) {
			console.error("Error clearing AsyncStorage:", error);
		}
	};

	// Feature selection method
	const handleFeatureSelect = (feature: any) => {
		console.log("feature selected:", feature);
		setSearchModalVisible(false);
		const featureCategory = feature.category || feature.properties?.category;
		const featureName = feature.properties?.name;
		const compositeKey = featureCategory + "_" + featureName;
		let selected = feature;
		if (compositeKey) {
			const found = combinedList.find(
				(item) => (item.category || item.properties?.category) + "_" + item.properties?.name === compositeKey
			);
			if (found) {
				selected = found;
			}
		}
		const targetCoord =
			selected.geometry.type === "LineString"
				? selected.geometry.coordinates[Math.floor(selected.geometry.coordinates.length / 2)]
				: selected.geometry.coordinates;
		console.log("target coord:", targetCoord);
		mapCameraRef.current?.setCamera({
			centerCoordinate: targetCoord,
			zoomLevel: 15,
			animationDuration: 1000,
		});
		setRouteFeature(null);
		setSelectedFeature(selected);
		setInfoModalVisible(true);
	};

	const handleSearchItemPress = (feature: any) => {
		handleFeatureSelect(feature);
	};

	const handleMapFeaturePress = (e: any) => {
		const { features } = e;
		if (!features || !features[0]) return;
		handleFeatureSelect(features[0]);
	};

	// Build the graph from combinedList (hook already preprocessed this)
	const simplifiedEdges = useMemo(() => preprocessFeatures(combinedList), [combinedList]);
	const memoizedGraph = useMemo(() => (simplifiedEdges.length > 0 ? getGraph(simplifiedEdges) : null), [simplifiedEdges]);

	function onCalculateRoute(direction: "top" | "bottom") {
		if (!selectedFeature) return;
		const result = calculateRouteForFeature(selectedFeature, direction, userLocation, combinedList, travelFilters);
		if (!result) {
			console.error("Route calculation failed.");
			return;
		}
		const { segmentedGeoJSON, destinationCoord } = result;
		setRouteFeature(segmentedGeoJSON);
		mapCameraRef.current?.setCamera({
			centerCoordinate: destinationCoord,
			zoomLevel: 15,
			animationDuration: 1000,
		});
		setSelectedFeature(null);
		setTravelModalVisible(false);
		setRouteSegments(segmentedGeoJSON.features);
		setSheetOpen(true);
	}

	const onMapDidFinishRendering = () => {
		setMapLoading(false);
	};

	// Define runLayers to pass to SkiMap
	const runLayers = (shapeId: string, lineId: string, color: string, labelId: string, arrowId: string, shapeData: any) => {
		const hasArrow = shapeData.features.every((feature: any) => !["unknown", "flat"].includes(feature.properties.orientation));
		return (
			<MapboxGL.ShapeSource id={shapeId} shape={shapeData} onPress={handleMapFeaturePress}>
				<MapboxGL.LineLayer
					id={lineId}
					style={{
						lineColor: color,
						lineWidth: 1.5,
						lineOpacity: 0.7,
					}}
				/>
				<MapboxGL.SymbolLayer
					id={labelId}
					style={{
						symbolPlacement: "line",
						textField: ["get", "name"],
						textSize: 15,
						textColor: color,
						textHaloWidth: 3,
						textHaloColor: "#fff",
						textAllowOverlap: true,
						textFont: ["Open Sans Bold"],
						textIgnorePlacement: true,
						textOpacity: 0.7,
					}}
				/>
				{hasArrow && (
					<MapboxGL.SymbolLayer
						id={arrowId}
						style={{
							symbolPlacement: "line",
							symbolSpacing: 200,
							textField: "▶",
							textSize: 30,
							textColor: color,
							textHaloWidth: 0,
							textHaloColor: "#ffffff",
							textOpacity: 1,
						}}
					/>
				)}
			</MapboxGL.ShapeSource>
		);
	};

	return (
		<View style={[styles.container, { backgroundColor }]}>
			{/* Station Dropdown */}
			<View style={styles.selectContainer}>
				<DropDownPicker
					open={open}
					value={selectedStation?.osmId || null}
					items={dropdownItems}
					setOpen={setOpen}
					setValue={(callback) => {
						const osmId = typeof callback === "function" ? callback(selectedStation?.osmId) : callback;
						handleStationChange(osmId);
					}}
					setItems={() => {}}
					placeholder='Choisir une station'
					style={styles.dropdown}
					dropDownContainerStyle={styles.dropdownContainer}
				/>
			</View>
			{/* Modals */}
			<FilterModal
				visible={filterModal.visible}
				onClose={filterModal.closeModal}
				showLifts={showLifts}
				setShowLifts={setShowLifts}
				showRuns={showRuns}
				setShowRuns={setShowRuns}
				showNovice={showNovice}
				setShowNovice={setShowNovice}
				showEasy={showEasy}
				setShowEasy={setShowEasy}
				showIntermediate={showIntermediate}
				setShowIntermediate={setShowIntermediate}
				showExpert={showExpert}
				setShowExpert={setShowExpert}
			/>
			<InfoModal
				visible={infoModalVisible}
				onClose={() => setInfoModalVisible(false)}
				selectedFeature={selectedFeature}
				onTravel={() => {
					setInfoModalVisible(false);
					setTravelModalVisible(true);
				}}
			/>
			<TravelModal
				visible={travelModalVisible}
				onClose={() => setTravelModalVisible(false)}
				calculateRoute={onCalculateRoute}
				travelFilters={travelFilters}
				setTravelFilters={setTravelFilters}
			/>

			<SearchModal
				visible={searchModalVisible}
				onClose={() => setSearchModalVisible(false)}
				searchQuery={searchQuery}
				handleSearch={handleSearch}
				isSearching={isSearching || hookIsSearching}
				searchResults={searchResults}
				onSearchItemPress={handleSearchItemPress}
			/>
			{/* Search Bar */}
			<View style={styles.searchBarContainer}>
				<TouchableOpacity style={styles.searchBar} onPress={() => setSearchModalVisible(true)}>
					<Text style={styles.searchBarText}>Search...</Text>
				</TouchableOpacity>
			</View>
			{/* SkiMap Component */}
			<SkiMap
				cameraCenter={cameraCenter}
				is3D={is3D}
				userLocation={userLocation}
				mapCameraRef={mapCameraRef}
				selectedFeature={selectedFeature}
				routeFeature={routeFeature}
				stationGeoJson={stationGeoJson}
				assets={assets}
				onMapDidFinishRendering={onMapDidFinishRendering}
				onMapFeaturePress={handleMapFeaturePress}
				runLayers={runLayers}
			/>
			{/* Rounded Buttons */}
			<View style={styles.centerCameraBtnContainer}>
				<RoundedButton onPress={centerCameraOnStation}>
					<FontAwesome6 name='arrows-to-circle' size={24} color='black' />
				</RoundedButton>
			</View>
			<View style={styles.userCenterBtnContainer}>
				<RoundedButton onPress={centerCameraOnUser}>
					<Ionicons name='locate' size={24} color='black' />
				</RoundedButton>
			</View>
			<View style={styles.mapStyleBtnContainer}>
				<RoundedButton onPress={toggleMapStyle}>
					<Text style={styles.mapStyleBtnText}>{is3D ? "3D" : "2D"}</Text>
				</RoundedButton>
			</View>
			<View style={styles.filterBtnContainer}>
				<RoundedButton onPress={filterModal.openModal}>
					<Text style={styles.filterBtnText}>≡</Text>
				</RoundedButton>
			</View>
			{/* Collapsible Route Sheet */}
			{routeSegments.length > 0 && (
				<CollapsibleRouteSheet
					segments={routeSegments}
					open={sheetOpen}
					onToggle={() => setSheetOpen((prev) => !prev)}
					onCancelTravel={onCancelTravel}
				/>
			)}
		</View>
	);
}
