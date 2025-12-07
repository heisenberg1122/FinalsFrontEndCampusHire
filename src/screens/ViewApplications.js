import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Alert } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const ViewApplications = ({ navigation }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🌐 AUTO-DETECT URL
  const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'http://10.0.2.2:8000';

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      // Connects to the backend API we made earlier
      const response = await axios.get(`${API_URL}/job/api/applications/`); 
      setApplications(response.data);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Could not fetch applications.");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={{flex:1}}>
            <Text style={styles.name}>{item.applicant?.first_name} {item.applicant?.last_name}</Text>
            <Text style={styles.email}>{item.applicant?.email}</Text>
            <Text style={styles.job}>Role: <Text style={{fontWeight:'bold', color:'#0d6efd'}}>{item.job?.title}</Text></Text>
        </View>
        <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btn} onPress={() => Alert.alert("Resume", "Resume download logic")}>
            <Ionicons name="document-text-outline" size={16} color="white" />
            <Text style={styles.btnText}> Resume</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, {backgroundColor:'#ffc107'}]} onPress={() => Alert.alert("Schedule", "Open Calendar logic")}>
            <Ionicons name="calendar-outline" size={16} color="white" />
            <Text style={styles.btnText}> Schedule</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Job Applications</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>Back</Text>
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator size="large" color="#0d6efd" style={{marginTop:20}} /> : (
        <FlatList 
            data={applications}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{padding: 15}}
            ListEmptyComponent={<Text style={{textAlign:'center', marginTop:20, color:'#666'}}>No applications found.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { backgroundColor: 'white', padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  backBtn: { color: '#0d6efd', fontWeight: 'bold' },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 10, marginBottom: 15, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  name: { fontSize: 18, fontWeight: 'bold' },
  email: { color: '#666', fontSize: 12, marginBottom: 5 },
  job: { fontSize: 14, marginTop: 5 },
  statusBadge: { backgroundColor: '#e9ecef', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, height: 30, justifyContent: 'center' },
  statusText: { fontSize: 12, fontWeight: 'bold', color: '#495057' },
  actions: { flexDirection: 'row', gap: 10 },
  btn: { backgroundColor: '#0d6efd', padding: 10, borderRadius: 5, flexDirection: 'row', alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 12, marginLeft: 5 }
});

export default ViewApplications;