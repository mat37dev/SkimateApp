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

	const handleCameraChanged = useCallback(
		(e: any) => {
			const c = e?.properties?.center;
			if (!c) return;
			const [lng, lat] = Array.isArray(c) ? c : [c.lng, c.lat];
			if (
				lng < mapVariables.BOUNDS.sw[0] ||
				lng > mapVariables.BOUNDS.ne[0] ||
				lat < mapVariables.BOUNDS.sw[1] ||
				lat > mapVariables.BOUNDS.ne[1]
			) {
				mapCameraRef.current?.setCamera({
					centerCoordinate: cameraCenter,
					animationMode: mapVariables.RECENTERING_ZOOM_ANIMATION_MODE,
					duration: mapVariables.RECENTERING_ZOOM_DURATION,
				});
			}
		},
		[cameraCenter, is3D, mapCameraRef]
	);

	return (
		<MapboxGL.MapView
			key={1}
			style={styles.map}
			styleURL='mapbox://styles/baptlab/cm7kbr8wz008y01sb2hxsc5g9'
			onMapIdle={handleCameraChanged}
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
						id='highlightLiftBackground'
						belowLayerID='liftLineLabelLayer'
						filter={["==", ["get", "category"], "lift"]}
						style={{
							lineColor: "white",
							lineWidth: 3, // plus large
							lineOpacity: 1,
						}}
					/>

					<MapboxGL.LineLayer
						id='highlightLiftForeground'
						belowLayerID='liftLineLabelLayer'
						filter={["==", ["get", "category"], "lift"]}
						style={{
							lineColor: "black",
							lineWidth: 3.5, // un peu plus fin
							lineDasharray: [2, 2], // pointillé noir
							lineOpacity: 1,
						}}
					/>

					<MapboxGL.LineLayer
						id='highlightRunsLayer'
						filter={["==", ["get", "category"], "run"]}
						belowLayerID={getLabelLayerId(selectedFeature)}
						style={{
							lineColor: [
								"match",
								["get", "difficulty"],
								"novice",
								"green",
								"easy",
								"blue",
								"intermediate",
								"red",
								"advanced",
								"black",
								"expert",
								"black",
								"nullDiff",
								"grey",
								"unknown",
								"grey",
								"grey",
							],
							lineWidth: 3.5,
							lineOpacity: 1,
						}}
					/>
				</MapboxGL.ShapeSource>
			)}

			{userLocation && (
				<MapboxGL.Camera
					ref={mapCameraRef}
					pitch={is3D ? 70 : 0}
					animationMode='flyTo'
					animationDuration={1500}
				/>
			)}

			<MapboxGL.UserLocation visible />
		</MapboxGL.MapView>
	);
}
