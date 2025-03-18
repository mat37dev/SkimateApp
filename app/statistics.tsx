import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import { Link } from 'expo-router';
import {useThemeColor} from "@/hooks/useThemeColor";

export default function Statistics() {

    const textColor = useThemeColor({}, 'tint');

    return (
        <View style={styles.mainContainer}>
            <ImageBackground
                source={require("../assets/background/pexels-ryank-20042214.jpg")}
                style={styles.background}
                imageStyle={styles.backgroundImage}
            >
                <View style={styles.topContainer}>
                    <View style={styles.chronoContainer}>
                        <Text style={styles.textStyle}>Distance : 00km</Text>
                        <Text style={styles.textStyle}>Temps : 00:00</Text>
                    </View>
                    <View style={styles.iconChrono}>
                        <TouchableOpacity>
                            <Entypo name="stopwatch" style={styles.stopWatchIcon} />
                        </TouchableOpacity>
                    </View>
                </View>
                <ScrollView contentContainerStyle={styles.bottomContainer}>
                    <View style={styles.sessionsContainer}>
                        <View style={styles.sessionTextContainer}>
                            <Text style={styles.sessionText}>Session 1 : 20km en 1:00</Text>
                            <Text style={styles.sessionText}>Session 2 : 20km en 1:00</Text>
                            <Text style={styles.sessionText}>Session 3 : 20km en 1:00</Text>
                        </View>
                        <View style={styles.sessionTextContainer}>
                            <Text style={styles.sessionText}>Session 4 : 15km en 0:45</Text>
                            <Text style={styles.sessionText}>Session 5 : 18km en 0:50</Text>
                            <Text style={styles.sessionText}>Session 6 : 22km en 1:10</Text>
                        </View>
                    </View>
                    <View style={styles.statsContainer}>
                        <View style={styles.row}>
                            <View style={styles.totalStats}>
                                <Text style={styles.statsText}>
                                    Nombre de descentes effectuées aujourd’hui: 5 descentes
                                </Text>
                            </View>
                            <View style={styles.totalStats}>
                                <Text style={styles.statsText}>
                                    Temps moyen par descente : 20 minutes
                                </Text>
                            </View>
                        </View>
                        <View style={styles.row}>
                            <View style={styles.totalStats}>
                                <Text style={styles.totalStatsText}>Distance totale : 20 km</Text>
                            </View>
                            <View style={styles.totalStats}>
                                <Text style={styles.totalStatsText}>Temps total : 2h30</Text>
                            </View>
                        </View>
                    </View>
                    {/* Lien pour revenir au dashboard si tu le souhaites */}
                    <Link href="/dashboard" asChild>
                        <TouchableOpacity style={{ marginTop: 20 }}>
                            <Text style={{ color: textColor, textAlign: 'center' }}>Retour au Dashboard</Text>
                        </TouchableOpacity>
                    </Link>
                </ScrollView>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    background: {
        flex: 1,
    },
    backgroundImage: {
        opacity: 0.5,
    },
    topContainer: {
        alignItems: "center",
        marginTop: 30,
    },
    chronoContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    textStyle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 5,
    },
    stopWatchIcon: {
        fontSize: 120,
        color: "#333",
        marginTop: 20,
    },
    iconChrono: {
        alignItems: "center",
        justifyContent: "center",
    },
    bottomContainer: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    sessionsContainer: {
        backgroundColor: "#ffffff",
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginTop: 20,
        opacity: 0.84,
        flexDirection: "row",
        justifyContent: "space-around",
    },
    sessionTextContainer: {
        width: "50%",
    },
    sessionText: {
        fontSize: 11,
        textAlign: "center",
        color: "#555",
        marginVertical: 5,
    },
    statsContainer: {
        backgroundColor: "#ffffff",
        borderRadius: 10,
        padding: 15,
        margin: 15,
    },
    row: {
        marginBottom: 10,
        flexDirection: "row",
    },
    totalStats: {
        flexDirection: "row",
        marginTop: 5,
        width: "50%",
    },
    totalStatsText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#444",
    },
    statsText: {
        fontSize: 10,
    },
});