import React from "react";
import MapboxGL from "@rnmapbox/maps";
import MapStyleConfig from "@/constants/map/mapStyles";

interface Props {
	showLifts: boolean;
	liftLines: any;
	liftStartPoints: any;
	onMapFeaturePress: (e: any) => void;
}

export const LiftsLayers = ({
	showLifts,
	liftLines,
	liftStartPoints,
	onMapFeaturePress,
}: Props) => {
	if (!showLifts) return null;

	return (
		<>
			{liftLines.features.length > 0 && (
				<MapboxGL.ShapeSource
					id='liftLineSource'
					shape={liftLines}
					onPress={onMapFeaturePress}
				>
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
					<MapboxGL.LineLayer
						id='liftLineLayer'
						style={{
							lineColor: MapStyleConfig.LiftLineColor,
							lineWidth: MapStyleConfig.LiftLineWidth,
							lineDasharray: MapStyleConfig.LiftLineDashArray,
							lineOpacity: MapStyleConfig.LiftLineOpacity,
						}}
					/>
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

			{liftStartPoints.features.length > 0 && (
				<MapboxGL.ShapeSource
					id='liftStartPointsSource'
					shape={liftStartPoints}
					onPress={onMapFeaturePress}
				>
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
