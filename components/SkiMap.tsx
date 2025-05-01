import React, { useEffect, useState, useMemo, useRef } from "react";
import MapboxGL, { UserTrackingMode } from "@rnmapbox/maps";
import { View, Image, Text } from "react-native";
import styles from "@/styles/mapStyles";
import type { SkiMapProps } from "../interfaces/SkiMap";

export function SkiMap({
	cameraCenter,
	is3D,
	userLocation,
	mapCameraRef,
	selectedFeature,
	routeFeature,
	stationGeoJson,
	destinationCoord,
	showDestinationPoint,
	assets,
	onMapFeaturePress,
	onMapLoad,
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
	const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(userLocation);
	const [currentIndex, setCurrentIndex] = useState(0);

	const hasLoadedRef = useRef(false);
	const notifyLoad = () => {
		if (!hasLoadedRef.current) {
			hasLoadedRef.current = true;
			onMapLoad?.();
		}
	};
	useEffect(() => {}, [userLocation]);

	return (
		<MapboxGL.MapView
			style={styles.map}
			styleURL='mapbox://styles/baptlab/cm7kbr8wz008y01sb2hxsc5g9'
			onDidFinishLoadingMap={() => {
				console.log("Map style loaded");
				notifyLoad();
			}}
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

			{/* Destination route point flag icon*/}
			{showDestinationPoint && destinationCoord && (
				<MapboxGL.PointAnnotation id='destinationPoint' coordinate={destinationCoord}>
					<View style={styles.destinationIcon}>
						<Text style={{ fontSize: 24 }}>🚩</Text>
					</View>
				</MapboxGL.PointAnnotation>
			)}

			{gpsMode && userLocation ? (
				// GPS “manual follow” mode with fixed 45° tilt
				<MapboxGL.Camera
					ref={mapCameraRef}
					centerCoordinate={userLocation}
					zoomLevel={18}
					pitch={45}
					animationMode='flyTo'
					animationDuration={1500}
				/>
			) : is3D ? (
				// 3D overview mode
				<MapboxGL.Camera ref={mapCameraRef} zoomLevel={11} centerCoordinate={cameraCenter} pitch={70} />
			) : (
				// Plain 2D mode
				<MapboxGL.Camera ref={mapCameraRef} zoomLevel={11} centerCoordinate={cameraCenter} pitch={0} />
			)}
			<MapboxGL.UserLocation
				onUpdate={(location) => {
					console.log("[MapboxGL.UserLocation] onUpdate:", {
						lon: location.coords.longitude,
						lat: location.coords.latitude,
						accuracy: location.coords.accuracy,
					});
				}}
				visible
				showsUserHeadingIndicator={gpsMode}
				androidRenderMode={gpsMode ? "compass" : "normal"}
			/>
		</MapboxGL.MapView>
	);
}
