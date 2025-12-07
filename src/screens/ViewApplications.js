import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Alert, ImageBackground, Dimensions, StatusBar, RefreshControl, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const ViewApplications = ({ navigation }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 🌐 AUTO-DETECT URL
  const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'http://10.0.2.2:8000';

  // Shared Background
  const BACKGROUND_IMAGE_URL = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop&ixlib=rb-4.0.3';

  const fetchApplications = async () => {
    try {
      // Connects to the backend API
      const response = await axios.get(`${API_URL}/job/api/applications/`); 
      setApplications(response.data);
    } catch (error) {
      console.log(error);
      // Silent fail on console, but could alert user if needed
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchApplications();
    }, [])
  );

  const onRefresh = () => { setRefreshing(true); fetchApplications(); };

  // --- HELPER: Get Color based on Status ---
  const getStatusStyle = (status) => {
      switch(status) {
          case 'Accepted': return { bg: '#d1e7dd', text: '#0f5132' }; // Green
          case 'Rejected': return { bg: '#f8d7da', text: '#842029' }; // Red
          case 'Pending': return { bg: '#fff3cd', text: '#664d03' };  // Orange/Yellow
          default: return { bg: '#e2e3e5', text: '#41464b' };        // Gray
      }
  };

  const renderItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);

    return (
      <View style={styles.card}>
        {/* Top Row: Name & Status */}
        <View style={styles.headerRow}>
            <View style={{flex: 1}}>
                <Text style={styles.name}>{item.applicant?.first_name} {item.applicant?.last_name}</Text>
                <View style={styles.roleContainer}>
                      <Ionicons name="briefcase-outline" size={14} color="#0d6efd" style={{marginRight: 4}}/>
                      <Text style={styles.jobTitle}>{item.job?.title}</Text>
                </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
            </View>
        </View>
        
        {/* Contact Info */}
        <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={14} color="#666" style={{marginRight: 6}} />
            <Text style={styles.email}>{item.applicant?.email}</Text>
        </View>

        <View style={styles.divider} />

        {/* Action Buttons */}
        <View style={styles.actions}>
          {item.resume ? (
            <TouchableOpacity 
              style={[styles.btn, styles.resumeBtn]} 
              onPress={() => handleOpenResume(item.resume)}
              activeOpacity={0.8}
            >
                <Ionicons name="document-text" size={16} color="white" />
                <Text style={styles.btnText}>Resume</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.btn, styles.resumeBtn, styles.noResumeBtn]}>
                <Ionicons name="close-circle" size={16} color="white" />
                <Text style={styles.btnText}>No Resume</Text>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.btn, styles.scheduleBtn]} 
            onPress={() => handleSchedule(item)}
            activeOpacity={0.8}
          >
              <Ionicons name="calendar" size={16} color="white" />
              <Text style={styles.btnText}>Schedule</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
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

    Linking.canOpenURL(finalUrl).then(supported => {
      if (supported) {
        Linking.openURL(finalUrl).catch(() => Alert.alert('Error', 'Cannot open resume link.'));
      } else {
        Alert.alert('Error', 'Cannot open resume link.');
      }
    }).catch(err => {
      console.log('canOpenURL error', err);
      Alert.alert('Error', 'Cannot open resume link.');
    });
  };

  const handleSchedule = (item) => {
    navigation.navigate('ScheduleInterview', {
      applicationId: item.id,
      applicantName: item.applicant?.first_name,
      jobTitle: item.job?.title || ''
    });
  };

  return (
    <ImageBackground source={{ uri: BACKGROUND_IMAGE_URL }} style={styles.backgroundImage} resizeMode="cover">
      <View style={styles.overlay}>
        <StatusBar barStyle="light-content" />

        {/* --- MODIFIED HEADER --- */}
        <View style={styles.header}>
            {/* Back Button */}
             <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <View style={styles.iconCircle}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </View>
                <Text style={styles.headerTitle}>Applications</Text>
            </TouchableOpacity>

            {/* NEW: Admin Pending Button */}
            <TouchableOpacity 
                style={styles.pendingBtn}
                onPress={() => navigation.navigate('AdminPending')} // Ensures navigation to the specific screen
                activeOpacity={0.7}
            >
                <Text style={styles.pendingBtnText}>Pending</Text>
                <Ionicons name="time-outline" size={18} color="white" />
            </TouchableOpacity>
        </View>

        {loading ? (
           <View style={styles.centerLoading}><ActivityIndicator size="large" color="#ffffff" /></View>
        ) : (
          <FlatList 
            data={applications}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
            ListEmptyComponent={
                <View style={styles.emptyState}>
                    <Ionicons name="folder-open-outline" size={50} color="white" style={{opacity: 0.8}} />
                    <Text style={{color: 'white', marginTop: 10, fontSize: 16}}>No applications received yet.</Text>
                </View>
            }
          />
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  // --- Background ---
  backgroundImage: { flex: 1, width: width, height: height },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },

  // --- Header ---
  header: {
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between', // Pushes items to edges
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 60 : 45, 
    paddingBottom: 15,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
      backgroundColor: 'rgba(255,255,255,0.2)', width: 35, height: 35, borderRadius: 17.5,
      justifyContent: 'center', alignItems: 'center', marginRight: 10
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: 'white' },

  // --- NEW BUTTON STYLES ---
  pendingBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)', // Glass effect
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.3)'
  },
  pendingBtnText: {
      color: 'white',
      fontWeight: '600',
      fontSize: 14,
      marginRight: 6
  },

  // --- List & States ---
  listContent: { padding: 20, paddingBottom: 40 },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },

  // --- Card (Glassmorphism) ---
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // High opacity white
    borderRadius: 16, padding: 20, marginBottom: 15,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 3 }, elevation: 4
  },
  
  // Header Row (Name + Status)
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 },
  name: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  roleContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  jobTitle: { fontSize: 14, color: '#0d6efd', fontWeight: '600' },
  
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

  // Info Row
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  email: { color: '#666', fontSize: 13 },

  divider: { height: 1, backgroundColor: '#e9ecef', marginVertical: 15 },

  // Actions
  actions: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowOpacity: 0.1, elevation: 2 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 13, marginLeft: 6 },
  
  resumeBtn: { backgroundColor: '#0d6efd' }, // Blue
  scheduleBtn: { backgroundColor: '#fd7e14' }, // Orange
});

export default ViewApplications;