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
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, Link } from 'expo-router';
import Constants from 'expo-constants';

const LoginScreen: React.FC = () => {
    let API_URL = 'http://localhost:3000/';
    if (!Constants.expoConfig || !Constants.expoConfig.extra) {
        console.warn("Les variables d'environnement ne sont pas accessibles.");
    } else {
        API_URL = Constants.expoConfig.extra.API_URL;
    }

    const router = useRouter();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleLogin = async (): Promise<void> => {
        if (!email || !password) {
            setError('Veuillez remplir tous les champs.');
            return;
        }

        const isEmailValid = (input: string): boolean => {
            const regex = /^[a-z0-9]+@[a-z0-9]+\.[a-z0-9]+$/i;
            return regex.test(input);
        };

        if (!isEmailValid(email)) {
            setError('Veuillez entrer une adresse email valide.');
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/api/login`, {
                email,
                password,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status === 200) {
                Alert.alert('Vous êtes connecté(e) avec succès.');
                const token = response.data.token;
                await AsyncStorage.setItem('token', token);
                console.log(response.data.token);
                router.push('/dashboard');
            } else {
                setError("Identifiants invalides. Veuillez réessayer.");
            }
        } catch (err) {
            console.log(err);
            setError('Une erreur s\'est produite. Veuillez réessayer plus tard.');
        }
    };

    return (
        <View style={styles.LoginContainer}>
            <ImageBackground
                source={require('../assets/background/pexels-ryank-20042214.jpg')}
                style={styles.background}
                imageStyle={styles.backgroundImage}
            >
                <View style={styles.container}>
                    <Text style={styles.logo}>SkiMate</Text>

                    {error ? (
                        <Text style={{ color: 'red', marginBottom: 20 }}>{error}</Text>
                    ) : null}

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            placeholderTextColor="#000000"
                            value={email}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Mot de passe"
                            value={password}
                            onChangeText={setPassword}
                            placeholderTextColor="#000000"
                            secureTextEntry
                        />
                    </View>
                    <TouchableOpacity onPress={handleLogin} style={styles.button}>
                        <Text style={styles.buttonText}>Se connecter</Text>
                    </TouchableOpacity>

                    <View style={styles.linksContainer}>
                        <Link href="/register" asChild>
                            <TouchableOpacity>
                                <Text style={styles.linkText}>S'inscrire</Text>
                            </TouchableOpacity>
                        </Link>
                        <TouchableOpacity>
                            <Text style={styles.linkText}>Mot de passe oublié</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    LoginContainer: {
        flex: 1,
    },
    background: {
        flex: 1,
    },
    backgroundImage: {
        opacity: 0.5,
    },
    container: {
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
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#fff',
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
    linksContainer: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    linkText: {
        color: '#000000',
        fontSize: 14,
    },
});

export default LoginScreen;
