import React from "react";
import MapboxGL from "@rnmapbox/maps";
import MapStyleConfig from "@/constants/map/mapStyles";

interface Props {
	stationCities: any;
}

export const CitiesLabels = ({ stationCities }: Props) => {
	if (!stationCities || stationCities.features.length === 0) return null;

	return (
		<MapboxGL.ShapeSource
			id='citySource'
			shape={stationCities}
			key={`citySource-${stationCities.features.length}`}
		>
			<MapboxGL.SymbolLayer
				minZoomLevel={MapStyleConfig.CityLabelMinimumDistanceApparition}
				maxZoomLevel={MapStyleConfig.CityLabelMaximumDistanceApparition}
				id='cityLabelLayer'
				style={{
					textField: ["get", "name"],
					textSize: MapStyleConfig.CityLabelFontSize,
					textColor: MapStyleConfig.CityLabelColor,
					textHaloWidth: MapStyleConfig.CityLabelHaloWidth,
					textHaloColor: MapStyleConfig.CityLabelHaloColor,
					textAllowOverlap: MapStyleConfig.CityLabelAllowOverlap,
					textIgnorePlacement:
						MapStyleConfig.CityLabelTextIgnorePlacement,
					textOpacity: MapStyleConfig.CityLabelTextOpacity,
				}}
			/>
		</MapboxGL.ShapeSource>
	);
};
export default CitiesLabels;
