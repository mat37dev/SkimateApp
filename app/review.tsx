import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Platform,
} from 'react-native';
import apiClient from "@/api/apiClient";
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from 'expo-secure-store';
import {TextStyles} from "@/constants/TextStyles";
import {useThemeColor} from "@/hooks/useThemeColor";


const ReviewScreen = () => {

    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newComment, setNewComment] = useState('');
    const [title, setTitle] = useState('');
    const [starRating, setStarRating] = useState(0);

    const errorTextColor = useThemeColor({}, 'errorText');

    function showRating(starRating: number) {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <AntDesign
                    style={styles.rating}
                    name={i < starRating ? 'star' : 'staro'}
                    key={i}
                />
            );
        }
        return stars;
    }

    useEffect(() => {
        const fetchComment = async () => {
            const url = '/comment';
            try {
                const response = await apiClient.get(url);
                setComments(response.data);
            } catch (error) {
                setError('Impossible de charger les commentaires.');
            } finally {
                setLoading(false);
            }
        };
        fetchComment();
    }, []);

    const handleAddComment = async () => {
        try {

            const userToken = Platform.OS === 'web'
                ? await AsyncStorage.getItem('token')
                : await SecureStore.getItemAsync('token');

            if (!userToken) {
                setError('Utilisateur non authentifié.');
                return;
            }

            const url = '/comment/add';
            const newCommentData = {
                title: title,
                comment: newComment,
                note: starRating,
                userToken: userToken,
            };

            const response = await apiClient.post(url, newCommentData, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            });
            if (response.status === 201) {
                setComments((prevComments) => [response.data, ...prevComments]);
                setNewComment('');
                setTitle('');
                setStarRating(0);
            } else {
                setError('Une erreur s\'est produite lors de l\'ajout du commentaire.');
            }
        } catch (error) {
            if (error.response && error.response.data) {
                setError(error.response.data.error || 'Une erreur s\'est produite.');
            } else {
                setError('Impossible d\'ajouter le commentaire.');
            }
            console.error('Add Comment Error:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.stationInfo}>
                <Text style={styles.stationName}>La Plagne</Text>
                <Text style={styles.weather}>Météo : Ensoleillé, -5°C</Text>
            </View>
            <ScrollView style={styles.reviewContainer}>
                <Text style={styles.sectionTitle}>Avis :</Text>
                {loading ? (
                    <ActivityIndicator size="small" color="#003566" />
                ) : comments.length > 0 ? ( comments.map((comment) => (
                        <View style={styles.review} key={comment.id}>
                            <Text style={styles.username}>
                                {comment.user && comment.user.firstname ? comment.user.firstname : 'Anonyme'}
                                {showRating(comment.note)}
                            </Text>
                            <Text style={styles.reviewTitle}>{comment.title}</Text>
                            <Text style={styles.reviewText}>{comment.description}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={[{ color: errorTextColor }, TextStyles.errorText]}>{error}</Text>
                )}
            </ScrollView>
            <View style={styles.leaveReviewContainer}>
                <Text style={styles.sectionTitle}>Laisser un avis</Text>
                <TextInput
                    style={styles.inputTitle}
                    placeholder="Titre..."
                    value={title}
                    onChangeText={setTitle}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Message..."
                    multiline
                    value={newComment}
                    onChangeText={setNewComment}
                />
                <View style={styles.ratingContainer}>
                    <TouchableOpacity onPress={() => setStarRating(1)}>
                        <AntDesign
                            style={styles.rating}
                            name={starRating >= 1 ? 'star' : 'staro'}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setStarRating(2)}>
                        <AntDesign
                            style={styles.rating}
                            name={starRating >= 2 ? 'star' : 'staro'}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setStarRating(3)}>
                        <AntDesign
                            style={styles.rating}
                            name={starRating >= 3 ? 'star' : 'staro'}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setStarRating(4)}>
                        <AntDesign
                            style={styles.rating}
                            name={starRating >= 4 ? 'star' : 'staro'}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setStarRating(5)}>
                        <AntDesign
                            style={styles.rating}
                            name={starRating >= 5 ? 'star' : 'staro'}
                        />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.submitButton} onPress={handleAddComment}>
                    <Text style={styles.submitButtonText}>Enregistrer</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#D6E6F2',
        padding: 20,
        marginBottom: 60,

    },
    stationInfo: {
        marginBottom: 20,
        alignItems: 'center',
    },
    stationName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0A3A5D',
    },
    weather: {
        fontSize: 16,
        color: '#0A3A5D',
        marginTop: 5,

    },
    reviewContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0A3A5D',
        marginBottom: 10,
    },
    review: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        elevation: 2,
    },
    username: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    reviewText: {
        fontSize: 14,
        lineHeight: 20,
    },
    reviewTitle: {
        fontSize: 14,
        color: '#0A3A5D',
        lineHeight: 20,
    },
    leaveReviewContainer: {
        marginTop: 10,
    },
    input: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 15,
        height: 100,
        textAlignVertical: 'top',
        marginBottom: 15,
        elevation: 2,
    },
    inputTitle: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 15,
        height: 50,
        textAlignVertical: 'top',
        marginBottom: 15,
        elevation: 2,
    },
    submitButton: {
        backgroundColor: '#0A3A5D',
        borderRadius: 10,
        alignItems: 'center',
        paddingVertical: 10,
    },
    submitButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    rating:{
        color:'#fcdd53',
        marginLeft:3,
        fontSize:20,
    },
    ratingContainer: {
        marginBottom:5,
        flexDirection: 'row'
    },
});

export default ReviewScreen;
