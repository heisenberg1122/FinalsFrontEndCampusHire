import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Alert, ImageBackground, Dimensions, StatusBar, Modal, ScrollView, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const AdminPending = ({ navigation }) => {
  // --- STATE ---
  const [pendingApps, setPendingApps] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  // --- CONFIG ---
  // 🌐 Auto-detect URL (Adjust if using real device)
  const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'http://10.0.2.2:8000';
  const BACKGROUND_IMAGE_URL = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop&ixlib=rb-4.0.3';

  // --- API: FETCH APPLICATIONS ---
  const fetchPending = async () => {
  try {
    setLoading(true);
    // Ensure this endpoint matches your urls.py list view
    const response = await axios.get(`${API_URL}/job/api/applications/`);
      
    if (Array.isArray(response.data)) {
      // Filter only 'Pending' status
      const pending = response.data.filter(app => app.status === 'Pending');
      setPendingApps(pending);
    } else {
      setPendingApps([]);
    }
  } catch (error) {
    console.error("Error fetching pending:", error);
  } finally {
    setLoading(false);
  }
  };

  useFocusEffect(
  useCallback(() => {
    fetchPending();
  }, [])
  );

  // --- API: SUBMIT REVIEW (Accept/Reject) ---
  const submitReview = async (applicationId, actionType) => {
  const targetUrl = `${API_URL}/job/review/${applicationId}/`;
    
  console.log(`Attempting POST to: ${targetUrl}`);
  console.log(`Payload: { action: '${actionType}' }`);

  try {
    // 1. Send POST request -- allow axios to return non-2xx so we can handle 403 body
    const response = await axios.post(targetUrl, {
      action: actionType // sends 'accept' or 'reject'
    }, {
      // prevent axios from throwing on non-2xx so we can inspect response body (helpful for debugging 403)
      validateStatus: () => true
    });

    console.log("Review response status:", response.status);
    console.log("Review response data:", response.data);

    if (response.status >= 200 && response.status < 300) {
      // 2. Success Feedback
      const statusText = actionType === 'accept' ? "Accepted" : "Rejected";
      Alert.alert("Success", `Application has been ${statusText}.`);
      // 3. Close Modal & Remove from List
      setModalVisible(false);
      setPendingApps(prevApps => prevApps.filter(app => app.id !== applicationId));
    } else {
      // Not a success status -- show server message if present
      const msg = response.data?.error || response.data?.message || JSON.stringify(response.data);
      Alert.alert("Server Error", `Status: ${response.status}\nMessage: ${msg}`);
    }

  } catch (error) {
    console.error("Review failed full error:", error);

    // --- DETAILED ERROR HANDLING ---
    if (error.response) {
      // The server responded with a status code other than 2xx (e.g. 403, 404, 500)
      console.log("Server Error Data:", error.response.data);
      console.log("Server Status:", error.response.status);
            
      Alert.alert(
        "Server Error", 
        `Status: ${error.response.status}\nMessage: ${JSON.stringify(error.response.data)}`
      );
    } else if (error.request) {
      // The request was made but no response was received
      console.log("No response received:", error.request);
      Alert.alert("Network Error", "Server is not responding. Check if Django is running and your IP is correct.");
    } else {
      // Something happened in setting up the request
      Alert.alert("Error", error.message);
    }
  }
  };

  // --- ACTION HANDLERS ---

  const handleOpenResume = (url) => {
    if (!url) {
      Alert.alert("No Resume", "This applicant did not upload a resume.");
      return;
    }

    // If the resume URL is relative (doesn't start with http), prefix API host
    let finalUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      // Ensure API_URL doesn't end with a slash
      const base = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
      // Ensure url starts with '/'
      const path = url.startsWith('/') ? url : '/' + url;
      finalUrl = `${base}${path}`;
    }

    Linking.canOpenURL(finalUrl).then((supported) => {
      if (supported) {
        Linking.openURL(finalUrl).catch(err => Alert.alert("Error", "Cannot open resume link."));
      } else {
        Alert.alert("Error", "Cannot open resume link.");
      }
    }).catch(err => {
      console.log('canOpenURL error', err);
      Alert.alert('Error', 'Cannot open resume link.');
    });
  };

  // Handles confirmation before calling API
  const handleDecision = (actionType) => {
    Alert.alert(
      `Confirm ${actionType === 'accept' ? 'Accept' : 'Reject'}`,
      `Are you sure you want to ${actionType} this applicant?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          onPress: () => submitReview(selectedApp.id, actionType)
        }
      ]
    );
  };

  const handleScheduleInterview = () => {
    setModalVisible(false);
    // Navigate to Schedule Screen
    navigation.navigate('ScheduleInterview', { 
      applicationId: selectedApp.id,
      applicantName: selectedApp.applicant?.first_name 
    });
  };

  const openReviewModal = (item) => {
    setSelectedApp(item);
    setModalVisible(true);
  };

  // --- RENDER ITEM ---
  const renderItem = ({ item }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={{flex: 1}}>
      <Text style={styles.name}>
        {item.applicant?.first_name || "Unknown"} {item.applicant?.last_name || ""}
      </Text>
      <Text style={styles.jobTitle}>{item.job?.title || "Unknown Job"}</Text>
      </View>
      <View style={styles.pendingBadge}>
        <Text style={styles.pendingText}>Pending</Text>
      </View>
    </View>

    <Text style={styles.email} numberOfLines={1}>{item.applicant?.email}</Text>

    <TouchableOpacity 
    style={styles.reviewBtn} 
    onPress={() => openReviewModal(item)}
    activeOpacity={0.8}
    >
      <Text style={styles.reviewBtnText}>Review Application</Text>
      <Ionicons name="arrow-forward" size={16} color="white" />
    </TouchableOpacity>
  </View>
  );

  return (
  <ImageBackground source={{ uri: BACKGROUND_IMAGE_URL }} style={styles.backgroundImage} resizeMode="cover">
    <View style={styles.overlay}>
    <StatusBar barStyle="light-content" />
        
    {/* HEADER */}
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Pending Approvals</Text>
    </View>

    {/* LIST */}
    {loading ? (
      <ActivityIndicator size="large" color="#fff" style={{marginTop: 50}} />
    ) : (
      <FlatList
        data={pendingApps}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-circle-outline" size={60} color="white" opacity={0.8} />
            <Text style={{color:'white', marginTop: 10, fontSize: 16}}>No pending applications.</Text>
          </View>
        }
      />
    )}

    {/* --- DETAILED REVIEW MODAL --- */}
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Application Details</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            {selectedApp && (
              <>
                {/* Profile Section */}
                <View style={styles.section}>
                  <View style={styles.profileRow}>
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>{selectedApp.applicant?.first_name?.[0] || "U"}</Text>
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.profileName}>{selectedApp.applicant?.first_name} {selectedApp.applicant?.last_name}</Text>
                      <Text style={styles.profileJob}>Applied for: <Text style={{fontWeight:'bold', color: '#0d6efd'}}>{selectedApp.job?.title}</Text></Text>
                    </View>
                  </View>
                                    
                  <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                      <Ionicons name="mail-outline" size={16} color="#666" />
                      <Text style={styles.infoText}>{selectedApp.applicant?.email || "N/A"}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons name="call-outline" size={16} color="#666" />
                      <Text style={styles.infoText}>{selectedApp.applicant?.phone || "No Phone"}</Text>
                    </View>
                  </View>
                </View>

                {/* Resume Section */}
                <Text style={styles.sectionTitle}>Documents</Text>
                <View style={styles.section}>
                  <TouchableOpacity 
                    style={styles.docButton} 
                    onPress={() => handleOpenResume(selectedApp.resume)}
                  >
                    <Ionicons name="document-text" size={20} color="#dc3545" />
                    <Text style={styles.docButtonText}>View PDF Resume</Text>
                    <Ionicons name="open-outline" size={16} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Cover Letter Section */}
                <Text style={styles.sectionTitle}>Cover Letter</Text>
                <View style={styles.section}>
                  <Text style={styles.coverLetterText}>
                    {selectedApp.cover_letter 
                      ? selectedApp.cover_letter 
                      : "No cover letter provided by the applicant."}
                  </Text>
                </View>
              </>
            )}
          </ScrollView>

          {/* Modal Footer (ACTIONS) */}
          <View style={styles.modalFooter}>
            {/* Schedule Button */}
            <TouchableOpacity 
              style={styles.scheduleFullBtn} 
              onPress={handleScheduleInterview}
            >
              <Ionicons name="calendar" size={18} color="white" />
              <Text style={styles.footerBtnText}>Schedule Interview</Text>
            </TouchableOpacity>

            <View style={styles.decisionRow}>
              {/* Reject Button (Sends 'reject') */}
              <TouchableOpacity 
                style={[styles.decisionBtn, styles.rejectBtn]} 
                onPress={() => handleDecision('reject')}
              >
                <Ionicons name="close-circle" size={18} color="white" style={{marginRight: 5}}/>
                <Text style={styles.footerBtnText}>Reject</Text>
              </TouchableOpacity>
                            
              {/* Accept Button (Sends 'accept') */}
              <TouchableOpacity 
                style={[styles.decisionBtn, styles.acceptBtn]} 
                onPress={() => handleDecision('accept')}
              >
                <Ionicons name="checkmark-circle" size={18} color="white" style={{marginRight: 5}}/>
                <Text style={styles.footerBtnText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>

      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: width, height: height },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  
  // Header
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50 },
  backBtn: { marginRight: 15, padding: 5 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  
  listContent: { padding: 20 },
  emptyState: { alignItems: 'center', marginTop: 100 },

  // --- List Item Card ---
  card: { 
      backgroundColor: 'rgba(255,255,255,0.95)', 
      borderRadius: 16, 
      padding: 16, 
      marginBottom: 15,
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontSize: 17, fontWeight: '700', color: '#222' },
  jobTitle: { fontSize: 13, color: '#0d6efd', fontWeight: '600', marginTop: 2 },
  pendingBadge: { backgroundColor: '#fff3cd', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  pendingText: { fontSize: 10, fontWeight: 'bold', color: '#856404', textTransform: 'uppercase' },
  email: { color: '#666', fontSize: 13, marginTop: 8, marginBottom: 12 },
  
  reviewBtn: {
      backgroundColor: '#212529',
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8
  },
  reviewBtnText: { color: 'white', fontWeight: '600', fontSize: 13 },

  // --- MODAL STYLES ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { 
      backgroundColor: '#f8f9fa', 
      borderTopLeftRadius: 20, borderTopRightRadius: 20, 
      height: '85%', 
      paddingBottom: 30
  },
  modalHeader: { 
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
      padding: 20, borderBottomWidth: 1, borderBottomColor: '#e9ecef', backgroundColor: 'white',
      borderTopLeftRadius: 20, borderTopRightRadius: 20
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalScroll: { padding: 20 },

  // Sections
  section: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#e9ecef' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#495057', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase' },

  // Profile Specifics
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatarPlaceholder: { 
      width: 50, height: 50, borderRadius: 25, backgroundColor: '#e2e6ea', 
      justifyContent: 'center', alignItems: 'center', marginRight: 15 
  },
  avatarText: { fontSize: 22, fontWeight: 'bold', color: '#495057' },
  profileName: { fontSize: 18, fontWeight: 'bold', color: '#212529' },
  profileJob: { fontSize: 13, color: '#666' },
  
  infoGrid: { gap: 8 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { color: '#495057', fontSize: 14 },

  // Documents
  docButton: { 
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
      padding: 5 
  },
  docButtonText: { flex: 1, marginLeft: 10, fontSize: 14, fontWeight: '600', color: '#212529' },

  // Cover Letter
  coverLetterText: { fontSize: 14, lineHeight: 22, color: '#495057' },

  // Modal Footer
  modalFooter: { 
      padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#dee2e6' 
  },
  scheduleFullBtn: {
      backgroundColor: '#fd7e14', // Orange
      paddingVertical: 12, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
      marginBottom: 10, shadowColor: '#fd7e14', shadowOpacity: 0.2, shadowOffset: {width:0, height:2}
  },
  decisionRow: { flexDirection: 'row', gap: 10 },
  decisionBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  acceptBtn: { backgroundColor: '#198754' }, // Green
  rejectBtn: { backgroundColor: '#dc3545' }, // Red
  footerBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },

});

export default AdminPending;