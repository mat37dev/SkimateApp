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

			let cachedList: Station[] = [];
			try {
				const savedId = await AsyncStorage.getItem("selected_station"); // <- prioritaire
				const cached = await AsyncStorage.getItem("skiStationsData");

				if (cached) {
					cachedList = JSON.parse(cached) as Station[];
					setStations(cachedList);
					setDropdownItems(
						cachedList.map((s) => ({
							label: s.name,
							value: s.osmId,
						}))
					);
					const bySaved = savedId
						? cachedList.find(
								(s) => String(s.osmId) === String(savedId)
						  )
						: null;
					setSelectedStation(bySaved || cachedList[0] || null);
					return;
				}

				// Pas de cache => fetch une fois
				const result = await fetchStations();
				cachedList = result;
				await AsyncStorage.setItem(
					"skiStationsData",
					JSON.stringify(result)
				);
				setStations(result);
				setDropdownItems(
					result.map((s) => ({ label: s.name, value: s.osmId }))
				);
				const bySaved = savedId
					? result.find((s) => String(s.osmId) === String(savedId))
					: null;
				setSelectedStation(bySaved || result[0] || null);
			} catch (e: any) {
				setStations([]);
				setDropdownItems([]);
				setSelectedStation(null);
				console.error("❌ fetchStations failed:", e?.message || e);
			} finally {
				hasFetched.current = true;
				isFetching.current = false;
				setIsLoading(false);
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
