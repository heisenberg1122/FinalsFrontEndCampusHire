import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const EditJobScreen = ({ route, navigation }) => {
  const { job } = route.params;
  
  const [title, setTitle] = useState(job.title || '');
  const [position, setPosition] = useState(job.job_position || '');
  const [description, setDescription] = useState(job.description || '');
  const [salary, setSalary] = useState(String(job.salary || ''));
  const [slots, setSlots] = useState(String(job.slots || ''));
  const [status, setStatus] = useState(job.status || 'Open');
  const [loading, setLoading] = useState(false);

  const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'http://10.0.2.2:8000';

  const handleUpdate = async () => {
    if (!title || !position || !description || !salary || !slots) {
        Alert.alert("Error", "Please fill all fields.");
        return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        job_position: position,
        description,
        salary: parseFloat(salary),
        slots: parseInt(slots),
        status
      };

      await axios.put(`${API_URL}/api/jobs/${job.id}/`, payload);
      
      Alert.alert("Success", "Job Updated!", [{ text: "OK", onPress: () => navigation.goBack() }]);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to update job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Job</Text>
      </View>
      
      <Text style={styles.label}>Job Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Position</Text>
      <TextInput style={styles.input} value={position} onChangeText={setPosition} />

      <Text style={styles.label}>Status</Text>
      <TextInput style={styles.input} value={status} onChangeText={setStatus} placeholder="Open" />

      <Text style={styles.label}>Salary</Text>
      <TextInput style={styles.input} value={salary} onChangeText={setSalary} keyboardType="numeric" />

      <Text style={styles.label}>Slots</Text>
      <TextInput style={styles.input} value={slots} onChangeText={setSlots} keyboardType="numeric" />

      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline />

      <TouchableOpacity style={styles.btn} onPress={handleUpdate} disabled={loading}>
        {loading ? <ActivityIndicator color="white"/> : <Text style={styles.btnText}>Save Changes</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: 'white', flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginLeft: 10, color: '#333' },
  label: { fontWeight: '600', marginBottom: 5, color: '#555' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15 },
  textArea: { height: 100, textAlignVertical: 'top' },
  btn: { backgroundColor: '#198754', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  btnText: { color: 'white', fontWeight: 'bold' }
});

export default EditJobScreen;