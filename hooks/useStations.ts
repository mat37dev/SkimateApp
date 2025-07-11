// hooks/useStations.ts
import { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchStations, fetchStationsData } from "@/api/skiApi";
import { Station, UseStationsResult } from "@/interfaces/datas/StationData";

export const useStations = (): UseStationsResult => {
	const [stations, setStations] = useState<Station[]>([]);
	const [dropdownItems, setDropdownItems] = useState<
		{ label: string; value: string }[]
	>([]);
	const [selectedStation, setSelectedStation] = useState<Station | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);

	const isFetching = useRef(false);
	const hasFetchedStations = useRef(false);
	const hasFetchedStationData = useRef(false);

	useEffect(() => {
		const getStations = async () => {
			if (hasFetchedStations.current || isFetching.current) return;
			isFetching.current = true;

			try {
				const cachedStations = await AsyncStorage.getItem(
					"skiStations"
				);
				if (cachedStations) {
					const stationsData: Station[] = JSON.parse(cachedStations);
					setStations(stationsData);
					setDropdownItems(
						stationsData.map((s) => ({
							label: s.name,
							value: s.osmId,
						}))
					);
					// Set the first station as selected
					if (stationsData.length > 0) {
						setSelectedStation(stationsData[0]);
					}
					// Optionally, if you want to fetch station-specific data once:
					if (!hasFetchedStationData.current) {
						hasFetchedStationData.current = true;
						// Here you might trigger a callback or set state in another hook
					}
					return;
				}

				// No cache available, so fetch from API
				const response = await fetchStations();
				if (response && response.length > 0) {
					// Optionally, you could enhance each station with additional data:
					const stationsWithCoords: Station[] = await Promise.all(
						response.map(
							async (station: Station, index: number) => {
								// Fetch additional station data (like coordinates)
								const stationData = await fetchStationsData(
									station
								);
								return {
									...station,
									longitude:
										stationData?.longitude ||
										(index === 0 ? 6.681 : 6.82),
									latitude:
										stationData?.latitude ||
										(index === 0 ? 45.512 : 45.563),
								};
							}
						)
					);

					await AsyncStorage.setItem(
						"skiStations",
						JSON.stringify(stationsWithCoords)
					);
					setStations(stationsWithCoords);
					setDropdownItems(
						stationsWithCoords.map((s) => ({
							label: s.name,
							value: s.osmId,
						}))
					);
					if (stationsWithCoords.length > 0) {
						setSelectedStation(stationsWithCoords[0]);
					}
				}
			} catch (error) {
				console.error("Error fetching stations:", error);
			} finally {
				hasFetchedStations.current = true;
				isFetching.current = false;
				setIsLoading(false);
				console.log("Station Infos retrieved !");
			}
		};

		getStations();
	}, []);

	return {
		stations,
		dropdownItems,
		selectedStation,
		setSelectedStation,
		isLoading,
	};
};
