import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/Card';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { TextStyles } from '@/constants/TextStyles';

export type StationStatsCardProps = {
    stationInfo: {
        altitudeMin?: number | null;
        altitudeMax?: number | null;
        distanceSlope?: number | null;
        countEasy?: number | null;
        countIntermediate?: number | null;
        countAdvanced?: number | null;
        countExpert?: number | null;
    };
};

export function StationStatsCard({ stationInfo }: StationStatsCardProps) {
    const textColor = useThemeColor({}, 'text');
    const cardBg = useThemeColor({}, 'card');
    const {
        altitudeMin,
        altitudeMax,
        distanceSlope,
        countEasy,
        countIntermediate,
        countAdvanced,
        countExpert,
    } = stationInfo;

    // Calcul du dénivelé
    const denivele =
        altitudeMin != null && altitudeMax != null ? altitudeMax - altitudeMin : null;

    // Section 1 : Statistiques
    // On prépare un tableau des items à afficher
    const statsItems: { label: string; value: string; icon: any }[] = [];
    if (altitudeMin != null) {
        statsItems.push({
            label: 'Altitude basse',
            value: `${altitudeMin} m`,
            icon: 'arrow-down',
        });
    }
    if (altitudeMax != null) {
        statsItems.push({
            label: 'Altitude haute',
            value: `${altitudeMax} m`,
            icon: 'arrow-up',
        });
    }
    if (distanceSlope != null) {
        statsItems.push({
            label: 'Distance de piste',
            value: `${distanceSlope} m`,
            icon: 'navigate',
        });
    }
    if (denivele != null) {
        statsItems.push({
            label: 'Dénivelé',
            value: `${denivele} m`,
            icon: 'trending-up',
        });
    }

    // Section 2 : Difficulté des descentes
    // Préparation des items de difficulté avec le code couleur souhaité
    const difficultyItems: { label: string; count: number; color: string; icon: any }[] = [];
    if (countEasy != null) {
        difficultyItems.push({
            label: 'Piste verte',
            count: countEasy,
            color: '#4CAF50', // Vert
            icon: 'checkmark-circle',
        });
    }
    if (countIntermediate != null) {
        difficultyItems.push({
            label: 'Piste bleue',
            count: countIntermediate,
            color: '#2196F3', // Bleu
            icon: 'information-circle',
        });
    }
    if (countAdvanced != null) {
        difficultyItems.push({
            label: 'Piste rouge',
            count: countAdvanced,
            color: '#F44336', // Rouge
            icon: 'alert-circle',
        });
    }
    if (countExpert != null) {
        difficultyItems.push({
            label: 'Piste noire',
            count: countExpert,
            color: '#000000', // Noir
            icon: 'close-circle',
        });
    }

    const totalSlopes = (Number(countEasy) || 0) +
        (Number(countIntermediate) || 0) +
        (Number(countAdvanced) || 0) +
        (Number(countExpert) || 0);

    // Pour le gauge, on calcule la proportion de chaque niveau
    const totalForGauge = difficultyItems.reduce((sum, item) => sum + Number(item.count), 0);
    return (
        <Card style={[styles.cardContainer, { backgroundColor: cardBg }]}>
            {/* Section 1 : Statistiques */}
            <View style={styles.statsSection}>
                <Text style={[styles.statisticTitle, { color: textColor }, TextStyles.cardTitle]}>Statistiques de la station</Text>
                {statsItems.map((item, index) => (
                    <View key={index} style={styles.statItem}>
                        <View style={styles.statLabelContainer}>
                            <Ionicons name={item.icon} size={16} color={textColor} style={styles.statIcon} />
                            <Text style={[styles.statLabel, { color: textColor }]}>{item.label}</Text>
                        </View>
                        <Text style={[styles.statValue, { color: textColor }]}>{item.value}</Text>
                    </View>
                ))}
            </View>

            {/* Ligne de séparation */}
            <View style={styles.divider} />

            {/* Section 2 : Difficulté des descentes */}
            <View style={styles.difficultySection}>
                <Text style={[styles.statisticTitle, { color: textColor }, TextStyles.cardTitle]}>Difficulté des descentes</Text>

                {/* Gauge horizontal */}
                <View style={styles.gaugeContainer}>
                    {difficultyItems.map((item, index) => {
                        // Calcule le pourcentage pour cet item.
                        const widthPercent = totalForGauge > 0 ? (item.count / totalForGauge) * 100 : 0;
                        return (
                            <View
                                key={index}
                                style={[
                                    styles.gaugeSegment,
                                    { width: `${widthPercent}%`, backgroundColor: item.color }
                                ]}
                            />
                        );
                    })}
                </View>



                {/* Liste des difficultés */}
                {difficultyItems.map((item, index) => (
                    <View key={index} style={styles.difficultyItem}>
                        <Ionicons name={item.icon} size={16} color={item.color} style={styles.difficultyIcon} />
                        <Text style={[styles.difficultyLabel, { color: textColor }, TextStyles.bodyText]}>{item.label}</Text>
                        <Text style={[styles.difficultyCount, { color: item.color }, TextStyles.bodyText]}>{item.count}</Text>
                    </View>
                ))}
                <View style={styles.difficultyItem}>
                    <Text style={styles.difficultyCount}>Total:</Text>
                    <Text style={styles.difficultyCount}>{totalSlopes} pistes</Text>
                </View>
            </View>
        </Card>
    );
}


const styles = StyleSheet.create({
    cardContainer: {
        padding: 15,
        marginVertical: 10,
        borderRadius: 10,
    },
    // Section 1 : Statistiques
    statsSection: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statItem: {
        width: '48%',
        marginVertical: 8,
    },
    statLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    statIcon: {
        marginRight: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginVertical: 15,
    },
    // Section 2 : Difficulté des descentes
    difficultySection: {
        // Optionnel : paddingHorizontal: 5,
    },
    statisticTitle: {
        marginBottom: 10,
    },
    gaugeContainer: {
        width: '100%',
        height: 20,
        flexDirection: 'row',
        backgroundColor: '#eee',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 10,
        position: 'relative',
    },
    gaugeSegment: {
        height: '100%',
    },
    totalText: {
        position: 'absolute',
        right: 8,
        top: 0,
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 4,
        borderRadius: 4,
    },
    difficultyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
        justifyContent: 'space-between',
    },
    difficultyIcon: {
        marginRight: 8,
    },
    difficultyLabel: {
        flex: 1,
    },
    difficultyCount: {
        fontWeight: 'bold',
    },
});
