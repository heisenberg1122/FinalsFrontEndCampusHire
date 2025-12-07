import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../api/config';

const CandidateDashboard = ({ route, navigation }) => {
  const { user } = route.params;
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('api/jobs/');
      setJobs(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderJobItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.position}>{item.job_position}</Text>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      
      <View style={styles.row}>
        <Text style={styles.salary}>💰 ${item.salary}</Text>
        <Text style={styles.slots}>📦 {item.slots} Slots</Text>
      </View>

      <TouchableOpacity 
        style={styles.applyButton}
        onPress={() => navigation.navigate('ApplyJob', { job: item, user })}
      >
        <Text style={styles.applyButtonText}>Apply Now</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🚀 JobPortal</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile', { user })}>
            <Text style={styles.headerLink}>My Profile</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Find Your Next Career Move</Text>
        <Text style={styles.bannerSub}>Explore {jobs.length} open positions available right now.</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0066cc" style={{marginTop: 20}} />
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderJobItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: 15 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  header: { backgroundColor: '#1a1d21', flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center' },
  logo: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  headerLink: { color: '#00bcd4' },
  banner: { backgroundColor: '#0066cc', padding: 40, alignItems: 'center' },
  bannerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  bannerSub: { color: '#e0e0e0', marginTop: 5 },
  card: { backgroundColor: 'white', borderRadius: 8, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  jobTitle: { fontSize: 18, fontWeight: 'bold' },
  badge: { backgroundColor: '#28a745', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeText: { color: 'white', fontSize: 12 },
  position: { color: '#0066cc', marginTop: 2, marginBottom: 10 },
  description: { color: '#666', marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  salary: { fontWeight: 'bold', color: '#555' },
  slots: { color: '#555' },
  applyButton: { backgroundColor: '#0066cc', padding: 12, borderRadius: 5, alignItems: 'center' },
  applyButtonText: { color: 'white', fontWeight: 'bold' }
});

export default CandidateDashboard;