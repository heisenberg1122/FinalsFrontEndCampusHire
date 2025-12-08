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
    RefreshControl, 
    ImageBackground, 
    Dimensions, 
    StatusBar, 
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

const ViewApplications = ({ navigation }) => {
    const { width: screenWidth } = useWindowDimensions();
    const isDesktop = screenWidth > 768;

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // 🌐 AUTO-DETECT URL
    const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'https://finalsbackendcampushire.onrender.com';
    const HEADER_BG = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop';

    const fetchApplications = async () => {
        try {
            const response = await axios.get(`${API_URL}/job/api/applications/`); 
            setApplications(response.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchApplications();
        }, [])
    );

    const onRefresh = () => { setRefreshing(true); fetchApplications(); };

    // --- DELETE LOGIC ---
    const handleDeleteApplication = (id) => {
        Alert.alert(
            "Delete Application",
            "Are you sure you want to delete this accepted applicant? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: async () => {
                        try {
                            await axios.delete(`${API_URL}/job/api/applications/${id}/`);
                            setApplications(prev => prev.filter(app => app.id !== id));
                            // Alert.alert("Success", "Application deleted."); // Optional feedback
                        } catch (error) {
                            console.error("Delete failed", error);
                            Alert.alert("Error", "Failed to delete application.");
                        }
                    }
                }
            ]
        );
    };

    // --- HELPER: Status Styles (Updated to Palette) ---
    const getStatusStyle = (status) => {
        switch(status) {
            case 'Accepted': return { bg: palette.successSoft, text: palette.success };
            case 'Rejected': return { bg: palette.dangerSoft, text: palette.danger };
            case 'Pending': return { bg: palette.warningSoft, text: palette.warning };
            default: return { bg: palette.background, text: palette.textSecondary };
        }
    };

    const handleOpenResume = (url) => {
        if (!url) {
            Alert.alert('No Resume', 'This applicant did not upload a resume.');
            return;
        }
        let finalUrl = url;
        if (!/^https?:\/\//i.test(url)) {
            const base = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
            const path = url.startsWith('/') ? url : '/' + url;
            finalUrl = `${base}${path}`;
        }
        Linking.openURL(finalUrl).catch(() => Alert.alert('Error', 'Cannot open resume link.'));
    };

    const handleSchedule = (item) => {
        navigation.navigate('ScheduleInterview', {
            applicationId: item.id,
            applicantName: item.applicant?.first_name,
            jobTitle: item.job?.title || ''
        });
    };

    const renderItem = ({ item }) => {
        const statusStyle = getStatusStyle(item.status);
        const isAccepted = item.status === 'Accepted';

        return (
            <View style={[styles.card, isDesktop && { width: '48%', marginRight: '2%' }]}>
                {/* Header: Name & Status */}
                <View style={styles.cardHeader}>
                    <View style={{flex: 1}}>
                        <Text style={styles.applicantName}>
                            {item.applicant?.first_name} {item.applicant?.last_name}
                        </Text>
                        <View style={styles.jobRow}>
                            <Ionicons name="briefcase-outline" size={14} color={palette.accent} style={{marginRight: 4}}/>
                            <Text style={styles.jobTitle} numberOfLines={1}>
                                {item.job?.title || 'Unknown Position'}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
                    </View>
                </View>

                {/* Info Row: Email */}
                <View style={styles.infoRow}>
                    <Ionicons name="mail-outline" size={14} color={palette.iconNeutral} />
                    <Text style={styles.infoText}>{item.applicant?.email}</Text>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Actions */}
                <View style={styles.actionsRow}>
                    {/* Resume Button */}
                    <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: palette.background }]} 
                        onPress={() => handleOpenResume(item.resume)}
                    >
                        <Ionicons name="document-text-outline" size={18} color={palette.textSecondary} />
                        <Text style={[styles.actionText, { color: palette.textSecondary }]}>Resume</Text>
                    </TouchableOpacity>

                    {/* Dynamic Action: Delete or Schedule */}
                    {isAccepted ? (
                        <TouchableOpacity 
                            style={[styles.actionBtn, { backgroundColor: palette.dangerSoft }]} 
                            onPress={() => handleDeleteApplication(item.id)}
                        >
                            <Ionicons name="trash-outline" size={18} color={palette.danger} />
                            <Text style={[styles.actionText, { color: palette.danger }]}>Delete</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity 
                            style={[styles.actionBtn, { backgroundColor: palette.accentSoft }]} 
                            onPress={() => handleSchedule(item)}
                        >
                            <Ionicons name="calendar-outline" size={18} color={palette.accent} />
                            <Text style={[styles.actionText, { color: palette.accent }]}>Schedule</Text>
                        </TouchableOpacity>
                    )}
                </View>
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
                            
                            {/* Back & Title */}
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navLeft}>
                                <View style={styles.iconBtn}>
                                    <Ionicons name="arrow-back" size={24} color="#fff" />
                                </View>
                                <View>
                                    <Text style={styles.screenLabel}>MANAGEMENT</Text>
                                    <Text style={styles.screenTitle}>Applications</Text>
                                </View>
                            </TouchableOpacity>

                            {/* Pending Button */}
                            <TouchableOpacity 
                                style={styles.pendingBtn}
                                onPress={() => navigation.navigate('AdminPending')} 
                                activeOpacity={0.9}
                            >
                                <Ionicons name="time-outline" size={20} color={palette.accent} />
                                <Text style={styles.pendingBtnText}>Review Pending</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>
            </ImageBackground>

            {/* 2. Floating Surface */}
            <View style={styles.surface}>
                {loading ? (
                    <View style={styles.centerLoading}>
                        <ActivityIndicator size="large" color={palette.accent} />
                    </View>
                ) : (
                    <FlatList 
                        data={applications}
                        keyExtractor={item => item.id.toString()}
                        renderItem={renderItem}
                        // Grid support
                        numColumns={isDesktop ? 2 : 1}
                        key={isDesktop ? 'h' : 'v'}
                        contentContainerStyle={[
                            styles.listContent, 
                            { paddingHorizontal: isDesktop ? 32 : 20 }
                        ]}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <View style={styles.emptyIconCircle}>
                                    <Ionicons name="folder-open-outline" size={40} color={palette.iconNeutral} />
                                </View>
                                <Text style={styles.emptyTitle}>No Applications</Text>
                                <Text style={styles.emptySub}>Applications will appear here once submitted.</Text>
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
    navLeft: { flexDirection: 'row', alignItems: 'center' },
    iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    
    screenLabel: { color: palette.iconNeutral, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
    screenTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },

    // Pending Button (White Pill Style)
    pendingBtn: { 
        backgroundColor: '#FFFFFF', 
        paddingVertical: 8, 
        paddingHorizontal: 14, 
        borderRadius: 25, 
        flexDirection: 'row', 
        alignItems: 'center',
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4
    },
    pendingBtnText: { color: palette.accent, fontWeight: '700', fontSize: 13, marginLeft: 6 },

    // --- Surface (Floating Sheet) ---
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

    // --- Card Style ---
    card: {
        backgroundColor: palette.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: palette.cardBorder,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    
    applicantName: { fontSize: 16, fontWeight: '800', color: palette.textPrimary, marginBottom: 4 },
    jobRow: { flexDirection: 'row', alignItems: 'center' },
    jobTitle: { fontSize: 13, color: palette.accent, fontWeight: '600' },

    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },

    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    infoText: { color: palette.textSecondary, fontSize: 13, marginLeft: 6 },

    divider: { height: 1, backgroundColor: palette.cardBorder, marginBottom: 16 },

    // Actions
    actionsRow: { flexDirection: 'row', gap: 12 },
    actionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
    actionText: { fontWeight: '700', fontSize: 13, marginLeft: 6 },

    // Empty State
    emptyState: { alignItems: 'center', marginTop: 80 },
    emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: palette.textPrimary },
    emptySub: { fontSize: 14, color: palette.textSecondary, marginTop: 4 },
});

export default ViewApplications;