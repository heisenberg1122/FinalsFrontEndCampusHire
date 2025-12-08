import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    ScrollView, 
    ActivityIndicator, 
    RefreshControl, 
    Platform, 
    ImageBackground, 
    Dimensions, 
    StatusBar,
    Alert,
    Modal, 
    useWindowDimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const palette = {
    surface: "#FFFFFF",
    background: "#F8FAFC",
    textPrimary: "#1E293B",
    textSecondary: "#64748B",
    accent: "#3B82F6",
    accentSoft: "rgba(59, 130, 246, 0.08)",
    statShadow: "rgba(0, 0, 0, 0.05)",
    cardBorder: "#E2E8F0",
    iconNeutral: "#94A3B8",
    danger: "#EF4444",   
    dangerSoft: "#FEF2F2",
    success: "#10B981", 
};

const AdminDashboard = ({ navigation, route }) => {
    
    // --- 1. SETUP ---
    const params = route.params || {};
    const [user, setUser] = useState(params.user || { first_name: 'Admin', last_name: 'User' });
    const { width: screenWidth } = useWindowDimensions();
    const isDesktop = screenWidth > 768; 

    // --- 2. STATE ---
    const [stats, setStats] = useState({ total_jobs: 0, total_users: 0, total_applications: 0, pending_tasks: 0 });
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingInterviews, setLoadingInterviews] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // --- MODAL STATE ---
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- 3. CONFIG ---
    const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'https://finalsbackendcampushire.onrender.com';
    const DASHBOARD_BG = 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop';

    // --- 4. SESSION ---
    useEffect(() => {
        const manageUserSession = async () => {
            try {
                if (route.params?.user) {
                    setUser(route.params.user);
                    await AsyncStorage.setItem('user_session', JSON.stringify(route.params.user));
                } else {
                    const storedUser = await AsyncStorage.getItem('user_session');
                    if (storedUser) setUser(JSON.parse(storedUser));
                }
            } catch (error) { console.error("Session Error:", error); }
        };
        manageUserSession();
    }, [route.params?.user]);

    // --- 5. API CALLS ---
    const fetchUserData = async () => {
        if (!user?.id) return;
        try {
            const response = await axios.get(`${API_URL}/reg/api/users/${user.id}/`);
            const updatedUser = response.data;
            if (updatedUser.first_name !== user.first_name || updatedUser.last_name !== user.last_name) {
                setUser(updatedUser);
                await AsyncStorage.setItem('user_session', JSON.stringify(updatedUser));
            }
        } catch (error) { console.log("Sync failed", error.message); }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/stats/`);
            setStats(response.data);
        } catch (error) { console.log("Stats error", error); } 
        finally { setLoading(false); setRefreshing(false); }
    };

    const fetchInterviews = async () => {
        try {
            setLoadingInterviews(true);
            const res = await axios.get(`${API_URL}/job/api/interviews/`);
            setInterviews(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.log('Failed fetch interviews', err); setInterviews([]); } 
        finally { setLoadingInterviews(false); }
    };

    // --- 6. LOGIC: OPEN MODAL ---
    const handleOpenReview = (interviewItem) => {
        setSelectedInterview(interviewItem);
        setModalVisible(true);
    };

    // --- 7. HELPER: EXTRACT APP ID ---
    const getApplicationId = (interview) => {
        if (!interview) return null;
        if (typeof interview.application === 'object' && interview.application !== null) {
            return interview.application.id;
        }
        if (typeof interview.application === 'number' || typeof interview.application === 'string') {
            return interview.application;
        }
        if (interview.application_id) {
            return interview.application_id;
        }
        return null;
    };

    // --- 8. LOGIC: SUBMIT REVIEW ---
    const handleDecision = (actionType) => {
        const appId = getApplicationId(selectedInterview);

        if (!appId) {
            Alert.alert("Error", "Could not find linked Application ID for this interview.");
            return;
        }

        Alert.alert(
            `Confirm ${actionType === 'accept' ? 'Accept' : 'Reject'}`,
            `Are you sure you want to ${actionType} this candidate? The interview will be removed from the schedule.`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Confirm", 
                    style: actionType === 'accept' ? "default" : "destructive",
                    onPress: () => submitReview(appId, actionType)
                }
            ]
        );
    };

    const submitReview = async (appId, actionType) => {
        if (isSubmitting) return; 
        setIsSubmitting(true); 

        const targetUrl = `${API_URL}/job/review/${appId}/`;
        
        try {
            // 1. Submit the Application Review (Accept/Reject)
            const response = await axios.post(targetUrl, {
                action: actionType 
            }, { validateStatus: () => true });

            if (response.status >= 200 && response.status < 300) {
                setModalVisible(false);
                
                // --- 2. NEW LOGIC: AUTOMATICALLY DELETE THE INTERVIEW ---
                // Since the decision is made, the interview is no longer needed/pending.
                if (selectedInterview && selectedInterview.id) {
                    try {
                        console.log(`Auto-deleting interview ID: ${selectedInterview.id}`);
                        await axios.delete(`${API_URL}/job/api/interviews/${selectedInterview.id}/delete/`);
                        
                        // Remove from local UI immediately
                        setInterviews(prev => prev.filter(item => item.id !== selectedInterview.id));
                    } catch (deleteError) {
                        console.log("Could not auto-delete interview:", deleteError);
                        // Even if delete fails on server, we remove it from UI locally
                        setInterviews(prev => prev.filter(item => item.id !== selectedInterview.id));
                    }
                }
                // -------------------------------------------------------

                if (actionType === 'accept') {
                    Alert.alert("Success", "Candidate Accepted. Interview removed.");
                } else {
                    Alert.alert("Rejected", "Candidate Rejected. Interview removed.");
                }
                
                fetchStats(); // Update stats
            } else {
                console.log("Server Response:", response.data);
                Alert.alert("Server Error", `Status: ${response.status}. Could not process request.`);
            }
        } catch (error) {
            console.log("Network Error:", error);
            Alert.alert("Network Error", "Server is not responding.");
        } finally {
            setIsSubmitting(false); 
        }
    };

    // --- 9. DELETE INTERVIEW (Manual) ---
    const handleDeleteInterview = (id) => {
        Alert.alert(
            "Cancel Interview",
            "Are you sure you want to remove this interview?",
            [
                { text: "No", style: "cancel" },
                { 
                    text: "Yes, Delete", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await axios.delete(`${API_URL}/job/api/interviews/${id}/delete/`);
                            setInterviews(prev => prev.filter(item => item.id !== id));
                        } catch (error) {
                            console.error("Delete failed", error);
                            Alert.alert("Error", "Could not delete interview.");
                        }
                    }
                }
            ]
        );
    };

    // --- 10. POLLING ---
    const pollRef = useRef(null);
    useFocusEffect(
        useCallback(() => {
            fetchStats();
            fetchInterviews();
            fetchUserData();
            pollRef.current = setInterval(() => { 
                fetchInterviews(); 
                fetchUserData();
            }, 15000);
            return () => { if (pollRef.current) clearInterval(pollRef.current); };
        }, [user.id])
    );

    const onRefresh = () => { 
        setRefreshing(true); 
        fetchStats(); 
        fetchInterviews(); 
        fetchUserData();
    };

    const handleLogout = async () => {
        try { await AsyncStorage.removeItem('user_session'); navigation.replace('Login'); } catch (e) { navigation.replace('Login'); }
    };

    // --- COMPONENTS ---

    const StatCard = ({ label, value, icon, onPress }) => (
        <TouchableOpacity 
            style={[styles.statCard, { width: isDesktop ? '24%' : '48%' }]} 
            onPress={onPress} activeOpacity={0.9}
        >
            <View style={styles.statHeader}>
                <View style={styles.iconBox}> 
                    <Ionicons name={icon} size={22} color={palette.textSecondary} />
                </View>
                <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </View>
            <View style={styles.statContent}>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
            </View>
        </TouchableOpacity>
    );

    const ActionButton = ({ label, icon, onPress }) => (
        <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.actionIcon}>
                <Ionicons name={icon} size={20} color={palette.textPrimary} />
            </View>
            <Text style={styles.actionBtnText}>{label}</Text>
        </TouchableOpacity>
    );

    const AgendaItem = ({ item }) => {
        const dateObj = new Date(item.date_time);
        return (
            <View style={styles.agendaItem}> 
                <View style={styles.agendaTimeBox}>
                    <Text style={styles.agendaTime}>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    <Text style={styles.agendaDate}>{dateObj.getDate()} {dateObj.toLocaleString('default', { month: 'short' })}</Text>
                </View>
                <View style={styles.verticalLine} />
                
                <TouchableOpacity 
                    style={styles.agendaDetails}
                    onPress={() => handleOpenReview(item)}
                >
                    <Text style={styles.agendaTitle} numberOfLines={1}>{item.job_title || 'Interview'}</Text>
                    <Text style={styles.agendaSubtitle} numberOfLines={1}>Candidate: {item.applicant_name}</Text>
                    <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={14} color="#94A3B8" />
                        <Text style={styles.locationText}>{item.location || 'Online'}</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.deleteBtn} 
                    onPress={() => handleDeleteInterview(item.id)}
                >
                    <Ionicons name="trash-outline" size={18} color={palette.danger} />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            <ImageBackground source={{ uri: DASHBOARD_BG }} style={styles.headerBackground}>
                <View style={styles.headerOverlay}>
                    <SafeAreaView edges={['top']} style={styles.safeArea}>
                        {/* Header Content */}
                        <View style={[styles.topNav, { paddingHorizontal: isDesktop ? 32 : 24 }]}>
                            <View>
                                <Text style={styles.greetingText}>ADMIN CONSOLE</Text>
                                <Text style={[styles.userText, isDesktop && { fontSize: 32 }]}>
                                    {user.first_name} {user.last_name}
                                </Text>
                            </View>
                            <View style={styles.headerActions}>
                                <TouchableOpacity style={styles.iconBtn} onPress={handleLogout}>
                                    <Ionicons name="log-out-outline" size={24} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile', { user })}>
                                    <Text style={styles.profileInitials}>{(user.first_name?.[0] || 'A')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </SafeAreaView>
                </View>
            </ImageBackground>

            <View style={styles.surface}>
                <ScrollView 
                    contentContainerStyle={[
                        styles.scrollContent, 
                        { paddingHorizontal: isDesktop ? 32 : 20, paddingTop: 32 }
                    ]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    {/* STATS */}
                    <Text style={styles.sectionTitle}>Overview</Text>
                    {loading ? <ActivityIndicator color={palette.accent} style={{margin: 20}} /> : (
                        <View style={styles.grid}>
                            <StatCard label="APPLICANTS" value={stats.total_applications} icon="people-outline" onPress={() => navigation.navigate('ViewApplications')}/>
                            <StatCard label="OPEN JOBS" value={stats.total_jobs} icon="briefcase-outline" onPress={() => navigation.navigate('JobPostings')}/>
                            <StatCard label="PENDING" value={stats.pending_tasks} icon="alert-circle-outline" onPress={() => navigation.navigate('AdminPending')}/>
                            <StatCard label="USERS" value={stats.total_users} icon="shield-checkmark-outline" onPress={() => navigation.navigate('UserManagement')}/>
                        </View>
                    )}

                    {/* QUICK ACTIONS */}
                    <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Quick Actions</Text>
                    <View style={styles.actionRow}>
                        <ActionButton label="Post Job" icon="add" onPress={() => navigation.navigate('JobPostings')} />
                        <ActionButton label="Review" icon="file-tray-full-outline" onPress={() => navigation.navigate('AdminPending')} />
                        <ActionButton label="Add User" icon="person-add-outline" onPress={() => navigation.navigate('UserManagement')} />
                    </View>

                    {/* SCHEDULE */}
                    <View style={styles.agendaHeader}>
                        <Text style={styles.sectionTitle}>Upcoming Interviews</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ViewApplications')}>
                            <Text style={styles.linkText}>Full Calendar</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.agendaContainer}>
                        {loadingInterviews ? (
                            <ActivityIndicator size="large" color="#475569" style={{ padding: 40 }} />
                        ) : interviews.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="calendar-outline" size={40} color="#CBD5E1" />
                                <Text style={styles.emptyText}>No interviews scheduled.</Text>
                            </View>
                        ) : (
                            interviews.slice(0, 5).map((iv, index) => (
                                <AgendaItem key={iv.id || index} item={iv} />
                            ))
                        )}
                    </View>

                    <View style={{ height: 60 }} />
                </ScrollView>
            </View>

            {/* --- REVIEW MODAL --- */}
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
                            <Text style={styles.modalTitle}>Interview Review</Text>
                            <TouchableOpacity onPress={() => !isSubmitting && setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={palette.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            {selectedInterview && (
                                <>
                                    <View style={styles.modalInfoRow}>
                                        <View style={styles.modalIconBox}>
                                            <Ionicons name="person" size={20} color={palette.accent} />
                                        </View>
                                        <View>
                                            <Text style={styles.modalLabel}>CANDIDATE</Text>
                                            <Text style={styles.modalValue}>{selectedInterview.applicant_name}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.modalInfoRow}>
                                        <View style={styles.modalIconBox}>
                                            <Ionicons name="briefcase" size={20} color={palette.accent} />
                                        </View>
                                        <View>
                                            <Text style={styles.modalLabel}>POSITION</Text>
                                            <Text style={styles.modalValue}>{selectedInterview.job_title}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.modalInfoRow}>
                                        <View style={styles.modalIconBox}>
                                            <Ionicons name="time" size={20} color={palette.accent} />
                                        </View>
                                        <View>
                                            <Text style={styles.modalLabel}>SCHEDULE</Text>
                                            <Text style={styles.modalValue}>
                                                {new Date(selectedInterview.date_time).toLocaleString()}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={[styles.modalInfoRow, {borderBottomWidth:0}]}>
                                        <View style={styles.modalIconBox}>
                                            <Ionicons name="location" size={20} color={palette.accent} />
                                        </View>
                                        <View>
                                            <Text style={styles.modalLabel}>LOCATION</Text>
                                            <Text style={styles.modalValue}>{selectedInterview.location}</Text>
                                        </View>
                                    </View>
                                </>
                            )}
                        </View>

                        {/* Actions */}
                        <View style={styles.modalFooter}>
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
            </Modal>

        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    
    // Header
    headerBackground: { height: height * 0.22, width: '100%' },
    headerOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.9)' },
    safeArea: { flex: 1 },
    topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
    headerActions: { flexDirection: 'row', alignItems: 'center' },
    iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    profileBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
    profileInitials: { color: '#0F172A', fontSize: 18, fontWeight: '800' },
    greetingText: { color: palette.iconNeutral, fontSize: 12, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
    userText: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginTop: 4 },

    // Main Surface
    surface: { flex: 1, backgroundColor: palette.background, borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30, overflow: 'hidden' },
    scrollContent: { paddingBottom: 40 },

    sectionTitle: { fontSize: 14, fontWeight: '800', color: palette.textSecondary, marginBottom: 16, letterSpacing: 0.5, textTransform: 'uppercase' },

    // Stats Grid
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
    statCard: { 
        backgroundColor: palette.surface, 
        borderRadius: 16, 
        padding: 20, 
        marginBottom: 16,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
        borderWidth: 1, borderColor: palette.cardBorder
    },
    statHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: palette.background, justifyContent: 'center', alignItems: 'center' },
    statValue: { fontSize: 36, fontWeight: '800', color: palette.textPrimary, letterSpacing: -1 },
    statLabel: { fontSize: 12, fontWeight: '700', color: palette.textSecondary, marginTop: 4 },

    // Quick Actions
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
    actionBtn: { 
        width: '32%', 
        backgroundColor: palette.surface, 
        paddingVertical: 16, 
        borderRadius: 14, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        borderWidth: 1, borderColor: palette.cardBorder,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1
    },
    actionIcon: { marginRight: 8 },
    actionBtnText: { fontSize: 13, fontWeight: '700', color: palette.textPrimary },

    // Agenda
    agendaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    linkText: { color: palette.accent, fontWeight: '700', fontSize: 13 },
    agendaContainer: { backgroundColor: palette.surface, borderRadius: 20, padding: 4, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: palette.cardBorder },
    agendaItem: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: palette.background, alignItems: 'center' },
    agendaTimeBox: { width: 65, alignItems: 'flex-end', marginRight: 16 },
    agendaTime: { fontSize: 15, fontWeight: '800', color: '#334155' },
    agendaDate: { fontSize: 11, fontWeight: '600', color: palette.iconNeutral, marginTop: 4 },
    verticalLine: { width: 2, height: '80%', backgroundColor: palette.cardBorder, borderRadius: 2, marginRight: 16 },
    agendaDetails: { flex: 1, justifyContent: 'center' },
    agendaTitle: { fontSize: 15, fontWeight: '700', color: palette.textPrimary },
    agendaSubtitle: { fontSize: 13, color: palette.textSecondary, marginTop: 2 },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    locationText: { fontSize: 12, color: palette.iconNeutral, marginLeft: 4, fontWeight: '600' },
    
    deleteBtn: {
        padding: 10,
        backgroundColor: palette.dangerSoft,
        borderRadius: 10,
        marginLeft: 8
    },

    emptyState: { padding: 40, alignItems: 'center' },
    emptyText: { color: palette.iconNeutral, marginTop: 10, fontSize: 14, fontWeight: '500' },

    // --- MODAL STYLES ---
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
    modalContent: { 
        backgroundColor: palette.background, 
        borderTopLeftRadius: 24, borderTopRightRadius: 24, 
        paddingBottom: 30
    },
    modalHeader: { 
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
        padding: 20, borderBottomWidth: 1, borderBottomColor: palette.cardBorder, backgroundColor: palette.surface,
        borderTopLeftRadius: 24, borderTopRightRadius: 24
    },
    modalTitle: { fontSize: 16, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, color: palette.textPrimary },
    
    modalBody: { padding: 20 },
    modalInfoRow: { 
        flexDirection: 'row', alignItems: 'center', 
        backgroundColor: palette.surface, padding: 12, borderRadius: 12,
        marginBottom: 12, borderWidth: 1, borderColor: palette.cardBorder
    },
    modalIconBox: { 
        width: 40, height: 40, borderRadius: 20, backgroundColor: palette.accentSoft, 
        justifyContent: 'center', alignItems: 'center', marginRight: 12 
    },
    modalLabel: { fontSize: 10, fontWeight: '800', color: palette.textSecondary, marginBottom: 2 },
    modalValue: { fontSize: 14, fontWeight: '700', color: palette.textPrimary },

    modalFooter: { paddingHorizontal: 20, flexDirection: 'row', gap: 12 },
    decisionBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    acceptBtn: { backgroundColor: palette.success, borderColor: palette.success },
    rejectBtn: { backgroundColor: palette.background, borderColor: palette.danger },
    footerBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
});

export default AdminDashboard;