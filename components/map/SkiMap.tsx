// SkiMap.tsx — Composant principal de la carte interactive Mapbox
// ---------------------------------------------------------------
// Ce composant gère :
// - L’affichage des couches Mapbox (stations, pistes, remontées, villes)
// - Le chargement des données et la logique de zoom/caméra
// - Le basculement 2D/3D
// - Le centrage automatique de la carte dans les limites autorisées
// - La mise en évidence des pistes ou remontées sélectionnées

import React, { useRef, useCallback } from "react";
import MapboxGL from "@rnmapbox/maps";
import { View, Text, LogBox } from "react-native";
import styles from "@/styles/mapStyles";
import type { SkiMapProps } from "@/interfaces/SkiMap.ts";
import MapStyleConfig from "@/constants/map/mapStyles";
import { StationsLayers } from "./mapLayers/StationsLayers";
import { RunsLayers } from "@/components/map/mapLayers/RunsLayers";
import { LiftsLayers } from "@/components/map/mapLayers/LiftsLayers";
import { CitiesLabels } from "@/components/map/mapLabels/CitiesLabels";
import { mapVariables } from "@/constants/map/mapCameraVariable";

// Fonction utilitaire : récupère toutes les sous-catégories de pistes et remontées depuis les assets
// Retourne un objet contenant des FeatureCollections vides si certaines données sont manquantes
function getRunsAndLifts(assets: any) {
	const runs = assets?.runs || {};
	const lifts = assets?.lifts || {};

	// ⚠️ Important : toujours renvoyer une FeatureCollection vide plutôt que undefined
	// car MapboxGL.ShapeSource plante si la propriété "shape" est absente ou invalide.
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

// Fonction de correspondance : renvoie le bon layer d’étiquette pour une piste sélectionnée selon sa difficulté
function getLabelLayerId(selectedFeature) {
	// Sert à déterminer quelle couche de texte (label) survoler lors de la mise en surbrillance.
	// Cela garantit que la ligne sélectionnée reste visible sous le bon label Mapbox.
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

// ---------------------------------------------------------------
// Composant principal SkiMap
// ---------------------------------------------------------------
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

	// Empêche les appels multiples à onMapLoad
	const hasLoadedRef = useRef(false);

	const notifyLoad = useCallback(() => {
		if (!hasLoadedRef.current) {
			hasLoadedRef.current = true;
			onMapLoad?.();
		}
	}, [onMapLoad]);

	// Vérifie que la caméra reste dans les bornes définies par mapVariables
	// Si elle sort de la zone autorisée, elle est automatiquement recentrée
	const handleCameraChanged = useCallback(
		(e: any) => {
			const c = e?.properties?.center;
			if (!c) return;
			const [lng, lat] = Array.isArray(c) ? c : [c.lng, c.lat];

			// 🔒 Empêche la caméra de sortir des limites définies dans mapVariables.BOUNDS
			// Si l’utilisateur dézoome trop ou fait glisser la carte hors zone, la caméra
			// est automatiquement recentrée pour éviter les crashs ou zones blanches.
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
			maxBounds={{
				ne: mapVariables.BOUNDS.ne,
				sw: mapVariables.BOUNDS.sw,
			}}
			onMapIdle={handleCameraChanged}
			onDidFinishLoadingMap={() => {
				console.log("Map loaded");
				notifyLoad();
			}}
		>
			{/* Chargement des icônes des types de remontées mécaniques */}
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

			{/* Source de terrain 3D pour le relief (DEM = Digital Elevation Model) */}
			<MapboxGL.RasterDemSource
				id='terrainSource'
				tileUrlTemplates={[
					// 🏔️ Source d’altitude (DEM) pour afficher le relief 3D du terrain.
					// Utilise les tuiles Mapbox Terrain-RGB avec une exagération du relief (1.75)
					process.env.MAPBOX_STYLE_URL ||
						"https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.pngraw?access_token=pk.eyJ1IjoiYmFwdGxhYiIsImEiOiJjbHdvcTEzc3cxM2NjMmlyem11ZHF4MWh2In0.KmT1eerA8ZSQaREGnkaN2A",
				]}
				tileSize={256}
				maxZoomLevel={14}
			>
				<MapboxGL.Terrain style={{ exaggeration: 1.75 }} />
			</MapboxGL.RasterDemSource>

			{/* Affichage de la route GPS si un itinéraire est défini */}
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

			{/* Couches principales de la carte */}
			<StationsLayers geoJson={stationGeoJson} />
			{/* Contour et nom des stations */}
			<CitiesLabels stationCities={stationCities} />
			{/* Labels des villes */}
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

			{/* Mise en évidence (surlignage) de l’élément sélectionné (piste ou remontée) */}
			{selectedFeature && (
				<MapboxGL.ShapeSource
					id='highlightSource'
					shape={
						// 🟩 Gère la mise en surbrillance de l’élément sélectionné (piste ou remontée)
						// Enveloppe toujours dans une FeatureCollection, même si un seul élément.
						(selectedFeature as any).type === "FeatureCollection"
							? (selectedFeature as any)
							: {
									type: "FeatureCollection",
									features: [selectedFeature],
							  }
					}
				>
					{/* Double couche pour effet visuel : fond blanc + pointillés noirs */}
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

					{/* Couche de surbrillance des pistes selon leur difficulté */}
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

			{/* Caméra principale : définit les limites, zooms, et inclinaison */}
			<MapboxGL.Camera
				ref={mapCameraRef}
				centerCoordinate={cameraCenter}
				zoomLevel={mapVariables.DEFAULT_ZOOM_LEVEL}
				pitch={is3D ? mapVariables.DEFAULT_PITCH_3D : 0}
				animationMode='flyTo'
				animationDuration={1500}
				minZoomLevel={mapVariables.MIN_ZOOM_LEVEL}
				maxZoomLevel={mapVariables.MAX_ZOOM_LEVEL}
				maxBounds={{
					ne: mapVariables.BOUNDS.ne,
					sw: mapVariables.BOUNDS.sw,
				}}
				// 🎯 Caméra principale contrôlée par référence
				// Permet le centrage dynamique sur l’utilisateur, la station ou une piste via useCamera.ts
			/>

			{/* Localisation GPS de l’utilisateur affichée sur la carte */}
			<MapboxGL.UserLocation
				visible
				showsUserHeadingIndicator={false}
				androidRenderMode='normal'
				onUpdate={() => {}}
			/>
		</MapboxGL.MapView>
	);
}
