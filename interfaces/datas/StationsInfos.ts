import { ImageSourcePropType } from "react-native";

export interface StationInfo {
	name: string;
	domain: string;
	website: string;
	emergencyPhone: string;
	altitudeMin?: number | null;
	altitudeMax?: number | null;
	distanceSlope?: number | null;
	countEasy?: number | null;
	countIntermediate?: number | null;
	countAdvanced?: number | null;
	countExpert?: number | null;
	logo?: ImageSourcePropType | null;
}
