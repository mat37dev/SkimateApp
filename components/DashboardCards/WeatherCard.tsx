import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Card } from '@/components/Card';
import { useThemeColor } from '@/hooks/useThemeColor';
import {useRouter} from "expo-router";
import {TextStyles} from "@/constants/TextStyles";

type WeatherCardProps = {
    weatherToday: any | null;
    weatherTomorrow: any | null;
};

export function WeatherCard({ weatherToday, weatherTomorrow }: WeatherCardProps) {
    const [activeDay, setActiveDay] = useState<'today' | 'tomorrow'>('today');
    const textColor = useThemeColor({}, 'text');
    const router = useRouter();

    // Petit helper pour importer l'icône météo PNG selon le code
    const getWeatherImage = (iconName: string) => {
        // Adapte le chemin selon ta structure
        switch (iconName) {
            case 'ensoleille':     return require('../../assets/weatherIcons/sunny.png');
            case 'nuageux':    return require('../../assets/weatherIcons/cloudy.png');
            case 'brouillard':       return require('../../assets/weatherIcons/fog.png');
            case 'pluvieux':     return require('../../assets/weatherIcons/rainy.png');
            case 'neigeux':      return require('../../assets/weatherIcons/snow.png');
            default:          return require('../../assets/weatherIcons/inconnue.png');
        }
    };

    // Mini-icônes : vent, neige, flocon
    const iconVent   = require('../../assets/weatherIcons/vent.png');
    const iconNeige  = require('../../assets/weatherIcons/neige.png');
    const iconFlocon = require('../../assets/weatherIcons/flocon-de-neige.png');

    // Retourne la météo d'un jour (matin et après-midi), selon "today" ou "tomorrow"
    const currentWeather = activeDay === 'today' ? weatherToday : weatherTomorrow;

    return (
        <Card>
            {/* Onglets pour choisir le jour */}
            <Text style={styles.link} onPress={()=> router.push("/weather")}>Voir la semaine -&gt;</Text>
            <Text style={[styles.header, {color: textColor}, TextStyles.cardTitle]}>Météo de la station</Text>
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, activeDay === 'today' && styles.tabButtonActive]}
                    onPress={() => setActiveDay('today')}
                >
                    <Text style={[styles.tabLabel, activeDay === 'today' && styles.tabLabelActive]}>
                        Aujourd'hui
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabButton, activeDay === 'tomorrow' && styles.tabButtonActive]}
                    onPress={() => setActiveDay('tomorrow')}
                >
                    <Text style={[styles.tabLabel, activeDay === 'tomorrow' && styles.tabLabelActive]}>
                        Demain
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Blocks Matin + Après-midi */}
            <View style={styles.dayContainer}>
                {/* Matin */}
                {currentWeather?.morning && (
                    <View style={styles.weatherBlock}>
                        <Text style={[styles.blockTitle, { color: textColor }]}>Matin</Text>

                        {/* Image Météo principale */}
                        <Image
                            source={getWeatherImage(currentWeather.morning.weather_code[1])}
                            style={styles.weatherImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.tempText}>{currentWeather.morning.temperature_2m}°C</Text>
                        <Text style={styles.weatherLabel}>{currentWeather.morning.weather_code[0]}</Text>

                        {/* Petit bloc d'infos */}
                        <View style={styles.infoRow}>
                            {/* vent */}
                            <Image source={iconVent} style={styles.miniIcon} resizeMode="contain" />
                            <Text style={[styles.infoText, TextStyles.bodyText]}>
                                {currentWeather.morning.wind_speed_10m} km/h
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            {/* profondeur de neige */}
                            <Image source={iconFlocon} style={styles.miniIcon} resizeMode="contain" />
                            <Text style={[styles.infoText, TextStyles.bodyText]}>
                                {Math.round(currentWeather.morning.snow_depth*100)} cm
                            </Text>
                        </View>

                        {/* Chutes de neige (si > 0) */}
                        {!!currentWeather.morning.snowfall && currentWeather.morning.snowfall > 0 && (
                            <View style={styles.infoRow}>
                                <Image source={iconNeige} style={styles.miniIcon} resizeMode="contain" />
                                <Text style={[styles.infoText, TextStyles.bodyText]}>
                                    {currentWeather.morning.snowfall} cm
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Après-midi */}
                {currentWeather?.afternoon && (
                    <View style={styles.weatherBlock}>
                        <Text style={[styles.blockTitle, { color: textColor }]}>Après-midi</Text>

                        <Image
                            source={getWeatherImage(currentWeather.afternoon.weather_code[1])}
                            style={styles.weatherImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.tempText}>{currentWeather.afternoon.temperature_2m}°C</Text>
                        <Text style={styles.weatherLabel}>{currentWeather.afternoon.weather_code[0]}</Text>

                        <View style={styles.infoRow}>
                            <Image source={iconVent} style={styles.miniIcon} resizeMode="contain" />
                            <Text style={[styles.infoText, TextStyles.bodyText]}>
                                {currentWeather.afternoon.wind_speed_10m} km/h
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Image source={iconFlocon} style={styles.miniIcon} resizeMode="contain" />
                            <Text style={[styles.infoText, TextStyles.bodyText]}>
                                {Math.round(currentWeather.afternoon.snow_depth*100)} cm
                            </Text>
                        </View>
                        {!!currentWeather.afternoon.snowfall && currentWeather.afternoon.snowfall > 0 && (
                            <View style={styles.infoRow}>
                                <Image source={iconNeige} style={styles.miniIcon} resizeMode="contain" />
                                <Text style={[styles.infoText, TextStyles.bodyText]}>
                                    {currentWeather.afternoon.snowfall} cm
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    header:{
        marginBottom: 10,
        textAlign: 'center',
    },
    link: {
        color: '#0a7ea4',
        textDecorationLine: 'underline',
        textAlign: 'right',
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
    },
    tabButton: {
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#ddd',
        marginHorizontal: 5,
    },
    tabButtonActive: {
        backgroundColor: '#0a7ea4',
    },
    tabLabel: {
        color: '#555',
        fontWeight: '600',
    },
    tabLabelActive: {
        color: '#fff',
    },

    dayContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    weatherBlock: {
        width: '45%',
        backgroundColor: '#0a7ea4',
        borderRadius: 12,
        alignItems: 'center',
        padding: 10,
    },
    blockTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 6,
    },
    weatherImage: {
        width: 50,
        height: 50,
        marginBottom: 6,
    },
    tempText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 2,
    },
    weatherLabel: {
        fontSize: 14,
        color: '#fff',
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 2,
    },
    miniIcon: {
        width: 16,
        height: 16,
        marginRight: 4,
    },
    infoText: {
        color: '#fff',
    },
});
