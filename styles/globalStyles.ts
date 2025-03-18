// src/styles/globalStyles.ts
import { StyleSheet } from 'react-native';

/**
 * Styles réutilisables pour l'ensemble de l'application.
 * Ici, on définit un container principal et le style d'une "card".
 */
export const globalStyles = StyleSheet.create({
    // Un conteneur d’écran (ou de section) typique
    screenContainer: {
        flex: 1,
        alignItems: 'center',
        // On centre horizontalement les children (dont nos cards)
        paddingTop: 15,
        paddingBottom: 15,
    },
    // Style commun pour les cartes
    card: {
        width: '90%',
        marginBottom: 40,  // Séparation verticale de 15px
        padding: 15,       // Un peu de padding interne
        borderRadius: 15,   // Coins arrondis

        // Ombrés (Shadow) iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,

        // Ombrés (Shadow) Android
        elevation: 3,
    },
});
