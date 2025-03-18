/**
 * Exemple de palette de couleurs light/dark.
 * N'hésite pas à ajuster les hex selon tes préférences.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    whiteText: '#fff',
    containerHeader: '#0A3A5D',
    background: '#e1e9f4',    // Gris/bleu clair pour un look plus "moderne" qu'un blanc pur
    tint: tintColorLight,     // Couleur d'accent primaire (ex: pour les boutons, liens, icônes sélectionnées)
    icon: '#687076',        // Couleur d'icônes par défaut
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    separator: '#D1D5DB',     // Couleur de séparateur (ex: lignes, bordures)
    card: '#FFFFFF',      // Couleur pour des cartes/containers si besoin
    errorText: "#de0707",
    successText: '#0a7ea4',
  },
  dark: {
    text: '#11181C',
    whiteText: '#fff',
    containerHeader: '#11181C',
    background: '#11181C',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    separator: '#2A2D2F',
    card: '#1E1F20', // Optionnel, couleur pour "card" en mode dark
    errorText: "#de0707",
    successText: '#0a7ea4',
  },
};
