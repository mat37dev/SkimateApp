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

export const useStationData = (
	station: Station | null
): UseStationDataResult & {
	stationCities: FeatureCollection<Point, { name: string }> | null;
} => {
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

	const isFetching = useRef(false);
	const emptyFC: FeatureCollection = {
		type: "FeatureCollection",
		features: [],
	};

	// Ajoute des IDs basés sur properties.osmId ou index si absent
	const injectUniqueId = <T extends FeatureCollection<any, any>>(fc: T): T =>
		({
			...fc,
			features: fc.features.map((feature, idx) => {
				const {
					category,
					difficulty = "none",
					name = "",
				} = feature.properties || {};
				// Construit un id unique : catégorie–osmId–difficulty
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

	useEffect(() => {
		if (!station || isFetching.current) return;
		const getStationData = async () => {
			isFetching.current = true;

			const geoKey = `stationGeoJson-${station.osmId}`;
			const delimKey = `stationsDelimitations-${station.osmId}`;
			const runsKey = `stationRuns-${station.osmId}`;
			const liftsKey = `stationLifts-${station.osmId}`;
			const citiesKey = `stationCities-${station.osmId}`;

			try {
				const [geoJSON, delimJSON, runsJSON, liftsJSON, citiesJSON] =
					await Promise.all([
						AsyncStorage.getItem(geoKey),
						AsyncStorage.getItem(delimKey),
						AsyncStorage.getItem(runsKey),
						AsyncStorage.getItem(liftsKey),
						AsyncStorage.getItem(citiesKey),
					]);

				let storedGeo: FeatureCollection<Point, any>;
				let storedDelimitations: StationCoordinates;
				let rawRuns: any;
				let rawLifts: any;
				let citiesGeoJson: FeatureCollection<Point, { name: string }>;

				if (
					geoJSON &&
					delimJSON &&
					runsJSON &&
					liftsJSON &&
					citiesJSON
				) {
					storedGeo = injectUniqueId(JSON.parse(geoJSON));
					storedDelimitations = JSON.parse(delimJSON);
					rawRuns = JSON.parse(runsJSON);
					rawLifts = JSON.parse(liftsJSON);
					citiesGeoJson = JSON.parse(citiesJSON);
				} else {
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

					// après fetch ou lecture du cache
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

					await AsyncStorage.multiSet([
						[geoKey, JSON.stringify(storedGeo)],
						[delimKey, JSON.stringify(storedDelimitations)],
						[runsKey, JSON.stringify(rawRuns)],
						[liftsKey, JSON.stringify(rawLifts)],
						[citiesKey, JSON.stringify(citiesGeoJson)],
					]);
				}

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

	return {
		stationData,
		stationGeoJson,
		stationCoordinates,
		assets,
		stationCities,
		isLoading,
	};
};
