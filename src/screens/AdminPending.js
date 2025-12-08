import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    TouchableOpacity, 
    StyleSheet, 
    ActivityIndicator, 
    Platform, 
    Alert, 
    ImageBackground, 
    Dimensions, 
    StatusBar, 
    Modal, 
    ScrollView, 
    Linking,
    useWindowDimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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
    danger: "#EF4444",
    dangerSoft: "#FEE2E2",
    warning: "#F59E0B",
    warningSoft: "#FEF3C7",
    cardBorder: "#E2E8F0",
    iconNeutral: "#94A3B8"
};

const AdminPending = ({ navigation }) => {
    const { width: screenWidth } = useWindowDimensions();
    const isDesktop = screenWidth > 768;

    // --- STATE ---
    const [pendingApps, setPendingApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false); 
    
    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);

    // --- CONFIG ---
    const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'https://finalsbackendcampushire.onrender.com';
    const HEADER_BG = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop';

    // --- API: FETCH APPLICATIONS ---
    const fetchPending = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/job/api/applications/`);
            if (Array.isArray(response.data)) {
                const pending = response.data.filter(app => app.status === 'Pending');
                setPendingApps(pending);
            } else {
                setPendingApps([]);
            }
        } catch (error) {
            console.error("Error fetching pending:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchPending();
        }, [])
    );

    // --- API: SUBMIT REVIEW ---
    const submitReview = async (applicationId, actionType) => {
        if (isSubmitting) return; 
        setIsSubmitting(true); 

        const targetUrl = `${API_URL}/job/review/${applicationId}/`;
        
        try {
            const response = await axios.post(targetUrl, {
                action: actionType 
            }, { validateStatus: () => true });

            if (response.status >= 200 && response.status < 300) {
                setModalVisible(false);
                setPendingApps(prevApps => prevApps.filter(app => app.id !== applicationId));

                if (actionType === 'accept') {
                    Alert.alert("Success! 🎉", "Application Accepted. Applicant notified.");
                } else {
                    Alert.alert("Rejected", "Application rejected. Applicant notified.");
                }
            } else {
                const msg = response.data?.error || response.data?.message || JSON.stringify(response.data);
                Alert.alert("Server Error", `Status: ${response.status}\nMessage: ${msg}`);
            }

        } catch (error) {
            Alert.alert("Network Error", "Server is not responding.");
        } finally {
            setIsSubmitting(false); 
        }
    };

    // --- ACTION HANDLERS ---
    const handleOpenResume = (url) => {
        if (!url) {
            Alert.alert("No Resume", "This applicant did not upload a resume.");
            return;
        }
        let finalUrl = url;
        if (!/^https?:\/\//i.test(url)) {
            const base = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
            const path = url.startsWith('/') ? url : '/' + url;
            finalUrl = `${base}${path}`;
        }
        Linking.openURL(finalUrl).catch(err => Alert.alert("Error", "Cannot open resume link."));
    };

    const handleDecision = (actionType) => {
        Alert.alert(
            `Confirm ${actionType === 'accept' ? 'Accept' : 'Reject'}`,
            `Are you sure you want to ${actionType} this applicant? A notification will be sent immediately.`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Confirm", 
                    style: actionType === 'accept' ? "default" : "destructive",
                    onPress: () => submitReview(selectedApp.id, actionType)
                }
            ]
        );
    };

    const handleScheduleInterview = () => {
        setModalVisible(false);
        navigation.navigate('ScheduleInterview', { 
            applicationId: selectedApp.id,
            applicantName: selectedApp.applicant?.first_name 
        });
    };

    const openReviewModal = (item) => {
        setSelectedApp(item);
        setModalVisible(true);
    };

    const renderItem = ({ item }) => (
        <View style={[styles.card, isDesktop && { width: '48%', marginRight: '2%' }]}>
            {/* Header: Name & Job */}
            <View style={styles.cardHeader}>
                <View style={{flex: 1}}>
                    <Text style={styles.applicantName}>
                        {item.applicant?.first_name || "Unknown"} {item.applicant?.last_name || ""}
                    </Text>
                    <Text style={styles.jobTitle}>{item.job?.title || "Unknown Job"}</Text>
                </View>
                <View style={styles.pendingBadge}>
                    <Text style={styles.pendingText}>PENDING</Text>
                </View>
            </View>

            <Text style={styles.email} numberOfLines={1}>{item.applicant?.email}</Text>

            {/* Review Button */}
            <TouchableOpacity 
                style={styles.reviewBtn} 
                onPress={() => openReviewModal(item)}
                activeOpacity={0.9}
            >
                <Text style={styles.reviewBtnText}>Review Application</Text>
                <Ionicons name="arrow-forward" size={16} color="white" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* 1. Header Background */}
            <ImageBackground source={{ uri: HEADER_BG }} style={styles.headerBackground}>
                <View style={styles.headerOverlay}>
                    <SafeAreaView edges={['top']} style={styles.safeArea}>
                        <View style={[styles.topNav, { paddingHorizontal: isDesktop ? 32 : 24 }]}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navLeft}>
                                <View style={styles.iconBtn}>
                                    <Ionicons name="arrow-back" size={24} color="#fff" />
                                </View>
                                <View>
                                    <Text style={styles.screenLabel}>TASK LIST</Text>
                                    <Text style={styles.screenTitle}>Pending Approvals</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>
            </ImageBackground>

            {/* 2. Floating Sheet Surface */}
            <View style={styles.surface}>
                {loading ? (
                    <View style={styles.centerLoading}>
                        <ActivityIndicator size="large" color={palette.accent} />
                    </View>
                ) : (
                    <FlatList
                        data={pendingApps}
                        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                        renderItem={renderItem}
                        numColumns={isDesktop ? 2 : 1}
                        key={isDesktop ? 'h' : 'v'}
                        contentContainerStyle={[
                            styles.listContent,
                            { paddingHorizontal: isDesktop ? 32 : 20 }
                        ]}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <View style={styles.emptyIconCircle}>
                                    <Ionicons name="checkmark-done-circle-outline" size={40} color={palette.success} />
                                </View>
                                <Text style={styles.emptyTitle}>All Caught Up!</Text>
                                <Text style={styles.emptySub}>No pending applications to review.</Text>
                            </View>
                        }
                    />
                )}
            </View>

            {/* --- DETAILED REVIEW MODAL --- */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, isDesktop && { width: '50%', alignSelf: 'center' }]}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Application Review</Text>
                            <TouchableOpacity onPress={() => !isSubmitting && setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={palette.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScroll}>
                            {selectedApp && (
                                <>
                                    {/* Profile Section */}
                                    <View style={styles.section}>
                                        <View style={styles.profileRow}>
                                            <View style={styles.avatarPlaceholder}>
                                                <Text style={styles.avatarText}>{selectedApp.applicant?.first_name?.[0] || "U"}</Text>
                                            </View>
                                            <View style={{flex: 1}}>
                                                <Text style={styles.profileName}>{selectedApp.applicant?.first_name} {selectedApp.applicant?.last_name}</Text>
                                                <Text style={styles.profileJob}>Applied for: <Text style={{fontWeight:'bold', color: palette.accent}}>{selectedApp.job?.title}</Text></Text>
                                            </View>
                                        </View>
                                        
                                        <View style={styles.infoGrid}>
                                            <View style={styles.infoItem}>
                                                <Ionicons name="mail-outline" size={16} color={palette.iconNeutral} />
                                                <Text style={styles.infoText}>{selectedApp.applicant?.email || "N/A"}</Text>
                                            </View>
                                            <View style={styles.infoItem}>
                                                <Ionicons name="call-outline" size={16} color={palette.iconNeutral} />
                                                <Text style={styles.infoText}>{selectedApp.applicant?.phone || "No Phone"}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Resume Section */}
                                    <Text style={styles.sectionLabel}>DOCUMENTS</Text>
                                    <View style={styles.section}>
                                        <TouchableOpacity 
                                            style={styles.docButton} 
                                            onPress={() => handleOpenResume(selectedApp.resume)}
                                        >
                                            <View style={{flexDirection:'row', alignItems:'center'}}>
                                                <View style={styles.pdfIconBox}>
                                                    <Ionicons name="document-text" size={20} color={palette.danger} />
                                                </View>
                                                <Text style={styles.docButtonText}>View Applicant Resume</Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={16} color={palette.iconNeutral} />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Cover Letter */}
                                    <Text style={styles.sectionLabel}>COVER LETTER</Text>
                                    <View style={[styles.section, {minHeight: 100}]}>
                                        <Text style={styles.coverLetterText}>
                                            {selectedApp.cover_letter 
                                                ? selectedApp.cover_letter 
                                                : "No cover letter provided by the applicant."}
                                        </Text>
                                    </View>
                                    <View style={{height: 20}} />
                                </>
                            )}
                        </ScrollView>

                        {/* Modal Footer (ACTIONS) */}
                        <View style={styles.modalFooter}>
                            <TouchableOpacity 
                                style={[styles.scheduleFullBtn, isSubmitting && {opacity: 0.6}]} 
                                onPress={handleScheduleInterview}
                                disabled={isSubmitting}
                            >
                                <Ionicons name="calendar" size={18} color="white" style={{marginRight: 6}} />
                                <Text style={styles.footerBtnText}>Schedule Interview</Text>
                            </TouchableOpacity>

                            <View style={styles.decisionRow}>
                                <TouchableOpacity 
                                    style={[styles.decisionBtn, styles.rejectBtn, isSubmitting && {opacity: 0.6}]} 
                                    onPress={() => handleDecision('reject')}
                                    disabled={isSubmitting}
                                >
                                    <Ionicons name="close-circle" size={18} color={palette.danger} style={{marginRight: 6}}/>
                                    <Text style={[styles.footerBtnText, {color: palette.danger}]}>Reject</Text>
                                </TouchableOpacity>
                                                
                                <TouchableOpacity 
                                    style={[styles.decisionBtn, styles.acceptBtn, isSubmitting && {opacity: 0.6}]} 
                                    onPress={() => handleDecision('accept')}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <>
                                            <Ionicons name="checkmark-circle" size={18} color="white" style={{marginRight: 6}}/>
                                            <Text style={styles.footerBtnText}>Accept</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
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
    listContent: { paddingTop: 32, paddingBottom: 40 },
    centerLoading: { marginTop: 100 },

    // --- Card ---
    card: { 
        backgroundColor: palette.surface, 
        borderRadius: 16, 
        padding: 20, 
        marginBottom: 16,
        borderWidth: 1,
        borderColor: palette.cardBorder,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    applicantName: { fontSize: 16, fontWeight: '800', color: palette.textPrimary },
    jobTitle: { fontSize: 13, color: palette.accent, fontWeight: '600', marginTop: 2 },
    
    pendingBadge: { backgroundColor: palette.warningSoft, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
    pendingText: { fontSize: 10, fontWeight: '800', color: palette.warning, letterSpacing: 0.5 },
    
    email: { color: palette.textSecondary, fontSize: 13, marginTop: 8, marginBottom: 16 },
    
    reviewBtn: {
        backgroundColor: palette.textPrimary,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        paddingVertical: 12, borderRadius: 10
    },
    reviewBtnText: { color: 'white', fontWeight: '700', fontSize: 13, marginRight: 8 },

    // --- Empty State ---
    emptyState: { alignItems: 'center', marginTop: 80 },
    emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: palette.successSoft, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: palette.textPrimary },
    emptySub: { fontSize: 14, color: palette.textSecondary, marginTop: 4 },

    // --- MODAL ---
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
    modalContent: { 
        backgroundColor: palette.background, 
        borderTopLeftRadius: 24, borderTopRightRadius: 24, 
        height: '85%', 
        paddingBottom: 30
    },
    modalHeader: { 
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
        padding: 20, borderBottomWidth: 1, borderBottomColor: palette.cardBorder, backgroundColor: palette.surface,
        borderTopLeftRadius: 24, borderTopRightRadius: 24
    },
    modalTitle: { fontSize: 16, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, color: palette.textPrimary },
    modalScroll: { padding: 20 },

    section: { backgroundColor: palette.surface, padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: palette.cardBorder },
    sectionLabel: { fontSize: 12, fontWeight: '700', color: palette.textSecondary, marginBottom: 8, marginLeft: 4, letterSpacing: 0.5 },

    // Profile
    profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    avatarPlaceholder: { 
        width: 50, height: 50, borderRadius: 16, backgroundColor: palette.background, 
        justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: palette.cardBorder 
    },
    avatarText: { fontSize: 20, fontWeight: '800', color: palette.textPrimary },
    profileName: { fontSize: 18, fontWeight: '800', color: palette.textPrimary },
    profileJob: { fontSize: 13, color: palette.textSecondary },
    
    infoGrid: { gap: 10 },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    infoText: { color: palette.textPrimary, fontSize: 14, fontWeight: '500' },

    // Docs
    docButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    pdfIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: palette.dangerSoft, justifyContent: 'center', alignItems: 'center' },
    docButtonText: { flex: 1, marginLeft: 12, fontSize: 14, fontWeight: '600', color: palette.textPrimary },

    coverLetterText: { fontSize: 14, lineHeight: 24, color: palette.textPrimary },

    // Footer
    modalFooter: { padding: 20, backgroundColor: palette.surface, borderTopWidth: 1, borderTopColor: palette.cardBorder },
    
    scheduleFullBtn: {
        backgroundColor: palette.accent, 
        paddingVertical: 14, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        marginBottom: 12
    },
    
    decisionRow: { flexDirection: 'row', gap: 12 },
    decisionBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    
    acceptBtn: { backgroundColor: palette.success, borderColor: palette.success },
    rejectBtn: { backgroundColor: palette.background, borderColor: palette.danger },
    
    footerBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
});

export default AdminPending;