import apiClient from "@/api/apiClient";

// Fetch all stations
export const fetchStations = async () => {
	try {
		const response = await apiClient("/api/stations", {
			method: "GET",
		});
		return response;
	} catch (error) {
		console.error("Error fetching stations:", error);
		return [];
	}
};

// Fetch station info
export const fetchStationsData = async (station) => {
	if (!station || !station.osmId) return null;
	try {
		const response = await apiClient("/api/station/information", {
			method: "POST",
			body: JSON.stringify({ osmId: station.osmId }),
		});

		return response;
	} catch (error) {
		console.error("Error fetching station data:", error);
		return null;
	}
};

const processCoordinates = (coordinates, orientation, category) => {
	if (category === "lift") {
		if (orientation === "desc") {
			// Invert coordinates for desc orientation (for lifts)
			return coordinates.reverse();
		}
	} else if (category === "run") {
		if (orientation === "asc") {
			// Invert coordinates for asc orientation (for runs)
			return coordinates.reverse();
		}
	}
	// Return coordinates as they are if orientation is not handled
	return coordinates;
};

export const fetchStationCoordinates = async (domain, stationOsmId) => {
	try {
		const response = await apiClient("/api/get-ski-domain", {
			method: "POST",
			body: JSON.stringify({ domaine: domain }),
		});

		if (!response || !Array.isArray(response.features)) {
			console.error("❌ Invalid API response format:", response);
			return null;
		}

		// ✅ Extract the main station
		const stationFeature = response.features.find(
			(feature) => feature.properties.type === "station" && feature.properties.osmId === stationOsmId
		);

		// ✅ Extract station delimitations (features representing station boundaries)
		const stationsDelimitations = response.features
			.filter(
				(feature) =>
					!feature.properties.category && // Not a run/lift
					feature.geometry && // Has geometry
					feature.geometry.type !== "Point" // Ensure it's not a single point
			)
			.map((feature) => ({
				type: "Feature",
				geometry: feature.geometry,
				properties: {
					name: feature.properties.name,
					domain: domain,
					osmId: feature.properties.osmId,
				},
			}));

		console.log(`📌 Found ${stationsDelimitations.length} delimitations for station ${stationFeature?.properties?.name || "Unknown"}`);

		// ✅ Extract runs (excluding closed loops)
		const runFeatures = response.features.filter(
			(f) =>
				f.properties.category === "run" &&
				f.geometry.type === "LineString" &&
				f.geometry.coordinates.length >= 2 &&
				!(
					f.geometry.coordinates[0][0] === f.geometry.coordinates.at(-1)[0] &&
					f.geometry.coordinates[0][1] === f.geometry.coordinates.at(-1)[1]
				)
		);

		// ✅ Extract lifts (separating lines & pylons)
		const liftFeatures = response.features.filter((f) => f.properties.category === "lift");
		const liftLineFeatures = liftFeatures.filter((f) => f.geometry.type === "LineString");
		const pylonPoints = liftFeatures.filter((f) => f.geometry.type === "Point" && f.properties.tags?.aerialway === "pylon");

		// ✅ Lift start points extraction
		const liftStartArr = liftLineFeatures
			.map((lineFeat) => {
				const coords = lineFeat.geometry.coordinates;
				return coords.length > 0
					? {
							type: "Feature",
							geometry: {
								type: "Point",
								coordinates: coords[lineFeat.properties.orientation === "desc" ? coords.length - 1 : 0],
							},
							properties: { ...lineFeat.properties },
					  }
					: null;
			})
			.filter(Boolean);

		// ✅ Process runs and lifts for correct orientation
		const processedRuns = runFeatures.map((f) => ({
			...f,
			geometry: { ...f.geometry, coordinates: processCoordinates(f.geometry.coordinates, f.properties.orientation, "run") },
		}));

		const processedLifts = liftLineFeatures.map((f) => ({
			...f,
			geometry: { ...f.geometry, coordinates: processCoordinates(f.geometry.coordinates, f.properties.orientation, "lift") },
		}));

		// ✅ Organize by difficulty
		const getRunsByDifficulty = (difficulty) => processedRuns.filter((f) => f.properties?.difficulty === difficulty) || [];

		return {
			stationGeoJson: {
				type: "FeatureCollection",
				features: stationFeature ? [stationFeature] : [],
			},
			stationsDelimitations: {
				type: "FeatureCollection",
				features: stationsDelimitations,
			},
			runs: {
				novice: { type: "FeatureCollection", features: getRunsByDifficulty("novice") },
				easy: { type: "FeatureCollection", features: getRunsByDifficulty("easy") },
				intermediate: { type: "FeatureCollection", features: getRunsByDifficulty("intermediate") },
				expert: {
					type: "FeatureCollection",
					features: processedRuns.filter((f) => ["advanced", "expert", "freeride", "extreme"].includes(f.properties?.difficulty)),
				},
				nullDiff: { type: "FeatureCollection", features: getRunsByDifficulty(null) },
				unknown: {
					type: "FeatureCollection",
					features: processedRuns.filter(
						(f) =>
							!["novice", "easy", "intermediate", "advanced", "expert", "freeride", "extreme", null].includes(
								f.properties?.difficulty
							)
					),
				},
			},
			lifts: {
				liftLines: { type: "FeatureCollection", features: processedLifts },
				liftPylonPoints: { type: "FeatureCollection", features: pylonPoints },
				liftStartPoints: { type: "FeatureCollection", features: liftStartArr },
			},
		};
	} catch (error) {
		console.error("❌ Error fetching station coordinates:", error);
		return null;
	}
};
