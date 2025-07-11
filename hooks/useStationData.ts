import { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchStationsData, fetchStationCoordinates } from "@/api/skiApi";
import {
	CityFeature,
	StationAssets,
	StationCoordinates,
	StationData,
	UseStationDataResult,
} from "@/interfaces/datas/StationData";
import type { FeatureCollection, Point } from "geojson";

export const useStationData = (
	station: { osmId: string; name: string } | null
): UseStationDataResult & {
	stationCities: FeatureCollection<Point, { name: string }> | null;
} => {
	const [stationData, setStationData] = useState<StationData | null>(null);
	const [stationCoordinates, setStationCoordinates] =
		useState<StationCoordinates | null>(null);
	const [assets, setAssets] = useState<StationAssets | null>(null);
	const [stationCities, setStationCities] = useState<FeatureCollection<
		Point,
		{ name: string }
	> | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const isFetching = useRef(false);

	useEffect(() => {
		const getStationData = async () => {
			if (!station || isFetching.current) return;
			isFetching.current = true;

			try {
				const dataKey = `stationData-${station.osmId}`;
				const delimKey = `stationsDelimitations-${station.osmId}`;
				const runsKey = `stationRuns-${station.osmId}`;
				const liftsKey = `stationLifts-${station.osmId}`;
				const citiesKey = `stationCities-${station.osmId}`;

				const [sDataJSON, sDelimJSON, runsJSON, liftsJSON, citiesJSON] =
					await Promise.all([
						AsyncStorage.getItem(dataKey),
						AsyncStorage.getItem(delimKey),
						AsyncStorage.getItem(runsKey),
						AsyncStorage.getItem(liftsKey),
						AsyncStorage.getItem(citiesKey),
					]);

				let storedStationData: StationData;
				let storedDelimitations: StationCoordinates;
				let runs: any;
				let lifts: any;
				let citiesGeoJson: FeatureCollection<Point, { name: string }>;

				const cacheHit =
					sDataJSON &&
					sDelimJSON &&
					runsJSON &&
					liftsJSON &&
					citiesJSON;

				if (cacheHit) {
					storedStationData = JSON.parse(sDataJSON!);
					storedDelimitations = JSON.parse(sDelimJSON!);
					runs = JSON.parse(runsJSON!);
					lifts = JSON.parse(liftsJSON!);
					citiesGeoJson = JSON.parse(citiesJSON!);
				} else {
					storedStationData = await fetchStationsData(station);
					if (!storedStationData) return;

					const fetched = await fetchStationCoordinates(
						storedStationData.domain,
						station.osmId
					);
					if (!fetched || !fetched.stationsDelimitations?.features)
						return;

					storedDelimitations = fetched.stationsDelimitations;
					runs = fetched.runs || {};
					lifts = fetched.lifts || {};

					let idCounter = 0;
					const injectIds = (fc: any) => ({
						...fc,
						features: fc.features.map((f: any) => ({
							...f,
							id: idCounter++,
						})),
					});

					runs = {
						easy: injectIds(runs.easy || { features: [] }),
						novice: injectIds(runs.novice || { features: [] }),
						intermediate: injectIds(
							runs.intermediate || { features: [] }
						),
						expert: injectIds(runs.expert || { features: [] }),
						nullDiff: injectIds(runs.nullDiff || { features: [] }),
						unknown: injectIds(runs.unknown || { features: [] }),
					};

					lifts = {
						liftLines: injectIds(
							lifts.liftLines || { features: [] }
						),
						liftStartPoints: injectIds(
							lifts.liftStartPoints || { features: [] }
						),
					};

					citiesGeoJson = fetched.allCities;

					await AsyncStorage.setItem(
						dataKey,
						JSON.stringify(storedStationData)
					);
					await AsyncStorage.setItem(
						delimKey,
						JSON.stringify(storedDelimitations)
					);
					await AsyncStorage.setItem(runsKey, JSON.stringify(runs));
					await AsyncStorage.setItem(liftsKey, JSON.stringify(lifts));
					if (citiesGeoJson) {
						await AsyncStorage.setItem(
							citiesKey,
							JSON.stringify(citiesGeoJson)
						);
					}
				}

				setStationData(storedStationData);
				setStationCoordinates(storedDelimitations);
				setAssets({ runs, lifts });
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
		stationCoordinates,
		assets,
		stationCities,
		isLoading,
	};
};
