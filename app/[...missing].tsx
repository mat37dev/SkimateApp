import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function MissingPage() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Oups, cette page n'existe pas.</Text>
            <Link href="/" style={styles.link}>
                <Text style={styles.linkText}>Revenir à l'accueil</Text>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fafafa',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 20,
    },
    link: {
        marginTop: 15,
        paddingVertical: 15,
    },
    linkText: {
        color: 'blue',
        fontSize: 16,
        textDecorationLine: 'underline',
    },
});