import { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchStations } from "@/api/skiApi";
import { Station, UseStationsResult } from "@/interfaces/datas/StationData";

// 🏔️ Hook responsable de la gestion de la liste complète des stations.
// Il gère le cache local, la sélection actuelle et le chargement initial depuis l’API.
export const useStations = (): UseStationsResult => {
	const [stations, setStations] = useState<Station[]>([]);
	const [dropdownItems, setDropdownItems] = useState<
		{ label: string; value: string }[]
	>([]);
	const [selectedStation, setSelectedStation] = useState<Station | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);

	const isFetching = useRef(false); // évite les appels concurrents
	const hasFetched = useRef(false); // évite de relancer inutilement

	useEffect(() => {
		const getStations = async () => {
			if (hasFetched.current || isFetching.current) return;
			isFetching.current = true;

			let cachedList: Station[] = [];
			try {
				// 🔑 Lecture des données locales
				const savedId = await AsyncStorage.getItem("selected_station"); // ID sauvegardé
				const cached = await AsyncStorage.getItem("skiStationsData");

				if (cached) {
					// ✅ Lecture depuis le cache si existant
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

				// 🌐 Aucun cache → appel API pour récupérer la liste des stations
				const result = await fetchStations();
				cachedList = result;

				// 💾 Mise en cache pour les prochains lancements
				await AsyncStorage.setItem(
					"skiStationsData",
					JSON.stringify(result)
				);

				setStations(result);
				setDropdownItems(
					result.map((s) => ({ label: s.name, value: s.osmId }))
				);

				// 🎯 Définit la station active (celle sauvegardée ou la première)
				const bySaved = savedId
					? result.find((s) => String(s.osmId) === String(savedId))
					: null;
				setSelectedStation(bySaved || result[0] || null);
			} catch (e: any) {
				console.error("❌ fetchStations failed:", e?.message || e);
				setStations([]);
				setDropdownItems([]);
				setSelectedStation(null);
			} finally {
				hasFetched.current = true;
				isFetching.current = false;
				setIsLoading(false);
			}
		};

		getStations();
	}, []);

	// 🔁 Retourne les données et setters utiles à la page principale
	return {
		stations,
		dropdownItems,
		selectedStation,
		setSelectedStation,
		isLoading,
	};
};
