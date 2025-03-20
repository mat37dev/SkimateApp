// components/SkiMap.tsx
import React from "react";
import MapboxGL from "@rnmapbox/maps";
import { View, ActivityIndicator, Text } from "react-native";
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
}

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
}: SkiMapProps) {
	// Destructure assets for convenience.
	const { runs, lifts } = assets || {};
	const runsEasy = runs?.easy || { type: "FeatureCollection", features: [] };
	const runsNovice = runs?.novice || { type: "FeatureCollection", features: [] };
	const runsIntermediate = runs?.intermediate || { type: "FeatureCollection", features: [] };
	const runsExpert = runs?.expert || { type: "FeatureCollection", features: [] };
	const runsNull = runs?.nullDiff || { type: "FeatureCollection", features: [] };
	const runsUnknown = runs?.unknown || { type: "FeatureCollection", features: [] };

	const liftLines = lifts?.liftLines || { type: "FeatureCollection", features: [] };
	const liftStartPoints = lifts?.liftStartPoints || { type: "FeatureCollection", features: [] };

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
				}}
			/>

			{is3D && (
				<MapboxGL.RasterDemSource id='mapbox-dem' url='mapbox://mapbox.mapbox-terrain-dem-v1' tileSize={512} maxZoom={4.5}>
					<MapboxGL.Terrain sourceID='mapbox-dem' exaggeration={1.75} />
				</MapboxGL.RasterDemSource>
			)}

			{/* Camera */}
			<MapboxGL.Camera ref={mapCameraRef} zoomLevel={11} centerCoordinate={cameraCenter} pitch={is3D ? 70 : 0} />

			{/* User Location */}
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
			{routeFeature && (
				<MapboxGL.ShapeSource id='routeSource' shape={routeFeature}>
					<MapboxGL.LineLayer
						id='routeLayer'
						style={{
							lineColor: ["get", "color"],
							lineWidth: 4,
							lineOpacity: 1,
							lineDasharray: ["match", ["get", "segmentType"], "bridging", [2, 2], [1, 0]],
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
			{liftLines.features.length > 0 && (
				// You can keep your liftLineLayers here or move them into SkiMap if preferred.
				// For simplicity, you can pass in a component or function to render these.
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
						}}
					/>
				</MapboxGL.ShapeSource>
			)}

			{/* Lift start points */}
			{liftStartPoints.features.length > 0 && (
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

			{/* Runs by difficulty using runLayers */}
			{runLayers && (
				<>
					{runLayers("runEasySource", "runEasyLayer", "blue", "runEasyLabelLayer", "runEasyArrowLayer", runsEasy)}
					{runLayers("runNoviceSource", "runNoviceLayer", "green", "runNoviceLabelLayer", "runNoviceArrowLayer", runsNovice)}
					{runLayers(
						"runIntermediateSource",
						"runIntermediateLayer",
						"red",
						"runIntermediateLabelLayer",
						"runIntermediateArrowLayer",
						runsIntermediate
					)}
					{runLayers("runExpertSource", "runExpertLayer", "black", "runExpertLabelLayer", "runExpertArrowLayer", runsExpert)}
					{runLayers("runNullSource", "runNullLayer", "grey", "runNullLabelLayer", "runNullArrowLayer", runsNull)}
					{runLayers("runUnknownSource", "runUnknownLayer", "grey", "runUnknownLabelLayer", "runUnknownArrowLayer", runsUnknown)}
				</>
			)}
		</MapboxGL.MapView>
	);
}
