import React, { useEffect, useState, useMemo } from "react";
import MapboxGL from "@rnmapbox/maps";
import { View, Text, Image } from "react-native";
import styles from "@/styles/mapStyles";

interface SkiMapProps {
	cameraCenter: [number, number];
	is3D: boolean;
	userLocation: [number, number];
	mapCameraRef: React.RefObject<any>;
	selectedFeature: any;
	routeFeature: any;
	stationGeoJson: any;
	assets: any;
	onMapDidFinishRendering: () => void;
	onMapFeaturePress: (e: any) => void;
	runLayers: (shapeId: string, lineId: string, color: string, labelId: string, arrowId: string, shapeData: any) => JSX.Element;
	showRuns: boolean;
	showLifts: boolean;
	showNovice: boolean;
	showEasy: boolean;
	showIntermediate: boolean;
	showExpert: boolean;
	gpsMode?: boolean; // new optional prop
}

// Reversed sample coordinates (the route to follow)
const sampleRunCoordinates: [number, number][] = [
	[6.7307541, 45.497037],
	[6.7301627, 45.4969619],
	[6.7297404, 45.4969657],
	[6.7293673, 45.4968699],
	[6.7288593, 45.4966166],
	[6.7285922, 45.4965638],
	[6.7282779, 45.4965865],
	[6.7276712, 45.4969136],
	[6.7272727, 45.497186],
	[6.726764, 45.4973352],
	[6.7261479, 45.4972917],
	[6.7252008, 45.497024],
	[6.7243223, 45.4968833],
	[6.7238639, 45.4969072],
	[6.723399, 45.4969871],
	[6.7222838, 45.4965083],
	[6.7213359, 45.4958927],
	[6.7203937, 45.4956098],
	[6.7195376, 45.4956973],
	[6.7188645, 45.4958651],
	[6.7182123, 45.4958968],
	[6.7176631, 45.4957533],
	[6.716829, 45.495226],
	[6.7162461, 45.49499],
	[6.7151623, 45.4949755],
	[6.7139783, 45.4949658],
	[6.7130194, 45.4950639],
	[6.7126284, 45.495296],
	[6.712419, 45.4957454],
	[6.7121293, 45.4960741],
	[6.7115528, 45.4963195],
	[6.7102925, 45.4971673],
	[6.7093207, 45.4977401],
	[6.7087924, 45.4981266],
	[6.7084744, 45.4984354],
	[6.7082474, 45.4992],
	[6.7083247, 45.4998884],
	[6.7085379, 45.5005338],
	[6.7083902, 45.50136],
	[6.7081278, 45.5016024],
];

export function SkiMap({
	cameraCenter,
	is3D,
	userLocation,
	mapCameraRef,
	selectedFeature,
	routeFeature,
	stationGeoJson,
	assets,
	onMapDidFinishRendering,
	onMapFeaturePress,
	runLayers,
	showRuns,
	showLifts,
	showNovice,
	showEasy,
	showIntermediate,
	showExpert,
	gpsMode,
}: SkiMapProps) {
	// Assets destructuring...
	const { runs, lifts } = assets || {};
	const runsEasy = runs?.easy || { type: "FeatureCollection", features: [] };
	const runsNovice = runs?.novice || { type: "FeatureCollection", features: [] };
	const runsIntermediate = runs?.intermediate || { type: "FeatureCollection", features: [] };
	const runsExpert = runs?.expert || { type: "FeatureCollection", features: [] };
	const runsNull = runs?.nullDiff || { type: "FeatureCollection", features: [] };
	const runsUnknown = runs?.unknown || { type: "FeatureCollection", features: [] };

	const liftLines = lifts?.liftLines || { type: "FeatureCollection", features: [] };
	const liftStartPoints = lifts?.liftStartPoints || { type: "FeatureCollection", features: [] };

	// State to track dynamic user location and current index in the route.
	const [currentLocation, setCurrentLocation] = useState<[number, number]>(userLocation);
	const [currentIndex, setCurrentIndex] = useState(0);

	// Helper: Calculate bearing between two coordinates.
	function calculateBearing(start: [number, number], end: [number, number]): number {
		const [lon1, lat1] = start;
		const [lon2, lat2] = end;
		const φ1 = (lat1 * Math.PI) / 180;
		const φ2 = (lat2 * Math.PI) / 180;
		const Δλ = ((lon2 - lon1) * Math.PI) / 180;
		const y = Math.sin(Δλ) * Math.cos(φ2);
		const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
		let θ = (Math.atan2(y, x) * 180) / Math.PI;
		return (θ + 360) % 360;
	}

	// Compute the angle using currentLocation and the next coordinate in sampleRunCoordinates.
	let computedAngle = 0;
	if (gpsMode && sampleRunCoordinates.length > 0) {
		const nextCoord =
			currentIndex < sampleRunCoordinates.length - 1 ? sampleRunCoordinates[currentIndex + 1] : sampleRunCoordinates[currentIndex];
		computedAngle = calculateBearing(currentLocation, nextCoord);
	}

	// Compute arrival coordinate based on routeFeature.
	// If routeFeature is an array (segmented routes), take the last feature's last coordinate.
	// Otherwise, treat routeFeature as a single feature.
	const arrivalCoordinate = useMemo(() => {
		if (Array.isArray(routeFeature)) {
			if (
				routeFeature.length > 0 &&
				routeFeature[routeFeature.length - 1].geometry &&
				Array.isArray(routeFeature[routeFeature.length - 1].geometry.coordinates) &&
				routeFeature[routeFeature.length - 1].geometry.coordinates.length > 0
			) {
				const coords = routeFeature[routeFeature.length - 1].geometry.coordinates;
				return coords[coords.length - 1];
			}
			return null;
		} else if (
			routeFeature &&
			routeFeature.geometry &&
			Array.isArray(routeFeature.geometry.coordinates) &&
			routeFeature.geometry.coordinates.length > 0
		) {
			return routeFeature.geometry.coordinates[routeFeature.geometry.coordinates.length - 1];
		}
		return null;
	}, [routeFeature]);

	// Update camera heading and center whenever currentLocation or computedAngle changes.
	useEffect(() => {
		console.log("arrival:", arrivalCoordinate);
		if (gpsMode) {
			mapCameraRef.current?.setCamera({
				centerCoordinate: currentLocation,
				zoomLevel: 18,
				pitch: 45,
				heading: computedAngle,
				animationDuration: 1500,
			});
		}
	}, [gpsMode, computedAngle, currentLocation, arrivalCoordinate]);

	// Simulation: Update currentLocation along sampleRunCoordinates.
	useEffect(() => {
		console.log("arrival:", arrivalCoordinate);
		if (gpsMode && sampleRunCoordinates.length > 0) {
			let index = 0;
			setCurrentLocation(sampleRunCoordinates[index]);
			setCurrentIndex(index);
			const intervalId = setInterval(() => {
				index++;
				if (index >= sampleRunCoordinates.length) {
					clearInterval(intervalId);
				} else {
					setCurrentLocation(sampleRunCoordinates[index]);
					setCurrentIndex(index);
				}
			}, 1500); // update every 1.5 seconds (adjust as needed)
			return () => clearInterval(intervalId);
		}
	}, [gpsMode, arrivalCoordinate]);

	return (
		<MapboxGL.MapView
			style={styles.map}
			styleURL='mapbox://styles/baptlab/cm7kbr8wz008y01sb2hxsc5g9'
			onDidFinishRenderingMapFully={onMapDidFinishRendering}
		>
			{/* Images for icons */}
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
					// Add your arrival flag here.
					flag_checkered: require("../assets/mapIcons/flag-checkered-solid.svg"),
				}}
			/>

			{is3D && (
				<MapboxGL.RasterDemSource
					id='mapbox-dem'
					url='mapbox://styles/baptlab/cm7kbr8wz008y01sb2hxsc5g9'
					tileSize={512}
					maxZoom={4.5}
				>
					<MapboxGL.Terrain sourceID='mapbox-dem' exaggeration={1.75} />
				</MapboxGL.RasterDemSource>
			)}

			{/* Camera */}
			<MapboxGL.Camera ref={mapCameraRef} zoomLevel={11} centerCoordinate={cameraCenter} pitch={is3D ? 70 : 0} />

			{/* User Location Annotation */}
			<MapboxGL.PointAnnotation id='userLocation' coordinate={currentLocation}>
				{gpsMode ? (
					<View
						style={{
							padding: 10,
							backgroundColor: "rgba(255,255,255,0.3)",
							borderRadius: 25,
							zIndex: 4,
						}}
					>
						<Image
							source={require("../assets/mapIcons/travelArrow.png")}
							style={{
								width: 30,
								height: 30,
								transform: [{ rotate: `${computedAngle}deg` }],
							}}
						/>
					</View>
				) : (
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
				)}
			</MapboxGL.PointAnnotation>

			{/* Highlight selected feature */}
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

			{/* Render calculated route */}
			{routeFeature && !Array.isArray(routeFeature) && (
				<MapboxGL.ShapeSource id='routeSource' shape={routeFeature}>
					{/* Dotted line for bridging/walking */}
					<MapboxGL.LineLayer
						id='bridgingLayer'
						filter={["==", ["get", "segmentType"], "bridging"]}
						style={{
							lineColor: "green",
							lineWidth: 4,
							lineOpacity: 1,
							lineDasharray: [1, 1], // dotted
						}}
					/>
					{/* Solid line for everything else */}
					<MapboxGL.LineLayer
						id='normalLayer'
						filter={["!=", ["get", "segmentType"], "bridging"]}
						style={{
							lineColor: ["get", "color"],
							lineWidth: 4,
							lineOpacity: 1,
						}}
					/>
				</MapboxGL.ShapeSource>
			)}

			{/* If routeFeature is an array (segmented route), you might also render each feature */}
			{Array.isArray(routeFeature) &&
				routeFeature.map((feature: any, index: number) => (
					<MapboxGL.ShapeSource key={`routeSource-${index}`} id={`routeSource-${index}`} shape={feature}>
						<MapboxGL.LineLayer
							id={`normalLayer-${index}`}
							style={{
								lineColor: ["get", "color"],
								lineWidth: 4,
								lineOpacity: 1,
							}}
						/>
					</MapboxGL.ShapeSource>
				))}

			{/* Arrival Marker (displayed only if arrivalCoordinate is available) */}
			{arrivalCoordinate && (
				<MapboxGL.PointAnnotation id='arrivalMarker' coordinate={arrivalCoordinate}>
					<View style={{ padding: 5 }}>
						<Image source={require("../assets/mapIcons/flag-checkered-solid.svg")} style={{ width: 30, height: 30 }} />
					</View>
				</MapboxGL.PointAnnotation>
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

			{/* Lift lines (shown only if showLifts is true) */}
			{showLifts && liftLines.features.length > 0 && (
				<MapboxGL.ShapeSource id='liftLineSource' shape={liftLines} onPress={onMapFeaturePress}>
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
							textRotationAlignment: "map",
							textPitchAlignment: "map",
							textKeepUpright: false,
						}}
					/>
				</MapboxGL.ShapeSource>
			)}

			{/* Lift start points (shown only if showLifts is true) */}
			{showLifts && liftStartPoints.features.length > 0 && (
				<MapboxGL.ShapeSource id='liftStartPointsSource' shape={liftStartPoints} onPress={onMapFeaturePress}>
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
						onPress={onMapFeaturePress}
					/>
				</MapboxGL.ShapeSource>
			)}

			{/* Runs by difficulty using runLayers (shown only if showRuns is true) */}
			{showRuns && (
				<>
					{showEasy && runLayers("runEasySource", "runEasyLayer", "blue", "runEasyLabelLayer", "runEasyArrowLayer", runsEasy)}
					{showNovice &&
						runLayers("runNoviceSource", "runNoviceLayer", "green", "runNoviceLabelLayer", "runNoviceArrowLayer", runsNovice)}
					{showIntermediate &&
						runLayers(
							"runIntermediateSource",
							"runIntermediateLayer",
							"red",
							"runIntermediateLabelLayer",
							"runIntermediateArrowLayer",
							runsIntermediate
						)}
					{showExpert &&
						runLayers("runExpertSource", "runExpertLayer", "black", "runExpertLabelLayer", "runExpertArrowLayer", runsExpert)}
					{runLayers("runNullSource", "runNullLayer", "grey", "runNullLabelLayer", "runNullArrowLayer", runsNull)}
					{runLayers("runUnknownSource", "runUnknownLayer", "grey", "runUnknownLabelLayer", "runUnknownArrowLayer", runsUnknown)}
				</>
			)}
		</MapboxGL.MapView>
	);
}
