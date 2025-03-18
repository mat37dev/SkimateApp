// src/components/DashboardCards/CommentsSection.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { Card } from '@/components/Card';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import apiClient, {isUserConnected} from '@/api/apiClient';
import Ionicons from '@expo/vector-icons/Ionicons';
import {TextStyles} from "@/constants/TextStyles";

export type Comment = {
    id: string;
    title: string;
    description: string;
    note: number;
    createdAt: {
        date: string;
        timezone_type: number;
        timezone: string;
    };
    firstName: string;
    lastName: string;
};

export type CommentsSectionProps = {
    osmId: string;
};

const MAX_CHARS = 255;

export function CommentsSection({ osmId }: CommentsSectionProps) {
    // Liste des commentaires et état de chargement
    const [comments, setComments] = useState<Comment[]>([]);
    const [loadingComments, setLoadingComments] = useState<boolean>(true);
    const [errorComments, setErrorComments] = useState<string | null>(null);

    // États du formulaire
    const [commentTitle, setCommentTitle] = useState('');
    const [commentDescription, setCommentDescription] = useState('');
    const [commentRating, setCommentRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    // Vérification de la connexion
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const textColor = useThemeColor({}, 'text');
    const cardBg = useThemeColor({}, 'card');
    const router = useRouter();

    //système de trie
    const [sortMethod, setSortMethod] = useState<'date' | 'note'>('date');
    const [originalComments, setOriginalComments] = useState<Comment[]>([]);

    // Vérifier la connexion en cherchant un token
    useEffect(() => {
        const checkConnection = async () => {
            const connected = await isUserConnected();
            setIsLoggedIn(connected);
        };
        checkConnection();
    }, []);

    // Récupération des commentaires via POST /comments
    useEffect(() => {
        fetchComments();
    }, [osmId]);


    useEffect(() => {
        let sorted = [...originalComments];
        if (sortMethod === 'date') {
            sorted.sort((a, b) => {
                const dateA = new Date(a.createdAt.date.replace(' ', 'T')).getTime();
                const dateB = new Date(b.createdAt.date.replace(' ', 'T')).getTime();
                return dateB - dateA;
            });
        } else if (sortMethod === 'note') {
            sorted.sort((a, b) => b.note - a.note);
        }
        setComments(sorted);
    }, [sortMethod, originalComments]);

    const fetchComments = async () => {
        try {
            const response = await apiClient.post('/comments', { osmId });
            setComments(response.data);
            setOriginalComments(response.data);
        } catch (error) {
            setErrorComments("Erreur lors du chargement des commentaires.");
        } finally {
            setLoadingComments(false);
        }
    };

    // Fonction pour soumettre un nouveau commentaire via POST /comment/add
    const handleSubmitComment = async () => {
        if (!commentTitle.trim() || !commentDescription.trim()) return;
        setSubmitting(true);
        try {
            // Remplacez cet appel par votre appel réel à l'API
            await apiClient.post('/comment/add', {
                osmId,
                title: commentTitle,
                description: commentDescription,
                note: commentRating,
            });
            setCommentTitle('');
            setCommentDescription('');
            setCommentRating(0);
            await fetchComments();
        } catch (error) {
            console.warn("Erreur lors de la soumission du commentaire", error);
        } finally {
            setSubmitting(false);
        }
    };

    // Calcul de la note moyenne
    const totalRatings = comments.reduce((sum, comment) => sum + comment.note, 0);
    const averageRating = comments.length ? totalRatings / comments.length : 0;

// Calcul du nombre de commentaires pour chaque note (de 1 à 5)
    const ratingCounts = [1,2,3,4,5].reduce((acc, rating) => {
        acc[rating] = comments.filter(comment => comment.note === rating).length;
        return acc;
    }, {} as { [key: number]: number });

// Fonction pour obtenir le pourcentage d'une note
    const getRatingPercentage = (rating: number) => {
        return comments.length ? (ratingCounts[rating] / comments.length) * 100 : 0;
    };

// Fonction pour afficher les étoiles de la moyenne (gestion du demi-étoile)
    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) {
                stars.push(<Ionicons key={i} name="star" size={16} color="#FFD700" />);
            } else if (i === Math.floor(rating) + 1 && rating % 1 >= 0.5) {
                stars.push(<Ionicons key={i} name="star-half" size={16} color="#FFD700" />);
            } else {
                stars.push(<Ionicons key={i} name="star-outline" size={16} color="#ccc" />);
            }
        }
        return <View style={{ flexDirection: 'row' }}>{stars}</View>;
    };

    return (
        <Card style={[styles.cardContainer, { backgroundColor: cardBg }]}>
            <Text style={[styles.cardTitle, { color: textColor }]}>Commentaires</Text>

            {/* Section d'évaluation globale */}
            <View style={styles.overallRatingContainer}>
                <View style={styles.overallLeft}>
                    <Text style={[styles.averageRating, { color: textColor }]}>{averageRating.toFixed(1)}</Text>
                    <View style={styles.averageStars}>
                        {renderStars(averageRating)}
                    </View>
                    <View style={styles.commentCountContainer}>
                        <Text style={[styles.commentCountText, { color: textColor }]}>
                            {comments.length}
                        </Text>
                        <Ionicons name="person" size={16} color={textColor} />
                    </View>
                </View>
                <View style={styles.overallRight}>
                    {[5,4,3,2,1].map(rating => (
                        <View key={rating} style={styles.ratingRow}>
                            <Text style={[styles.ratingLabel, { color: textColor }]}>{rating}</Text>
                            <View style={styles.ratingBarContainer}>
                                <View
                                    style={[
                                        styles.ratingBarFill,
                                        { width: `${getRatingPercentage(rating)}%`, backgroundColor: '#0a7ea4' },
                                    ]}
                                />
                            </View>
                        </View>
                    ))}
                </View>
            </View>
            <View style={styles.divider} />

            <View style={styles.sortContainer}>
                <TouchableOpacity onPress={() => setSortMethod('date')}>
                    <Ionicons name="calendar" size={20} color={sortMethod === 'date' ? '#0a7ea4' : textColor} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSortMethod('note')}>
                    <Ionicons name="star" size={20} color={sortMethod === 'note' ? '#0a7ea4' : textColor} />
                </TouchableOpacity>
            </View>

            {loadingComments ? (
                <ActivityIndicator size="small" color="#0a7ea4" />
            ) : errorComments ? (
                <Text style={[styles.errorText, { color: textColor }]}>{errorComments}</Text>
            ) : comments.length === 0 ? (
                <Text style={[styles.noCommentsText, { color: textColor }]}>
                    Aucun commentaire pour le moment.
                </Text>
            ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.commentsList}>
                    {comments.map(comment => (
                        <TouchableOpacity key={comment.id} style={styles.commentCard}>
                            <View style={styles.headerComment}>
                                <Text style={[styles.commentTitle, { color: textColor }]}>{comment.title}</Text>
                                <Text style={[styles.commentAuthor, TextStyles.bodyText, { color: textColor }]}>
                                    {comment.lastName + " " + comment.firstName}
                                </Text>
                            </View>
                            <View style={styles.starsRow}>
                                {Array.from({ length: 5 }).map((_, index) => {
                                    const starNumber = index + 1;
                                    return (
                                        <Ionicons
                                            key={index}
                                            name={starNumber <= comment.note ? 'star' : 'star-outline'}
                                            size={16}
                                            color={starNumber <= comment.note ? '#FFD700' : '#ccc'}
                                        />
                                    );
                                })}
                                <Text style={[TextStyles.bodyText, { color: textColor }]}>
                                    {comment.note}/5
                                </Text>
                                <Text style={[styles.commentDate, TextStyles.bodyText, { color: textColor }]}>
                                    {new Date(comment.createdAt.date.replace(' ', 'T')).toLocaleDateString('fr-FR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: '2-digit',
                                    })}
                                </Text>
                            </View>
                            <Text style={[styles.commentDescription, { color: textColor }]}>{comment.description}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}


            {/* Séparateur */}
            <View style={styles.divider} />

            {/* Formulaire de commentaire ou message de connexion */}
            {isLoggedIn ? (
                <View style={styles.formContainer}>
                    <TextInput
                        style={[styles.input, { color: textColor }]}
                        placeholder="Titre (max 255 caractères)"
                        placeholderTextColor="#aaa"
                        value={commentTitle}
                        onChangeText={setCommentTitle}
                        maxLength={MAX_CHARS}
                    />
                    <Text style={[styles.charCount, { color: textColor }]}>{commentTitle.length}/{MAX_CHARS}</Text>

                    <TextInput
                        style={[styles.input, styles.multiline, { color: textColor }]}
                        placeholder="Description (max 255 caractères)"
                        placeholderTextColor="#aaa"
                        value={commentDescription}
                        onChangeText={setCommentDescription}
                        maxLength={MAX_CHARS}
                        multiline
                    />
                    <Text style={[styles.charCount, { color: textColor }]}>{commentDescription.length}/{MAX_CHARS}</Text>

                    {/* Champ de notation */}
                    <View style={styles.ratingContainer}>
                        {Array.from({ length: 5 }).map((_, index) => {
                            const starNumber = index + 1;
                            return (
                                <TouchableOpacity key={index} onPress={() => setCommentRating(starNumber)}>
                                    <Ionicons
                                        name={starNumber <= commentRating ? 'star' : 'star-outline'}
                                        size={24}
                                        color={starNumber <= commentRating ? '#FFD700' : '#ccc'}
                                    />
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmitComment}>
                        {submitting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Envoyer</Text>
                        )}
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.notLoggedContainer}>
                    <Text style={[styles.notLoggedText, { color: textColor }]}>
                        Vous devez être{' '}
                        <Text style={styles.link} onPress={() => router.push('/login')}>
                            connecté
                        </Text>{' '}
                        pour écrire un commentaire.
                    </Text>
                </View>
            )}
        </Card>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        padding: 15,
        marginVertical: 10,
        borderRadius: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    commentRating: {
        fontSize: 14,
        fontWeight: 'bold',
        marginRight: 5,
    },
    divider: {
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: 15,
    },
    formContainer: {
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 8,
        marginBottom: 5,
    },
    multiline: {
        height: 80,
        textAlignVertical: 'top',
    },
    charCount: {
        alignSelf: 'flex-end',
        fontSize: 12,
        marginBottom: 10,
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 10,
    },
    submitButton: {
        backgroundColor: '#0a7ea4',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    notLoggedContainer: {
        padding: 10,
        alignItems: 'center',
    },
    notLoggedText: {
        fontSize: 16,
    },
    link: {
        color: '#0a7ea4',
        textDecorationLine: 'underline',
    },
    commentsList: {
        marginVertical: 10,
    },
    noCommentsText: {
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 10,
    },
    errorText: {
        fontSize: 14,
        textAlign: 'center',
    },
    commentCard: {
        width: 300,
        backgroundColor: '#f2f4f7',
        borderRadius: 10,
        padding: 10,
        marginRight: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    author: {
        marginBottom: 4,
    },
    commentTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        width: '55%'
    },
    starsRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    commentDescription: {
        fontSize: 13,
    },
    headerComment: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start', // alignement en haut
        width: '100%',
        overflow: 'hidden'
    },
    commentAuthor:{
        flexWrap: 'wrap',
    },
    commentDate: {
        marginLeft: 10,
    },
    sortContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 10,
    },
    overallRatingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        marginTop: 15,
    },
    overallLeft: {
        flex: 1,
        alignItems: 'center',
    },
    averageRating: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    averageStars: {
        flexDirection: 'row',
        marginVertical: 5,
    },
    commentCountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    commentCountText: {
        fontSize: 14,
        marginLeft: 4,
    },
    overallRight: {
        flex: 1,
        justifyContent: 'center',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3,
    },
    ratingLabel: {
        width: 20,
        fontSize: 14,
    },
    ratingBarContainer: {
        flex: 1,
        height: 6,
        backgroundColor: '#eee',
        borderRadius: 3,
        overflow: 'hidden',
        marginLeft: 5,
    },
    ratingBarFill: {
        height: '100%',
        borderRadius: 3,
    },
});

export default CommentsSection;
