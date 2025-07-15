// components/Map/StationsLayers.tsx

import MapboxGL from "@rnmapbox/maps";
import MapStyleConfig from "@/constants/map/mapStyles";

export function StationsLayers({ geoJson }: { geoJson: any }) {
	if (!geoJson.features.length) return null;

	return (
		<MapboxGL.ShapeSource id='stationSource' shape={geoJson}>
			<MapboxGL.LineLayer
				id='stationLayer'
				style={{
					lineColor: MapStyleConfig.StationLineColor,
					lineWidth: MapStyleConfig.StationLineWidth,
					lineOpacity: MapStyleConfig.StationLineOpacity,
					lineJoin: MapStyleConfig.StationLineJoin,
					lineCap: MapStyleConfig.StationLineCap,
				}}
			/>
			<MapboxGL.SymbolLayer
				id='stationLabelLayer'
				style={{
					symbolPlacement: MapStyleConfig.StationLabelSymbolPlacement,
					textField: ["get", "domain"],
					textSize: MapStyleConfig.StationLabelFontSize,
					textColor: MapStyleConfig.StationLabelColor,
					textHaloWidth: MapStyleConfig.StationLabelHaloWidth,
					textHaloColor: MapStyleConfig.StationLabelHaloColor,
					textAllowOverlap: MapStyleConfig.StationLabelAllowOverlap,
					textFont: [MapStyleConfig.StationLabelTextFont],
					textOpacity: MapStyleConfig.StationLabelTextOpacity,
				}}
			/>
		</MapboxGL.ShapeSource>
	);
}
