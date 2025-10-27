import React from "react";
import MapboxGL from "@rnmapbox/maps";
import MapStyleConfig from "@/constants/map/mapStyles";

interface Props {
	showLifts: boolean;
	liftLines: any;
	liftStartPoints: any;
	onMapFeaturePress: (e: any) => void;
}

// 🚡 Affiche les remontées mécaniques sur la carte (télésièges, téléskis, etc.)
// Composée de deux ShapeSource :
// 1️⃣ liftLines → pour les tracés (lignes de câbles + flèches + noms)
// 2️⃣ liftStartPoints → pour les icônes représentant le type de remontée
export const LiftsLayers = ({
	showLifts,
	liftLines,
	liftStartPoints,
	onMapFeaturePress,
}: Props) => {
	// ❌ Si l’utilisateur masque les remontées, on ne rend rien pour alléger la carte
	if (!showLifts) return null;

	return (
		<>
			{/* ==================== LIGNES DES REMONTÉES ==================== */}
			{liftLines.features.length > 0 && (
				<MapboxGL.ShapeSource
					id='liftLineSource'
					shape={liftLines}
					onPress={onMapFeaturePress} // 🔍 Active la sélection sur une ligne
				>
					{/* ➡️ Flèches directionnelles sur les câbles */}
					<MapboxGL.SymbolLayer
						id='liftLineArrowLayer'
						minZoomLevel={
							MapStyleConfig.LiftArrowDistanceApparition
						}
						style={{
							symbolSpacing:
								MapStyleConfig.LiftArrowSymbolSpacing,
							symbolPlacement:
								MapStyleConfig.LiftArrowSymbolPlacement,
							textField: MapStyleConfig.LiftArrowTextField,
							textSize: MapStyleConfig.LiftArrowTextSize,
							textColor: MapStyleConfig.LiftLineColor,
							textOpacity: MapStyleConfig.LiftArrowTextOpacity,
							textHaloWidth: MapStyleConfig.LiftArrowHaloWidth,
							textHaloColor: MapStyleConfig.LiftArrowHaloColor,
							textRotationAlignment:
								MapStyleConfig.LiftArrowTextRotationAlignment,
							textPitchAlignment:
								MapStyleConfig.LiftArrowTextPitchAlignment,
							textKeepUpright:
								MapStyleConfig.LiftArrowTextKeepUpright,
						}}
					/>

					{/* 🎢 Tracé principal de la ligne de remontée */}
					<MapboxGL.LineLayer
						id='liftLineLayer'
						style={{
							lineColor: MapStyleConfig.LiftLineColor,
							lineWidth: MapStyleConfig.LiftLineWidth,
							lineDasharray: MapStyleConfig.LiftLineDashArray,
							lineOpacity: MapStyleConfig.LiftLineOpacity,
						}}
					/>

					{/* 🏷️ Nom de la remontée (ex : "Télésiège du Glacier") */}
					<MapboxGL.SymbolLayer
						id='liftLineLabelLayer'
						minZoomLevel={
							MapStyleConfig.LiftLabelTextDistanceApparition
						}
						style={{
							textField: ["get", "name"],
							symbolPlacement:
								MapStyleConfig.LiftLabelSymbolPlacement,
							textSize: MapStyleConfig.LiftLabelFontSize,
							textColor: MapStyleConfig.LiftLabelColor,
							textHaloWidth: MapStyleConfig.LiftLabelHaloWidth,
							textHaloColor: MapStyleConfig.LiftLabelHaloColor,
							textFont: [
								MapStyleConfig.LiftLabelTextFont ||
									"Open Sans Bold",
							],
							textAllowOverlap:
								MapStyleConfig.LiftLabelAllowOverlap,
							textIgnorePlacement:
								MapStyleConfig.LiftLabelTextIgnorePlacement,
							textOpacity: MapStyleConfig.LiftLabelTextOpacity,
						}}
					/>
				</MapboxGL.ShapeSource>
			)}

			{/* ==================== ICÔNES DES POINTS DE DÉPART ==================== */}
			{liftStartPoints.features.length > 0 && (
				<MapboxGL.ShapeSource
					id='liftStartPointsSource'
					shape={liftStartPoints}
					onPress={onMapFeaturePress}
				>
					{/* 🪧 Affiche l’icône correspondant au type de remontée (tapis, télécabine, etc.) */}
					<MapboxGL.SymbolLayer
						id='liftStartPointsLayer'
						minZoomLevel={MapStyleConfig.LiftIconDistanceApparition}
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
		</>
	);
};
