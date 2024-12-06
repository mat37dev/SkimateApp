import React, {useState} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignupScreen() {
    const navigation = useNavigation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [telephone, setTelephone] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // const [skiLevel, setSkiLevel] = useState('');
    const [name, setName] = useState('');
    const [lastname, setLastname] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async () => {

        if (!email || !password || !telephone || !name || !lastname || !confirmPassword) {
            setError('Veuillez remplir tous les champs.');
            return;
        }

    try{
        const payload ={
            email:email,
            firstName:name,
            lastName:lastname,
            password:password,
            confirmPassword:confirmPassword,
            phoneNumber:telephone,
            // skiLevel,
        }
        const response = await axios.post('http://localhost:8000/api/register',
            payload,{
            headers: {
                'Content-Type': 'application/json',
            }
        }
        );
        if (response.status === 200 || 201) {
            Alert.alert('Vous êtes connecté(e) avec succès.');
            const token = response.data.token;
            await AsyncStorage.setItem('token', token);
            console.log('Response received:', response);
            console.log(response.request);
            navigation.navigate('dashboard')
        }
    }catch(error){
            if(error.response){
                console.error(error.data);
                setError(error.response.data.errors);
                if (error.response.data.errors.email){
                    setError(error.response.data.errors.email);
                }
            }else if(error.request){
                console.error(error.data);
                setError('Impossible de se connecter au serveur. Vérifiez votre connexion.');
            }

        }
    }
    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../assets/background/pexels-ryank-20042214.jpg')}
                style={styles.background}
                imageStyle={styles.backgroundImage}
            >
                <View contentContainerStyle={styles.viewContainer}>
                    <View style={styles.errorContainer}>
                        {error && (
                            <Text style={styles.error}>
                                {error}
                            </Text>
                        )}
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
                    {/*<View style={styles.inputContainer}>*/}
                    {/*    <TextInput*/}
                    {/*        style={styles.input}*/}
                    {/*        placeholder="Niveau de ski"*/}
                    {/*        onChangeText={setSkiLevel}*/}
                    {/*        placeholderTextColor="#FFFFFF"*/}
                    {/*    />*/}
                    {/*</View>*/}
                    <TouchableOpacity onPress={handleRegister} style={styles.button}>
                        <Text  style={styles.buttonText}>S'inscrire</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </View>
    );
}

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
    errorContainer:{
        color: 'red',
        backgroundColor: '#ffe5e5',
        padding: 10,
        borderRadius: 5,
        textAlign: 'center',
        margin: 20,
    }
});

