import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
    Alert,
} from 'react-native';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

const SignupScreen: React.FC = () => {
    let API_URL = 'http://localhost:3000/';
    if (!Constants.expoConfig || !Constants.expoConfig.extra) {
        console.warn("Les variables d'environnement ne sont pas accessibles.");
    } else {
        API_URL = Constants.expoConfig.extra.API_URL;
    }

    const router = useRouter();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [telephone, setTelephone] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    // const [skiLevel, setSkiLevel] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [lastname, setLastname] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleRegister = async (): Promise<void> => {
        if (!email || !password || !telephone || !name || !lastname || !confirmPassword) {
            setError('Veuillez remplir tous les champs.');
            return;
        }

        const payload = {
            email: email,
            firstName: name,
            lastName: lastname,
            password: password,
            confirmPassword: confirmPassword,
            phoneNumber: telephone,
            // skiLevel,
        };

        try {
            const response = await axios.post(`${API_URL}/api/register`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status === 200 || response.status === 201) {
                Alert.alert('Vous êtes inscrit(e) avec succès.');
                const token = response.data.token;
                await AsyncStorage.setItem('token', token);
                console.log('Response received:', response);
                router.push('/dashboard');
            } else {
                setError("Erreur inattendue. Veuillez réessayer.");
            }

        } catch (err: any) {
            // Gestion des erreurs axios
            if (err.response) {
                console.error(err.response.data);
                // On suppose que err.response.data.errors est un objet
                // On prend la première erreur si elle existe
                if (err.response.data.errors && typeof err.response.data.errors === 'object') {
                    // On essaie de récupérer un message d'erreur plus précis
                    const errors = err.response.data.errors;
                    if (errors.email) {
                        setError(errors.email as string);
                    } else {
                        setError('Une erreur est survenue lors de l’inscription.');
                    }
                } else {
                    setError('Une erreur est survenue lors de l’inscription.');
                }
            } else if (err.request) {
                console.error(err.request);
                setError('Impossible de se connecter au serveur. Vérifiez votre connexion.');
            } else {
                console.error('Erreur', err.message);
                setError('Une erreur s\'est produite. Veuillez réessayer plus tard.');
            }
        }
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../assets/background/pexels-ryank-20042214.jpg')}
                style={styles.background}
                imageStyle={styles.backgroundImage}
            >
                <View style={styles.viewContainer}>
                    <View style={styles.errorContainer}>
                        {error ? <Text style={styles.error}>{error}</Text> : null}
                    </View>
                    <Text style={styles.logo}>SkiMate</Text>
                    <View style={styles.row}>
                        <TextInput
                            style={[styles.input, styles.halfInput]}
                            placeholder="Nom"
                            onChangeText={setLastname}
                            placeholderTextColor="#FFFFFF"
                        />
                        <TextInput
                            style={[styles.input, styles.halfInput]}
                            placeholder="Prénom"
                            onChangeText={setName}
                            placeholderTextColor="#FFFFFF"
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            onChangeText={setEmail}
                            placeholderTextColor="#FFFFFF"
                            keyboardType="email-address"
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Téléphone"
                            onChangeText={setTelephone}
                            placeholderTextColor="#FFFFFF"
                            keyboardType="phone-pad"
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Mot de passe"
                            onChangeText={setPassword}
                            placeholderTextColor="#FFFFFF"
                            secureTextEntry
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirmer le mot de passe"
                            onChangeText={setConfirmPassword}
                            placeholderTextColor="#FFFFFF"
                            secureTextEntry
                        />
                    </View>
                    {/*
                      <View style={styles.inputContainer}>
                          <TextInput
                              style={styles.input}
                              placeholder="Niveau de ski"
                              onChangeText={setSkiLevel}
                              placeholderTextColor="#FFFFFF"
                          />
                      </View>
                    */}
                    <TouchableOpacity onPress={handleRegister} style={styles.button}>
                        <Text style={styles.buttonText}>S'inscrire</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
    },
    backgroundImage: {
        opacity: 0.5
    },
    viewContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    logo: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#003566',
        textAlign: 'center',
        marginBottom: 40,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    halfInput: {
        width: '48%',
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#FFFFFF',
        borderRadius: 25,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#000000',
        backgroundColor: 'transparent',
    },
    button: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#003566',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorContainer: {
        marginBottom: 20,
    },
    error: {
        color: 'red',
        textAlign: 'center',
    }
});

export default SignupScreen;
