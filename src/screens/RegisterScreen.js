import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    ScrollView, 
    Alert, 
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    useWindowDimensions
} from 'react-native';
import axios from 'axios'; 
import { Ionicons } from '@expo/vector-icons';

// --- SHARED DESIGN PALETTE ---
const palette = {
    background: "#F8FAFC",
    surface: "#FFFFFF",
    textPrimary: "#1E293B",
    textSecondary: "#64748B",
    accent: "#3B82F6",
    cardBorder: "#E2E8F0",
    iconNeutral: "#94A3B8"
};

// 1. BACKEND URL CONFIGURATION
const API_URL = 'https://finalsbackendcampushire.onrender.com';

const RegisterScreen = ({ navigation }) => {
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;

    const [loading, setLoading] = useState(false);
    
    // 2. Form State (Includes 'role')
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirm_password: '',
        phone_number: '',
        role: 'Applicant' // Default selection
    });

    const handleChange = (name, value) => {
        setForm({ ...form, [name]: value });
    };

    const handleRegister = async () => {
        // Validation
        if (!form.first_name || !form.last_name || !form.email || !form.password) {
            Alert.alert("Error", "Please fill in all required fields.");
            return;
        }
        if (form.password !== form.confirm_password) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            // 3. FIXED URL: pointing to /api/users/ (not /reg/...)
            await axios.post(`${API_URL}/api/users/`, {
                first_name: form.first_name,
                last_name: form.last_name,
                email: form.email,
                password: form.password,
                phone_number: form.phone_number,
                role: form.role, // Sends 'Admin' or 'Applicant'
            });

            Alert.alert("Success", "User added successfully!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);

        } catch (error) {
            console.log("Register Error:", error.response?.data || error.message);
            
            let msg = "Registration failed";
            if (error.response?.data?.email) {
                msg = "Email already exists";
            } else if (error.response?.data?.detail) {
                msg = error.response.data.detail;
            } else if (error.response?.status === 405) {
                msg = "Method Not Allowed. The URL is incorrect.";
            }

            Alert.alert("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={palette.background} />
            
            <View style={[styles.header, { paddingHorizontal: isDesktop ? 32 : 24 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={palette.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>Add New Member</Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
                <ScrollView contentContainerStyle={[styles.content, isDesktop && { width: '50%', alignSelf: 'center' }]}>
                    
                    {/* --- ROLE SELECTOR --- */}
                    <Text style={styles.label}>Select Role</Text>
                    <View style={styles.roleContainer}>
                        <TouchableOpacity 
                            style={[
                                styles.roleBtn, 
                                form.role === 'Applicant' && styles.roleBtnActive
                            ]}
                            onPress={() => handleChange('role', 'Applicant')}
                        >
                            <Ionicons 
                                name="person" 
                                size={18} 
                                color={form.role === 'Applicant' ? 'white' : palette.textSecondary} 
                            />
                            <Text style={[
                                styles.roleText, 
                                form.role === 'Applicant' && styles.roleTextActive
                            ]}>Applicant</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[
                                styles.roleBtn, 
                                form.role === 'Admin' && styles.roleBtnActive
                            ]}
                            onPress={() => handleChange('role', 'Admin')}
                        >
                            <Ionicons 
                                name="shield-checkmark" 
                                size={18} 
                                color={form.role === 'Admin' ? 'white' : palette.textSecondary} 
                            />
                            <Text style={[
                                styles.roleText, 
                                form.role === 'Admin' && styles.roleTextActive
                            ]}>Admin</Text>
                        </TouchableOpacity>
                    </View>
                    {/* --------------------- */}

                    <View style={styles.row}>
                        <View style={{flex: 1, marginRight: 8}}>
                            <Text style={styles.label}>First Name</Text>
                            <TextInput 
                                style={styles.input} 
                                value={form.first_name}
                                onChangeText={(text) => handleChange('first_name', text)}
                                placeholder="John"
                            />
                        </View>
                        <View style={{flex: 1, marginLeft: 8}}>
                            <Text style={styles.label}>Last Name</Text>
                            <TextInput 
                                style={styles.input} 
                                value={form.last_name}
                                onChangeText={(text) => handleChange('last_name', text)}
                                placeholder="Doe"
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Email Address</Text>
                    <TextInput 
                        style={styles.input} 
                        value={form.email}
                        onChangeText={(text) => handleChange('email', text)}
                        placeholder="john@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput 
                        style={styles.input} 
                        value={form.phone_number}
                        onChangeText={(text) => handleChange('phone_number', text)}
                        placeholder="+63 900 000 0000"
                        keyboardType="phone-pad"
                    />

                    <Text style={styles.label}>Password</Text>
                    <TextInput 
                        style={styles.input} 
                        value={form.password}
                        onChangeText={(text) => handleChange('password', text)}
                        secureTextEntry
                        placeholder="••••••••"
                    />

                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput 
                        style={styles.input} 
                        value={form.confirm_password}
                        onChangeText={(text) => handleChange('confirm_password', text)}
                        secureTextEntry
                        placeholder="••••••••"
                    />

                    <TouchableOpacity 
                        style={styles.submitBtn} 
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.submitText}>Create Account</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    header: { flexDirection: 'row', alignItems: 'center', height: 60, marginTop: 10, marginBottom: 10 },
    backBtn: { marginRight: 16, padding: 8 },
    title: { fontSize: 20, fontWeight: '700', color: palette.textPrimary },
    content: { padding: 24, paddingBottom: 50 },
    
    label: { fontSize: 13, fontWeight: '600', color: palette.textSecondary, marginBottom: 8, marginTop: 12 },
    input: { 
        backgroundColor: palette.surface, 
        borderWidth: 1, borderColor: palette.cardBorder, 
        borderRadius: 12, padding: 14, fontSize: 15, color: palette.textPrimary 
    },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    
    // Role Styles
    roleContainer: { flexDirection: 'row', marginBottom: 10 },
    roleBtn: { 
        flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        paddingVertical: 12, borderWidth: 1, borderColor: palette.cardBorder,
        borderRadius: 10, marginRight: 10, backgroundColor: palette.surface
    },
    roleBtnActive: { backgroundColor: palette.accent, borderColor: palette.accent },
    roleText: { marginLeft: 8, fontWeight: '600', color: palette.textSecondary },
    roleTextActive: { color: 'white' },

    submitBtn: { 
        backgroundColor: palette.accent, 
        paddingVertical: 16, borderRadius: 14, 
        alignItems: 'center', marginTop: 32,
        shadowColor: palette.accent, shadowOpacity: 0.3, shadowOffset: {width: 0, height: 4}, elevation: 4
    },
    submitText: { color: 'white', fontWeight: '700', fontSize: 16 }
});

export default RegisterScreen;