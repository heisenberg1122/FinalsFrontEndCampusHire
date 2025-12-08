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
    success: "#10B981",
    danger: "#EF4444",
    dangerSoft: "#FEE2E2",
    cardBorder: "#E2E8F0",
    iconNeutral: "#94A3B8"
};

const EditJobScreen = ({ route, navigation }) => {
    const { job } = route.params;
    const { width: screenWidth } = useWindowDimensions();
    const isDesktop = screenWidth > 768;
    
    // State management
    const [title, setTitle] = useState(job.title || '');
    const [position, setPosition] = useState(job.job_position || '');
    const [description, setDescription] = useState(job.description || '');
    const [salary, setSalary] = useState(String(job.salary || ''));
    const [slots, setSlots] = useState(String(job.slots || ''));
    const [status, setStatus] = useState(job.status || 'Open');
    const [loading, setLoading] = useState(false);

    // 🌐 CONFIG
    const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'https://finalsbackendcampushire.onrender.com';
    const HEADER_BG = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop';

    // --- HANDLE UPDATE (PUT) ---
    const handleUpdate = async () => {
        if (!title || !position || !description || !salary || !slots) {
            Alert.alert("Missing Info", "Please fill all fields.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title: title,
                job_position: position,
                description: description,
                salary: parseFloat(salary),
                slots: parseInt(slots),
                status: status
            };

            await axios.put(`${API_URL}/api/jobs/${job.id}/`, payload);
            
            Alert.alert("Success", "Job Updated Successfully!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);

        } catch (error) {
            console.log(error);
            let errorMsg = "Failed to update job.";
            if (error.response && error.response.data) {
                errorMsg = JSON.stringify(error.response.data);
            }
            Alert.alert("Error", errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLE DELETE (DELETE) ---
    const handleDelete = () => {
        Alert.alert(
            "Delete Job",
            "Are you sure you want to delete this job posting? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await axios.delete(`${API_URL}/api/jobs/${job.id}/`);
                            Alert.alert("Deleted", "Job posting removed.", [
                                { text: "OK", onPress: () => navigation.goBack() }
                            ]);
                        } catch (error) {
                            console.log("Delete error:", error);
                            Alert.alert("Error", "Failed to delete job.");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
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
                                    <Text style={styles.screenTitle}>Edit Job</Text>
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
                            
                            {/* Title & Position */}
                            <Text style={styles.label}>JOB TITLE</Text>
                            <TextInput 
                                style={styles.input} 
                                value={title} 
                                onChangeText={setTitle} 
                                placeholderTextColor={palette.iconNeutral}
                            />

                            <Text style={styles.label}>POSITION TYPE</Text>
                            <TextInput 
                                style={styles.input} 
                                value={position} 
                                onChangeText={setPosition} 
                                placeholderTextColor={palette.iconNeutral}
                            />

                            {/* Status Row */}
                            <Text style={styles.label}>STATUS (Open/Closed)</Text>
                            <TextInput 
                                style={styles.input} 
                                value={status} 
                                onChangeText={setStatus} 
                                placeholder="Open" 
                                placeholderTextColor={palette.iconNeutral}
                            />

                            {/* Salary & Slots Row */}
                            <View style={styles.row}>
                                <View style={[styles.col, { marginRight: 10 }]}>
                                    <Text style={styles.label}>SALARY ($)</Text>
                                    <TextInput 
                                        style={styles.input} 
                                        value={salary} 
                                        onChangeText={setSalary} 
                                        keyboardType="numeric" 
                                        placeholderTextColor={palette.iconNeutral}
                                    />
                                </View>
                                <View style={[styles.col, { marginLeft: 10 }]}>
                                    <Text style={styles.label}>SLOTS</Text>
                                    <TextInput 
                                        style={styles.input} 
                                        value={slots} 
                                        onChangeText={setSlots} 
                                        keyboardType="numeric" 
                                        placeholderTextColor={palette.iconNeutral}
                                    />
                                </View>
                            </View>

                            {/* Description */}
                            <Text style={styles.label}>DESCRIPTION</Text>
                            <TextInput 
                                style={[styles.input, styles.textArea]} 
                                value={description} 
                                onChangeText={setDescription} 
                                multiline 
                                textAlignVertical="top"
                                placeholderTextColor={palette.iconNeutral}
                            />

                            {/* --- ACTIONS --- */}
                            
                            {/* Save Button */}
                            <TouchableOpacity 
                                style={[styles.btn, styles.saveBtn]} 
                                onPress={handleUpdate} 
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white"/>
                                ) : (
                                    <>
                                        <Text style={styles.btnText}>Save Changes</Text>
                                        <Ionicons name="save-outline" size={18} color="white" style={{marginLeft: 8}}/>
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* Delete Button */}
                            <TouchableOpacity 
                                style={[styles.btn, styles.deleteBtn]} 
                                onPress={handleDelete} 
                                disabled={loading}
                            >
                                <Text style={[styles.btnText, {color: palette.danger}]}>Delete Job</Text>
                                <Ionicons name="trash-outline" size={18} color={palette.danger} style={{marginLeft: 8}}/>
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

    // Buttons
    btn: { 
        paddingVertical: 16, borderRadius: 14, 
        alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
        marginTop: 10
    },
    saveBtn: {
        backgroundColor: palette.success,
        shadowColor: palette.success, shadowOpacity: 0.3, shadowOffset: {width: 0, height: 4}, elevation: 4
    },
    deleteBtn: {
        backgroundColor: palette.dangerSoft,
        marginTop: 15
    },
    
    btnText: { color: 'white', fontWeight: '700', fontSize: 16 }
});

export default EditJobScreen;