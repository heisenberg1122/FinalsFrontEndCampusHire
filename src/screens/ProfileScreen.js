import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Image, 
    TouchableOpacity, 
    ScrollView, 
    RefreshControl, 
    Alert,
    ImageBackground,
    Dimensions,
    StatusBar,
    Platform,
    useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
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

const ProfileScreen = ({ route, navigation }) => {
    const { user } = route.params;
    const { width: screenWidth } = useWindowDimensions();
    const isDesktop = screenWidth > 768;

    const [profileData, setProfileData] = useState(user);
    const [refreshing, setRefreshing] = useState(false);

    // 🌐 CONFIG
    const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'https://finalsbackendcampushire.onrender.com';
    const HEADER_BG = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop';

    // Helper to construct full image URL
    const getImageUrl = (path) => {
        if (!path) return `https://ui-avatars.com/api/?name=${profileData.first_name}+${profileData.last_name}&background=0D8ABC&color=fff`;
        return path.startsWith('http') ? path : `${API_URL}${path}`;
    };

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(`${API_URL}/reg/api/users/${user.id}/`);
            setProfileData(response.data); 
        } catch (error) {
            console.log("Error fetching profile:", error);
            Alert.alert("Error", "Failed to refresh profile data.");
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchUserProfile();
        setRefreshing(false);
    }, []);

    // Listen for updates from EditProfile
    React.useEffect(() => {
        if (route.params?.user) {
            setProfileData(route.params.user);
        }
    }, [route.params?.user]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* 1. Header Background */}
            <ImageBackground source={{ uri: HEADER_BG }} style={styles.headerBackground}>
                <View style={styles.headerOverlay}>
                    <SafeAreaView edges={['top']} style={styles.safeArea}>
                        {/* Navigation Bar */}
                        <View style={[styles.topNav, { paddingHorizontal: isDesktop ? 32 : 24 }]}>
                            
                            {/* Back Button */}
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navLeft}>
                                <View style={styles.iconBtn}>
                                    <Ionicons name="arrow-back" size={24} color="#fff" />
                                </View>
                                <View>
                                    <Text style={styles.screenLabel}>MY ACCOUNT</Text>
                                    <Text style={styles.screenTitle}>Profile</Text>
                                </View>
                            </TouchableOpacity>

                            {/* Edit Button */}
                            <TouchableOpacity 
                                style={styles.editBtn}
                                onPress={() => navigation.navigate('EditProfile', { user: profileData })}
                                activeOpacity={0.9}
                            >
                                <Ionicons name="create-outline" size={20} color={palette.accent} />
                                <Text style={styles.editBtnText}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>
            </ImageBackground>

            {/* 2. Floating Sheet Surface */}
            <View style={styles.surface}>
                <ScrollView 
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingHorizontal: isDesktop ? 32 : 20 }
                    ]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    {/* PROFILE CARD */}
                    <View style={styles.profileCard}>
                        {/* Avatar & Basic Info */}
                        <View style={styles.profileHeader}>
                            <Image 
                                source={{ uri: getImageUrl(profileData.profile_picture) }} 
                                style={styles.avatar} 
                            />
                            <View style={{flex: 1}}>
                                <Text style={styles.name}>{profileData.first_name} {profileData.last_name}</Text>
                                <Text style={styles.email}>{profileData.email}</Text>
                                <View style={styles.roleBadge}>
                                    <Text style={styles.roleText}>{profileData.role || 'Member'}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Divider */}
                        <View style={styles.divider} />

                        {/* Contact Info */}
                        <View style={styles.infoRow}>
                            <View style={styles.infoItem}>
                                <Ionicons name="call-outline" size={18} color={palette.accent} />
                                <Text style={styles.infoText}>
                                    {profileData.phone_number ? profileData.phone_number : "No Phone"}
                                </Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Ionicons name="location-outline" size={18} color={palette.accent} />
                                <Text style={styles.infoText}>
                                    {profileData.address ? profileData.address : "No Address"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* SECTIONS */}
                    
                    {/* About Me */}
                    <Text style={styles.sectionLabel}>ABOUT ME</Text>
                    <View style={styles.contentCard}>
                        <Text style={styles.contentText}>
                            {profileData.bio ? profileData.bio : "No bio added yet. Click Edit to add a bio."}
                        </Text>
                    </View>

                    {/* Skills */}
                    <Text style={styles.sectionLabel}>SKILLS</Text>
                    <View style={styles.contentCard}>
                        <Text style={styles.contentText}>
                            {profileData.skills ? profileData.skills : "No skills listed yet."}
                        </Text>
                    </View>

                    {/* Resume */}
                    <Text style={styles.sectionLabel}>DOCUMENTS</Text>
                    <View style={styles.contentCard}>
                        <View style={styles.resumeRow}>
                            <View style={styles.iconBox}>
                                <Ionicons name="document-text" size={24} color={palette.textSecondary} />
                            </View>
                            <View>
                                <Text style={styles.resumeTitle}>Resume</Text>
                                <Text style={styles.resumeStatus}>
                                    {profileData.resume ? "Uploaded Successfully" : "No resume uploaded"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* --- JOB STATUS (Conditional) --- */}
                    {profileData.application_status === 'Accepted' && (
                        <>
                            <Text style={[styles.sectionLabel, {marginTop: 24}]}>EMPLOYMENT STATUS</Text>
                            <View style={styles.jobBox}>
                                <View style={styles.jobIcon}>
                                    <Ionicons name="briefcase" size={24} color={palette.success} />
                                </View>
                                <View style={{marginLeft: 15, flex: 1}}>
                                    <Text style={styles.jobLabel}>Current Position</Text>
                                    <Text style={styles.jobTitleText}>
                                        {profileData.job_title || "Position Title Not Set"}
                                    </Text>
                                </View>
                                <View style={styles.activeBadge}>
                                    <Text style={styles.activeText}>ACTIVE</Text>
                                </View>
                            </View>
                        </>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>
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

    // Edit Button
    editBtn: { 
        backgroundColor: '#FFFFFF', 
        paddingVertical: 8, 
        paddingHorizontal: 14, 
        borderRadius: 25, 
        flexDirection: 'row', 
        alignItems: 'center',
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4
    },
    editBtnText: { color: palette.accent, fontWeight: '700', fontSize: 13, marginLeft: 6 },

    // --- Surface ---
    surface: { 
        flex: 1, 
        backgroundColor: palette.background, 
        borderTopLeftRadius: 30, 
        borderTopRightRadius: 30, 
        marginTop: -30, 
        overflow: 'hidden' 
    },
    scrollContent: { paddingTop: 32, paddingBottom: 40 },

    // --- Profile Card ---
    profileCard: {
        backgroundColor: palette.surface,
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1, borderColor: palette.cardBorder,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    avatar: { width: 80, height: 80, borderRadius: 40, marginRight: 16, borderWidth: 3, borderColor: palette.background },
    name: { fontSize: 20, fontWeight: '800', color: palette.textPrimary },
    email: { fontSize: 14, color: palette.textSecondary, marginBottom: 8 },
    
    roleBadge: { alignSelf: 'flex-start', backgroundColor: palette.accentSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    roleText: { color: palette.accent, fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },

    divider: { height: 1, backgroundColor: palette.cardBorder, marginBottom: 20 },

    infoRow: { gap: 12 },
    infoItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.background, padding: 12, borderRadius: 12 },
    infoText: { color: palette.textPrimary, marginLeft: 10, fontWeight: '600', fontSize: 14 },

    // --- Content Sections ---
    sectionLabel: { fontSize: 12, fontWeight: '800', color: palette.textSecondary, marginBottom: 12, marginLeft: 4, letterSpacing: 1 },
    
    contentCard: {
        backgroundColor: palette.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1, borderColor: palette.cardBorder,
    },
    contentText: { fontSize: 14, lineHeight: 24, color: palette.textSecondary },

    // Resume
    resumeRow: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: palette.background, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    resumeTitle: { fontSize: 16, fontWeight: '700', color: palette.textPrimary },
    resumeStatus: { fontSize: 13, color: palette.textSecondary, marginTop: 2 },

    // --- Job Box ---
    jobBox: { 
        backgroundColor: palette.successSoft, 
        padding: 16, 
        borderRadius: 16, 
        borderWidth: 1, 
        borderColor: palette.successSoft,
        flexDirection: 'row', 
        alignItems: 'center' 
    },
    jobIcon: {
        backgroundColor: palette.surface, 
        width: 48, height: 48, borderRadius: 24, 
        justifyContent: 'center', alignItems: 'center'
    },
    jobLabel: { color: "#065F46", fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    jobTitleText: { color: "#064E3B", fontSize: 16, fontWeight: '800', marginTop: 2 },
    
    activeBadge: { backgroundColor: "#059669", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    activeText: { color: "white", fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
});

export default ProfileScreen;