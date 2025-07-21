import { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchStations } from "@/api/skiApi";
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
	const hasFetched = useRef(false);

	useEffect(() => {
		const getStations = async () => {
			if (hasFetched.current || isFetching.current) return;
			isFetching.current = true;
			let cachedData: Station[] = [];
			try {
				console.warn("looking for cached stations...");
				const cached = await AsyncStorage.getItem("skiStationsData");
				if (cached) {
					console.warn("✅ Found cached station data.");
					cachedData = JSON.parse(cached) as Station[];
					setStations(cachedData);
					setDropdownItems(
						cachedData.map((s) => ({
							label: s.name,
							value: s.osmId,
						}))
					);
					setSelectedStation(cachedData[0] || null);
				} else {
					console.warn("❌ No cached stations data found.");
					const result = await fetchStations();
					cachedData = result;
					await AsyncStorage.setItem(
						"skiStationsData",
						JSON.stringify(result)
					);
					setStations(result);
					setDropdownItems(
						result.map((s) => ({ label: s.name, value: s.osmId }))
					);
					setSelectedStation(result[0] || null);
				}
			} catch (error: any) {
				console.error("❌ fetchStations failed:", error.message);
				if (cachedData.length === 0) {
					setStations([]);
					setDropdownItems([]);
					setSelectedStation(null);
				}
			} finally {
				hasFetched.current = true;
				isFetching.current = false;
				setIsLoading(false);
			}
		};

		getStations();
	}, []);
	useEffect(() => {
		if (stations[0]) {
			console.log("useStations[0]:", stations[0]);
		}
	}, [stations[0]]);

	return {
		stations,
		dropdownItems,
		selectedStation,
		setSelectedStation,
		isLoading,
	};
};
