import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Alert, RefreshControl, ImageBackground, Dimensions, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const JobPostings = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 🌐 AUTO-DETECT URL
  const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'https://finalsbackendcampushire.onrender.com';

  // Shared Background Image
  const BACKGROUND_IMAGE_URL = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop&ixlib=rb-4.0.3';

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/jobs/`);
      setJobs(response.data);
    } catch (error) {
      console.log("Error fetching jobs:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchJobs();
    }, [])
  );

  const onRefresh = () => { setRefreshing(true); fetchJobs(); };

  // --- DELETE FUNCTION ---
  const handleDelete = (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to remove this job?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/api/jobs/${id}/`);
            setJobs(currentJobs => currentJobs.filter(job => job.id !== id));
            Alert.alert("Success", "Job deleted successfully");
          } catch (error) {
            console.log(error);
            Alert.alert("Error", "Could not delete job.");
          }
        }
      }
    ]);
  };

  const renderJobItem = ({ item }) => {
    const isOpen = item.status === 'Open';
    const statusColor = isOpen ? '#198754' : '#dc3545'; 

    return (
      <View style={[styles.card, { borderLeftColor: statusColor }]}>
        <View style={styles.cardHeaderTop}>
            <View style={{flex: 1, marginRight: 10}}>
                <Text style={styles.jobTitle}>{item.title}</Text>
                <Text style={styles.jobPosition}>{item.job_position}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: isOpen ? '#d1e7dd' : '#f8d7da' }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
            </View>
        </View>

        <Text style={styles.description} numberOfLines={3}>{item.description}</Text>

        <View style={styles.infoBox}>
            <View style={styles.infoItem}>
                <Ionicons name="cash-outline" size={18} color="#555" />
                <Text style={styles.infoText}> ${item.salary}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
                <Ionicons name="people-outline" size={18} color="#555" />
                <Text style={styles.infoText}> {item.slots} Slots</Text>
            </View>
        </View>

        <View style={styles.actionsRow}>
            <TouchableOpacity 
                style={[styles.actionBtn, styles.editBtnOutline]} 
                onPress={() => navigation.navigate('EditJob', { job: item })}
                activeOpacity={0.7}
            >
                <Ionicons name="create-outline" size={16} color="#0d6efd" style={{marginRight:5}}/>
                <Text style={{color:'#0d6efd', fontWeight:'600'}}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.actionBtn, styles.deleteBtnOutline]} 
                onPress={() => handleDelete(item.id)}
                activeOpacity={0.7}
            >
                <Ionicons name="trash-outline" size={16} color="#dc3545" style={{marginRight:5}}/>
                <Text style={{color:'#dc3545', fontWeight:'600'}}>Delete</Text>
            </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground source={{ uri: BACKGROUND_IMAGE_URL }} style={styles.backgroundImage} resizeMode="cover">
      <View style={styles.overlay}>
        <StatusBar barStyle="light-content" />

        {/* Transparent Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <View style={styles.iconCircle}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </View>
                <Text style={styles.headerTitle}>Job Postings</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.addBtn} 
                onPress={() => navigation.navigate('AddJob')}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={22} color="#0d6efd" />
                <Text style={styles.addBtnText}>Post New</Text>
            </TouchableOpacity>
        </View>

        {loading ? (
            <View style={styles.centerLoading}><ActivityIndicator size="large" color="#ffffff" /></View>
        ) : (
            <FlatList
            data={jobs}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderJobItem}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
            ListEmptyComponent={
                <View style={styles.emptyState}>
                    <Ionicons name="briefcase-outline" size={50} color="white" style={{opacity: 0.8}} />
                    <Text style={{color: 'white', marginTop: 10, fontSize: 16, fontWeight: '600'}}>No jobs posted yet.</Text>
                </View>
            }
            />
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  // Background & Overlay
  backgroundImage: { flex: 1, width: width, height: height },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }, // Slightly dark overlay for white text header

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 45, paddingBottom: 15,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
      backgroundColor: 'rgba(255,255,255,0.2)', width: 35, height: 35, borderRadius: 17.5,
      justifyContent: 'center', alignItems: 'center', marginRight: 10
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: 'white' },
  
  // "Post New" Button
  addBtn: {
    backgroundColor: 'white', flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3
  },
  addBtnText: { color: '#0d6efd', fontWeight: '700', fontSize: 13, marginLeft: 2 },

  // List
  listContent: { padding: 20, paddingBottom: 40 },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },

  // Card (Glassmorphism Style)
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // High opacity white
    borderRadius: 20, padding: 20, marginBottom: 20, borderLeftWidth: 5,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, 
    shadowOffset: { width: 0, height: 5 }, elevation: 6,
  },
  cardHeaderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  jobTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
  jobPosition: { fontSize: 14, color: '#0d6efd', fontWeight: '600' },
  
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '700' },
  
  description: { color: '#555', fontSize: 14, lineHeight: 20, marginBottom: 20 },
  
  // Info Box
  infoBox: {
    flexDirection: 'row', backgroundColor: '#f8f9fa', borderRadius: 12, padding: 15,
    alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#e9ecef'
  },
  infoItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  infoText: { color: '#495057', fontWeight: '600', fontSize: 14, marginLeft: 8 },
  infoDivider: { width: 1, height: '80%', backgroundColor: '#DEE2E6', marginHorizontal: 10 },
  
  // Actions
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 10, borderWidth: 1 },
  editBtnOutline: { borderColor: '#0d6efd', backgroundColor: '#F0F7FF' },
  deleteBtnOutline: { borderColor: '#dc3545', backgroundColor: '#FFF5F5' },
});

export default JobPostings;