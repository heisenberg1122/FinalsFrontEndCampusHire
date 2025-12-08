import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform, ImageBackground, Dimensions, ActivityIndicator, KeyboardAvoidingView, StatusBar } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const ApplyJobScreen = ({ route, navigation }) => {
  const { job, user } = route.params;
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);

  // 🌐 AUTO-DETECT URL
  const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'https://finalsbackendcampushire.onrender.com';
  
  // Shared Background Image
  const BACKGROUND_IMAGE_URL = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop&ixlib=rb-4.0.3';

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Construct payload matching the Django View expectations
      const payload = {
        job_id: job.id,
        user_id: user.id,
        cover_letter: coverLetter
      };

      // Send POST request
      await axios.post(`${API_URL}/job/api/apply/`, payload);
      
      // Success Logic
      Alert.alert("Success", `Application for ${job.title} submitted successfully!`, [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);

    } catch (error) {
      console.log("Apply Error:", error);
      
      let msg = "Failed to submit application.";
      
      // Check if backend sent a specific error (e.g., "You have already applied")
      if (error.response && error.response.data && error.response.data.error) {
          msg = error.response.data.error;
      } 
      
      // Show the specific error to the user
      Alert.alert("Notice", msg, [
          { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={{ uri: BACKGROUND_IMAGE_URL }} style={styles.backgroundImage} resizeMode="cover">
      <View style={styles.overlay}>
        <StatusBar barStyle="light-content" />
        
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex:1}}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Apply Now</Text>
                </View>

                {/* Main Glass Card */}
                <View style={styles.card}>
                    
                    {/* Job Details Header */}
                    <View style={styles.jobHeader}>
                        <Text style={styles.applyLabel}>Applying for Position</Text>
                        <Text style={styles.jobTitle}>{job.title}</Text>
                        <View style={styles.badgeRow}>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{job.job_position}</Text>
                            </View>
                            <View style={[styles.badge, {backgroundColor: '#e9ecef', marginLeft: 8}]}>
                                <Text style={[styles.badgeText, {color: '#495057'}]}>{job.status}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Applicant Info */}
                    <Text style={styles.sectionTitle}>Applicant Details</Text>
                    <View style={styles.infoRow}>
                        <Ionicons name="person-circle-outline" size={22} color="#0d6efd" />
                        <Text style={styles.infoText}>{user.first_name} {user.last_name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="mail-outline" size={22} color="#0d6efd" />
                        <Text style={styles.infoText}>{user.email}</Text>
                    </View>

                    {/* Cover Letter Input */}
                    <Text style={styles.sectionTitle}>Cover Letter</Text>
                    <TextInput 
                        style={styles.textArea}
                        multiline={true}
                        numberOfLines={6}
                        placeholder="Tell the hiring manager why you are a good fit..."
                        placeholderTextColor="#999"
                        value={coverLetter}
                        onChangeText={setCoverLetter}
                        textAlignVertical="top"
                    />

                    {/* Resume Upload (Placeholder) */}
                    <Text style={styles.sectionTitle}>Resume</Text>
                    <TouchableOpacity style={styles.fileBtn} onPress={() => Alert.alert("Upload", "File picker requires native config.")}>
                        <Ionicons name="cloud-upload-outline" size={24} color="#666" />
                        <Text style={styles.fileText}> Upload Resume (PDF/Docx)</Text>
                    </TouchableOpacity>

                    {/* Action Buttons */}
                    <View style={styles.footerBtns}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelBtn}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
                            {loading ? (
                                <ActivityIndicator color="white"/>
                            ) : (
                                <>
                                    <Text style={styles.submitText}>Submit Application</Text>
                                    <Ionicons name="send" size={16} color="white" style={{marginLeft: 8}}/>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  // Background & Layout
  backgroundImage: { flex: 1, width: width, height: height },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  scrollContent: { padding: 20, paddingTop: 50, paddingBottom: 40 },
  
  // Header
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, marginRight: 15 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: 'white' },

  // Card Design
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20, padding: 25,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 8
  },

  // Job Info
  jobHeader: { alignItems: 'center', marginBottom: 10 },
  applyLabel: { fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600' },
  jobTitle: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', marginVertical: 5, textAlign: 'center' },
  badgeRow: { flexDirection: 'row', marginTop: 5 },
  badge: { backgroundColor: '#cfe2ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#052c65', fontWeight: '700', fontSize: 12 },

  divider: { height: 1, backgroundColor: '#e9ecef', marginVertical: 20 },

  // Sections
  sectionTitle: { fontWeight: '700', fontSize: 15, marginTop: 15, marginBottom: 8, color: '#333' },
  
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, backgroundColor: '#f8f9fa', padding: 12, borderRadius: 12 },
  infoText: { marginLeft: 10, color: '#555', fontWeight: '600', fontSize: 15 },

  textArea: { 
    borderWidth: 1, borderColor: '#dee2e6', borderRadius: 12, padding: 15, height: 120, 
    backgroundColor: '#fff', fontSize: 15, textAlignVertical: 'top', color: '#333'
  },

  fileBtn: { 
    borderWidth: 1.5, borderColor: '#dee2e6', borderStyle: 'dashed', padding: 25, borderRadius: 12, 
    backgroundColor: '#f8f9fa', alignItems: 'center', flexDirection: 'row', justifyContent: 'center'
  },
  fileText: { color: '#666', marginLeft: 10, fontWeight: '500' },

  // Footer Buttons
  footerBtns: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30 },
  cancelBtn: { padding: 15 },
  cancelText: { color: '#666', fontWeight: '700', fontSize: 15 },
  
  submitBtn: { 
    backgroundColor: '#0d6efd', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 12,
    shadowColor: '#0d6efd', shadowOpacity: 0.3, elevation: 4,
    flexDirection: 'row', alignItems: 'center'
  },
  submitText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default ApplyJobScreen;