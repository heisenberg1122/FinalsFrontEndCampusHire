import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // <--- IMPORT THIS
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const JobPostings = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 🌐 AUTO-DETECT URL
  const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'http://10.0.2.2:8000';

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

  // 🔄 CRITICAL UPDATE: useFocusEffect
  // This ensures the list reloads whenever you navigate back to this screen
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
            // Remove from list immediately (UI optimizaton)
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
                {/* Ensure backend field name matches here */}
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
            >
                <Ionicons name="create-outline" size={16} color="#0d6efd" style={{marginRight:5}}/>
                <Text style={{color:'#0d6efd', fontWeight:'600'}}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.actionBtn, styles.deleteBtnOutline]} 
                onPress={() => handleDelete(item.id)}
            >
                <Ionicons name="trash-outline" size={16} color="#dc3545" style={{marginRight:5}}/>
                <Text style={{color:'#dc3545', fontWeight:'600'}}>Delete</Text>
            </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#0d6efd" />
            <Text style={styles.headerTitle}>Job Postings</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={styles.addBtn} 
            onPress={() => navigation.navigate('AddJob')}
        >
            <Ionicons name="add-circle" size={20} color="white" style={{marginRight: 5}}/>
            <Text style={styles.addBtnText}>Post New</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerLoading}><ActivityIndicator size="large" color="#0d6efd" /></View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderJobItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0d6efd']} />}
          ListEmptyComponent={
            <View style={styles.centerLoading}>
                <Text style={{color: '#888', marginTop: 20}}>No jobs found. Post one!</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    backgroundColor: 'white', paddingTop: Platform.OS === 'ios' ? 50 : 25, paddingBottom: 15, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 3
  },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#2D3748', marginLeft: 5 },
  addBtn: {
    backgroundColor: '#0d6efd', flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 30, elevation: 5
  },
  addBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },
  listContent: { padding: 20, paddingBottom: 40 },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 20, borderLeftWidth: 5,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 15, elevation: 4,
  },
  cardHeaderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  jobTitle: { fontSize: 18, fontWeight: '700', color: '#2D3748', marginBottom: 4 },
  jobPosition: { fontSize: 14, color: '#0d6efd', fontWeight: '600' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '700' },
  description: { color: '#718096', fontSize: 14, lineHeight: 20, marginBottom: 20 },
  infoBox: {
    flexDirection: 'row', backgroundColor: '#F8F9FA', borderRadius: 12, padding: 15,
    alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#E9ECEF'
  },
  infoItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  infoText: { color: '#495057', fontWeight: '600', fontSize: 14, marginLeft: 8 },
  infoDivider: { width: 1, height: '80%', backgroundColor: '#DEE2E6', marginHorizontal: 10 },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8, borderWidth: 1 },
  editBtnOutline: { borderColor: '#0d6efd', backgroundColor: '#F0F7FF' },
  deleteBtnOutline: { borderColor: '#dc3545', backgroundColor: '#FFF5F5' },
});

export default JobPostings;