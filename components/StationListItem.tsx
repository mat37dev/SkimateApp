import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import {API_URL} from '@/api/apiClient';

type StationListItemProps = {
    logo?: ImageSourcePropType | null;  // source de l'image, par ex. require('../assets/images/stationLogo.png')
    text: string;
    onPress?: () => void;
};

export function StationListItem({ logo, text, onPress }: StationListItemProps) {
    const textColor = useThemeColor({}, 'text');

    // Si un onPress est fourni, on rend le tout cliquable avec TouchableOpacity
    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} style={styles.container}>
                {logo && <Image source={{ uri: API_URL + logo }} style={styles.logo} resizeMode="contain" />}
                <Text style={[styles.text, { color: textColor }]}>
                    {text}
                </Text>
            </TouchableOpacity>
        );
    }

    // Sinon, on renvoie juste une vue non-cliquable
    return (
        <View style={styles.container}>
            {logo && <Image source={logo} style={styles.logo} resizeMode="contain" />}
            <Text style={[styles.text, { color: textColor }]} numberOfLines={1}>
                {text}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    logo: {
        width: 30,
        height: 30,
        marginRight: 8,
    },
    text: {
        fontSize: 18,
    },
});
