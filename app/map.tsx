import MapboxGL from "@rnmapbox/maps";
import { useEffect, useState, useRef, useMemo } from "react";
import { View, TouchableOpacity, Text, ScrollView, Modal, Pressable, TextInput, ActivityIndicator } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import DropDownPicker from "react-native-dropdown-picker";
import Checkbox from "expo-checkbox";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Hooks for data fetching
import { useStations } from "@/hooks/useStations";
import { useStationData } from "@/hooks/useStationData";

// Styles
import styles from "@/styles/mapStyles";
import {
	buildGraph,
	computeShortestPath,
	findClosestNode,
	generateSegmentedRoutes,
	getGraph,
	preprocessFeatures,
} from "@/hooks/calculateRoute";
import { CollapsibleRouteSheet } from "@/components/CollapsibleRouteSheet";

export default function MapScreen() {
	const backgroundColor = useThemeColor({}, "background");
	const mapCameraRef = useRef<any>(null);

	// New state for the travel modal
	const [travelModalVisible, setTravelModalVisible] = useState(false);

	// MOCKED user location (center of La Plagne)
	const [userLocation] = useState<[number, number]>([6.6771972, 45.5052883]);

	// New state for search and map loading
	const [isSearching, setIsSearching] = useState(false);
	const [mapLoading, setMapLoading] = useState(true);

	// New state for the calculated route (green layer)
	const [routeFeature, setRouteFeature] = useState<any>(null);

	// 1. Set the Mapbox token on mount
	useEffect(() => {
		MapboxGL.setAccessToken("pk.eyJ1IjoiYmFwdGxhYiIsImEiOiJjbHdvcTEzc3cxM2NjMmlyem11ZHF4MWh2In0.KmT1eerA8ZSQaREGnkaN2A");
	}, []);

	// 2. Station fetching logic via custom hooks
	const { stations, dropdownItems, selectedStation, setSelectedStation } = useStations();
	const { stationData, stationCoordinates, assets } = useStationData(selectedStation);

	// 3. Local state for search and combined list
	const [searchQuery, setSearchQuery] = useState("");
	const [combinedList, setCombinedList] = useState<any[]>([]);
	const [searchResults, setSearchResults] = useState<any[]>([]);
	const [open, setOpen] = useState(false);
	const [is3D, setIs3D] = useState(false);
	const toggleMapStyle = () => setIs3D((prev) => !prev);

	const [showFilterModal, setShowFilterModal] = useState(false);
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

	// A boolean or enum to control the bottom sheet’s open/closed state.
	const [sheetOpen, setSheetOpen] = useState(false);

	// 4. Camera center (default to station if available)
	const cameraCenter = selectedStation ? [selectedStation.longitude, selectedStation.latitude] : [6.7483232, 45.5203648];

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

	// New: Center camera on user location
	const centerCameraOnUser = () => {
		mapCameraRef.current?.setCamera({
			centerCoordinate: userLocation,
			zoomLevel: 15,
			animationDuration: 1000,
		});
	};

	// 5. Handle dropdown changes
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

	// 6. Search logic with simulated delay and loading indicator
	const handleSearch = (text: string) => {
		setSearchQuery(text);
		if (!text) {
			setSearchResults([]);
			setIsSearching(false);
			return;
		}
		setIsSearching(true);
		const lowerText = text.toLowerCase();
		setTimeout(() => {
			const filtered = combinedList.filter((item) => {
				const name = item.properties?.name || "";
				return name.toLowerCase().includes(lowerText);
			});
			setSearchResults(filtered);
			setIsSearching(false);
		}, 300);
	};

	// 7. Clear storage (if needed)
	const clearStorage = async () => {
		try {
			await AsyncStorage.clear();
		} catch (error) {
			console.error("Error clearing AsyncStorage:", error);
		}
	};

	// 8. Extract runs and lifts from assets
	const runsEasy = assets?.runs?.easy || { type: "FeatureCollection", features: [] };
	const runsNovice = assets?.runs?.novice || { type: "FeatureCollection", features: [] };
	const runsIntermediate = assets?.runs?.intermediate || { type: "FeatureCollection", features: [] };
	const runsExpert = assets?.runs?.expert || { type: "FeatureCollection", features: [] };
	const runsNull = assets?.runs?.nullDiff || { type: "FeatureCollection", features: [] };
	const runsUnknown = assets?.runs?.unknown || { type: "FeatureCollection", features: [] };

	const liftLines = assets?.lifts?.liftLines || { type: "FeatureCollection", features: [] };
	const liftPylonPoints = assets?.lifts?.liftPylonPoints || { type: "FeatureCollection", features: [] };
	const liftStartPoints = assets?.lifts?.liftStartPoints || { type: "FeatureCollection", features: [] };

	// 9. Combine runs & lifts for search, using a composite key (category + name) for deduplication
	useEffect(() => {
		const allRuns = [
			...runsEasy.features,
			...runsNovice.features,
			...runsIntermediate.features,
			...runsExpert.features,
			...runsNull.features,
			...runsUnknown.features,
		].map((feature) => ({
			...feature,
			category: "run",
		}));
		const allLifts = [...liftLines.features, ...liftStartPoints.features].map((feature) => ({
			...feature,
			category: "lift",
		}));
		const combined = [...allRuns, ...allLifts];
		const uniqueMap = new Map();
		combined.forEach((feature) => {
			const featureCategory = feature.category || feature.properties?.category;
			const featureName = feature.properties?.name;
			const key = featureCategory + "_" + featureName;
			if (featureName && !uniqueMap.has(key)) {
				uniqueMap.set(key, feature);
			}
		});
		setCombinedList(Array.from(uniqueMap.values()));
	}, [runsEasy, runsNovice, runsIntermediate, runsExpert, runsNull, runsUnknown, liftLines, liftStartPoints]);

	// Hide map loading overlay when combined list is ready
	useEffect(() => {
		if (combinedList.length > 0) {
			setMapLoading(false);
		}
	}, [combinedList]);

	// 10. Toggle run difficulties when showRuns is toggled
	useEffect(() => {
		if (!showRuns) {
			setShowNovice(false);
			setShowEasy(false);
			setShowIntermediate(false);
			setShowExpert(false);
		} else {
			setShowNovice(true);
			setShowEasy(true);
			setShowIntermediate(true);
			setShowExpert(true);
		}
	}, [showRuns]);

	// 11. Station boundary
	const stationGeoJson = stationCoordinates ?? {
		type: "FeatureCollection",
		features: [],
	};

	// 13. Feature press on the map calls handleFeatureSelect
	const handleFeaturePress = (e: any) => {
		const { features } = e;
		if (!features || !features[0]) return;
		handleFeatureSelect(features[0]);
	};

	// 14. Reusable function for rendering run layers
	const runLayers = (shapeId: string, lineId: string, color: string, labelId: string, arrowId: string, shapeData: any) => {
		const hasArrow = shapeData.features.every((feature: any) => !["unknown", "flat"].includes(feature.properties.orientation));
		return (
			<MapboxGL.ShapeSource id={shapeId} shape={shapeData} onPress={handleFeaturePress}>
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

	// 15. Lift layers
	const liftLineLayers = (
		<MapboxGL.ShapeSource id='liftLineSource' shape={liftLines} onPress={handleFeaturePress}>
			<MapboxGL.LineLayer
				id='liftLineLayer'
				style={{
					lineColor: "black",
					lineWidth: 2.5,
					lineDasharray: [2, 2],
					lineOpacity: 0.7,
				}}
			/>
			<MapboxGL.SymbolLayer
				id='liftLineLabelLayer'
				style={{
					symbolPlacement: "line",
					textField: ["get", "name"],
					textSize: 15,
					textColor: "#000",
					textHaloWidth: 3,
					textHaloColor: "#fff",
					textFont: ["Open Sans Bold"],
					textAllowOverlap: true,
					textIgnorePlacement: true,
					textOpacity: 0.7,
				}}
			/>
			<MapboxGL.SymbolLayer
				id='liftLineArrowLayer'
				style={{
					symbolPlacement: "line",
					symbolSpacing: 200,
					textField: "▶",
					textSize: 30,
					textColor: "black",
					textHaloWidth: 0,
					textHaloColor: "#ffffff",
					textOpacity: 1,
				}}
			/>
		</MapboxGL.ShapeSource>
	);

	// 16. Filter Modal (kept with dark overlay)
	const openFilters = () => setShowFilterModal(true);
	const renderFilterModal = () => (
		<Modal visible={showFilterModal} transparent animationType='slide' onRequestClose={() => setShowFilterModal(false)}>
			<Pressable style={styles.modalOverlay} onPress={() => setShowFilterModal(false)}>
				<View style={styles.modalContainer}>
					<Pressable onPress={(e) => e.stopPropagation()} style={{ flex: 1 }}>
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
					</Pressable>
				</View>
			</Pressable>
		</Modal>
	);

	// 17. Info Modal with a "Travel to" button at the bottom.
	// The overlay is overridden with a transparent background for better map visibility.
	const renderInfoModal = () => {
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
			<Modal visible={infoModalVisible} transparent animationType='slide' onRequestClose={() => setInfoModalVisible(false)}>
				<Pressable style={[styles.modalOverlay, { backgroundColor: "transparent" }]} onPress={() => setInfoModalVisible(false)}>
					<View style={styles.modalContainer}>
						<Pressable onPress={(e) => e.stopPropagation()} style={{ flex: 1 }}>
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
								<TouchableOpacity
									style={{ padding: 10, backgroundColor: "#ddd", borderRadius: 5 }}
									onPress={() => {
										setInfoModalVisible(false);
										setTravelModalVisible(true);
									}}
								>
									<Text>Travel to</Text>
								</TouchableOpacity>
							</View>
						</Pressable>
					</View>
				</Pressable>
			</Modal>
		);
	};

	// 18. Travel Modal with two parts: top 66% for filters, bottom for two buttons.
	const renderTravelModal = () => (
		<Modal visible={travelModalVisible} transparent animationType='slide' onRequestClose={() => setTravelModalVisible(false)}>
			<Pressable style={[styles.modalOverlay, { backgroundColor: "transparent" }]} onPress={() => setTravelModalVisible(false)}>
				<View style={[styles.modalContainer, { height: "45%" }]}>
					<Pressable onPress={(e) => e.stopPropagation()} style={{ flex: 1 }}>
						{/* Top part: your filters */}
						<View style={{ flex: 2 }}>
							<ScrollView>
								<Text style={styles.modalTitle}>Travel Filters</Text>
								{/* ... all your checkboxes ... */}
							</ScrollView>
						</View>

						{/* Bottom part: route buttons + cancel */}
						<View
							style={{
								flex: 1,
								flexDirection: "row",
								justifyContent: "space-around",
								alignItems: "center",
							}}
						>
							<TouchableOpacity
								style={{
									padding: 10,
									backgroundColor: "#ddd",
									borderRadius: 5,
									width: "28%",
									alignItems: "center",
								}}
								onPress={() => {
									// Calculate and display route for "Travel to Top"
									calculateRoute("top");
								}}
							>
								<Text>Travel to Top</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={{
									padding: 10,
									backgroundColor: "#ddd",
									borderRadius: 5,
									width: "28%",
									alignItems: "center",
								}}
								onPress={() => {
									// Calculate and display route for "Travel to Bottom"
									calculateRoute("bottom");
								}}
							>
								<Text>Travel to Bottom</Text>
							</TouchableOpacity>
						</View>
					</Pressable>
				</View>
			</Pressable>
		</Modal>
	);

	// 19. Consolidated feature selection method used by both search and map taps.
	// It now also compares the category to ensure that if two features share the same name,
	// the correct one (run vs. lift) is selected.
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
		// Clear any previous route and blue highlight
		setRouteFeature(null);
		setSelectedFeature(selected);
		setInfoModalVisible(true);
	};

	// 20. Update both search and map tap handlers to call handleFeatureSelect
	const handleSearchItemPress = (feature: any) => {
		handleFeatureSelect(feature);
	};

	const handleMapFeaturePress = (e: any) => {
		const { features } = e;
		if (!features || !features[0]) return;
		handleFeatureSelect(features[0]);
	};

	// 2. Preprocess the combinedList into simplified edges (top->bottom for runs, bottom->top for lifts)
	const simplifiedEdges = useMemo(() => {
		return preprocessFeatures(combinedList);
	}, [combinedList]);

	// 3. Build or get the graph from those edges
	const memoizedGraph = useMemo(() => {
		if (simplifiedEdges.length > 0) {
			return getGraph(simplifiedEdges);
		}
		return null;
	}, [simplifiedEdges]);

	// 4. The “calculateRoute” function
	function calculateRoute(direction: "top" | "bottom") {
		if (!selectedFeature || !memoizedGraph) return;
		let destinationCoord: [number, number] | null = null;

		if (selectedFeature.geometry.type === "LineString") {
			const coords = selectedFeature.geometry.coordinates;
			if (direction === "top") {
				destinationCoord = coords[0];
			} else {
				destinationCoord = coords[coords.length - 1];
			}
		} else if (selectedFeature.geometry.type === "Point") {
			destinationCoord = selectedFeature.geometry.coordinates;
		}
		if (!destinationCoord) return;

		// Find closest nodes in the graph
		const startNodeId = findClosestNode(memoizedGraph, userLocation);
		const endNodeId = findClosestNode(memoizedGraph, destinationCoord);

		// Compute path
		const path = computeShortestPath(memoizedGraph, startNodeId, endNodeId);
		if (!path || path.length === 0) {
			console.error("No path found");
			return;
		}

		// Generate segmented routes instead of one continuous line.
		const segmentedGeoJSON = generateSegmentedRoutes(memoizedGraph, path);
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

	// 22. Rendering the MapScreen
	return (
		<View style={[styles.container, { backgroundColor }]}>
			{/* Search Bar */}
			<View style={styles.searchBarContainer}>
				<TouchableOpacity style={styles.searchBar} onPress={() => setSearchModalVisible(true)}>
					<Text style={styles.searchBarText}>Search...</Text>
				</TouchableOpacity>
			</View>
			<MapboxGL.MapView
				style={styles.map}
				styleURL='mapbox://styles/baptlab/cm7kbr8wz008y01sb2hxsc5g9'
				onDidFinishRenderingMapFully={() => setMapLoading(false)}
			>
				{/* Provide icons to Mapbox */}
				<MapboxGL.Images
					images={{
						chair_lift: require("../assets/mapIcons/chair_lift.png"),
						drag_lift: require("../assets/mapIcons/platter.png"),
						rope_tow: require("../assets/mapIcons/rope_tow.png"),
						magic_carpet: require("../assets/mapIcons/magic_carpet.png"),
						gondola: require("../assets/mapIcons/cable_car.png"),
						zip_line: require("../assets/mapIcons/zip_line.png"),
						platter: require("../assets/mapIcons/platter.png"),
						unknown: require("../assets/mapIcons/unknown.png"),
					}}
				/>

				{is3D && (
					<MapboxGL.RasterDemSource id='mapbox-dem' url='mapbox://mapbox.mapbox-terrain-dem-v1' tileSize={512} maxZoom={4.5}>
						<MapboxGL.Terrain sourceID='mapbox-dem' exaggeration={1.75} />
					</MapboxGL.RasterDemSource>
				)}

				{/* Camera */}
				<MapboxGL.Camera ref={mapCameraRef} zoomLevel={11} centerCoordinate={cameraCenter} pitch={is3D ? 70 : 0} />

				{/* User Location (blue dot) */}
				<MapboxGL.PointAnnotation id='userLocation' coordinate={userLocation}>
					<View
						style={{
							width: 20,
							height: 20,
							borderRadius: 10,
							backgroundColor: "blue",
							borderWidth: 3,
							borderColor: "#fff",
						}}
					/>
				</MapboxGL.PointAnnotation>

				{/* Highlight selected run/lift (blue outline) */}
				{selectedFeature && (
					<MapboxGL.ShapeSource id='highlightSource' shape={{ type: "FeatureCollection", features: [selectedFeature] }}>
						<MapboxGL.LineLayer
							id='highlightLayer'
							style={{
								lineColor: "blue",
								lineWidth: 4,
								lineOpacity: 1,
							}}
						/>
					</MapboxGL.ShapeSource>
				)}

				{/* Render calculated route (green line) if available */}
				{routeFeature && (
					<MapboxGL.ShapeSource id='routeSource' shape={routeFeature}>
						<MapboxGL.LineLayer
							id='routeLayer'
							style={{
								lineColor: ["get", "color"],
								lineWidth: 4,
								lineOpacity: 1,
								// Dotted line for bridging segments, solid for run/lift segments.
								lineDasharray: [
									"match",
									["get", "segmentType"],
									"bridging",
									[2, 2], // dotted
									[1, 0], // solid
								],
							}}
						/>
					</MapboxGL.ShapeSource>
				)}

				{/* Station boundary */}
				{stationGeoJson.features.length > 0 && (
					<MapboxGL.ShapeSource id='stationSource' shape={stationGeoJson}>
						<MapboxGL.LineLayer
							id='stationLayer'
							style={{
								lineColor: "#1E90FF",
								lineWidth: 3.5,
								lineOpacity: 0.5,
								lineJoin: "round",
								lineCap: "round",
							}}
						/>
						<MapboxGL.SymbolLayer
							id='stationLabelLayer'
							style={{
								symbolPlacement: "line",
								textField: ["get", "domain"],
								textSize: 16,
								textColor: "#1E90FF",
								textHaloWidth: 2,
								textHaloColor: "#ffffff",
								textAllowOverlap: false,
								textFont: ["Open Sans Bold"],
								textOpacity: 1,
							}}
						/>
					</MapboxGL.ShapeSource>
				)}

				{/* Lift lines */}
				{showLifts && liftLines.features.length > 0 && liftLineLayers}

				{/* Lift start points (PNG icons) */}
				{showLifts && liftStartPoints.features.length > 0 && (
					<MapboxGL.ShapeSource id='liftStartPointsSource' shape={liftStartPoints} onPress={handleMapFeaturePress}>
						<MapboxGL.SymbolLayer
							id='liftStartPointsLayer'
							minZoomLevel={13}
							style={{
								iconImage: [
									"match",
									["get", "aerialway", ["get", "tags"]],
									"chair_lift",
									"chair_lift",
									"drag_lift",
									"drag_lift",
									"rope_tow",
									"rope_tow",
									"magic_carpet",
									"magic_carpet",
									"gondola",
									"gondola",
									"zip_line",
									"zip_line",
									"platter",
									"platter",
									"unknown",
								],
								iconSize: 0.07,
								symbolPlacement: "point",
								iconAllowOverlap: true,
								iconIgnorePlacement: true,
								iconPitchAlignment: "viewport",
								iconRotationAlignment: "viewport",
								iconAnchor: "bottom",
							}}
							onPress={handleMapFeaturePress}
						/>
					</MapboxGL.ShapeSource>
				)}

				{/* Runs by difficulty */}
				{showRuns &&
					showEasy &&
					runsEasy.features.length > 0 &&
					runLayers("runEasySource", "runEasyLayer", "blue", "runEasyLabelLayer", "runEasyArrowLayer", runsEasy)}

				{showRuns &&
					showNovice &&
					runsNovice.features.length > 0 &&
					runLayers("runNoviceSource", "runNoviceLayer", "green", "runNoviceLabelLayer", "runNoviceArrowLayer", runsNovice)}

				{showRuns &&
					showIntermediate &&
					runsIntermediate.features.length > 0 &&
					runLayers(
						"runIntermediateSource",
						"runIntermediateLayer",
						"red",
						"runIntermediateLabelLayer",
						"runIntermediateArrowLayer",
						runsIntermediate
					)}

				{showRuns &&
					showExpert &&
					runsExpert.features.length > 0 &&
					runLayers("runExpertSource", "runExpertLayer", "black", "runExpertLabelLayer", "runExpertArrowLayer", runsExpert)}

				{showRuns &&
					runsNull.features.length > 0 &&
					runLayers("runNullSource", "runNullLayer", "grey", "runNullLabelLayer", "runNullArrowLayer", runsNull)}

				{showRuns &&
					runsUnknown.features.length > 0 &&
					runLayers("runUnknownSource", "runUnknownLayer", "grey", "runUnknownLabelLayer", "runUnknownArrowLayer", runsUnknown)}
			</MapboxGL.MapView>
			{/* Overlay for map (and runs/lifts) loading */}
			{mapLoading && (
				<View style={styles.mapLoadingOverlay}>
					<View style={styles.mapLoadingContainer}>
						<ActivityIndicator size='small' color='#000' />
						<Text>Loading...</Text>
					</View>
				</View>
			)}
			{/* Dropdown for station selection */}
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
			{/* Center camera on station button */}
			<View style={styles.centerCameraBtnContainer}>
				<TouchableOpacity style={styles.centerCameraBtn} onPress={centerCameraOnStation}>
					<FontAwesome6 name='arrows-to-circle' size={24} color='black' />
				</TouchableOpacity>
			</View>
			{/* Center camera on user button */}
			<View style={styles.userCenterBtnContainer}>
				<TouchableOpacity style={styles.userCenterBtn} onPress={centerCameraOnUser}>
					<Ionicons name='locate' size={24} color='black' />
				</TouchableOpacity>
			</View>
			{/* 2D / 3D Toggle */}
			<View style={styles.mapStyleBtnContainer}>
				<TouchableOpacity style={styles.mapStyleBtn} onPress={toggleMapStyle}>
					<Text style={styles.mapStyleBtnText}>{is3D ? "3D" : "2D"}</Text>
				</TouchableOpacity>
			</View>
			{/* Filter Button */}
			<View style={styles.filterBtnContainer}>
				<TouchableOpacity style={styles.filterBtn} onPress={openFilters}>
					<Text style={styles.filterBtnText}>≡</Text>
				</TouchableOpacity>
			</View>
			{renderFilterModal()}
			{renderInfoModal()}
			{renderTravelModal()}
			// In your MapScreen return(...) after the MapboxGL.MapView:
			{routeSegments.length > 0 && (
				<CollapsibleRouteSheet
					segments={routeSegments}
					open={sheetOpen}
					onToggle={() => setSheetOpen((prev) => !prev)}
					onCancelTravel={onCancelTravel} // pass the cancel function
				/>
			)}
			{/* Search Modal */}
			<Modal
				visible={searchModalVisible}
				animationType='slide'
				transparent={false}
				onRequestClose={() => setSearchModalVisible(false)}
			>
				<View style={styles.searchModalContainer}>
					<View style={styles.searchModalHeader}>
						<TouchableOpacity onPress={() => setSearchModalVisible(false)}>
							<Ionicons name='arrow-back' size={24} color='black' />
						</TouchableOpacity>
						<TextInput
							style={styles.searchModalInput}
							placeholder='Search...'
							value={searchQuery}
							onChangeText={handleSearch}
						/>
					</View>
					{isSearching && (
						<View style={{ padding: 10, alignItems: "center" }}>
							<ActivityIndicator size='small' color='#000' />
						</View>
					)}
					{!isSearching && searchResults.length === 0 && searchQuery !== "" && (
						<View style={{ padding: 10, alignItems: "center" }}>
							<Text>No results found</Text>
						</View>
					)}
					<ScrollView style={{ flex: 1 }}>
						{searchResults.map((item, idx) => (
							<TouchableOpacity key={idx} style={{ margin: 10 }} onPress={() => handleSearchItemPress(item)}>
								<Text>
									{item.properties?.name} ({item.category})
								</Text>
							</TouchableOpacity>
						))}
					</ScrollView>
				</View>
			</Modal>
		</View>
	);
}
