import React, {useRef, useState, useEffect} from "react";
import {
    Animated,
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity, ImageSourcePropType
} from "react-native";
import {useThemeColor} from "@/hooks/useThemeColor";
import CollapsibleHeader from "../components/CollapsibleHeader";
import {Card} from '@/components/Card';
import {globalStyles} from "@/styles/globalStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "@/api/apiClient";
import Ionicons from "@expo/vector-icons/Ionicons";
import {WeatherCard} from "@/components/DashboardCards/WeatherCard";
import {CardContact} from "@/components/DashboardCards/CardContact";
import {StationStatsCard} from "@/components/DashboardCards/StationStatsCard";
import {ListDomainStationsCard} from "@/components/DashboardCards/ListDomainStationsCard";
import {StationListItem} from "@/components/StationListItem";
import CommentCard from "@/components/DashboardCards/CommentCard";

interface StationInfo {
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

export default function DashboardScreen() {
    // Gestion du scroll pour le header collapsant
    const scrollY = useRef(new Animated.Value(0)).current;

    // Couleurs du thème
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');

    // Station sélectionnée (null si aucune)
    const [selectedStation, setSelectedStation] = useState<string | null>(null);

    // États pour la recherche
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const backgroundColorCard = useThemeColor({}, 'card');

    const [stationInfo, setStationInfo] = useState<StationInfo | null>(null);
    const [weatherToday, setWeatherToday] = useState<any | null>(null);
    const [weatherTomorrow, setWeatherTomorrow] = useState<any | null>(null);

    useEffect(() => {
        if (!selectedStation) return; // pas de station => pas de requête

        (async () => {
            try {
                // 1) Récup info station
                const infoRes = await apiClient.post('/station/information', {
                    osmId: selectedStation,
                });
                setStationInfo(infoRes.data);

                if (infoRes.data?.name) {
                    const weatherRes = await apiClient.post('/weather', {
                        location: infoRes.data.name,
                    });
                    setWeatherToday(weatherRes.data.forecasts[0]);
                    setWeatherTomorrow(weatherRes.data.forecasts[1]);
                }
            } catch (err) {
                console.warn("Erreur chargement station/weather:", err);
            }
        })();
    }, [selectedStation]);


    // Au montage, on vérifie si on a déjà une station enregistrée
    useEffect(() => {
        (async () => {
            try {
                const savedStation = await AsyncStorage.getItem('selected_station');
                if (savedStation) {
                    setSelectedStation(savedStation);
                }
            } catch (error) {
                console.warn("Erreur lors de la lecture de la station:", error);
            }
        })();
    }, []);

    // Fonction appelée quand l'utilisateur tape dans la barre de recherche
    const handleSearch = async (text: string) => {
        setSearchTerm(text);

        if (text.length === 0) {
            setSearchResults([]);
            return;
        }

        try {
            setIsSearching(true);
            const response = await apiClient.get(`/stations`, {
                params: {q: text},
            });
            setSearchResults(response.data); // En supposant que l'API renvoie un array
        } catch (error) {
            console.warn("Erreur lors de la recherche de stations:", error);
        } finally {
            setIsSearching(false);
        }
    };

    // Fonction quand on clique sur une station proposée
    const handleSelectStation = async (stationId: string) => {
        await AsyncStorage.setItem('selected_station', stationId);
        setSelectedStation(stationId);
    };

    const handleReset = async () => {
        await AsyncStorage.removeItem('selected_station');
        setSelectedStation(null);
    }

    // — Rendu : si on n'a PAS de station sélectionnée → affichage "recherche + favoris"
    if (!selectedStation) {
        return (
            <View style={[styles.container, {backgroundColor}]}>
                <CollapsibleHeader scrollY={scrollY} title="Stations"/>


                <Animated.ScrollView
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={[globalStyles.screenContainer]}>
                        {/* Barre de recherche */}
                        <View style={styles.searchContainer}>
                            <TextInput
                                style={[styles.searchInput, {color: textColor}]}
                                placeholder="Rechercher une station"
                                placeholderTextColor="#aaa"
                                value={searchTerm}
                                onChangeText={handleSearch}
                            />
                            {isSearching && (
                                <Text style={[styles.loadingText, {color: textColor}]}>
                                    Recherche...
                                </Text>
                            )}

                            {/* Liste des résultats (overlay absolu) */}
                            {searchResults.length > 0 && (
                                <View style={[styles.resultsContainer, {backgroundColor: backgroundColorCard}]}>
                                    {searchResults.map((station) => (
                                        <StationListItem
                                            key={station.osmId}
                                            logo={station.logo || null}
                                            text={station.name}
                                            onPress={() => handleSelectStation(station.osmId)}
                                        />
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Card de favoris */}
                        <Card>
                            <Text style={{color: textColor, fontWeight: 'bold'}}>Favoris</Text>
                            {/* À remplir plus tard */}
                            <Text>Listes de vos stations favorites.</Text>
                        </Card>
                    </View>
                </Animated.ScrollView>
            </View>
        );
    }

    // -- Sinon, si on a une station => on affiche la version "header collapsant" + cards
    return (
        <View style={[styles.container, {backgroundColor}]}>
            <CollapsibleHeader scrollY={scrollY} title={stationInfo?.name} showBackButton={true} onBackPress={handleReset} logo={stationInfo?.logo}/>
            <Animated.ScrollView
                contentContainerStyle={styles.scrollContent}
                onScroll={Animated.event(
                    [{nativeEvent: {contentOffset: {y: scrollY}}}],
                    {useNativeDriver: false}
                )}
                scrollEventThrottle={16}
            >
                {stationInfo && (
                    <Text style={[styles.domainText, {color: textColor},{fontWeight: 'bold'}]}>
                        <Ionicons name="location" size={24} color={textColor}/>
                        {stationInfo.domain}
                    </Text>
                )}

                {/* Row d'icônes ronds */}
                <View style={styles.iconRow}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="heart" size={24} color="#fff"/>
                        <Text style={styles.iconLabel}>Favoris</Text>
                    </TouchableOpacity>
                    {/* etc. */}
                </View>
                <View style={[globalStyles.screenContainer]}>
                    <WeatherCard
                        weatherToday={weatherToday}
                        weatherTomorrow={weatherTomorrow}
                    />
                    {stationInfo && <StationStatsCard stationInfo={stationInfo} />}
                    {stationInfo && stationInfo.domain && (
                        <ListDomainStationsCard
                            domain={stationInfo.domain}
                            onSelectStation={(osmId: string) => {
                                AsyncStorage.setItem('selected_station', osmId);
                                setSelectedStation(osmId);
                            }}
                            selectedStationId={selectedStation}
                        />
                    )}

                    <CommentCard osmId={selectedStation} />
                    <CardContact website={stationInfo?.website} emergencyPhone={stationInfo?.emergencyPhone} />
                </View>
            </Animated.ScrollView>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 10,
        paddingBottom: 50,
    },
    searchContainer: {
        position: 'relative',
        width: '85%',
        marginBottom: 15,
    },
    searchInput: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
    },
    loadingText: {
        marginTop: 5,
        fontStyle: 'italic',
    },
    resultsContainer: {
        // On le met en position absolue pour qu'il flotte au-dessus
        position: 'absolute',
        top: 50,       // Ajuste pour qu'il soit juste en dessous du TextInput
        left: 0,
        right: 0,
        zIndex: 999,   // Pour être sûr d'être au-dessus des autres éléments

        borderRadius: 8,
        paddingVertical: 8,
        // Shadow iOS
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        // Shadow Android
        elevation: 4,
    },
    resultItem: {
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: '#ccc',
    },
    resultItemText: {
        fontSize: 14,
    },
    domainText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 25
    },
    iconRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        width: '100%',
    },
    iconButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a7ea4',
        borderRadius: 30,
        width: 60,
        height: 60,
    },
    iconLabel: {
        color: '#fff',
        marginTop: 2,
        fontSize: 10,
    },
});
