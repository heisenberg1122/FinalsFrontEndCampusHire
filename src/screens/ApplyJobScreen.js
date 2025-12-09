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

    ImageBackground,

    Dimensions,

    ActivityIndicator,

    KeyboardAvoidingView,

    StatusBar,

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

    successSoft: "#D1FAE5",

    cardBorder: "#E2E8F0",

    iconNeutral: "#94A3B8"

};



const ApplyJobScreen = ({ route, navigation }) => {

    const { job, user } = route.params;

    const { width: screenWidth } = useWindowDimensions();

    const isDesktop = screenWidth > 768;



    const [coverLetter, setCoverLetter] = useState('');

    const [loading, setLoading] = useState(false);



    // 🌐 CONFIG

    const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'https://finalsbackendcampushire.onrender.com';

    const HEADER_BG = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop';



    const handleSubmit = async () => {

        if (!coverLetter.trim()) {

            Alert.alert("Missing Info", "Please write a short cover letter.");

            return;

        }



        setLoading(true);

        try {

            const payload = {

                job_id: job.id,

                user_id: user.id,

                cover_letter: coverLetter

            };



            await axios.post(`${API_URL}/job/api/apply/`, payload);

           

            Alert.alert("Success", `Application for ${job.title} submitted successfully!`, [

                { text: "OK", onPress: () => navigation.goBack() }

            ]);



        } catch (error) {

            console.log("Apply Error:", error);

            let msg = "Failed to submit application.";

            if (error.response && error.response.data && error.response.data.error) {

                msg = error.response.data.error;

            }

            Alert.alert("Notice", msg, [{ text: "OK", onPress: () => navigation.goBack() }]);

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

                                    <Text style={styles.screenLabel}>APPLICATION</Text>

                                    <Text style={styles.screenTitle}>Apply Now</Text>

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

                        {/* JOB SUMMARY CARD */}

                        <View style={[styles.card, styles.jobSummaryCard]}>

                            <Text style={styles.applyLabel}>POSITION DETAILS</Text>

                            <Text style={styles.jobTitle}>{job.title}</Text>

                           

                            <View style={styles.badgeRow}>

                                <View style={styles.badge}>

                                    <Text style={styles.badgeText}>{job.job_position}</Text>

                                </View>

                                <View style={[styles.badge, { backgroundColor: palette.successSoft, marginLeft: 8 }]}>

                                    <Text style={[styles.badgeText, { color: palette.success }]}>{job.status}</Text>

                                </View>

                            </View>

                        </View>



                        {/* APPLICANT INFO */}

                        <Text style={styles.sectionLabel}>APPLICANT INFO</Text>

                        <View style={styles.infoBox}>

                            <View style={styles.infoRow}>

                                <Ionicons name="person" size={18} color={palette.accent} />

                                <Text style={styles.infoText}>{user.first_name} {user.last_name}</Text>

                            </View>

                            <View style={styles.divider} />

                            <View style={styles.infoRow}>

                                <Ionicons name="mail" size={18} color={palette.accent} />

                                <Text style={styles.infoText}>{user.email}</Text>

                            </View>

                        </View>



                        {/* COVER LETTER INPUT */}

                        <Text style={styles.sectionLabel}>COVER LETTER</Text>

                        <TextInput

                            style={styles.textArea}

                            multiline={true}

                            numberOfLines={6}

                            placeholder="Why are you a good fit for this role?"

                            placeholderTextColor={palette.iconNeutral}

                            value={coverLetter}

                            onChangeText={setCoverLetter}

                            textAlignVertical="top"

                        />



                        {/* RESUME UPLOAD */}

                        <Text style={styles.sectionLabel}>RESUME</Text>

                        <TouchableOpacity

                            style={styles.fileBtn}

                            onPress={() => Alert.alert("Upload", "File picker requires native config.")}

                            activeOpacity={0.8}

                        >

                            <View style={styles.fileIconBox}>

                                <Ionicons name="cloud-upload" size={20} color={palette.accent} />

                            </View>

                            <Text style={styles.fileText}>Click to upload Resume (PDF)</Text>

                        </TouchableOpacity>



                        {/* ACTIONS */}

                        <View style={styles.actionContainer}>

                            <TouchableOpacity

                                onPress={() => navigation.goBack()}

                                style={styles.cancelBtn}

                                disabled={loading}

                            >

                                <Text style={styles.cancelText}>Cancel</Text>

                            </TouchableOpacity>

                           

                            <TouchableOpacity

                                style={[styles.submitBtn, loading && { opacity: 0.7 }]}

                                onPress={handleSubmit}

                                disabled={loading}

                            >

                                {loading ? (

                                    <ActivityIndicator color="white"/>

                                ) : (

                                    <>

                                        <Text style={styles.submitText}>Submit Application</Text>

                                        <Ionicons name="arrow-forward" size={18} color="white" style={{marginLeft: 8}}/>

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



    // --- Job Summary Card ---

    card: {

        backgroundColor: palette.surface,

        borderRadius: 16,

        padding: 20,

        marginBottom: 24,

        borderWidth: 1, borderColor: palette.cardBorder,

        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,

    },

    jobSummaryCard: { alignItems: 'center', borderTopWidth: 4, borderTopColor: palette.accent },

   

    applyLabel: { fontSize: 11, color: palette.textSecondary, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },

    jobTitle: { fontSize: 22, fontWeight: '800', color: palette.textPrimary, textAlign: 'center', marginBottom: 12 },

   

    badgeRow: { flexDirection: 'row' },

    badge: { backgroundColor: palette.accentSoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },

    badgeText: { color: palette.accent, fontWeight: '800', fontSize: 11, textTransform: 'uppercase' },



    // --- Sections ---

    sectionLabel: { fontSize: 12, fontWeight: '800', color: palette.textSecondary, marginBottom: 12, marginLeft: 4, letterSpacing: 0.5 },



    // Info Box

    infoBox: { backgroundColor: palette.surface, borderRadius: 12, borderWidth: 1, borderColor: palette.cardBorder, marginBottom: 24 },

    infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },

    infoText: { marginLeft: 12, color: palette.textPrimary, fontWeight: '600', fontSize: 14 },

    divider: { height: 1, backgroundColor: palette.cardBorder, marginHorizontal: 16 },



    // Inputs

    textArea: {

        backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.cardBorder,

        borderRadius: 12, padding: 16, height: 140,

        fontSize: 14, color: palette.textPrimary, marginBottom: 24,

        textAlignVertical: 'top'

    },



    // File Upload

    fileBtn: {

        borderWidth: 1.5, borderColor: palette.cardBorder, borderStyle: 'dashed',

        borderRadius: 12, backgroundColor: palette.background,

        height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',

        marginBottom: 32

    },

    fileIconBox: { width: 32, height: 32, borderRadius: 16, backgroundColor: palette.accentSoft, justifyContent: 'center', alignItems: 'center', marginRight: 10 },

    fileText: { color: palette.textSecondary, fontWeight: '600', fontSize: 13 },



    // Actions

    actionContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

    cancelBtn: { padding: 15 },

    cancelText: { color: palette.textSecondary, fontWeight: '700', fontSize: 14 },

   

    submitBtn: {

        backgroundColor: palette.accent,

        paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12,

        flexDirection: 'row', alignItems: 'center',

        shadowColor: palette.accent, shadowOpacity: 0.3, shadowOffset: {width: 0, height: 4}, elevation: 4

    },

    submitText: { color: 'white', fontWeight: '700', fontSize: 14 }

});



export default ApplyJobScreen;