import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
    StatusBar,
    useWindowDimensions
} from 'react-native';

// 1. New Imports for modern UI and functionality
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

// Helper function to format date/time into Django's expected format
const formatDateToISO = (date) => date.toISOString().split('T')[0]; // YYYY-MM-DD
const formatTimeToISO = (date) => date.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

const ScheduleInterview = ({ route, navigation }) => {
    const { width: screenWidth } = useWindowDimensions();
    const isWeb = Platform.OS === 'web' || screenWidth > 768;
    const WEB_MAX_WIDTH = 1000;

    // Default values for testing/fallback (as per your design example)
    const { applicationId, applicantName, jobTitle } = route.params || {
        applicationId: '006',
        applicantName: 'Nicole',
        jobTitle: 'Frontend Dev'
    };

    // State Variables
    const [date, setDate] = useState(new Date()); // Holds both date and time as a single Date object
    const [location, setLocation] = useState(''); // Stores location (from chip or text input)
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const quickLocations = ["Zoom", "Google Meet", "Teams", "In-Person"];

    // API Configuration (using your provided detection logic)
    const API_ROOT = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'https://finalsbackendcampushire.onrender.com';
    const API_URL = `${API_ROOT}/job/api/interviews/create/`; // Your backend endpoint

    // --- Date/Time Picker Handlers ---

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            // Preserve the time but update the date
            setDate(prev => {
                const newDate = new Date(selectedDate);
                newDate.setHours(prev.getHours(), prev.getMinutes(), 0, 0);
                return newDate;
            });
        }
    };

    const handleTimeChange = (event, selectedDate) => {
        setShowTimePicker(false);
        if (selectedDate) {
            // Preserve the date but update the time
            setDate(prev => {
                const newDate = new Date(prev);
                newDate.setHours(selectedDate.getHours());
                newDate.setMinutes(selectedDate.getMinutes());
                return newDate;
            });
        }
    };

    // --- Submission Logic ---

    const handleSubmit = async () => {
        if (!location) {
            Alert.alert("Missing Info", "Please select or type a location.");
            return;
        }
        
        // Format the Date object into the two strings your API expects
        const interviewDate = formatDateToISO(date); // e.g., "2025-12-30"
        const interviewTime = formatTimeToISO(date); // e.g., "14:30"

        setLoading(true);
        
        try {
            const res = await axios.post(API_URL, {
                application_id: applicationId,
                date: interviewDate, // Sending the formatted Date string
                time: interviewTime, // Sending the formatted Time string
                location: location
            }, {
                // Allows us to inspect non-2xx status codes (like 400 or 500)
                validateStatus: () => true 
            });

            console.log('Attempt POST to:', API_URL);
            console.log('Response status:', res.status, 'data:', res.data);

            if (res.status >= 200 && res.status < 300) {
                const interview = res.data;
                Alert.alert("Success", "Interview Scheduled!", [
                    { 
                        text: "OK", 
                        // Navigate back and pass the new data for potential list update
                        onPress: () => navigation.navigate("AdminDashboard", { newInterview: interview }) 
                    }
                ]);
            } else {
                const msg = res.data?.error || res.data?.message || JSON.stringify(res.data);
                Alert.alert("Server Error", `Status: ${res.status}\nMessage: ${msg}`);
            }
        } catch (error) {
            console.error("Submission error:", error);
            Alert.alert("Error", "Failed to schedule interview. Check API connection or server logs.");
        } finally {
            setLoading(false);
        }
    };

    // --- Render ---

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1A1E26" />

            {/* Background Layer */}
            <View style={[styles.backgroundLayer, isWeb && styles.backgroundLayerWeb]}>
                {isWeb && <View style={styles.webBgCircle} />}
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        isWeb ? styles.scrollContentWeb : styles.scrollContentMobile
                    ]}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    {/* Safe Area Usage */}
                    <SafeAreaView edges={['top', 'left', 'right']}>
                        {/* Header */}
                        <View style={[
                            styles.headerNav,
                            isWeb && { width: '100%', maxWidth: WEB_MAX_WIDTH, alignSelf: 'center', marginBottom: 20 }
                        ]}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                                <Ionicons name="arrow-back" size={24} color="#fff" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Schedule Interview</Text>
                            <View style={{ width: 40 }} />
                        </View>
                    </SafeAreaView>

                    {/* Main Card */}
                    <View style={[
                        styles.mainCard,
                        isWeb ? {
                            width: '100%',
                            maxWidth: WEB_MAX_WIDTH,
                            borderRadius: 24,
                            padding: 32,
                            alignSelf: 'center'
                        } : styles.mainCardMobile
                    ]}>

                        {/* Applicant Ticket */}
                        <View style={styles.applicantTicket}>
                            <View style={styles.ticketHeader}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>{applicantName.charAt(0)}</Text>
                                </View>
                                <View>
                                    <Text style={styles.ticketLabel}>APPLICANT</Text>
                                    <Text style={styles.ticketName}>{applicantName}</Text>
                                    <Text style={styles.ticketRole}>{jobTitle}</Text>
                                </View>
                            </View>
                            <View style={styles.ticketDivider}>
                                <View style={[styles.notch, styles.notchLeft]} />
                                <View style={styles.dashedLine} />
                                <View style={[styles.notch, styles.notchRight]} />
                            </View>
                            <View style={styles.ticketFooter}>
                                <Text style={styles.ticketFooterText}>Reviewing Application #{applicationId}</Text>
                            </View>
                        </View>

                        {/* Date & Time Section */}
                        <Text style={styles.sectionTitle}>Date & Time</Text>
                        <View style={styles.row}>
                            <TouchableOpacity style={styles.dateTimeBox} onPress={() => setShowDatePicker(true)}>
                                <Text style={styles.boxLabel}>DATE</Text>
                                <View style={styles.boxContent}>
                                    <Ionicons name="calendar" size={18} color="#4A90E2" />
                                    <Text style={styles.boxValue}>
                                        {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <View style={{ width: 16 }} />
                            <TouchableOpacity style={styles.dateTimeBox} onPress={() => setShowTimePicker(true)}>
                                <Text style={styles.boxLabel}>TIME</Text>
                                <View style={styles.boxContent}>
                                    <Ionicons name="time" size={18} color="#4A90E2" />
                                    <Text style={styles.boxValue}>
                                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Location Section */}
                        <Text style={styles.sectionTitle}>Location</Text>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.chipsContainer}
                            contentContainerStyle={styles.chipsContent}
                        >
                            {quickLocations.map((loc) => (
                                <TouchableOpacity
                                    key={loc}
                                    style={[styles.chip, location === loc && styles.chipActive]}
                                    onPress={() => setLocation(loc)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.chipText, location === loc && styles.chipTextActive]}>{loc}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.inputContainer}>
                            <Ionicons name="link-outline" size={20} color="#999" style={{ marginRight: 10 }} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Or type custom link/address..."
                                value={location}
                                onChangeText={setLocation}
                                placeholderTextColor="#A0A0A0"
                                onFocus={() => setLocation('')} // Clear quick selection when typing
                            />
                        </View>

                        {/* Pickers */}
                        {showDatePicker && (
                            <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} minimumDate={new Date()} />
                        )}
                        {showTimePicker && (
                            <DateTimePicker value={date} mode="time" display="default" onChange={handleTimeChange} />
                        )}

                        <View style={{ height: 24 }} />

                        {/* Submit Button */}
                        <TouchableOpacity style={styles.mainButton} onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
                            {loading ? <ActivityIndicator color="#fff" /> : (
                                <>
                                    <Text style={styles.mainButtonText}>Schedule Interview</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }}/>
                                </>
                            )}
                        </TouchableOpacity>

                        <View style={{ height: 20 }} />

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

// --- Styles (Unchanged from your second block) ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FB' },

    backgroundLayer: {
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 300,
        backgroundColor: '#1A1E26',
        zIndex: 0, elevation: 0
    },
    backgroundLayerWeb: { height: '100%', justifyContent: 'center', alignItems: 'center' },
    webBgCircle: { position: 'absolute', width: 800, height: 800, borderRadius: 400, backgroundColor: '#4A90E2', opacity: 0.05, top: -150, right: -150 },

    scrollContent: { flexGrow: 1, zIndex: 10 },
    scrollContentMobile: { paddingTop: 0 },
    scrollContentWeb: { justifyContent: 'center', alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },

    headerNav: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, marginBottom: 20, zIndex: 20, elevation: 10,
        marginTop: 10
    },
    iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, color: '#fff', fontWeight: '600' },

    mainCard: {
        backgroundColor: '#fff', padding: 24, zIndex: 20,
        shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20,
        elevation: 5,
    },
    mainCardMobile: {
        flex: 1, borderTopLeftRadius: 30, borderTopRightRadius: 30,
    },

    applicantTicket: {
        backgroundColor: '#fff', borderRadius: 16, marginBottom: 24,
        borderWidth: 1, borderColor: '#F3F4F6',
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10,
        elevation: 2
    },
    ticketHeader: { flexDirection: 'row', padding: 20, alignItems: 'center' },
    avatar: { width: 50, height: 50, borderRadius: 14, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    avatarText: { fontSize: 22, fontWeight: 'bold', color: '#4A90E2' },
    ticketLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '700', marginBottom: 4, letterSpacing: 0.5 },
    ticketName: { fontSize: 19, fontWeight: '800', color: '#1F2937' },
    ticketRole: { fontSize: 15, color: '#6B7280' },

    ticketDivider: { height: 1, position: 'relative', justifyContent: 'center', overflow: 'hidden' },
    dashedLine: { borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed', borderRadius: 1 },
    notch: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', position: 'absolute', top: -10, borderWidth: 1, borderColor: '#F3F4F6' },
    notchLeft: { left: -10 },
    notchRight: { right: -10 },
    ticketFooter: { padding: 15, alignItems: 'center', backgroundColor: '#FAFAFA', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
    ticketFooterText: { color: '#6B7280', fontSize: 13, fontWeight: '500' },

    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 12, marginTop: 4 },
    row: { flexDirection: 'row', marginBottom: 20 },
    dateTimeBox: {
        flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 14,
        borderWidth: 1, borderColor: '#E5E7EB',
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 5,
        elevation: 2
    },
    boxLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '800', marginBottom: 8, letterSpacing: 0.5 },
    boxContent: { flexDirection: 'row', alignItems: 'center' },
    boxValue: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginLeft: 8 },

    chipsContainer: { marginBottom: 16 },
    chipsContent: { alignItems: 'center', paddingRight: 20 },
    chip: {
        paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25,
        backgroundColor: '#fff', marginRight: 10,
        borderWidth: 1, borderColor: '#E5E7EB',
        elevation: 1
    },
    chipActive: { backgroundColor: '#4A90E2', borderColor: '#4A90E2', elevation: 3 },
    chipText: { color: '#6B7280', fontWeight: '600' },
    chipTextActive: { color: '#fff' },

    inputContainer: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 14,
        borderWidth: 1, borderColor: '#E5E7EB'
    },
    textInput: { flex: 1, fontSize: 16, color: '#1F2937' },

    mainButton: {
        backgroundColor: '#1A1E26', height: 56, borderRadius: 16,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        shadowColor: "#4A90E2", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10,
        elevation: 5, marginTop: 20
    },
    mainButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 }
});

export default ScheduleInterview;