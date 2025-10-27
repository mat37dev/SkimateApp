import MapboxGL from "@rnmapbox/maps";
import MapStyleConfig from "@/constants/map/mapStyles";

// 🗺️ Affiche les contours des stations et leurs noms sur la carte.
// Chaque station est rendue à partir d’un GeoJSON contenant les limites du domaine skiable.
export function StationsLayers({ geoJson }: { geoJson: any }) {
	// ✅ Si aucune station n’est définie, on ne rend rien pour éviter une erreur Mapbox
	if (!geoJson.features.length) return null;

	return (
		<MapboxGL.ShapeSource id='stationSource' shape={geoJson}>
			{/* 🧱 Contour des stations (limites géographiques) */}
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

			{/* 🏷️ Nom du domaine skiable affiché sur la carte */}
			<MapboxGL.SymbolLayer
				id='stationLabelLayer'
				style={{
					symbolPlacement: MapStyleConfig.StationLabelSymbolPlacement,
					textField: ["get", "domain"], // Affiche le champ "domain" du GeoJSON
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
