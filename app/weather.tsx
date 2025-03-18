import React, {useEffect, useRef, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ImageBackground,
    Image, Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '@/api/apiClient';
import { useThemeColor } from '@/hooks/useThemeColor';
import CollapsibleHeader from "@/components/CollapsibleHeader";
import {router} from "expo-router";


function getWeatherImage(weatherCode: any): any {
    const code = Array.isArray(weatherCode) ? weatherCode[1]?.toLowerCase() : '';
    switch (code) {
        case 'ensoleille':
            return require('@/assets/weatherIcons/sunny.png');
        case 'nuageux':
            return require('@/assets/weatherIcons/cloudy.png');
        case 'brouillard':
            return require('@/assets/weatherIcons/fog.png');
        case 'pluvieux':
            return require('@/assets/weatherIcons/rainy.png');
        case 'neigeux':
            return require('@/assets/weatherIcons/snow.png');
        default:
            return require('@/assets/weatherIcons/inconnue.png');
    }
}

const WeatherScreen: React.FC = () => {
    const scrollY = useRef(new Animated.Value(0)).current;
    const [forecast, setForecast] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [stationId, setStationId] = useState<string | null>(null);
    const [stationName, setStationName] = useState<string | null>(null);

    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'background');

    // Récupère la station sélectionnée depuis AsyncStorage
    useEffect(() => {
        const fetchStationName = async () => {
            try {
                const stored = await AsyncStorage.getItem('selected_station');
                if (stored) {
                    setStationId(stored);
                } else {
                    setError("Aucune station sélectionnée.");
                }
            } catch (err) {
                setError("Erreur lors de la récupération de la station.");
            }
        };
        fetchStationName();
    }, []);



    // Appel API météo avec le nom de la station
    useEffect(() => {
        if (!stationId) return;

        const fetchWeather = async () => {
            try {
                // Récupérer les informations de la station
                const infoRes = await apiClient.post('/station/information', {
                    osmId: stationId,
                });

                if (infoRes.data && infoRes.data.name) {
                    setStationName(infoRes.data.name);
                    const response = await apiClient.post('/weather', {
                        location: infoRes.data.name,
                    });
                    if (response.data && response.data.forecasts && response.data.forecasts.length > 0) {
                        setForecast(response.data.forecasts);
                    } else {
                        setError('Aucune donnée de prévision disponible.');
                    }
                }
            } catch (err: any) {
                console.log(err);
                setError('Impossible de charger les prévisions météo.');
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [stationId]);

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor }]}>
                <ActivityIndicator size="large" color="#003566" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor }]}>
                <Text style={[styles.errorText, { color: textColor }]}>{error}</Text>
            </View>
        );
    }

    const handleBack = () => {
        router.replace("/dashboard");
    }

    return (
        <ImageBackground
            source={require('@/assets/background/pexels-ryank-20042214.jpg')}
            style={styles.background}
            imageStyle={styles.backgroundImage}
        >
            <View style={[styles.container, { backgroundColor }]}>
                {/* En-tête */}
                <CollapsibleHeader scrollY={scrollY} title="Météos" showBackButton={true} onBackPress={handleBack}/>

                <Animated.ScrollView
                    contentContainerStyle={styles.scrollContent}
                    onScroll={Animated.event(
                        [{nativeEvent: {contentOffset: {y: scrollY}}}],
                        {useNativeDriver: false}
                    )}
                    scrollEventThrottle={16}
                >
                    <Text style={[styles.headerTitle, {color: textColor}]}>Météo de la station:</Text>
                    <Text style={[styles.headerTitle, {color: textColor}]}>{stationName}</Text>
                    {forecast.map((dayForecast, index) => {
                        const date = new Date(dayForecast.day);
                        return (
                            <View key={index} style={styles.dayContainer}>
                                <Text style={[styles.dayTitle, { color: textColor }]}>
                                    {date.toLocaleDateString('fr-FR', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                    })}
                                </Text>
                                {/* Affichage détaillé pour le matin */}
                                <View style={styles.periodContainer}>
                                    <Text style={[styles.periodTitle, { color: textColor }]}>Matin</Text>
                                    <View style={styles.periodContent}>
                                        <Image
                                            source={getWeatherImage(dayForecast.morning.weather_code)}
                                            style={styles.weatherImage}
                                            resizeMode="contain"
                                        />
                                        <View style={styles.infoContainer}>
                                            <Text style={[styles.temperature, { color: textColor }]}>
                                                {dayForecast.morning.temperature_2m}°C
                                            </Text>
                                            <Text style={[styles.description, { color: textColor }]}>
                                                {dayForecast.morning.weather_code[0]}
                                            </Text>
                                            <Text style={[styles.info, { color: textColor }]}>
                                                Vent: {dayForecast.morning.wind_speed_10m} km/h
                                            </Text>
                                            <Text style={[styles.info, { color: textColor }]}>
                                                Chute: {dayForecast.morning.snowfall || 0} cm
                                            </Text>
                                            <Text style={[styles.info, { color: textColor }]}>
                                                Prof.: {Math.round(dayForecast.morning.snow_depth*100) || 0} cm
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                {/* Affichage détaillé pour l'après-midi */}
                                <View style={styles.periodContainer}>
                                    <Text style={[styles.periodTitle, { color: textColor }]}>Après-midi</Text>
                                    <View style={styles.periodContent}>
                                        <Image
                                            source={getWeatherImage(dayForecast.afternoon.weather_code)}
                                            style={styles.weatherImage}
                                            resizeMode="contain"
                                        />
                                        <View style={styles.infoContainer}>
                                            <Text style={[styles.temperature, { color: textColor }]}>
                                                {dayForecast.afternoon.temperature_2m}°C
                                            </Text>
                                            <Text style={[styles.description, { color: textColor }]}>
                                                {dayForecast.afternoon.weather_code[0]}
                                            </Text>
                                            <Text style={[styles.info, { color: textColor }]}>
                                                Vent: {dayForecast.afternoon.wind_speed_10m} km/h
                                            </Text>
                                            <Text style={[styles.info, { color: textColor }]}>
                                                Chute: {dayForecast.afternoon.snowfall || 0} cm
                                            </Text>
                                            <Text style={[styles.info, { color: textColor }]}>
                                                Prof.: {Math.round(dayForecast.afternoon.snow_depth*100) || 0} cm
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </Animated.ScrollView>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    backgroundImage: {
        opacity: 0.5,
    },
    container: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingTop: 10,
        paddingBottom: 50,
    },
    dayContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    dayTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    periodContainer: {
        marginBottom: 10,
    },
    periodTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
    },
    periodContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    weatherImage: {
        width: 50,
        height: 50,
        marginRight: 10,
    },
    infoContainer: {
        flex: 1,
    },
    temperature: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 16,
        marginBottom: 5,
    },
    info: {
        fontSize: 14,
    },
});

export default WeatherScreen;
