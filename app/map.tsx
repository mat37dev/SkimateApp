import MapboxGL from "@rnmapbox/maps";
import { useEffect, useState, useRef, useMemo } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import DropDownPicker from "react-native-dropdown-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useModal } from "@/hooks/useModal";
import { FilterModal } from "@/components/Modals/FilterModal";
import { InfoModal } from "@/components/Modals/InfoModal";
import { SearchModal } from "@/components/Modals/SearchModal";
import { useStations } from "@/hooks/useStations";
import { useStationData } from "@/hooks/useStationData";
import styles from "@/styles/mapStyles";
import { RoundedButton } from "@/components/btns/RoundedButton";
import { SkiMap } from "@/components/map/SkiMap";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useSkiMap } from "@/hooks/useSkiMap";
import { centerOnStation, setCameraToCoordinates } from "@/hooks/useCamera";
import { LoadingModal } from "@/components/Modals/LoadingModal";
import { useUserLocation } from "@/hooks/useUserLocation";
import { mapVariables } from "@/constants/map/mapConfigVariables";

export default function map() {
	const backgroundColor = useThemeColor({}, "background");
	const mapCameraRef = useRef<any>(null);

	const [isSearching, setIsSearching] = useState(false);
	const [routeFeature, setRouteFeature] = useState<any>(null);
	const [mapReady, setMapReady] = useState(false);

	const { location: userLocation } = useUserLocation({
		distanceFilter: 10,
		interval: 5000,
	});

	const {
		stations,
		dropdownItems,
		selectedStation,
		setSelectedStation,
		isLoading: stationsLoading,
	} = useStations();

	const {
		stationCities,
		stationCoordinates,
		assets,
		isLoading: stationDataLoading,
	} = useStationData(selectedStation);

	const loading = stationsLoading || stationDataLoading || !mapReady;

	const {
		searchQuery,
		setSearchQuery,
		searchResults,
		isSearching: hookIsSearching,
		handleSearch,
		combinedList,
	} = useSkiMap(assets);

	const [open, setOpen] = useState(false);
	const [is3D, setIs3D] = useState(true);
	const toggleMapStyle = () => setIs3D((prev) => !prev);
	const filterModal = useModal();

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

	const stationGeoJson: { type: string; features: any[] } =
		stationCoordinates ?? { type: "FeatureCollection", features: [] };

	const didCenterRef = useRef(false);

	useEffect(() => {
		const checkStorage = async () => {
			try {
				const keys = await AsyncStorage.getAllKeys();
				if (keys.length > 0) {
					console.log("Keys in cache:", keys);

					// Exemple : afficher juste les tailles par catégorie
					const entries = await AsyncStorage.multiGet(keys);
					entries.forEach(([key, value]) => {
						console.log(
							`Key: ${key}, size: ${value ? value.length : 0}`
						);
						console.log(
							"Selected station:",
							entries.find(([k]) => k === "selected_station")?.[1]
						);
					});
				} else {
					console.log("No data in AsyncStorage");
				}
			} catch (err) {
				console.error("Error reading AsyncStorage:", err);
			}
		};

		checkStorage();

		MapboxGL.setAccessToken(process.env.MAPBOX_ACCESS_TOKEN);
	}, []);

	useEffect(() => {
		if (!mapReady) return;
		if (didCenterRef.current) return;
		if (!userLocation) return;
		didCenterRef.current = true;
		mapCameraRef.current?.setCamera({
			centerCoordinate: userLocation,
			zoomLevel: 14,
			pitch: is3D ? mapVariables.DEFAULT_PITCH_3D : 0,
			animationMode: mapVariables.RECENTERING_ZOOM_ANIMATION_MODE,
			animationDuration: mapVariables.RECENTERING_ZOOM_DURATION,
		});
	}, [mapReady, userLocation, is3D]);

	const clearStorage = async () => {
		try {
			await AsyncStorage.clear();
		} catch {}
	};

	useEffect(() => {
		if (!mapReady || !selectedStation) return;
		centerOnStation(
			mapCameraRef,
			Number(selectedStation.longitude),
			Number(selectedStation.latitude)
		);
	}, [mapReady, selectedStation?.osmId]);

	const cameraCenter = selectedStation
		? [Number(selectedStation.longitude), Number(selectedStation?.latitude)]
		: [6.7483232, 45.5203648];

	const handleStationChange = (osmId: string) => {
		const station = stations.find((s) => String(s.osmId) === String(osmId));
		if (station) {
			setSelectedStation(station);
		}
		console.log("Selected station:", station);
	};

	const handleFeatureSelect = (feature: any) => {
		setSearchModalVisible(false);
		const fullRun = combinedList.find((item) => item.id === feature.id);
		const highlightGeom = fullRun || feature;
		let targetCoord: number[] | null = null;
		if (feature.geometry.type === "LineString") {
			const coords = feature.geometry.coordinates;
			targetCoord = coords[Math.floor(coords.length / 2)];
		} else if (feature.geometry.type === "Point") {
			targetCoord = feature.geometry.coordinates;
		} else {
			return;
		}
		setSelectedFeature(highlightGeom);
		setRouteFeature(null);
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

	const clearSelection = () => {
		setSelectedFeature(null);
		setRouteFeature(null);
	};

	return (
		<View style={[styles.container, { backgroundColor }]}>
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
						console.log("Station changed to:", osmId);
						handleStationChange(osmId);
					}}
					setItems={() => {}}
					placeholder='Choisir une station'
					style={styles.dropdown}
					dropDownContainerStyle={styles.dropdownContainer}
				/>
			</View>

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
				onClear={clearSelection}
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

			<SkiMap
				cameraCenter={userLocation || cameraCenter}
				is3D={is3D}
				onMapLoad={() => {
					setMapReady(true);
					if (!userLocation && selectedStation) {
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
			/>

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

			{!!selectedFeature && !infoModalVisible && (
				<View style={{ position: "absolute", bottom: 40, left: 20 }}>
					<RoundedButton onPress={() => setInfoModalVisible(true)}>
						<Ionicons
							name='information-circle'
							size={24}
							color='black'
						/>
					</RoundedButton>
				</View>
			)}

			{!!selectedFeature && (
				<View style={{ position: "absolute", bottom: 100, left: 20 }}>
					<RoundedButton onPress={clearSelection}>
						<Ionicons name='close' size={24} color='black' />
					</RoundedButton>
				</View>
			)}
		</View>
	);
}
