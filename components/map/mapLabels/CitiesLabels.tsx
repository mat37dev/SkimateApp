import React from "react";
import MapboxGL from "@rnmapbox/maps";
import MapStyleConfig from "@/constants/map/mapStyles";

interface Props {
	stationCities: any;
}

// 🏙️ Composant d’affichage des noms de villes autour d’une station.
// Utilise une ShapeSource + SymbolLayer pour afficher les labels textuels
// directement sur la carte Mapbox avec un style personnalisé défini dans MapStyleConfig.
export const CitiesLabels = ({ stationCities }: Props) => {
	// ✅ Si aucune ville n’est disponible, on ne rend rien pour éviter
	// les erreurs Mapbox liées à un ShapeSource vide ou undefined.
	if (!stationCities || stationCities.features.length === 0) return null;

	return (
		<MapboxGL.ShapeSource
			id='citySource'
			shape={stationCities}
			key={`citySource-${stationCities.features.length}`} // 🔑 la clé dépend du nombre de villes pour forcer un refresh si la liste change
		>
			<MapboxGL.SymbolLayer
				// 🔍 Limite d’apparition des labels selon le niveau de zoom
				minZoomLevel={MapStyleConfig.CityLabelMinimumDistanceApparition}
				maxZoomLevel={MapStyleConfig.CityLabelMaximumDistanceApparition}
				id='cityLabelLayer'
				style={{
					// 🏷️ Règle la mise en forme du texte à partir du champ "name"
					textField: ["get", "name"], // affiche la propriété "name" de chaque ville
					textSize: MapStyleConfig.CityLabelFontSize,
					textColor: MapStyleConfig.CityLabelColor,
					textHaloWidth: MapStyleConfig.CityLabelHaloWidth, // halo = contour blanc autour du texte
					textHaloColor: MapStyleConfig.CityLabelHaloColor,
					textAllowOverlap: MapStyleConfig.CityLabelAllowOverlap, // évite les chevauchements si false
					textIgnorePlacement:
						MapStyleConfig.CityLabelTextIgnorePlacement,
					textOpacity: MapStyleConfig.CityLabelTextOpacity,
				}}
			/>
		</MapboxGL.ShapeSource>
	);
};

export default CitiesLabels;
