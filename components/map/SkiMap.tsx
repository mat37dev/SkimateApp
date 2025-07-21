import React, { useRef, useCallback } from "react";
import MapboxGL from "@rnmapbox/maps";
import { View, Text } from "react-native";
import styles from "@/styles/mapStyles";
import type { SkiMapProps } from "@/interfaces/SkiMap.ts";
import MapStyleConfig from "@/constants/map/mapStyles";
import { StationsLayers } from "./mapLayers/StationsLayers";
import { RunsLayers } from "@/components/map/mapLayers/RunsLayers";
import { LiftsLayers } from "@/components/map/mapLayers/LiftsLayers";
import { CitiesLabels } from "@/components/map/mapLabels/CitiesLabels";
import { RouteLayers } from "@/components/map/mapLayers/RouteLayers";
import { mapVariables } from "@/constants/map/mapConfigVariables";

function getRunsAndLifts(assets: any) {
	const runs = assets?.runs || {};
	const lifts = assets?.lifts || {};

	return {
		runsEasy: runs.easy || { type: "FeatureCollection", features: [] },
		runsNovice: runs.novice || { type: "FeatureCollection", features: [] },
		runsIntermediate: runs.intermediate || {
			type: "FeatureCollection",
			features: [],
		},
		runsExpert: runs.expert || { type: "FeatureCollection", features: [] },
		runsNull: runs.nullDiff || { type: "FeatureCollection", features: [] },
		runsUnknown: runs.unknown || {
			type: "FeatureCollection",
			features: [],
		},
		liftLines: lifts.liftLines || {
			type: "FeatureCollection",
			features: [],
		},
		liftStartPoints: lifts.liftStartPoints || {
			type: "FeatureCollection",
			features: [],
		},
	};
}

function getLabelLayerId(selectedFeature) {
	if (!selectedFeature?.properties) return "runEasyLabelLayer";
	switch (selectedFeature.properties.difficulty) {
		case "easy":
			return "runEasyLabelLayer";
		case "novice":
			return "runNoviceLabelLayer";
		case "intermediate":
			return "runIntermediateLabelLayer";
		case "expert":
			return "runExpertLabelLayer";
		case "nullDiff":
			return "runNullLabelLayer";
		case "unknown":
			return "runUnknownLabelLayer";
		default:
			return "runEasyLabelLayer";
	}
}

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
	stationCities,
	onMapFeaturePress,
	onMapLoad,
	showRuns,
	showLifts,
	showNovice,
	showEasy,
	showIntermediate,
	showExpert,
	gpsMode,
	graphNodesGeoJson,
}: SkiMapProps) {
	const {
		runsEasy,
		runsNovice,
		runsIntermediate,
		runsExpert,
		runsNull,
		runsUnknown,
		liftLines,
		liftStartPoints,
	} = getRunsAndLifts(assets);

	const hasLoadedRef = useRef(false);

	const notifyLoad = useCallback(() => {
		if (!hasLoadedRef.current) {
			hasLoadedRef.current = true;
			onMapLoad?.();
		}
	}, [onMapLoad]);

	const handleMapIdle = (event: any) => {
		const coords = event?.geometry?.coordinates;
		if (!coords) return;
		const [lng, lat] = coords;

		if (
			lng < mapVariables.BOUNDS.sw[0] ||
			lng > mapVariables.BOUNDS.ne[0] ||
			lat < mapVariables.BOUNDS.sw[1] ||
			lat > mapVariables.BOUNDS.ne[1]
		) {
			mapCameraRef.current?.setCamera({
				centerCoordinate: cameraCenter,
				zoomLevel: mapVariables.DEFAULT_ZOOM_LEVEL,
				pitch: is3D ? mapVariables.DEFAULT_PITCH_3D : 0,
				animationMode: mapVariables.RECENTERING_ZOOM_ANIMATION_MODE,
				duration: mapVariables.RECENTERING_ZOOM_DURATION,
			});
			console.log("Hors limites, recentrage sur :", cameraCenter);
		}
	};

	return (
		<MapboxGL.MapView
			key={1}
			style={styles.map}
			styleURL='mapbox://styles/baptlab/cm7kbr8wz008y01sb2hxsc5g9'
			onMapIdle={handleMapIdle}
			onDidFinishLoadingMap={() => {
				console.log("Map style loaded");
				notifyLoad();
			}}
		>
			<MapboxGL.Images
				images={{
					chair_lift: require("@/assets/mapIcons/chair_lift.png"),
					drag_lift: require("@/assets/mapIcons/platter.png"),
					rope_tow: require("@/assets/mapIcons/rope_tow.png"),
					magic_carpet: require("@/assets/mapIcons/magic_carpet.png"),
					gondola: require("@/assets/mapIcons/cable_car.png"),
					zip_line: require("@/assets/mapIcons/zip_line.png"),
					platter: require("@/assets/mapIcons/platter.png"),
					unknown: require("@/assets/mapIcons/unknown.png"),
					flag_checkered: require("@/assets/mapIcons/flag-checkered-solid.svg"),
				}}
			/>

			{is3D && (
				<MapboxGL.RasterDemSource
					id='terrainSource'
					tileUrlTemplates={[
						process.env.MAPBOX_STYLE_URL ||
							"https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.pngraw?access_token=pk.eyJ1IjoiYmFwdGxhYiIsImEiOiJjbHdvcTEzc3cxM2NjMmlyem11ZHF4MWh2In0.KmT1eerA8ZSQaREGnkaN2A",
					]}
					tileSize={256}
					maxZoomLevel={14}
				>
					<MapboxGL.Terrain style={{ exaggeration: 1.75 }} />
				</MapboxGL.RasterDemSource>
			)}

			{Array.isArray(routeFeature) &&
				routeFeature.map((feature: any, index: number) => (
					<MapboxGL.ShapeSource
						key={`routeSource-${index}`}
						id={`routeSource-${index}`}
						shape={feature}
					>
						<MapboxGL.LineLayer
							id={`normalLayer-${index}`}
							style={{
								lineColor: ["get", "color"],
								lineWidth: MapStyleConfig.RouteSegmentLineWidth,
								lineOpacity:
									MapStyleConfig.RouteSegmentLineOpacity,
							}}
						/>
					</MapboxGL.ShapeSource>
				))}
			{/* {graphNodesGeoJson && (
				<MapboxGL.ShapeSource id='graphNodes' shape={graphNodesGeoJson}>
					<MapboxGL.CircleLayer
						id='graphNodesLayer'
						style={{
							circleRadius: 4,
							circleColor: [
								"case",
								["==", ["get", "intersection"], true],
								"orange", // couleur des intersections
								"purple", // couleur des autres nœuds
							],
							circleOpacity: 0.9,
						}}
					/>
				</MapboxGL.ShapeSource>
			)} */}

			<StationsLayers geoJson={stationGeoJson} />
			<CitiesLabels stationCities={stationCities} />
			<LiftsLayers
				showLifts={showLifts}
				liftLines={liftLines}
				liftStartPoints={liftStartPoints}
				onMapFeaturePress={onMapFeaturePress}
			/>
			<RunsLayers
				showRuns={showRuns}
				showNovice={showNovice}
				showEasy={showEasy}
				showIntermediate={showIntermediate}
				showExpert={showExpert}
				runsEasy={runsEasy}
				runsNovice={runsNovice}
				runsIntermediate={runsIntermediate}
				runsExpert={runsExpert}
				runsNull={runsNull}
				runsUnknown={runsUnknown}
				onMapFeaturePress={onMapFeaturePress}
			/>

			<RouteLayers
				routeFeature={routeFeature}
				belowLayerID={getLabelLayerId(selectedFeature)}
			/>

			{selectedFeature && (
				<MapboxGL.ShapeSource
					id='highlightSource'
					shape={
						(selectedFeature as any).type === "FeatureCollection"
							? (selectedFeature as any)
							: {
									type: "FeatureCollection",
									features: [selectedFeature],
							  }
					}
				>
					<MapboxGL.LineLayer
						id='highlightLayer'
						belowLayerID={getLabelLayerId(selectedFeature)}
						style={{
							lineColor: "blue",
							lineWidth: 4,
							lineOpacity: 1,
						}}
					/>
				</MapboxGL.ShapeSource>
			)}

			{showDestinationPoint && destinationCoord && (
				<MapboxGL.PointAnnotation
					id='destinationPoint'
					coordinate={destinationCoord}
				>
					<View style={styles.destinationIcon}>
						<Text style={{ fontSize: 24 }}>🚩</Text>
					</View>
				</MapboxGL.PointAnnotation>
			)}

			{gpsMode && userLocation ? (
				<MapboxGL.Camera
					ref={mapCameraRef}
					centerCoordinate={userLocation}
					zoomLevel={18}
					pitch={45}
					animationMode='flyTo'
					animationDuration={1500}
				/>
			) : is3D ? (
				<MapboxGL.Camera
					ref={mapCameraRef}
					zoomLevel={11}
					centerCoordinate={cameraCenter}
					pitch={70}
				/>
			) : (
				<MapboxGL.Camera
					ref={mapCameraRef}
					zoomLevel={11}
					centerCoordinate={cameraCenter}
					pitch={0}
				/>
			)}

			<MapboxGL.UserLocation
				visible
				showsUserHeadingIndicator={gpsMode}
				androidRenderMode={gpsMode ? "compass" : "normal"}
			/>
		</MapboxGL.MapView>
	);
}
