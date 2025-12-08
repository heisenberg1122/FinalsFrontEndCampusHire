import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, ImageBackground, Dimensions, Platform, StatusBar, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const CandidateDashboard = ({ route, navigation }) => {
  // --- FIX START: Safe Parameter Handling ---
  // 1. Get params safely (defaults to empty object if route.params is null)
  const params = route.params || {};

  // 2. Get user safely (defaults to "Candidate" if user is missing from params)
  // This prevents crashes if other screens send back params without the user object
  const user = params.user || { 
      first_name: 'Candidate', 
      id: 0 
  };
  // --- FIX END ---
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // State for Red Dot
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false); 

  // 🌐 AUTO-DETECT URL
  const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'https://finalsbackendcampushire.onrender.com';

  // Shared Background Image
  const BACKGROUND_IMAGE_URL = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop&ixlib=rb-4.0.3';

  // 1. Fetch Available Jobs
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

  // 2. UPDATED: Check for UNREAD Notifications
  const checkNotifications = async () => {
    if (!user || !user.id) return;

    try {
      // Fetch the exact same list your Notifications screen uses
      const response = await axios.get(`${API_URL}/job/api/notifications/${user.id}/`);
      
      const notifications = response.data || [];

      // Filter to find any that are NOT read
      const unreadItems = notifications.filter(n => {
        const isRead = (n.read !== undefined) ? n.read : (n.is_read !== undefined ? n.is_read : false);
        return isRead === false;
      });

      // If we have any unread items, show the dot
      setHasUnreadNotifications(unreadItems.length > 0);

    } catch (error) {
      console.error("Error checking notifications:", error);
    }
  };

  // Auto-load data when screen is focused
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

  const renderJobItem = ({ item }) => {
    const isOpen = item.status === 'Open';
    const statusColor = isOpen ? '#198754' : '#dc3545';

    return (
      <View style={[styles.card, { borderLeftColor: statusColor }]}>
        <View style={styles.cardHeader}>
          <View style={{flex: 1}}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.position}>{item.job_position}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: isOpen ? '#d1e7dd' : '#f8d7da' }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>{item.status}</Text>
          </View>
        </View>
        
        <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
        
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
             <Ionicons name="cash-outline" size={16} color="#555" />
             <Text style={styles.metaText}>${item.salary}</Text>
          </View>
          <View style={styles.metaItem}>
             <Ionicons name="people-outline" size={16} color="#555" />
             <Text style={styles.metaText}>{item.slots} Slots</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.applyButton, !isOpen && styles.disabledButton]}
          onPress={() => handleApply(item)}
          disabled={!isOpen}
          activeOpacity={0.8}
        >
          <Text style={styles.applyButtonText}>
              {isOpen ? 'Apply Now' : 'Position Closed'}
          </Text>
          {isOpen && <Ionicons name="arrow-forward" size={16} color="white" style={{marginLeft: 5}}/>}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ImageBackground source={{ uri: BACKGROUND_IMAGE_URL }} style={styles.backgroundImage} resizeMode="cover">
      <View style={styles.overlay}>
        <StatusBar barStyle="light-content" />
        
        {/* Header */}
        <View style={styles.header}>
            <View>
                <Text style={styles.logoText}>Campus Hire</Text>
                <Text style={styles.welcomeText}>Hello, {user.first_name}!</Text>
            </View>
            <View style={styles.headerActions}>
                
                {/* --- NOTIFICATION BUTTON --- */}
                <TouchableOpacity 
                  style={[styles.iconBtn, { marginRight: 8, position: 'relative' }]} 
                  onPress={() => {
                      navigation.navigate('Notifications', { user });
                  }}
                >
                    <Ionicons name="notifications" size={26} color="white" />
                    
                    {/* RED DOT: Only shows if hasUnreadNotifications is true */}
                    {hasUnreadNotifications && (
                        <View style={styles.notificationDot} />
                    )}
                </TouchableOpacity>

                {/* Profile Button */}
                <TouchableOpacity 
                    style={styles.iconBtn} 
                    onPress={() => navigation.navigate('Profile', { user })}
                >
                    <Ionicons name="person-circle-outline" size={28} color="white" />
                </TouchableOpacity>

                {/* Logout Button */}
                <TouchableOpacity 
                    style={[styles.iconBtn, {marginLeft: 8}]} 
                    onPress={() => navigation.replace('Login')}
                >
                    <Ionicons name="log-out-outline" size={26} color="white" />
                </TouchableOpacity>
            </View>
        </View>
        
        {/* Banner */}
        <View style={styles.bannerContainer}>
            <View style={styles.bannerGlass}>
                <Text style={styles.bannerTitle}>Find Your Dream Job</Text>
                <Text style={styles.bannerSub}>{jobs.length} open positions available for you.</Text>
            </View>
        </View>

        {loading ? (
           <View style={styles.centerLoading}><ActivityIndicator size="large" color="#ffffff" /></View>
        ) : (
          <FlatList
            data={jobs}
            renderItem={renderJobItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
            ListEmptyComponent={
                <View style={styles.emptyState}>
                    <Ionicons name="search" size={50} color="white" style={{opacity: 0.8}} />
                    <Text style={{color: 'white', marginTop: 10, fontSize: 16}}>No jobs available right now.</Text>
                </View>
            }
          />
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  // Background & Layout
  backgroundImage: { flex: 1, width: width, height: height },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  listContent: { padding: 20, paddingBottom: 40 },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 45, paddingBottom: 15,
  },
  logoText: { fontSize: 22, fontWeight: '800', color: 'white' },
  welcomeText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: 5 },

  // --- RED DOT STYLE ---
  notificationDot: {
    position: 'absolute',
    top: 4,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff3b30', // System Red
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.1)',
    zIndex: 10,
  },

  // Banner
  bannerContainer: { paddingHorizontal: 20, marginBottom: 10 },
  bannerGlass: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: 20, borderRadius: 15,
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)'
  },
  bannerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  bannerSub: { color: '#f0f0f0', marginTop: 5, fontSize: 13 },

  // Job Card
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16, padding: 20, marginBottom: 20,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
    borderLeftWidth: 5
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  jobTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  position: { color: '#0d6efd', fontWeight: '600', fontSize: 14 },
  
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  description: { color: '#666', marginBottom: 15, lineHeight: 20, fontSize: 14 },

  // Meta Data
  metaRow: { flexDirection: 'row', marginBottom: 15, backgroundColor: '#f8f9fa', padding: 10, borderRadius: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  metaText: { color: '#333', fontWeight: '600', marginLeft: 6, fontSize: 13 },

  // Apply Button
  applyButton: {
    backgroundColor: '#0d6efd', padding: 14, borderRadius: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#0d6efd', shadowOpacity: 0.3, shadowRadius: 5, elevation: 3
  },
  disabledButton: { backgroundColor: '#adb5bd', shadowOpacity: 0 },
  applyButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default CandidateDashboard;