import { useState, useEffect, useMemo } from "react";
import { preprocessFeatures, getGraph } from "@/hooks/calculateRoute";

export function useSkiMap(assets: any) {
	// State for search query and results
	const [searchQuery, setSearchQuery] = useState("");
	const [combinedList, setCombinedList] = useState<any[]>([]);
	const [searchResults, setSearchResults] = useState<any[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	// Combine runs and lifts from assets (using a composite key) into one list
	useEffect(() => {
		if (!assets) return;
		const runsEasy = assets?.runs?.easy || { features: [] };
		const runsNovice = assets?.runs?.novice || { features: [] };
		const runsIntermediate = assets?.runs?.intermediate || { features: [] };
		const runsExpert = assets?.runs?.expert || { features: [] };
		const runsNull = assets?.runs?.nullDiff || { features: [] };
		const runsUnknown = assets?.runs?.unknown || { features: [] };

		const liftLines = assets?.lifts?.liftLines || { features: [] };
		const liftStartPoints = assets?.lifts?.liftStartPoints || { features: [] };

		const allRuns = [
			...runsEasy.features,
			...runsNovice.features,
			...runsIntermediate.features,
			...runsExpert.features,
			...runsNull.features,
			...runsUnknown.features,
		].map((feature) => ({ ...feature, category: "run" }));
		const allLifts = [...liftLines.features, ...liftStartPoints.features].map((feature) => ({
			...feature,
			category: "lift",
		}));
		const combined = [...allRuns, ...allLifts];
		const uniqueMap = new Map();
		combined.forEach((feature) => {
			const featureCategory = feature.category || feature.properties?.category;
			const featureName = feature.properties?.name;
			const key = featureCategory + "_" + featureName;
			if (featureName && !uniqueMap.has(key)) {
				uniqueMap.set(key, feature);
			}
		});
		setCombinedList(Array.from(uniqueMap.values()));
	}, [assets]);

	// Search logic (with delay)
	const handleSearch = (text: string) => {
		setSearchQuery(text);
		if (!text) {
			setSearchResults([]);
			setIsSearching(false);
			return;
		}
		setIsSearching(true);
		const lowerText = text.toLowerCase();
		setTimeout(() => {
			const filtered = combinedList.filter((item) => {
				const name = item.properties?.name || "";
				return name.toLowerCase().includes(lowerText);
			});
			setSearchResults(filtered);
			setIsSearching(false);
		}, 300);
	};

	// Preprocess combinedList into simplified edges and build (or get cached) graph
	const simplifiedEdges = useMemo(() => preprocessFeatures(combinedList), [combinedList]);
	const memoizedGraph = useMemo(() => (simplifiedEdges.length > 0 ? getGraph(simplifiedEdges) : null), [simplifiedEdges]);

	return {
		searchQuery,
		setSearchQuery,
		searchResults,
		isSearching,
		handleSearch,
		combinedList,
		simplifiedEdges,
		memoizedGraph,
	};
}
