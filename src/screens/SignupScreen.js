import React, { useState } from 'react';
import { 
    View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, 
    ScrollView, ActivityIndicator, Platform, ImageBackground, 
    KeyboardAvoidingView, Dimensions, Image 
} from 'react-native';
import axios from 'axios'; 
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SignupScreen = ({ navigation }) => {
    // --- State Variables ---
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [gender, setGender] = useState('Male');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); 

    // 🌐 AUTO-DETECT URL (Using the local emulator URL for mobile)
    const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'https://finalsbackendcampushire.onrender.com';
    // NOTE: If testing on Android Emulator, change the mobile URL to 'http://10.0.2.2:8000' for local backend access.

    // Same background as Login
    const BACKGROUND_IMAGE_URL = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop&ixlib=rb-4.0.3';

    // --- Submission Logic ---
    const handleSignup = async () => {
        if(!firstName || !lastName || !email || !password) {
            const msg = "Please fill all fields";
            Platform.OS === 'web' ? alert(msg) : Alert.alert("Error", msg);
            return;
        }
        
        setLoading(true);
        try {
            await axios.post(`${API_URL}/reg/api/register/`, {
                first_name: firstName,
                last_name: lastName,
                email,
                password,
                gender,
                role: 'Applicant'
            });
            
            const successMsg = "Account created! Login now.";
            if (Platform.OS === 'web') {
                alert(successMsg);
                navigation.navigate("Login");
            } else {
                Alert.alert("Success", successMsg, [{ text: "Login", onPress: () => navigation.navigate("Login") }]);
            }
        } catch (error) {
            console.log(error);
            let msg = "Registration Failed.";
            if (error.response && error.response.data) {
                // Try to show specific backend error if available
                msg = JSON.stringify(error.response.data);
                // Optional: If error is simple, e.g., 'email' is in use:
                if (error.response.data.email) {
                    msg = `Email Error: ${error.response.data.email[0]}`;
                }
            }
            Platform.OS === 'web' ? alert(msg) : Alert.alert("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    // --- Render ---
    return (
        <ImageBackground source={{ uri: BACKGROUND_IMAGE_URL }} style={styles.backgroundImage} resizeMode="cover">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
                <View style={styles.overlay}>
                    <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
                        
                        {/* LOGO (Outside the card, positioned above it) */}
                        <Image 
                            source={require('../../assets/CampusHirelogo.png')} 
                            style={styles.logo}
                            resizeMode="contain"
                        />

                        <View style={styles.card}>
                            
                            {/* Header Text */}
                            <View style={styles.headerContainer}>
                                <Text style={styles.welcomeText}>Create Account</Text>
                                <Text style={styles.subtitleText}>Join us as a candidate today!</Text>
                            </View>

                            {/* First Name & Last Name Row */}
                            <View style={styles.rowInputContainer}>
                                <View style={[styles.inputContainer, {flex: 1, marginRight: 10}]}>
                                    <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
                                    <TextInput 
                                        style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First Name" placeholderTextColor="#aaa"
                                    />
                                </View>
                                <View style={[styles.inputContainer, {flex: 1}]}>
                                    <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
                                    <TextInput 
                                        style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last Name" placeholderTextColor="#aaa"
                                    />
                                </View>
                            </View>

                            {/* Email Input */}
                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Email Address"
                                    placeholderTextColor="#aaa"
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>

                            {/* Password Input with Toggle */}
                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Password"
                                    placeholderTextColor="#aaa"
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordIcon}>
                                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#999" />
                                </TouchableOpacity>
                            </View>

                            {/* Gender Selection */}
                            <Text style={styles.label}>Gender</Text>
                            <View style={styles.genderRow}>
                                <TouchableOpacity 
                                    style={[styles.genderBtn, gender==='Male' && styles.activeGenderBtn]} 
                                    onPress={()=>setGender('Male')} activeOpacity={0.8}
                                >
                                    <Ionicons name="male" size={18} color={gender==='Male' ? 'white' : '#666'} style={{marginRight: 8}} />
                                    <Text style={gender==='Male'? styles.activeGenderTxt : styles.genderTxt}>Male</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.genderBtn, gender==='Female' && styles.activeGenderBtn]} 
                                    onPress={()=>setGender('Female')} activeOpacity={0.8}
                                >
                                    <Ionicons name="female" size={18} color={gender==='Female' ? 'white' : '#666'} style={{marginRight: 8}} />
                                    <Text style={gender==='Female'? styles.activeGenderTxt : styles.genderTxt}>Female</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Sign Up Button */}
                            <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading} activeOpacity={0.8}>
                                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Sign Up</Text>}
                            </TouchableOpacity>
                            
                            {/* Back to Login Link */}
                            <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.signupLinkContainer}>
                                <Text style={styles.linkText}>Already have an account? <Text style={styles.linkHighlight}>Login here</Text></Text>
                            </TouchableOpacity>

                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    // --- Main Structure ---
    backgroundImage: { flex: 1, width: width, height: height },
    container: { flex: 1 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', width: '100%' },
    scrollViewContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
    
    // LOGO STYLE: Platform Specific (Web vs Mobile)
    logo: {
        width: Platform.OS === 'web' ? 500 : '85%',
        height: Platform.OS === 'web' ? 250 : 150,
        marginBottom: -20,
        marginTop: -100, 
        alignSelf: 'center',
    },

    card: {
        width: '90%', maxWidth: 450, backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 25, paddingVertical: 30, paddingHorizontal: 30,
        shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
    },

    // --- Header Styles ---
    headerContainer: { marginBottom: 25, alignItems: 'center' },
    welcomeText: { fontSize: 26, fontWeight: '800', color: '#1a1a1a', marginBottom: 5 },
    subtitleText: { fontSize: 15, color: '#666', fontWeight: '500' },

    // --- Input Styles ---
    rowInputContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 15,
        marginBottom: 15, paddingHorizontal: 15, borderWidth: 1, borderColor: '#e1e5e9', height: 55,
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, height: '100%', color: '#333', fontSize: 16, ...Platform.select({ web: { outlineStyle: 'none' } }) },
    passwordIcon: { padding: 10 },

    // --- Gender Styles ---
    label: { fontWeight: '600', marginBottom: 10, color: '#555', marginLeft: 5 },
    genderRow: { flexDirection: 'row', marginBottom: 25 },
    genderBtn: { 
        flex: 1, flexDirection: 'row', paddingVertical: 12, alignItems: 'center', justifyContent: 'center',
        marginHorizontal: 5, borderRadius: 15, backgroundColor: '#f0f2f5', borderWidth: 1, borderColor: '#e1e5e9' 
    },
    activeGenderBtn: { 
        backgroundColor: '#0d6efd', borderColor: '#0d6efd',
        shadowColor: '#0d6efd', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, elevation: 2
    },
    activeGenderTxt: { color: 'white', fontWeight: 'bold', fontSize: 15 },
    genderTxt: { color: '#666', fontWeight: '600', fontSize: 15 },

    // --- Button & Link Styles ---
    button: {
        backgroundColor: '#0d6efd', paddingVertical: 16, borderRadius: 15, alignItems: 'center',
        marginBottom: 20, shadowColor: '#0d6efd', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8, elevation: 5, ...Platform.select({ web: { cursor: 'pointer' } }),
    },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
    signupLinkContainer: { alignItems: 'center', ...Platform.select({ web: { cursor: 'pointer' } }) },
    linkText: { textAlign: 'center', color: '#666', fontSize: 15 },
    linkHighlight: { color: '#0d6efd', fontWeight: '700' },
});

export default SignupScreen;