// src/components/CollapsibleHeader.tsx
import React from "react";
import {
    Animated,
    StyleSheet,
    StyleProp,
    ViewStyle,
    Platform,
    TouchableOpacity,
    View,
    Image,
    ImageSourcePropType,
} from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import Ionicons from "@expo/vector-icons/Ionicons";
import { API_URL } from "@/api/apiClient";

type CollapsibleHeaderProps = {
    scrollY: Animated.Value;
    maxHeight?: number;
    minHeight?: number;
    maxFontSize?: number;
    minFontSize?: number;
    title?: string;
    containerStyle?: StyleProp<ViewStyle>;
    showBackButton?: boolean;
    onBackPress?: () => void;
    logo?: ImageSourcePropType | null;
};

export default function CollapsibleHeader({
                                              scrollY,
                                              maxHeight = 100,
                                              minHeight = 50,
                                              maxFontSize = 24,
                                              minFontSize = 18,
                                              title = "Mon Titre",
                                              showBackButton = false,
                                              onBackPress,
                                              logo,
                                          }: CollapsibleHeaderProps) {
    let textColor = useThemeColor({}, "text");
    let bgColor = useThemeColor({}, "background");

    // Interpolation de la hauteur et de la taille de police
    const headerHeight = scrollY.interpolate({
        inputRange: [0, 50],
        outputRange: [maxHeight, minHeight],
        extrapolate: "clamp",
    });

    const titleFontSize = scrollY.interpolate({
        inputRange: [0, 50],
        outputRange: [maxFontSize, minFontSize],
        extrapolate: "clamp",
    });

    if (Platform.OS === "web") {
        bgColor = "#f2f4f7";
        textColor = "#11181C";
    }

    return (
        <Animated.View style={[styles.header, { backgroundColor: bgColor, height: headerHeight }]}>
            {showBackButton && (
                <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
            )}
            {/* Conteneur pour le logo et le titre */}
            <View style={styles.titleContainer}>
                {logo && (
                    <Image
                        source={{ uri: API_URL + logo }}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                )}
                <Animated.Text style={[styles.title, { color: textColor, fontSize: titleFontSize }]}>
                    {title}
                </Animated.Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    header: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
    },
    backButton: {
        marginRight: 10,
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    logo: {
        width: 30,
        height: 30,
        marginRight: 8,
    },
    title: {
        fontWeight: "bold",
        flexShrink: 1,
    },
});
