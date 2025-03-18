import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
} from 'react-native';
import React, {useState} from "react";
import SelectDropdown from 'react-native-select-dropdown'
import { AntDesign } from '@expo/vector-icons';
import axios from "axios";
import {useRouter} from "expo-router";
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from 'react-native';
import apiClient from "@/api/apiClient";
import {useThemeColor} from "@/hooks/useThemeColor";
import { TextStyles } from '@/constants/TextStyles';


const  SettingScreen: React.FC = () => {

    const [email, setEmail] = useState<string>('');
    const [firstname, setFirstname] = useState<string>('');
    const [lastname, setLastname] = useState<string>('');
    const [phonenumber, setPhonenumber] = useState<string>('');
    const [isPressed, setIsPressed] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [skiPreference, setSkiPreference] = useState<string | null>(null);
    const [skiLevel, setSkiLevel] = useState<string | null>(null);


    const text = useThemeColor({}, 'text');
    const whiteText = useThemeColor({}, 'whiteText');
    const errorTextColor = useThemeColor({}, 'errorText');
    const successTextColor = useThemeColor({}, 'successText');

    const router = useRouter();

    const handlePress = (type: string, field: string) => {
        setIsPressed(type);
        handleUpdate(field, type);
    };

    const handleUpdate = async (field: string, value: string)=>{
        try {
            const userToken = Platform.OS === 'web' ?
                await AsyncStorage.getItem('token') :
                await SecureStore.getItemAsync('token');

            if(!userToken){
                setError('utilisateur non trouvé')
                return;
            }
            if (field === 'email') {
                const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!regex.test(value)) {
                    setError('Email invalide');
                    return;
                }
            }

            if (field === 'phonenumber'){
                const regex = /^(\+33|0)[1-9](\d{2}){4}$/;
                if (!regex.test(value)){
                    setError('numéro de téléphone invalide');
                    return;
                }
            }
            if (value.trim() === '') {
                setError(`Le champ ne peut pas être vide`);
                return;
            }

            const response = await apiClient.post(`profile/user-edit`, {
                [field]:value,
            });
            if (response.status === 200) {
                if (field === 'email') setEmail(value);
                if (field === 'firstname') setFirstname(value);
                if (field === 'lastname') setLastname(value);
                if (field === 'phoneNumber') setPhonenumber(value);
                if (field === 'skiPreference') setSkiPreference(value);
                if (field === 'skiLevel') setSkiLevel(value);
                setSuccess('Données mises à jour avec succès')

            } else {
                setError('Une erreur est survenue lors de la mise à jour.');
            }
        }catch (error: any){
            if (error.response) {
                const errors = error.response.data.errors && error.response.data.errors.email;
                if (errors) {
                    setError(errors || 'Erreur inattendue');
                }
            }else {
                setError('Impossible d\'enregistré les données.')
            }
        }
    }

    const handleLogout = async () => {
        try {
            let token;
            let refreshToken;

            if (Platform.OS === 'web'){
                refreshToken = await AsyncStorage.getItem("refresh_token");
                token = await AsyncStorage.getItem("token");
            }else {
                refreshToken = await SecureStore.getItemAsync("refresh_token");
                token = await SecureStore.getItemAsync("token");
            }

            if (refreshToken != null && token != null) {
                if (Platform.OS === 'web'){
                    await AsyncStorage.removeItem("refresh_token");
                    await AsyncStorage.removeItem("token");
                }else{
                    await SecureStore.deleteItemAsync("refresh_token");
                    await SecureStore.deleteItemAsync("token");
                }
                router.push('/login');
            }
        }catch (error){
            console.error(error);
        }
    }
    return(
        <View style={styles.mainContainer}>
            <ImageBackground
                source={require('../assets/background/pexels-ryank-20042214.jpg')}
                style={styles.background}
                imageStyle={styles.backgroundImage}
            >
                <View style={styles.container}>
                    {!!success ? (
                        <Text style={[{ color: successTextColor }, TextStyles.successText]}>{success}</Text>
                    ) : !!error ? (
                        <Text style={[{ color: errorTextColor }, TextStyles.errorText]}>{error}</Text>
                    ) : null}


                    <View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                placeholderTextColor="#000000"
                                value={email}
                            />
                            <TouchableOpacity onPress={()=> handleUpdate('email', email)}>
                                <AntDesign style={styles.editBtn} name="edit"/>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Prenom"
                                onChangeText={setFirstname}
                                placeholderTextColor="#000000"
                                value={firstname}
                            />
                            <TouchableOpacity onPress={()=> handleUpdate('firstname', firstname)}>
                                <AntDesign style={styles.editBtn} name="edit"/>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Nom"
                                onChangeText={setLastname}
                                placeholderTextColor="#000000"
                                value={lastname}
                            />
                            <TouchableOpacity onPress={()=> handleUpdate('lastname', lastname)}>
                                <AntDesign style={styles.editBtn} name="edit"/>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Telephone"
                                onChangeText={setPhonenumber}
                                placeholderTextColor="#000000"
                                value={phonenumber}
                                keyboardType="phone-pad"
                            />
                            <TouchableOpacity onPress={()=> handleUpdate('phonenumber', phonenumber)}>
                                <AntDesign style={styles.editBtn} name="edit"/>
                            </TouchableOpacity>
                        </View>

                        <View>
                            <Text style={[styles.text,{color: text}]}>Type de ski</Text>
                            <View style={styles.containerPreference}>
                                <TouchableOpacity
                                    style={[styles.button, isPressed === 'piste' ? styles.buttonPressed : null ]}
                                    onPress={() => handlePress("piste", "skiPreference")}>
                                    <Text style={[styles.buttonText,{color: text}, isPressed === "piste" ? styles.buttonPressedText : null]}>Piste</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button2, isPressed === 'hors-piste' ? styles.buttonPressed : null ]}
                                    onPress={() => handlePress("hors-piste", "skiPreference")}>
                                    <Text style={[styles.buttonText,{color: text}, isPressed === "hors-piste" ? styles.buttonPressedText : null]}>Hors-piste</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.button3, isPressed === 'freestyle' ? styles.buttonPressed : null ]}
                                    onPress={() => handlePress("freestyle", "skiPreference")}>
                                    <Text style={[styles.buttonText,{color: text}, isPressed === "freestyle" ? styles.buttonPressedText : null]}>Freestyle</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View>
                            <Text style={[styles.text,{color: text}]}>Niveau de difficulté</Text>
                            <View style={styles.containerPreference}>
                                <TouchableOpacity
                                    style={[styles.button, isPressed === 'Vert' ? styles.buttonPressed : null]}
                                    onPress={() => handlePress("Vert", "skiLevel")}>
                                    <Text style={[styles.buttonText, {color: text}, isPressed === "Vert" ? styles.buttonPressedText : null]}>
                                        Vert
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button2, isPressed === 'Bleu' ? styles.buttonPressed : null]}
                                    onPress={() => handlePress("Bleu", "skiLevel")}>
                                    <Text style={[styles.buttonText,{color: text}, isPressed === "Bleu" ? styles.buttonPressedText : null]}>
                                        Bleu
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button2, isPressed === 'Rouge' ? styles.buttonPressed : null]}
                                    onPress={() => handlePress("Rouge", "skiLevel")}>
                                    <Text style={[styles.buttonText, {color: text},isPressed === "Rouge" ? styles.buttonPressedText : null]}>
                                        Rouge
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button3, isPressed === 'Noir' ? styles.buttonPressed : null]}
                                    onPress={() => handlePress("Noir", "skiLevel")}>
                                    <Text style={[styles.buttonText,{color: text}, isPressed === "Noir" ? styles.buttonPressedText : null]}>
                                        Noir
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                       <View style={styles.btnsContainer}>
                           <TouchableOpacity style={styles.adminBtn}>
                               <Text style={{ color: text }} onPress={()=> router.push('/chat')}>Contacter un admin</Text>
                           </TouchableOpacity>
                           <TouchableOpacity style={styles.logoutBtn}>
                               <Text style={[styles.logoutBtnText,{color:whiteText}]} onPress={handleLogout}> Déconnexion</Text>
                           </TouchableOpacity>
                       </View>
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
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
        alignItems: 'center',
        marginBottom:50,
    },
    inputContainer: {
        marginBottom: 20,
        height: 50,
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 25,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#fff',
        flexDirection: 'row',
    },
    input: {
       width:280
    },
    editBtn:{
        marginTop:10,
        fontSize:16
    },
    button: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        borderBottomLeftRadius: 25,
        borderTopLeftRadius: 25,
        alignItems: 'center',
        marginTop: 20,
        width:80,
    },
    button2: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingLeft:10,
        alignItems: 'center',
        marginTop: 20,
        width:90,
    },
    button3: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        borderBottomRightRadius: 25,
        borderTopRightRadius: 25,
        alignItems: 'center',
        marginTop: 20,
        width:80,
    },
    buttonText: {
        color: '#0A3A5D',
        fontSize: 16,
    },
    buttonPressed:{
        backgroundColor:'#0A3A5D',
        color:'#fff'
    },
    buttonPressedText:{
        color:'#fff'
    },
    containerPreference:{
        flexDirection:'row',
        justifyContent:'center',
    },
    adminBtn:{
        backgroundColor: '#fff',
        paddingVertical: 10,
        marginTop: 20,
        width:200,
        justifyContent:"center",
        alignItems:'center',
        borderRadius: 25,
    },
    logoutBtn:{
        backgroundColor: 'red',
        paddingVertical: 10,
        marginTop: 20,
        width:200,
        justifyContent:"center",
        alignItems:'center',
        borderRadius: 10,
        color:'#fff',
    },
    btnsContainer:{
        alignItems:'center',
    },
    logoutBtnText:{
        color:'#fff',
    },
    iconLogout:{
        paddingLeft:5,
        fontSize:12
    },
    text:{
        marginTop:20,
        fontWeight:'bold',
        textTransform:"uppercase",
        color:"#0A3A5D"
    },
})
export default SettingScreen