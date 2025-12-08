import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    TouchableOpacity, 
    StyleSheet, 
    ActivityIndicator, 
    ImageBackground, 
    Dimensions, 
    Platform, 
    StatusBar, 
    RefreshControl, 
    Alert,
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
    cardBorder: "#E2E8F0",
    iconNeutral: "#94A3B8"
};

const CandidateDashboard = ({ route, navigation }) => {
    const { width: screenWidth } = useWindowDimensions();
    const isDesktop = screenWidth > 768;

    // --- 1. SAFE PARAMETER HANDLING ---
    const params = route.params || {};
    const user = params.user || { first_name: 'Candidate', id: 0 };

    // --- 2. STATE ---
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false); 

    // --- 3. CONFIG ---
    const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'https://finalsbackendcampushire.onrender.com';
    const HEADER_BG = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop';

    // --- API CALLS ---
    const fetchJobs = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/jobs/`);
            setJobs(response.data);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const checkNotifications = async () => {
        if (!user || !user.id) return;
        try {
            const response = await axios.get(`${API_URL}/job/api/notifications/${user.id}/`);
            const notifications = response.data || [];
            // Check for unread
            const unreadItems = notifications.filter(n => {
                const isRead = (n.read !== undefined) ? n.read : (n.is_read !== undefined ? n.is_read : false);
                return isRead === false;
            });
            setHasUnreadNotifications(unreadItems.length > 0);
        } catch (error) {
            console.error("Error checking notifications:", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchJobs();
            checkNotifications(); 
        }, [])
    );

    const onRefresh = () => { 
        setRefreshing(true); 
        fetchJobs(); 
        checkNotifications(); 
    };

    const handleApply = (item) => {
        if (item.status !== 'Open') {
            Alert.alert("Unavailable", "This job position is currently closed.");
            return;
        }
        navigation.navigate('ApplyJob', { job: item, user });
    };

    // --- RENDER ITEMS ---

    const renderHeaderComponent = () => (
        <View style={styles.bannerContainer}>
            <View style={styles.bannerContent}>
                <View>
                    <Text style={styles.bannerTitle}>Find Your Dream Job</Text>
                    <Text style={styles.bannerSub}>
                        {jobs.length} open positions waiting for you.
                    </Text>
                </View>
                <View style={styles.bannerIcon}>
                    <Ionicons name="search" size={24} color={palette.accent} />
                </View>
            </View>
        </View>
    );

    const renderJobItem = ({ item }) => {
        const isOpen = item.status === 'Open';
        
        return (
            <View style={[styles.card, isDesktop && { width: '48%', marginRight: '2%' }]}>
                {/* Header: Title & Status */}
                <View style={styles.cardHeader}>
                    <View style={{flex: 1}}>
                        <Text style={styles.jobTitle}>{item.title}</Text>
                        <Text style={styles.position}>{item.job_position}</Text>
                    </View>
                    <View style={[
                        styles.badge, 
                        { backgroundColor: isOpen ? palette.successSoft : palette.dangerSoft }
                    ]}>
                        <Text style={[
                            styles.badgeText, 
                            { color: isOpen ? palette.success : palette.danger }
                        ]}>
                            {item.status}
                        </Text>
                    </View>
                </View>

                {/* Description */}
                <Text style={styles.description} numberOfLines={3}>{item.description}</Text>

                {/* Meta Info */}
                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Ionicons name="cash-outline" size={14} color={palette.textSecondary} />
                        <Text style={styles.metaText}>${item.salary}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="people-outline" size={14} color={palette.textSecondary} />
                        <Text style={styles.metaText}>{item.slots} Slots</Text>
                    </View>
                </View>

                {/* Apply Button */}
                <TouchableOpacity 
                    style={[
                        styles.applyButton, 
                        !isOpen && styles.disabledButton
                    ]}
                    onPress={() => handleApply(item)}
                    disabled={!isOpen}
                    activeOpacity={0.9}
                >
                    <Text style={styles.applyButtonText}>
                        {isOpen ? 'Apply Now' : 'Position Closed'}
                    </Text>
                    {isOpen && <Ionicons name="arrow-forward" size={16} color="white" style={{marginLeft: 6}}/>}
                </TouchableOpacity>
            </View>
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
                            
                            {/* Left: Branding/Greeting */}
                            <View>
                                <Text style={styles.screenLabel}>CampusHire</Text>
                                <Text style={styles.screenTitle}>Hello, {user.first_name}</Text>
                            </View>

                            {/* Right: Actions */}
                            <View style={styles.headerActions}>
                                {/* Notification with Red Dot */}
                                <TouchableOpacity 
                                    style={styles.iconBtn} 
                                    onPress={() => navigation.navigate('Notifications', { user })}
                                >
                                    <Ionicons name="notifications-outline" size={24} color="#fff" />
                                    {hasUnreadNotifications && <View style={styles.notificationDot} />}
                                </TouchableOpacity>

                                {/* Profile */}
                                <TouchableOpacity 
                                    style={styles.iconBtn} 
                                    onPress={() => navigation.navigate('Profile', { user })}
                                >
                                    <Ionicons name="person-circle-outline" size={24} color="#fff" />
                                </TouchableOpacity>

                                {/* Logout */}
                                <TouchableOpacity 
                                    style={[styles.iconBtn, {marginRight: 0}]} 
                                    onPress={() => navigation.replace('Login')}
                                >
                                    <Ionicons name="log-out-outline" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>
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
                        data={jobs}
                        renderItem={renderJobItem}
                        keyExtractor={item => item.id.toString()}
                        ListHeaderComponent={renderHeaderComponent}
                        
                        // Grid Logic
                        numColumns={isDesktop ? 2 : 1}
                        key={isDesktop ? 'h' : 'v'}
                        
                        contentContainerStyle={[
                            styles.listContent,
                            { paddingHorizontal: isDesktop ? 32 : 20 }
                        ]}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <View style={styles.emptyIconCircle}>
                                    <Ionicons name="search" size={40} color={palette.iconNeutral} />
                                </View>
                                <Text style={styles.emptyTitle}>No Jobs Found</Text>
                                <Text style={styles.emptySub}>Check back later for new openings.</Text>
                            </View>
                        }
                    />
                )}
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
    topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
    
    screenLabel: { color: palette.iconNeutral, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
    screenTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
    
    headerActions: { flexDirection: 'row', alignItems: 'center' },
    iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginLeft: 12 },

    // Red Dot
    notificationDot: {
        position: 'absolute', top: 8, right: 8,
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: palette.danger,
        borderWidth: 1, borderColor: '#fff'
    },

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

    // --- Banner ---
    bannerContainer: { marginBottom: 24 },
    bannerContent: { 
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: palette.accentSoft, padding: 20, borderRadius: 16,
        borderWidth: 1, borderColor: palette.accentSoft
    },
    bannerTitle: { fontSize: 18, fontWeight: '800', color: palette.accent },
    bannerSub: { fontSize: 13, color: palette.textSecondary, marginTop: 4 },
    bannerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },

    // --- Job Card ---
    card: {
        backgroundColor: palette.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1, borderColor: palette.cardBorder,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    jobTitle: { fontSize: 16, fontWeight: '800', color: palette.textPrimary, marginBottom: 2 },
    position: { color: palette.accent, fontWeight: '600', fontSize: 13 },
    
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },

    description: { color: palette.textSecondary, marginBottom: 16, lineHeight: 20, fontSize: 13 },

    // Meta
    metaRow: { flexDirection: 'row', marginBottom: 16, gap: 12 },
    metaItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.background, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
    metaText: { color: palette.textPrimary, fontWeight: '600', marginLeft: 6, fontSize: 12 },

    // Apply Button
    applyButton: {
        backgroundColor: palette.accent, 
        paddingVertical: 12, borderRadius: 12,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        shadowColor: palette.accent, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2
    },
    disabledButton: { backgroundColor: palette.iconNeutral, shadowOpacity: 0 },
    applyButtonText: { color: 'white', fontWeight: '700', fontSize: 14 },

    // Empty State
    emptyState: { alignItems: 'center', marginTop: 40 },
    emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: palette.textPrimary },
    emptySub: { fontSize: 14, color: palette.textSecondary, marginTop: 4 },
});

export default CandidateDashboard;