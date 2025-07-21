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
import MapStyleConfig from "@/constants/map/mapStyles";
import {
	calculateRouteForFeature,
	getGraph,
	getGraphNodesAsGeoJSON,
	preprocessFeatures,
} from "@/hooks/calculateRoute";
import { CollapsibleRouteSheet } from "@/components/Modals/CollapsibleRouteSheet";
import { RoundedButton } from "@/components/btns/RoundedButton";
import { SkiMap } from "@/components/map/SkiMap";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useSkiMap } from "@/hooks/useSkiMap";

//Hooks
import {
	centerOnStation,
	centerOnUser,
	resetToStation2D,
	setCameraToCoordinates,
} from "@/hooks/useCamera";
import { LoadingModal } from "@/components/Modals/LoadingModal";
import { useUserLocation } from "@/hooks/useUserLocation";
import { mapVariables } from "@/constants/map/mapConfigVariables";

export default function map() {
	const backgroundColor = useThemeColor({}, "background");
	const mapCameraRef = useRef<any>(null);

	// State for modals and map loading
	const [travelModalVisible, setTravelModalVisible] = useState(false);
	const [isSearching, setIsSearching] = useState(false);
	const [routeFeature, setRouteFeature] = useState<any>(null);
	const [mapReady, setMapReady] = useState(false);

	// 1rst data fetching
	// This hook fetches the list of stations and their basic data
	const {
		stations,
		dropdownItems,
		selectedStation,
		setSelectedStation,
		isLoading: stationsLoading,
	} = useStations();

	// 2nd data fetching for station-specific data
	// This hook fetches station data, coordinates, and assets
	const {
		stationCities,
		stationCoordinates,
		assets,
		isLoading: stationDataLoading,
	} = useStationData(selectedStation);

	const loading = stationsLoading || stationDataLoading || !mapReady;

	// Extract search/filter & graph logic from useSkiMap hook
	const {
		searchQuery,
		setSearchQuery,
		searchResults,
		isSearching: hookIsSearching,
		handleSearch,
		combinedList,
	} = useSkiMap(assets);

	// Local UI state
	const [open, setOpen] = useState(false);
	const [is3D, setIs3D] = useState(true);
	const toggleMapStyle = () => setIs3D((prev) => !prev);
	const filterModal = useModal();

	// Toggles for runs and lifts display
	const [showRuns, setShowRuns] = useState(true);
	const [showLifts, setShowLifts] = useState(true);
	const [showNovice, setShowNovice] = useState(true);
	const [showEasy, setShowEasy] = useState(true);
	const [showIntermediate, setShowIntermediate] = useState(true);
	const [showExpert, setShowExpert] = useState(true);
	const [showDestinationPoint, setShowDestinationPoint] = useState(false);
	const [destinationCoord, setDestinationCoord] = useState<number[] | null>(
		null
	);

	const [infoModalVisible, setInfoModalVisible] = useState(false);
	const [selectedFeature, setSelectedFeature] = useState<any>(null);
	const [searchModalVisible, setSearchModalVisible] = useState(false);
	const [routeSegments, setRouteSegments] = useState<any[]>([]);
	const [sheetOpen, setSheetOpen] = useState(false);
	const [gpsMode, setGpsMode] = useState(false);

	const [travelFilters, setTravelFilters] = useState({
		runs: true,
		lifts: true,
		novice: true,
		easy: true,
		intermediate: true,
		expert: true,
	});

	const stationGeoJson: { type: string; features: any[] } =
		stationCoordinates ?? { type: "FeatureCollection", features: [] };

	useEffect(() => {
		if (showDestinationPoint && destinationCoord) {
			console.log("showDestinationPoint : ", showDestinationPoint);
			console.log("destinationCoord : ", destinationCoord);
			console.log("destinationCoord →", destinationCoord);
		}
	}, [showDestinationPoint, destinationCoord]);

	// Set Mapbox token on mount
	useEffect(() => {
		clearStorage();
		MapboxGL.setAccessToken(process.env.MAPBOX_ACCESS_TOKEN);
	}, []);

	//For testing purposes, the data are usually stored in the cache
	const clearStorage = async () => {
		try {
			await AsyncStorage.clear();
		} catch (error) {
			console.error("Error clearing AsyncStorage:", error);
		}
	};

	// Real user location (will be set once we fetch it, default to station)
	const { location: userLocation, error: locationError } = useUserLocation({
		distanceFilter: 10, // only update if moved 10m, tweak to your liking
		interval: 5000, // poll every 5s on Android
	});

	// Calculate camera center (default to station if available)
	const cameraCenter = selectedStation
		? [Number(selectedStation.longitude), Number(selectedStation?.latitude)]
		: [6.7483232, 45.5203648];

	// Handle dropdown changes (Station Select)
	const handleStationChange = (osmId: string) => {
		const station = stations.find((s) => String(s.osmId) === String(osmId));
		if (station) {
			setSelectedStation(station);
		} else {
			console.warn(`Station with osmId ${osmId} not found.`);
		}
	};

	function lockingRoute() {
		setSheetOpen(false);
		setGpsMode(true);
	}

	const handleFeatureSelect = (feature: any) => {
		console.log("handleFeatureSelect called with feature:", feature);
		setSearchModalVisible(false);

		// 1) on récupère la run complète si possible
		// 1) on récupère la run complète en cherchant d'abord par nom, puis par id
		const fullRun = combinedList.find((item) => item.id === feature.id);

		console.log("Full run found:", fullRun);
		const highlightGeom = fullRun || feature;

		// 2) on calcule la coordonnée pour zoomer sur le segment cliqué
		let targetCoord: number[] | null = null;
		if (feature.geometry.type === "LineString") {
			const coords = feature.geometry.coordinates;
			targetCoord = coords[Math.floor(coords.length / 2)];
		} else if (feature.geometry.type === "Point") {
			targetCoord = feature.geometry.coordinates;
		} else {
			return;
		}

		// 3) on surligne la géométrie complète (run entière ou route)
		setSelectedFeature(highlightGeom);
		setRouteFeature(null);

		// 4) on centre la caméra sur le segment cliqué
		if (mapCameraRef.current && targetCoord) {
			setCameraToCoordinates(mapCameraRef, targetCoord);
		}
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
	const { simplifiedEdges, intersectionPoints } = useMemo(
		() => preprocessFeatures(combinedList),
		[combinedList]
	);
	const memoizedGraph = useMemo(
		() => (simplifiedEdges.length > 0 ? getGraph(simplifiedEdges) : null),
		[simplifiedEdges]
	);
	const graphNodesGeoJson = useMemo(
		() =>
			memoizedGraph
				? getGraphNodesAsGeoJSON(memoizedGraph, intersectionPoints)
				: null,
		[memoizedGraph, intersectionPoints]
	);

	function onCalculateRoute(direction: "top" | "bottom") {
		if (!selectedFeature) return;
		const result = calculateRouteForFeature(
			selectedFeature,
			direction,
			userLocation,
			combinedList,
			travelFilters
		);
		if (!result) {
			console.error("Route calculation failed.");
			return;
		}
		const { segmentedGeoJSON, destinationCoord } = result;
		console.log("🏁 Arrival destination:", destinationCoord);
		setRouteFeature(segmentedGeoJSON);
		setCameraToCoordinates(mapCameraRef, destinationCoord);
		setSelectedFeature(null);
		setTravelModalVisible(false);
		setRouteSegments(segmentedGeoJSON.features);
		setSheetOpen(true);

		setDestinationCoord(destinationCoord);
		setShowDestinationPoint(true);
	}

	function onCancelTravel() {
		setRouteSegments([]);
		setRouteFeature(null);
		setSheetOpen(false);
		setGpsMode(false);
		// Reset camera: center on station, zoom out, and remove tilt
		resetToStation2D(
			mapCameraRef,
			Number(selectedStation?.longitude),
			Number(selectedStation?.latitude),
			mapVariables.DEFAULT_ZOOM_LEVEL,
			mapVariables.RECENTERING_ZOOM_DURATION
		);

		setShowDestinationPoint(false);
		setDestinationCoord(null);
	}

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
						const osmId =
							typeof callback === "function"
								? callback(selectedStation?.osmId)
								: callback;
						handleStationChange(osmId);
					}}
					setItems={() => {}}
					placeholder='Choisir une station'
					style={styles.dropdown}
					dropDownContainerStyle={styles.dropdownContainer}
				/>
			</View>
			{/* Modals */}
			<LoadingModal visible={loading} onClose={() => {}} />
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
				<TouchableOpacity
					style={styles.searchBar}
					onPress={() => setSearchModalVisible(true)}
				>
					<Text style={styles.searchBarText}>
						Arpette, La Roche, etc.
					</Text>
				</TouchableOpacity>
			</View>
			{/* SkiMap Component with filter props */}
			<SkiMap
				graphNodesGeoJson={graphNodesGeoJson}
				cameraCenter={cameraCenter}
				is3D={is3D}
				onMapLoad={() => {
					setMapReady(true);
					if (selectedStation) {
						mapCameraRef.current?.setCamera({
							centerCoordinate: [
								Number(selectedStation.longitude),
								Number(selectedStation.latitude),
							],
							zoomLevel: mapVariables.DEFAULT_ZOOM_LEVEL,
							pitch: is3D ? mapVariables.DEFAULT_PITCH_3D : 0,
							animationMode:
								mapVariables.RECENTERING_ZOOM_ANIMATION_MODE,
							animationDuration:
								mapVariables.RECENTERING_ZOOM_DURATION,
						});
					}
				}}
				userLocation={userLocation}
				mapCameraRef={mapCameraRef}
				selectedFeature={selectedFeature}
				routeFeature={routeFeature}
				stationGeoJson={stationGeoJson}
				assets={assets}
				showDestinationPoint={showDestinationPoint}
				destinationCoord={destinationCoord}
				onMapFeaturePress={handleMapFeaturePress}
				showRuns={showRuns}
				showLifts={showLifts}
				showNovice={showNovice}
				showEasy={showEasy}
				stationCities={stationCities}
				showIntermediate={showIntermediate}
				showExpert={showExpert}
				gpsMode={gpsMode} // pass the new prop
			/>
			{/* Rounded Buttons */}
			<View style={styles.centerCameraBtnContainer}>
				<RoundedButton
					onPress={() =>
						centerOnStation(
							mapCameraRef,
							Number(selectedStation?.longitude),
							Number(selectedStation?.latitude)
						)
					}
				>
					<FontAwesome6
						name='arrows-to-circle'
						size={24}
						color='black'
					/>
				</RoundedButton>
			</View>

			<View style={styles.userCenterBtnContainer}>
				<RoundedButton
					disabled={!userLocation}
					onPress={() => {
						console.log(
							"centering on user location : ",
							userLocation
						);
						if (!userLocation) return;
						mapCameraRef.current?.setCamera({
							centerCoordinate: userLocation,
							zoomLevel: mapVariables.BTN_ZOOM_LEVEL,
							animationDuration: mapVariables.BTN_ZOOM_DURATION,
						});
					}}
				>
					<Ionicons
						name='locate'
						size={24}
						color={userLocation ? "black" : "gray"}
					/>
				</RoundedButton>
			</View>
			<View style={styles.mapStyleBtnContainer}>
				<RoundedButton onPress={toggleMapStyle}>
					<Text style={styles.mapStyleBtnText}>
						{is3D ? "3D" : "2D"}
					</Text>
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
					lockingRoute={lockingRoute}
				/>
			)}
		</View>
	);
}
