import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    ScrollView, 
    Alert, 
    Platform, 
    ActivityIndicator,
    ImageBackground, 
    Dimensions, 
    StatusBar,
    KeyboardAvoidingView,
    useWindowDimensions
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// --- SHARED DESIGN PALETTE ---
const palette = {
    surface: "#FFFFFF",
    background: "#F8FAFC",
    textPrimary: "#1E293B",
    textSecondary: "#64748B",
    accent: "#3B82F6",
    accentSoft: "rgba(59, 130, 246, 0.1)",
    cardBorder: "#E2E8F0",
    iconNeutral: "#94A3B8"
};

const AddJobScreen = ({ navigation }) => {
    const { width: screenWidth } = useWindowDimensions();
    const isDesktop = screenWidth > 768;

    const [title, setTitle] = useState('');
    const [position, setPosition] = useState('');
    const [description, setDescription] = useState('');
    const [salary, setSalary] = useState('');
    const [slots, setSlots] = useState('');
    const [loading, setLoading] = useState(false);

    // 🌐 CONFIG
    const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'https://finalsbackendcampushire.onrender.com';
    const HEADER_BG = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop';

    const handleSubmit = async () => {
        // 1. Basic Validation
        if(!title || !position || !description || !salary || !slots) {
            Alert.alert("Missing Info", "Please fill all fields to continue.");
            return;
        }

        // 2. Number Validation
        const salaryNum = parseFloat(salary);
        const slotsNum = parseInt(slots);

        if (isNaN(salaryNum) || isNaN(slotsNum)) {
            Alert.alert("Invalid Input", "Salary and Slots must be valid numbers.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title,
                job_position: position, 
                description,
                salary: salaryNum,
                slots: slotsNum,
                status: 'Open'
            };
            
            await axios.post(`${API_URL}/api/jobs/`, payload);
            
            Alert.alert("Success", "Job Posted Successfully!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        
        } catch (error) {
            console.log(error);
            let errorMessage = "Failed to post job.";
            
            if (error.response) {
                console.log("Server Error Data:", error.response.data);
                errorMessage = JSON.stringify(error.response.data);
            } else if (error.request) {
                errorMessage = "Network error. Is the backend running?";
            }

            Alert.alert("Submission Error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* 1. Header Background */}
            <ImageBackground source={{ uri: HEADER_BG }} style={styles.headerBackground}>
                <View style={styles.headerOverlay}>
                    <SafeAreaView edges={['top']} style={styles.safeArea}>
                        {/* Navigation Bar */}
                        <View style={[styles.topNav, { paddingHorizontal: isDesktop ? 32 : 24 }]}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navLeft}>
                                <View style={styles.iconBtn}>
                                    <Ionicons name="arrow-back" size={24} color="#fff" />
                                </View>
                                <View>
                                    <Text style={styles.screenLabel}>MANAGEMENT</Text>
                                    <Text style={styles.screenTitle}>Post New Job</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>
            </ImageBackground>

            {/* 2. Floating Sheet Surface */}
            <View style={styles.surface}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex:1}}>
                    <ScrollView 
                        contentContainerStyle={[
                            styles.scrollContent,
                            { paddingHorizontal: isDesktop ? 32 : 24 }
                        ]}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* FORM CARD */}
                        <View style={[styles.card, isDesktop && { width: '60%', alignSelf: 'center' }]}>
                            
                            {/* Title Input */}
                            <Text style={styles.label}>JOB TITLE</Text>
                            <TextInput 
                                style={styles.input} 
                                value={title} 
                                onChangeText={setTitle} 
                                placeholder="e.g. Senior Software Engineer" 
                                placeholderTextColor={palette.iconNeutral}
                            />

                            {/* Position Input */}
                            <Text style={styles.label}>POSITION TYPE</Text>
                            <TextInput 
                                style={styles.input} 
                                value={position} 
                                onChangeText={setPosition} 
                                placeholder="e.g. Full-Time / Remote" 
                                placeholderTextColor={palette.iconNeutral}
                            />

                            {/* Row: Salary & Slots */}
                            <View style={styles.row}>
                                <View style={[styles.col, { marginRight: 10 }]}>
                                    <Text style={styles.label}>SALARY ($)</Text>
                                    <TextInput 
                                        style={styles.input} 
                                        value={salary} 
                                        onChangeText={setSalary} 
                                        keyboardType="numeric" 
                                        placeholder="0.00" 
                                        placeholderTextColor={palette.iconNeutral}
                                    />
                                </View>
                                <View style={[styles.col, { marginLeft: 10 }]}>
                                    <Text style={styles.label}>AVAILABLE SLOTS</Text>
                                    <TextInput 
                                        style={styles.input} 
                                        value={slots} 
                                        onChangeText={setSlots} 
                                        keyboardType="numeric" 
                                        placeholder="e.g. 3" 
                                        placeholderTextColor={palette.iconNeutral}
                                    />
                                </View>
                            </View>

                            {/* Description Input */}
                            <Text style={styles.label}>DESCRIPTION</Text>
                            <TextInput 
                                style={[styles.input, styles.textArea]} 
                                value={description} 
                                onChangeText={setDescription} 
                                multiline 
                                placeholder="Describe the role, responsibilities, and requirements..."
                                placeholderTextColor={palette.iconNeutral}
                                textAlignVertical="top"
                            />

                            {/* Submit Button */}
                            <TouchableOpacity 
                                style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
                                onPress={handleSubmit} 
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white"/>
                                ) : (
                                    <>
                                        <Text style={styles.btnText}>Publish Job</Text>
                                        <Ionicons name="cloud-upload-outline" size={20} color="white" style={{marginLeft: 8}}/>
                                    </>
                                )}
                            </TouchableOpacity>

                        </View>
                        
                        <View style={{height: 40}} />
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },

    // --- Header ---
    headerBackground: { height: height * 0.22, width: '100%' },
    headerOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.9)' },
    safeArea: { flex: 1 },
    topNav: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
    navLeft: { flexDirection: 'row', alignItems: 'center' },
    iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    
    screenLabel: { color: palette.iconNeutral, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
    screenTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },

    // --- Surface ---
    surface: { 
        flex: 1, 
        backgroundColor: palette.background, 
        borderTopLeftRadius: 30, 
        borderTopRightRadius: 30, 
        marginTop: -30, 
        overflow: 'hidden' 
    },
    scrollContent: { paddingTop: 32 },

    // --- Form Card ---
    card: {
        backgroundColor: palette.surface,
        borderRadius: 20,
        padding: 24,
        borderWidth: 1, borderColor: palette.cardBorder,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },

    // Inputs
    label: { fontSize: 11, fontWeight: '800', color: palette.textSecondary, marginBottom: 8, marginLeft: 4, letterSpacing: 0.5 },
    input: { 
        backgroundColor: palette.background,
        borderWidth: 1, borderColor: palette.cardBorder, 
        borderRadius: 12, 
        padding: 14, marginBottom: 20,
        fontSize: 15, color: palette.textPrimary, fontWeight: '500'
    },
    textArea: { height: 120, textAlignVertical: 'top' },

    // Layout
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    col: { flex: 1 },

    // Button
    submitBtn: { 
        backgroundColor: palette.accent, 
        paddingVertical: 16, borderRadius: 14, 
        alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
        marginTop: 10,
        shadowColor: palette.accent, shadowOpacity: 0.3, shadowOffset: {width: 0, height: 4}, elevation: 4
    },
    btnText: { color: 'white', fontWeight: '700', fontSize: 16 }
});

export default AddJobScreen;