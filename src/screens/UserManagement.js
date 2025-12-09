import React, { useState, useCallback } from 'react';

import {

    View,

    Text,

    FlatList,

    TouchableOpacity,

    StyleSheet,

    Image,

    ActivityIndicator,

    Alert,

    Platform,

    ImageBackground,

    Dimensions,

    StatusBar,

    RefreshControl,

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

    purple: "#8B5CF6",

    purpleSoft: "#F3E8FF",

    success: "#10B981",

    successSoft: "#D1FAE5",

    danger: "#EF4444",

    dangerSoft: "#FEE2E2",

    cardBorder: "#E2E8F0",

    iconNeutral: "#94A3B8"

};



const UserManagement = ({ navigation }) => {

    const { width: screenWidth } = useWindowDimensions();

    const isDesktop = screenWidth > 768;



    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);



    // 🌐 AUTO-DETECT URL

    const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'https://finalsbackendcampushire.onrender.com';

    const HEADER_BG = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop';



    const fetchUsers = async () => {

        try {

            // Note: Keeping your specific path /reg/api/users/ based on your code

            const response = await axios.get(`${API_URL}/reg/api/users/`);

            setUsers(response.data);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

            setRefreshing(false);

        }

    };



    useFocusEffect(

        useCallback(() => {

            fetchUsers();

        }, [])

    );



    const onRefresh = () => { setRefreshing(true); fetchUsers(); };



    const handleDelete = (id) => {

        Alert.alert("Confirm Delete", "Are you sure you want to remove this user?", [

            { text: "Cancel", style: "cancel" },

            {

                text: "Delete",

                style: "destructive",

                onPress: async () => {

                    // Placeholder for delete logic

                    Alert.alert("Note", "Delete logic needs backend endpoint.");

                }

            }

        ]);

    };



    const getImageUrl = (path) => {

        if (!path) return 'https://ui-avatars.com/api/?background=0d6efd&color=fff&name=User';

        return path.startsWith('http') ? path : `${API_URL}${path}`;

    };



    const renderUserItem = ({ item }) => {

        const isAdmin = item.role === 'Admin';

       

        return (

            <View style={[styles.card, isDesktop && { width: '48%', marginRight: '2%' }]}>

                {/* Header: Avatar, Name, Badge */}

                <View style={styles.cardHeader}>

                    <Image

                        source={{ uri: getImageUrl(item.profile_picture) }}

                        style={styles.avatar}

                    />

                    <View style={styles.headerTextContainer}>

                        <View style={styles.nameRow}>

                            <Text style={styles.userName} numberOfLines={1}>

                                {item.first_name} {item.last_name}

                            </Text>

                            {/* Role Badge */}

                            <View style={[

                                styles.badge,

                                { backgroundColor: isAdmin ? palette.purpleSoft : palette.successSoft }

                            ]}>

                                <Text style={[

                                    styles.badgeText,

                                    { color: isAdmin ? palette.purple : palette.success }

                                ]}>

                                    {item.role || 'User'}

                                </Text>

                            </View>

                        </View>

                        <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>

                    </View>

                </View>



                {/* Info Row (Gender/Details) */}

                <View style={styles.infoRow}>

                    <Ionicons name="person-circle-outline" size={16} color={palette.iconNeutral} />

                    <Text style={styles.infoText}>{item.gender || 'Not specified'}</Text>

                </View>



                {/* Divider */}

                <View style={styles.divider} />



                {/* Actions */}

                <View style={styles.actionsRow}>

                    <TouchableOpacity

                        style={[styles.actionBtn, { backgroundColor: palette.dangerSoft }]}

                        onPress={() => handleDelete(item.id)}

                    >

                        <Ionicons name="trash-outline" size={18} color={palette.danger} />

                        <Text style={[styles.actionText, { color: palette.danger }]}>Remove User</Text>

                    </TouchableOpacity>

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

                                    <Text style={styles.screenLabel}>TEAM</Text>

                                    <Text style={styles.screenTitle}>User Management</Text>

                                </View>

                            </TouchableOpacity>



                            {/* Add User Button */}

                            <TouchableOpacity

                                style={styles.addBtn}

                                onPress={() => Alert.alert("Add User", "Navigate to registration screen")}

                                activeOpacity={0.9}

                            >

                                <Ionicons name="person-add" size={20} color={palette.accent} />

                                <Text style={styles.addBtnText}>Add Member</Text>

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

                        data={users}

                        keyExtractor={item => item.id.toString()}

                        renderItem={renderUserItem}

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

                                    <Ionicons name="people-outline" size={40} color={palette.iconNeutral} />

                                </View>

                                <Text style={styles.emptyTitle}>No Users Found</Text>

                                <Text style={styles.emptySub}>Registered users will appear here.</Text>

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



    // Add Button (Pill)

    addBtn: {

        backgroundColor: '#FFFFFF',

        paddingVertical: 8,

        paddingHorizontal: 14,

        borderRadius: 25,

        flexDirection: 'row',

        alignItems: 'center',

        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4

    },

    addBtnText: { color: palette.accent, fontWeight: '700', fontSize: 13, marginLeft: 6 },



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

   

    // Header Section (Avatar + Name)

    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },

    avatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: palette.background, marginRight: 12 },

    headerTextContainer: { flex: 1 },

   

    nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

    userName: { fontSize: 16, fontWeight: '800', color: palette.textPrimary, flex: 1, marginRight: 8 },

    userEmail: { fontSize: 13, color: palette.textSecondary, marginTop: 2 },



    // Badges

    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },

    badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },



    // Details

    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },

    infoText: { color: palette.textSecondary, fontSize: 13, marginLeft: 6 },



    divider: { height: 1, backgroundColor: palette.cardBorder, marginBottom: 16 },



    // Actions

    actionsRow: { flexDirection: 'row' },

    actionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, borderRadius: 10 },

    actionText: { fontWeight: '700', fontSize: 13, marginLeft: 6 },



    // Empty State

    emptyState: { alignItems: 'center', marginTop: 80 },

    emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },

    emptyTitle: { fontSize: 18, fontWeight: '800', color: palette.textPrimary },

    emptySub: { fontSize: 14, color: palette.textSecondary, marginTop: 4 },

});



export default UserManagement;