import { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchStationCoordinates } from "@/api/skiApi";
import {
	StationAssets,
	StationCoordinates,
	UseStationDataResult,
	Station,
} from "@/interfaces/datas/StationData";
import type { FeatureCollection, Point } from "geojson";

// 🎿 Hook principal chargé de récupérer et de gérer toutes les données liées à une station donnée.
// Il combine le téléchargement depuis l’API et la mise en cache locale via AsyncStorage.
export const useStationData = (
	station: Station | null
): UseStationDataResult & {
	stationCities: FeatureCollection<Point, { name: string }> | null;
} => {
	// 📦 États principaux
	const [stationData, setStationData] = useState<Station | null>(null);
	const [stationGeoJson, setStationGeoJson] = useState<FeatureCollection<
		Point,
		any
	> | null>(null);
	const [stationCoordinates, setStationCoordinates] =
		useState<StationCoordinates | null>(null);
	const [assets, setAssets] = useState<StationAssets | null>(null);
	const [stationCities, setStationCities] = useState<FeatureCollection<
		Point,
		{ name: string }
	> | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const isFetching = useRef(false); // Empêche les appels API simultanés
	const emptyFC: FeatureCollection = {
		type: "FeatureCollection",
		features: [],
	};

	// 🆔 Génère des identifiants uniques pour chaque Feature du GeoJSON
	// utile pour éviter les conflits d’ID lors du rendu des couches Mapbox.
	const injectUniqueId = <T extends FeatureCollection<any, any>>(fc: T): T =>
		({
			...fc,
			features: fc.features.map((feature, idx) => {
				const {
					category,
					difficulty = "none",
					name = "",
				} = feature.properties || {};
				const osmId = String(
					feature.properties?.osmId ?? feature.id ?? idx
				);
				const uniqueId = `${category}-${osmId}-${difficulty}`;
				return {
					...feature,
					id: uniqueId,
					properties: {
						...feature.properties,
						osmId,
					},
				};
			}),
		} as T);

	// ==================== RÉCUPÉRATION DES DONNÉES ====================
	useEffect(() => {
		if (!station || isFetching.current) return;

		const getStationData = async () => {
			isFetching.current = true;

			// 🧠 Génération de clés uniques pour le cache local
			const geoKey = `stationGeoJson-${station.osmId}`;
			const delimKey = `stationsDelimitations-${station.osmId}`;
			const runsKey = `stationRuns-${station.osmId}`;
			const liftsKey = `stationLifts-${station.osmId}`;
			const citiesKey = `stationCities-${station.osmId}`;

			try {
				// 📦 Récupération depuis le cache local si possible
				const [geoJSON, delimJSON, runsJSON, liftsJSON, citiesJSON] =
					await Promise.all([
						AsyncStorage.getItem(geoKey),
						AsyncStorage.getItem(delimKey),
						AsyncStorage.getItem(runsKey),
						AsyncStorage.getItem(liftsKey),
						AsyncStorage.getItem(citiesKey),
					]);

				let storedGeo,
					storedDelimitations,
					rawRuns,
					rawLifts,
					citiesGeoJson;

				if (
					geoJSON &&
					delimJSON &&
					runsJSON &&
					liftsJSON &&
					citiesJSON
				) {
					// ✅ Lecture depuis le cache
					storedGeo = injectUniqueId(JSON.parse(geoJSON));
					storedDelimitations = JSON.parse(delimJSON);
					rawRuns = JSON.parse(runsJSON);
					rawLifts = JSON.parse(liftsJSON);
					citiesGeoJson = JSON.parse(citiesJSON);
				} else {
					// 🌐 Téléchargement depuis l’API si non présent dans le cache
					const fetched = await fetchStationCoordinates(
						station.domain,
						station.osmId
					);
					if (!fetched) return;

					storedGeo = injectUniqueId(fetched.stationGeoJson);
					storedDelimitations = fetched.stationsDelimitations;
					const runsFc = fetched.runs || {};
					const liftsFc = fetched.lifts || {};
					citiesGeoJson = fetched.allCities;

					// 🧩 Attribution d’IDs uniques aux sous-catégories
					const runsWithIds = {
						easy: injectUniqueId(runsFc.easy ?? emptyFC),
						novice: injectUniqueId(runsFc.novice ?? emptyFC),
						intermediate: injectUniqueId(
							runsFc.intermediate ?? emptyFC
						),
						expert: injectUniqueId(runsFc.expert ?? emptyFC),
						nullDiff: injectUniqueId(runsFc.nullDiff ?? emptyFC),
						unknown: injectUniqueId(runsFc.unknown ?? emptyFC),
					};
					const liftsWithIds = {
						liftLines: injectUniqueId(liftsFc.liftLines ?? emptyFC),
						liftStartPoints: injectUniqueId(
							liftsFc.liftStartPoints ?? emptyFC
						),
					};
					setAssets({ runs: runsWithIds, lifts: liftsWithIds });

					rawRuns = runsWithIds;
					rawLifts = liftsWithIds;

					// 💾 Mise en cache pour usage futur (mode offline)
					await AsyncStorage.multiSet([
						[geoKey, JSON.stringify(storedGeo)],
						[delimKey, JSON.stringify(storedDelimitations)],
						[runsKey, JSON.stringify(rawRuns)],
						[liftsKey, JSON.stringify(rawLifts)],
						[citiesKey, JSON.stringify(citiesGeoJson)],
					]);
				}

				// ✅ Mise à jour des états
				setStationData(station);
				setStationGeoJson(storedGeo);
				setStationCoordinates(storedDelimitations);
				setAssets({ runs: rawRuns, lifts: rawLifts });
				setStationCities(citiesGeoJson);
			} catch (error) {
				console.error("Error in useStationData:", error);
			} finally {
				isFetching.current = false;
				setIsLoading(false);
			}
		};

		getStationData();
	}, [station]);

	// 🧾 Retourne toutes les données de la station prête à être utilisées dans SkiMap
	return {
		stationData,
		stationGeoJson,
		stationCoordinates,
		assets,
		stationCities,
		isLoading,
	};
};
