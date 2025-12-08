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
    useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
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
    danger: "#EF4444",
    cardBorder: "#E2E8F0",
    iconNeutral: "#94A3B8"
};

const Notifications = ({ route, navigation }) => {
    const { width: screenWidth } = useWindowDimensions();
    const isDesktop = screenWidth > 768;

    // --- PARAMS & CONFIG ---
    const params = route.params || {};
    const user = params.user || (params.user_id ? { id: params.user_id } : null);
    const API_URL = params.apiUrl || (Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'https://finalsbackendcampushire.onrender.com');
    const HEADER_BG = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop';

    // --- STATE ---
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recentlyDeleted, setRecentlyDeleted] = useState([]); 

    // --- API: FETCH ---
    const fetchNotifications = async () => {
        if (!user || !user.id) {
            setNotifications([]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/job/api/notifications/${user.id}/`);
            const list = (res.data || []).map(n => ({
                ...n,
                read: (n.read !== undefined) ? n.read : (n.is_read !== undefined ? n.is_read : false),
            }));
            setNotifications(list);
        } catch (err) {
            console.log('Failed to fetch notifications', err);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [user])
    );

    // --- ACTIONS ---
    const markRead = async (id) => {
        try {
            setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n));
            await axios.post(`${API_URL}/job/api/notifications/${id}/mark_read/`);
        } catch (err) {
            console.log('Mark read failed', err);
        }
    };

    const markAllRead = async () => {
        try {
            const unread = notifications.filter(n => !n.read);
            if (unread.length === 0) return;
            setNotifications(prev => prev.map(n => ({...n, read: true})));
            await Promise.all(unread.map(n => axios.post(`${API_URL}/job/api/notifications/${n.id}/mark_read/`)));
            Alert.alert('Success', 'All notifications marked as read');
        } catch (err) {
            console.log('Mark all read failed', err);
            Alert.alert('Error', 'Failed to mark all as read');
        }
    };

    const deleteNotification = async (id) => {
        const itemToDelete = notifications.find(n => n.id === id);
        if (!itemToDelete) return;

        setNotifications(prev => prev.filter(n => n.id !== id));

        const timeoutId = setTimeout(async () => {
            console.log(`Permanently deleted notification ${id}`);
            setRecentlyDeleted(prev => prev.filter(p => p.item.id !== id));
        }, 4000); 

        setRecentlyDeleted(prev => [...prev, { item: itemToDelete, timeoutId }]);
    };

    const undoDelete = (id) => {
        const record = recentlyDeleted.find(r => r.item.id === id);
        if (!record) return;
        clearTimeout(record.timeoutId);
        setNotifications(prev => [record.item, ...prev]);
        setRecentlyDeleted(prev => prev.filter(r => r.item.id !== id));
    };

    // --- RENDER HELPERS ---
    const renderRightActions = (id) => () => (
        <TouchableOpacity 
            style={styles.swipeDeleteBtn} 
            onPress={() => {
                Alert.alert('Delete', 'Delete this notification?', [
                    {text: 'Cancel', style: 'cancel'},
                    {text: 'Delete', style: 'destructive', onPress: () => deleteNotification(id)}
                ]);
            }}
        >
            <Ionicons name="trash-outline" size={24} color="#fff" />
        </TouchableOpacity>
    );

    const renderItem = ({ item }) => (
        <View style={[styles.itemContainer, isDesktop && { width: '48%', alignSelf: 'center' }]}>
            <Swipeable renderRightActions={renderRightActions(item.id)}>
                <TouchableOpacity 
                    style={[styles.card, item.read && styles.readCard]} 
                    onPress={() => {
                        if(!item.read) markRead(item.id);
                        Alert.alert(item.title, item.message);
                    }}
                    activeOpacity={0.9}
                >
                    {/* Status Icon */}
                    <View style={[styles.iconCircle, { backgroundColor: item.read ? palette.background : palette.accentSoft }]}>
                        <Ionicons 
                            name={item.read ? "mail-open-outline" : "mail-unread"} 
                            size={20} 
                            color={item.read ? palette.textSecondary : palette.accent} 
                        />
                    </View>
                    
                    <View style={styles.content}>
                        <View style={styles.titleRow}>
                            <Text style={[styles.title, item.read && styles.readText]} numberOfLines={1}>
                                {item.title}
                            </Text>
                            <Text style={styles.time}>{new Date(item.created_at).toLocaleDateString()}</Text>
                        </View>
                        <Text style={styles.msg} numberOfLines={2}>{item.message}</Text>
                    </View>

                    {/* Manual Delete (for accessibility/non-swipe users) */}
                    <TouchableOpacity style={styles.miniDeleteBtn} onPress={() => deleteNotification(item.id)}>
                        <Ionicons name="close" size={16} color={palette.textSecondary} />
                    </TouchableOpacity>
                </TouchableOpacity>
            </Swipeable>
        </View>
    );

    // --- MAIN RENDER ---
    if (!user || !user.id) {
        return (
            <View style={styles.center}>
                <Ionicons name="lock-closed-outline" size={50} color={palette.iconNeutral} />
                <Text style={{marginTop: 10, color: palette.textSecondary}}>Please log in to view notifications.</Text>
            </View>
        );
    }

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
                                    <Text style={styles.screenLabel}>UPDATES</Text>
                                    <Text style={styles.screenTitle}>Notifications</Text>
                                </View>
                            </TouchableOpacity>

                            {/* Mark All Read */}
                            <TouchableOpacity 
                                style={styles.markReadBtn} 
                                onPress={markAllRead}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="checkmark-done-circle" size={22} color={palette.accent} />
                                <Text style={styles.markReadText}>Read All</Text>
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
                        data={notifications}
                        keyExtractor={item => item.id?.toString() || Math.random().toString()}
                        renderItem={renderItem}
                        contentContainerStyle={[
                            styles.listContent, 
                            { paddingHorizontal: isDesktop ? 32 : 20 }
                        ]}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <View style={styles.emptyIconCircle}>
                                    <Ionicons name="notifications-off-outline" size={40} color={palette.iconNeutral} />
                                </View>
                                <Text style={styles.emptyTitle}>All Caught Up</Text>
                                <Text style={styles.emptySub}>No new notifications.</Text>
                            </View>
                        }
                    />
                )}

                {/* Undo Toast (Floating at bottom) */}
                {recentlyDeleted.length > 0 && (
                    <View style={[styles.undoBar, { marginHorizontal: isDesktop ? '30%' : 20 }]}>
                        <Text style={styles.undoText}>{recentlyDeleted.length} item(s) deleted</Text>
                        <TouchableOpacity 
                            onPress={() => undoDelete(recentlyDeleted[recentlyDeleted.length - 1].item.id)} 
                            style={styles.undoBtn}
                        >
                            <Text style={styles.undoBtnText}>UNDO</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: palette.background },

    // --- Header ---
    headerBackground: { height: height * 0.22, width: '100%' },
    headerOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.9)' },
    safeArea: { flex: 1 },
    topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
    navLeft: { flexDirection: 'row', alignItems: 'center' },
    iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    
    screenLabel: { color: palette.iconNeutral, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
    screenTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },

    // Mark Read Button
    markReadBtn: { 
        backgroundColor: '#FFFFFF', 
        paddingVertical: 8, paddingHorizontal: 12, 
        borderRadius: 20, flexDirection: 'row', alignItems: 'center',
        shadowColor: "#000", shadowOpacity: 0.1, elevation: 3
    },
    markReadText: { color: palette.accent, fontWeight: '700', fontSize: 12, marginLeft: 6 },

    // --- Surface ---
    surface: { 
        flex: 1, 
        backgroundColor: palette.background, 
        borderTopLeftRadius: 30, 
        borderTopRightRadius: 30, 
        marginTop: -30, 
        overflow: 'hidden' 
    },
    listContent: { paddingTop: 32, paddingBottom: 80 },
    centerLoading: { marginTop: 100 },

    // --- Card Style ---
    itemContainer: { marginBottom: 16 },
    card: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: palette.surface,
        borderRadius: 16, padding: 16,
        borderWidth: 1, borderColor: palette.cardBorder,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    readCard: { backgroundColor: palette.background, borderColor: 'transparent', shadowOpacity: 0 },
    readText: { color: palette.textSecondary, fontWeight: 'normal' },

    iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    
    content: { flex: 1 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    title: { fontWeight: '700', fontSize: 15, color: palette.textPrimary, flex: 1, marginRight: 8 },
    time: { color: palette.textSecondary, fontSize: 11 },
    msg: { color: palette.textSecondary, fontSize: 13, lineHeight: 18 },

    miniDeleteBtn: { padding: 5, marginLeft: 5 },

    // Swipe Action
    swipeDeleteBtn: { 
        backgroundColor: palette.danger, 
        justifyContent: 'center', alignItems: 'center', 
        width: 80, height: '100%', 
        borderTopRightRadius: 16, borderBottomRightRadius: 16,
        marginLeft: -10 // Pulls it slightly under the card for better visual overlap
    },

    // --- Empty State ---
    emptyState: { alignItems: 'center', marginTop: 80 },
    emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: palette.textPrimary },
    emptySub: { fontSize: 14, color: palette.textSecondary, marginTop: 4 },

    // --- Undo Bar ---
    undoBar: { 
        position: 'absolute', bottom: 30, left: 0, right: 0, 
        backgroundColor: '#1E293B', padding: 16, borderRadius: 12, 
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 10, elevation: 6
    },
    undoText: { color: '#fff', fontWeight: 'bold' },
    undoBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: palette.accent, borderRadius: 8 },
    undoBtnText: { color: '#fff', fontWeight: '800', fontSize: 12 }
});

export default Notifications;