import React from "react";
import MapboxGL from "@rnmapbox/maps";
import MapStyleConfig from "@/constants/map/mapStyles";

// 🎿 Affiche toutes les pistes de ski classées par niveau de difficulté.
// Chaque groupe (verte, bleue, rouge, noire, etc.) correspond à une ShapeSource
// avec trois calques : flèches, ligne, et label.
interface Props {
	showRuns: boolean;
	showNovice: boolean;
	showEasy: boolean;
	showIntermediate: boolean;
	showExpert: boolean;
	runsEasy: any;
	runsNovice: any;
	runsIntermediate: any;
	runsExpert: any;
	runsNull: any;
	runsUnknown: any;
	onMapFeaturePress: (e: any) => void;
}

export const RunsLayers = ({
	showRuns,
	showNovice,
	showEasy,
	showIntermediate,
	showExpert,
	runsEasy,
	runsNovice,
	runsIntermediate,
	runsExpert,
	runsNull,
	runsUnknown,
	onMapFeaturePress,
}: Props) => {
	if (!showRuns) return null;

	// 🎨 Fonction interne réutilisable pour éviter la duplication.
	// Génère dynamiquement les trois couches d'une catégorie de piste :
	// 1. Flèches directionnelles
	// 2. Tracé de la piste
	// 3. Label du nom de la piste
	const runLayers = (
		shapeId: string,
		lineId: string,
		color: string,
		labelId: string,
		arrowId: string,
		shapeData: any
	) => {
		const hasArrow = shapeData.features.some(
			(f: any) =>
				f.properties.orientation &&
				!["unknown", "flat"].includes(f.properties.orientation)
		);

		return (
			<MapboxGL.ShapeSource
				id={shapeId}
				shape={shapeData}
				onPress={onMapFeaturePress}
			>
				{/* 🧭 Flèches indiquant la direction de la piste */}
				{hasArrow && (
					<MapboxGL.SymbolLayer
						id={arrowId}
						minZoomLevel={MapStyleConfig.RunArrowDistanceApparition}
						style={{
							textField: MapStyleConfig.RunArrowTextField,
							symbolPlacement:
								MapStyleConfig.RunArrowsSymbolPlacement,
							textSize: MapStyleConfig.RunArrowTextSize,
							textColor: color,
							textOpacity: MapStyleConfig.RunArrowTextOpacity,
							textHaloWidth: MapStyleConfig.RunArrowHaloWidth,
							textHaloColor: MapStyleConfig.RunArrowHaloColor,
							symbolSpacing: MapStyleConfig.RunArrowSymbolSpacing,
							textRotationAlignment:
								MapStyleConfig.RunArrowTextRotationAlignment,
							textPitchAlignment:
								MapStyleConfig.RunArrowTextPitchAlignment,
							textKeepUpright:
								MapStyleConfig.RunArrowTextKeepUpright,
						}}
					/>
				)}

				{/* 🎢 Tracé coloré de la piste */}
				<MapboxGL.LineLayer
					id={lineId}
					style={{
						lineColor: color,
						lineWidth: MapStyleConfig.RunLineWidth,
						lineOpacity: MapStyleConfig.RunLineOpacity,
					}}
				/>

				{/* 🏷️ Nom de la piste */}
				<MapboxGL.SymbolLayer
					id={labelId}
					minZoomLevel={MapStyleConfig.RunLabelTextDistanceApparition}
					style={{
						textField: ["get", "name"],
						symbolPlacement: MapStyleConfig.RunLabelSymbolPlacement,
						textSize: MapStyleConfig.RunLabelFontSize,
						textColor: color,
						textHaloWidth: MapStyleConfig.RunLabelHaloWidth,
						textHaloColor: MapStyleConfig.RunLabelHaloColor,
						textOpacity: MapStyleConfig.RunLabelTextOpacity,
						textFont: [
							MapStyleConfig.RunLabelTextFont || "Open Sans Bold",
						],
						textAllowOverlap: MapStyleConfig.RunLabelAllowOverlap,
						textIgnorePlacement:
							MapStyleConfig.RunLabelTextIgnorePlacement,
					}}
				/>
			</MapboxGL.ShapeSource>
		);
	};

	// 🧩 Rend dynamiquement toutes les couches actives selon les filtres utilisateur
	return (
		<>
			{showEasy &&
				runLayers(
					"runEasySource",
					"runEasyLayer",
					"blue",
					"runEasyLabelLayer",
					"runEasyArrowLayer",
					runsEasy
				)}
			{showNovice &&
				runLayers(
					"runNoviceSource",
					"runNoviceLayer",
					"green",
					"runNoviceLabelLayer",
					"runNoviceArrowLayer",
					runsNovice
				)}
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
				runLayers(
					"runExpertSource",
					"runExpertLayer",
					"black",
					"runExpertLabelLayer",
					"runExpertArrowLayer",
					runsExpert
				)}

			{/* ⚪ Catégories spéciales : pistes non définies ou inconnues */}
			{runLayers(
				"runNullSource",
				"runNullLayer",
				"grey",
				"runNullLabelLayer",
				"runNullArrowLayer",
				runsNull
			)}
			{runLayers(
				"runUnknownSource",
				"runUnknownLayer",
				"grey",
				"runUnknownLabelLayer",
				"runUnknownArrowLayer",
				runsUnknown
			)}
		</>
	);
};
