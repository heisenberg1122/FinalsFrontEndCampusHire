import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Platform, ImageBackground, Dimensions, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // <--- CRITICAL IMPORT
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const AdminDashboard = ({ navigation, route }) => {
  const { user } = route.params || { user: { first_name: 'Admin', last_name: 'User' } };
  
  // Stats State
  const [stats, setStats] = useState({ 
    total_jobs: 0, 
    total_users: 0, 
    total_applications: 0, 
    pending_tasks: 0 
  });
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [interviews, setInterviews] = useState([]);
  const [loadingInterviews, setLoadingInterviews] = useState(true);

  // 🌐 AUTO-DETECT URL
  const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'http://10.0.2.2:8000';

  // Professional Office Background
  const DASHBOARD_BG = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop&ixlib=rb-4.0.3';

  // --- FETCH STATS FUNCTION ---
  const fetchStats = async () => {
    try {
      // This calls the backend to get the real count of rows in the database
      const response = await axios.get(`${API_URL}/api/stats/`);
      setStats(response.data);
    } catch (error) {
      console.log("Stats error. Using defaults.", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --- FETCH UPCOMING INTERVIEWS ---
  const fetchInterviews = async () => {
    try {
      setLoadingInterviews(true);
      const res = await axios.get(`${API_URL}/job/api/interviews/`);
      console.log('fetchInterviews response status:', res.status);
      console.log('fetchInterviews response data:', res.data);
      if (Array.isArray(res.data)) {
        setInterviews(res.data);
      } else {
        setInterviews([]);
      }
    } catch (err) {
      console.log('Failed to fetch interviews', err);
      setInterviews([]);
    } finally {
      setLoadingInterviews(false);
    }
  };

  // --- 🔄 AUTO-REFRESH LOGIC ---
  // This runs every time the screen comes into focus
  const pollRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      // initial load
      fetchStats();
      fetchInterviews();

      // start polling every 10s while focused
      pollRef.current = setInterval(() => {
        fetchInterviews();
      }, 10000);

      return () => {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      };
    }, [])
  );

  const onRefresh = () => { setRefreshing(true); fetchStats(); fetchInterviews(); };

  // If a new interview was passed via navigation params, prepend it to the list so it shows immediately
  useEffect(() => {
    if (route?.params?.newInterview) {
      console.log('AdminDashboard received newInterview param:', route.params.newInterview);
      setInterviews(prev => {
        // Normalize shape: if interview contains application object, map to expected fields
        const newIv = route.params.newInterview;
        let normalized = newIv;
        if (newIv && newIv.application && newIv.application.id) {
          normalized = {
            id: newIv.id || Math.random(),
            application_id: newIv.application.id,
            applicant_name: newIv.application.applicant ? `${newIv.application.applicant.first_name || ''} ${newIv.application.applicant.last_name || ''}`.trim() : (newIv.applicant_name || ''),
            job_title: newIv.application.job ? (newIv.application.job.title || '') : (newIv.job_title || ''),
            date_time: newIv.date_time || '',
            location: newIv.location || ''
          };
        }
        const exists = prev.some(i => i.id === normalized.id);
        if (exists) return prev;
        return [normalized, ...prev];
      });
      // clear the param to avoid repeated inserts
      try { route.params.newInterview = null; } catch (e) {}
    }
  }, [route?.params?.newInterview]);

  // --- STAT CARD COMPONENT ---
  const DashboardCard = ({ title, count, iconName, onPress, color }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}> 
        <Ionicons name={iconName} size={24} color={color} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardCount}>{count}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground source={{ uri: DASHBOARD_BG }} style={styles.backgroundImage} resizeMode="cover">
      <View style={styles.overlay}>
        <StatusBar barStyle="light-content" />
        
        {/* Header Section */}
        <View style={styles.header}>
          <View>
             <Text style={styles.headerSubTitle}>Welcome back,</Text>
             <Text style={styles.headerTitle}>{user.first_name} {user.last_name}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => navigation.replace('Login')}>
              <Ionicons name="log-out-outline" size={20} color="#fff"/>
          </TouchableOpacity>
        </View>

        {/* Profile mini-card */}
        <View style={styles.profileMiniCardContainer}>
          <View style={styles.profileMiniCard}>
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarSmallText}>{(user.first_name?.[0] || 'A') + (user.last_name?.[0] || '')}</Text>
            </View>
            <View style={{flex:1, marginLeft:12}}>
              <Text style={styles.profileNameSmall}>{user.first_name} {user.last_name}</Text>
              {user.email ? <Text style={styles.profileEmailSmall}>{user.email}</Text> : null}
            </View>
            <TouchableOpacity style={styles.viewProfileBtn} onPress={() => navigation.navigate('Profile', { user })}>
              <Text style={styles.viewProfileText}>View Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff"/>}
        >
          
          {/* Main Content Container (Glassmorphism) */}
          <View style={styles.mainContainer}>
            
            <Text style={styles.sectionTitle}>Overview</Text>

            {loading ? <ActivityIndicator size="large" color="#0d6efd" style={{marginVertical: 20}} /> : (
              <View style={styles.grid}>
                <DashboardCard 
                    title="Total Jobs" count={stats.total_jobs} 
                    iconName="briefcase" color="#0d6efd" // Blue
                    onPress={() => navigation.navigate('JobPostings')}
                />
                <DashboardCard 
                    title="Users" count={stats.total_users} 
                    iconName="people" color="#198754" // Green
                    onPress={() => navigation.navigate('UserManagement')}
                />
                <DashboardCard 
                    title="Applicants" count={stats.total_applications} 
                    iconName="document-text" color="#fd7e14" // Orange
                    onPress={() => navigation.navigate('ViewApplications')}
                />
                <DashboardCard 
                  title="Pending" count={stats.pending_tasks} 
                  iconName="time" color="#dc3545" // Red
                  onPress={() => navigation.navigate('AdminPending')}
                />
              </View>
            )}

            <View style={styles.divider} />

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('JobPostings')}>
                   <View style={[styles.actionIcon, { backgroundColor: '#e7f1ff' }]}>
                      <Ionicons name="add-circle" size={24} color="#0d6efd" />
                   </View>
                   <Text style={styles.actionText}>Post Job</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('UserManagement')}>
                   <View style={[styles.actionIcon, { backgroundColor: '#e6f8f0' }]}>
                      <Ionicons name="person-add" size={24} color="#198754" />
                   </View>
                   <Text style={styles.actionText}>Add User</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ViewApplications')}>
                   <View style={[styles.actionIcon, { backgroundColor: '#fff3cd' }]}>
                      <Ionicons name="documents" size={24} color="#fd7e14" />
                   </View>
                   <Text style={styles.actionText}>Review</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* Recent Activity / Interviews */}
            <View style={styles.interviewHeader}>
                <Text style={styles.sectionTitle}>Interview Schedule</Text>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                  <View style={styles.liveBadge} />
                  <TouchableOpacity onPress={() => navigation.navigate('ViewApplications')}><Text style={styles.linkText}>View All</Text></TouchableOpacity>
                </View>
            </View>

            {loadingInterviews ? (
              <ActivityIndicator size="small" color="#0d6efd" />
            ) : interviews.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={40} color="#ddd" />
                <Text style={styles.emptyText}>No interviews scheduled.</Text>
              </View>
            ) : (
              <View>
                {interviews.slice(0,3).map((iv) => (
                  <TouchableOpacity key={iv.id} style={styles.interviewCard} onPress={() => navigation.navigate('ViewApplications')}>
                    <Text style={{fontWeight:'700'}}>{iv.job_title || 'Unknown Position'}</Text>
                    <Text style={{color:'#666', marginTop:4}}>{iv.applicant_name}</Text>
                    <Text style={{color:'#888', marginTop:6}}>{new Date(iv.date_time).toLocaleString()} • {iv.location}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  // --- Background & Layout ---
  backgroundImage: { flex: 1, width: width, height: height },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }, // Slightly darker overlay for white text header
  scrollContent: { padding: 20, paddingBottom: 40 },

  // --- Header ---
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 45, paddingBottom: 25,
  },
  headerSubTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  headerTitle: { color: 'white', fontSize: 26, fontWeight: '800' },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 12,
  },

  // --- Main Glass Container ---
  mainContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // High opacity white
    borderRadius: 25,
    padding: 25,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
    minHeight: height * 0.7, 
  },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 15 },

  // --- Stats Grid ---
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%', backgroundColor: 'white', borderRadius: 15, padding: 15, marginBottom: 15,
    borderWidth: 1, borderColor: '#f0f0f0',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
    flexDirection: 'column', justifyContent: 'space-between'
  },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  cardContent: { marginBottom: 5 },
  cardCount: { fontSize: 24, fontWeight: '800', color: '#333' },
  cardTitle: { fontSize: 13, color: '#666', fontWeight: '600' },
  arrowContainer: { position: 'absolute', top: 15, right: 10 },

  // --- Divider ---
  divider: { height: 1, backgroundColor: '#f0f2f5', marginVertical: 20 },

  // --- Quick Actions ---
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionButton: { alignItems: 'center', width: '30%' },
  actionIcon: {
    width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  actionText: { fontSize: 13, fontWeight: '600', color: '#555' },

  // --- Profile Mini Card ---
  profileMiniCardContainer: { paddingHorizontal: 20, marginTop: -20, marginBottom: 12 },
  profileMiniCard: { backgroundColor: 'white', borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', shadowColor:'#000', shadowOpacity:0.04, elevation:2 },
  avatarSmall: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#0d6efd', justifyContent:'center', alignItems:'center' },
  avatarSmallText: { color: 'white', fontWeight: '700' },
  profileNameSmall: { fontWeight: '700', fontSize: 14 },
  profileEmailSmall: { color: '#666', fontSize: 12, marginTop: 2 },
  viewProfileBtn: { backgroundColor: '#0d6efd', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  viewProfileText: { color: 'white', fontWeight: '700', fontSize: 12 },

  // --- Interview Section ---
  interviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  linkText: { color: '#0d6efd', fontWeight: '700', fontSize: 13 },
  emptyState: { 
    alignItems: 'center', padding: 30, backgroundColor: '#f8f9fa', 
    borderRadius: 15, borderWidth: 1, borderColor: '#e9ecef', borderStyle: 'dashed' 
  },
  emptyText: { color: '#999', marginTop: 10, fontSize: 14 }
  ,
  interviewCard: { padding: 12, backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, borderWidth:1, borderColor:'#eef2f6' }
  ,
  liveBadge: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#28a745', marginRight: 8, marginTop: 2 }
});

export default AdminDashboard;