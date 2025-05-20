// hooks/useStationData.ts
import { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchStationsData, fetchStationCoordinates } from "@/api/skiApi";
import { StationAssets, StationCoordinates, StationData, UseStationDataResult } from "@/interfaces/datas/StationData";

export const useStationData = (station: { osmId: string; name: string } | null): UseStationDataResult => {
	const [stationData, setStationData] = useState<StationData | null>(null);
	const [stationCoordinates, setStationCoordinates] = useState<StationCoordinates | null>(null);
	const [assets, setAssets] = useState<StationAssets | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const isFetching = useRef(false);

	useEffect(() => {
		const getStationData = async () => {
			if (!station || isFetching.current) return;
			isFetching.current = true;

			try {
				let storedStationData = await AsyncStorage.getItem(`stationData-${station.osmId}`);
				let storedDelimitations = await AsyncStorage.getItem(`stationsDelimitations-${station.osmId}`);
				let runs, lifts;

				if (storedStationData && storedDelimitations) {
					storedStationData = JSON.parse(storedStationData);
					storedDelimitations = JSON.parse(storedDelimitations);
					runs = JSON.parse(await AsyncStorage.getItem(`stationRuns-${station.osmId}`)) || {};
					lifts = JSON.parse(await AsyncStorage.getItem(`stationLifts-${station.osmId}`)) || {};
				} else {
					// Fetch fresh data
					storedStationData = await fetchStationsData(station);
					if (!storedStationData) {
						console.error(`Failed to fetch station data for: ${station.osmId}`);
						return;
					}

					const fetchedData = await fetchStationCoordinates(storedStationData.domain, station.osmId);
					if (!fetchedData || !fetchedData.stationsDelimitations || !fetchedData.stationsDelimitations.features) {
						console.error(`Failed to fetch coordinates for: ${station.osmId}`);
						return;
					}

					storedDelimitations = fetchedData.stationsDelimitations;
					runs = fetchedData.runs || {};
					lifts = fetchedData.lifts || {};

					// Cache the fetched data

					// create a counter scoped to this station-load
					let idCounter = 0;

					// helper to walk a FeatureCollection and give each feature a unique numeric id
					const injectIncrementalId = (fc) => ({
						...fc,
						features: fc.features.map((f) => ({
							...f,
							id: idCounter++, // will be 0,1,2,3,... across *all* runs & lifts
						})),
					});

					// re‐wrap all your raw FCs with injected ids
					runs = {
						easy: injectIncrementalId(runs.easy || { features: [] }),
						novice: injectIncrementalId(runs.novice || { features: [] }),
						intermediate: injectIncrementalId(runs.intermediate || { features: [] }),
						expert: injectIncrementalId(runs.expert || { features: [] }),
						nullDiff: injectIncrementalId(runs.nullDiff || { features: [] }),
						unknown: injectIncrementalId(runs.unknown || { features: [] }),
					};
					lifts = {
						liftLines: injectIncrementalId(lifts.liftLines || { features: [] }),
						liftStartPoints: injectIncrementalId(lifts.liftStartPoints || { features: [] }),
					};

					await AsyncStorage.setItem(`stationData-${station.osmId}`, JSON.stringify(storedStationData));
					await AsyncStorage.setItem(`stationsDelimitations-${station.osmId}`, JSON.stringify(storedDelimitations));
					await AsyncStorage.setItem(`stationRuns-${station.osmId}`, JSON.stringify(runs));
					await AsyncStorage.setItem(`stationLifts-${station.osmId}`, JSON.stringify(lifts));
				}

				setStationData(storedStationData);
				setStationCoordinates(storedDelimitations);
				setAssets({ runs, lifts });
			} catch (error) {
				console.error("Error fetching station data:", error);
			} finally {
				isFetching.current = false;
				setIsLoading(false);
				console.log("Stations Data retrieved !");
			}
		};

		getStationData();
	}, [station]);

	return { stationData, stationCoordinates, assets, isLoading };
};
