import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Platform, ImageBackground, Dimensions } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const AdminDashboard = ({ navigation, route }) => {
  const { user } = route.params || { user: { first_name: 'Admin', last_name: 'User' } };
  const [stats, setStats] = useState({ total_jobs: 0, total_users: 0, total_applications: 0, pending_tasks: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 🌐 AUTO-DETECT URL
  const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'http://10.0.2.2:8000';

  // Professional Abstract Background Image
  const DASHBOARD_BG = 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3';

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/stats/`);
      setStats(response.data);
    } catch (error) {
      console.log("Stats error. Using defaults.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchStats(); };

  // --- MODERN CARD COMPONENT ---
  const DashboardCard = ({ title, count, btnText, onPress, colorTheme, iconName }) => (
    <View style={[styles.card, { backgroundColor: colorTheme.bgTint }]}>
      <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: colorTheme.main }]}>
             <Ionicons name={iconName} size={20} color="white" />
          </View>
          <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={[styles.cardCount, { color: colorTheme.dark }]}>{count}</Text>
      <TouchableOpacity
        style={[styles.cardBtn, { backgroundColor: colorTheme.main }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.cardBtnText}>{btnText}</Text>
      </TouchableOpacity>
    </View>
  );

  // Color Themes for Cards
  const themes = {
      blue: { main: '#2E5BFF', bgTint: '#F4F7FF', dark: '#1A3B9C' }, // Jobs
      teal: { main: '#00C9A7', bgTint: '#F0FCF9', dark: '#007A65' }, // Users
      green: { main: '#34A853', bgTint: '#F1F9F4', dark: '#1E6331' }, // Apps
      orange: { main: '#FFBC00', bgTint: '#FFFBEA', dark: '#9C7300' }, // Tasks
  };

  return (
    <ImageBackground source={{ uri: DASHBOARD_BG }} style={styles.backgroundImage} resizeMode="cover">
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <View>
             <Text style={styles.headerSubTitle}>Welcome back,</Text>
             <Text style={styles.headerTitle}>{user.first_name} {user.last_name} 👋</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => navigation.replace('Login')}>
              <Ionicons name="log-out-outline" size={18} color="#2E5BFF" style={{marginRight:5}}/>
              <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E5BFF"/>}
        >
          {/* Welcome Banner */}
          <View style={styles.banner}>
            <Ionicons name="information-circle" size={24} color="#2E5BFF" style={{marginRight: 10}} />
            <View>
                <Text style={styles.bannerText}>System Overview updated.</Text>
                <Text style={styles.bannerSub}>Check your latest stats below.</Text>
            </View>
          </View>

          {/* Stats Grid */}
          {loading ? <ActivityIndicator size="large" color="#2E5BFF" style={{marginVertical: 20}} /> : (
            <View style={styles.grid}>
              <DashboardCard
                  title="Total Jobs" count={stats.total_jobs} btnText="Manage Jobs"
                  colorTheme={themes.blue} iconName="briefcase"
                  onPress={() => navigation.navigate('JobPostings')}
              />
              <DashboardCard
                  title="Users" count={stats.total_users} btnText="Manage Users"
                  colorTheme={themes.teal} iconName="people"
                  onPress={() => navigation.navigate('UserManagement')}
              />
              <DashboardCard
                  title="Applications" count={stats.total_applications} btnText="View All"
                  colorTheme={themes.green} iconName="document-text"
                  onPress={() => navigation.navigate('ViewApplications')}
              />
              <DashboardCard
                  title="Pending Tasks" count={stats.pending_tasks} btnText="Review"
                  colorTheme={themes.orange} iconName="time"
                  onPress={() => alert("No pending tasks")}
              />
            </View>
          )}

          {/* Quick Actions & Interviews Container */}
          <View style={styles.glassContainer}>
              {/* Quick Actions */}
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionsBox}>
                  <TouchableOpacity style={[styles.actBtn, {backgroundColor: themes.green.main}]} onPress={() => navigation.navigate('JobPostings')} activeOpacity={0.8}>
                      <Ionicons name="add-circle" size={18} color="white"/>
                      <Text style={styles.actText}> Post a Job</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actBtn, {backgroundColor: themes.blue.main}]} onPress={() => navigation.navigate('UserManagement')} activeOpacity={0.8}>
                      <Ionicons name="person-add" size={18} color="white"/>
                      <Text style={styles.actText}> Add User</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actBtn, {backgroundColor: themes.teal.main}]} onPress={() => navigation.navigate('ViewApplications')} activeOpacity={0.8}>
                      <Ionicons name="documents" size={18} color="white"/>
                      <Text style={styles.actText}> Applicants</Text>
                  </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              {/* Upcoming Interviews */}
              <View style={styles.interviewHeaderRow}>
                  <Text style={styles.sectionTitle}>Upcoming Interviews</Text>
                  <TouchableOpacity><Text style={{color: themes.blue.main, fontWeight:'600', fontSize:12}}>View Schedule</Text></TouchableOpacity>
              </View>
              <View style={styles.interviewBody}>
                  <Ionicons name="calendar-clear-outline" size={40} color="#ccc" marginBottom={10}/>
                  <Text style={{color:'#999', fontStyle:'italic'}}>No interviews scheduled for today.</Text>
              </View>
          </View>

        </ScrollView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  // Background & Structure
  backgroundImage: { flex: 1, width: width, height: height },
  overlay: { flex: 1, backgroundColor: 'rgba(245, 247, 250, 0.85)' }, // Light overlay for readability
  scrollContent: { padding: 20, paddingBottom: 40 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
  },
  headerSubTitle: { color: '#718096', fontSize: 14, fontWeight: '600' },
  headerTitle: { color: '#2D3748', fontSize: 22, fontWeight: '800' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
  },
  logoutText: { color: '#2E5BFF', fontWeight: '700', fontSize: 13 },

  // Banner
  banner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 15, borderRadius: 15, marginBottom: 25,
    borderLeftWidth: 4, borderLeftColor: '#2E5BFF',
    shadowColor: '#2E5BFF', shadowOpacity: 0.1, shadowRadius: 10, elevation: 3
  },
  bannerText: { fontSize: 16, fontWeight: '700', color: '#2D3748' },
  bannerSub: { color: '#718096', fontSize: 13, marginTop: 2 },

  // Grid & Cards
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 25 },
  card: {
    width: '48%', padding: 15, borderRadius: 20, marginBottom: 15,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)'
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconContainer: { padding: 8, borderRadius: 10, marginRight: 10 },
  cardTitle: { fontSize: 13, color: '#718096', fontWeight: '600', flex: 1, flexWrap: 'wrap' },
  cardCount: { fontSize: 32, fontWeight: '800', marginBottom: 20 },
  cardBtn: { paddingVertical: 10, width: '100%', borderRadius: 12, alignItems: 'center', shadowOpacity: 0.2, shadowRadius: 5, shadowOffset: {width:0, height:3}, elevation: 4 },
  cardBtnText: { fontSize: 13, fontWeight: '700', color: 'white' },

  // Glass Container for Bottom Sections
  glassContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3
  },
  sectionTitle: { color: '#2D3748', fontWeight: '800', fontSize: 16, marginBottom: 15 },
  actionsBox: { flexDirection: 'row', gap: 10, flexWrap:'wrap' },
  actBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 12, shadowOpacity: 0.2, shadowRadius: 5, elevation: 3, minWidth: '30%' },
  actText: { color: 'white', fontWeight: '700', fontSize: 12 },

  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 20 },

  // Interviews
  interviewHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  interviewBody: { alignItems: 'center', padding: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: '#E2E8F0', borderRadius: 15 },
});

export default AdminDashboard;