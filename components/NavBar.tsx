import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

interface NavBarProps {
    title?: string;
}

const NavBar: React.FC<NavBarProps> = ({ title = "SkiMate" }) => {
    return (
        <View style={styles.container}>
            {/* Bouton Home */}
            <Link href="/" asChild>
                <TouchableOpacity style={styles.iconContainer}>
                    <Ionicons name="home" size={24} color="#fff" />
                </TouchableOpacity>
            </Link>

            {/* Titre au milieu */}
            <Text style={styles.title}>{title}</Text>

            {/* Bouton Statistique */}
            <Link href="/statistics" asChild>
                <TouchableOpacity style={styles.iconContainer}>
                    <Ionicons name="person" size={24} color="#fff" />
                </TouchableOpacity>
            </Link>

            {/* Bouton Dashboard */}
            <Link href="/dashboard" asChild>
                <TouchableOpacity style={styles.iconContainer}>
                    <Ionicons name="person" size={24} color="#fff" />
                </TouchableOpacity>
            </Link>
        </View>
    );
};

export default NavBar;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#003566',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 50,
        paddingHorizontal: 10,
        // Sur mobile, prévoir éventuellement un padding-top supplémentaire si nécessaire
        // paddingTop: Constants.statusBarHeight (si besoin et si import de Constants)
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    iconContainer: {
        padding: 5,
    },
});
