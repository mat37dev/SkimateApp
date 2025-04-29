import { StyleProp, ViewStyle } from "react-native";

export interface RoundedButtonProps {
	onPress: () => void;
	style?: StyleProp<ViewStyle>;
	children?: React.ReactNode; // So we can pass icons or text
}
