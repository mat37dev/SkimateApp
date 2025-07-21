export interface CityFeature {
	id: string | number;
	name: string;
	lon: number;
	lat: number;
}

export interface StationData {
	domain: string;
	osmId: string;
	name: string;
	website?: string;
	emergencyPhone?: string;
	altitudeMin?: string;
	altitudeMax?: string;
	latitude: number;
	longitude: number;
	distanceSlope?: string;
	countEasy?: string;
	countIntermediate?: string;
	countAdvanced?: string;
	countExpert?: string;
	logo?: string;
	city?: Record<string, CityFeature>;
}

export interface StationCoordinates {
	type: "FeatureCollection";
	features: any[];
}

export interface StationAssets {
	runs: {
		easy: FeatureCollectionWithIds;
		novice: FeatureCollectionWithIds;
		intermediate: FeatureCollectionWithIds;
		expert: FeatureCollectionWithIds;
		nullDiff: FeatureCollectionWithIds;
		unknown: FeatureCollectionWithIds;
	};
	lifts: {
		liftLines: FeatureCollectionWithIds;
		liftStartPoints: FeatureCollectionWithIds;
	};
}

export interface FeatureCollectionWithIds {
	type: "FeatureCollection";
	features: (any & { id: number })[];
}

export interface UseStationDataResult {
	stationData: StationData | null;
	stationCoordinates: StationCoordinates | null;
	assets: StationAssets | null;
	isLoading: boolean;
}

export interface Station {
	osmId: string;
	name: string;
	logo: string;
	domain: string;
	website: string;
	emergencyPhone: string;
	altitudeMin: number;
	altitudeMax: number;
	latitude: number;
	longitude: number;
	distanceSlope: number;
	countEasy: number;
	countIntermediate: number;
	countAdvanced: number;
	countExpert: number;
}

export interface UseStationsResult {
	stations: Station[];
	dropdownItems: { label: string; value: string }[];
	selectedStation: Station | null;
	isLoading: boolean;
	setSelectedStation: (station: Station) => void;
}
