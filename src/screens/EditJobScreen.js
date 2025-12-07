import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const EditJobScreen = ({ route, navigation }) => {
  const { job } = route.params;
  
  // State management
  const [title, setTitle] = useState(job.title || '');
  const [position, setPosition] = useState(job.job_position || ''); // Field name matches backend
  const [description, setDescription] = useState(job.description || '');
  const [salary, setSalary] = useState(String(job.salary || ''));
  const [slots, setSlots] = useState(String(job.slots || ''));
  const [status, setStatus] = useState(job.status || 'Open');
  const [loading, setLoading] = useState(false);

  // Set API URL based on device
  const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'http://10.0.2.2:8000';

  // --- HANDLE UPDATE (PUT) ---
  const handleUpdate = async () => {
    if (!title || !position || !description || !salary || !slots) {
        Alert.alert("Error", "Please fill all fields.");
        return;
    }

    setLoading(true);
    try {
      // Construct payload to match Django Serializer
      const payload = {
        title: title,
        job_position: position, // IMPORTANT: key must be 'job_position'
        description: description,
        salary: parseFloat(salary),
        slots: parseInt(slots),
        status: status
      };

      console.log("Updating with:", payload); // Debugging

      await axios.put(`${API_URL}/api/jobs/${job.id}/`, payload);
      
      Alert.alert("Success", "Job Updated!", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);

    } catch (error) {
      console.log(error);
      // specific error handling to see what Django says
      let errorMsg = "Failed to update job.";
      if (error.response && error.response.data) {
          errorMsg = JSON.stringify(error.response.data);
      }
      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLE DELETE (DELETE) ---
  const handleDelete = () => {
    Alert.alert(
      "Delete Job",
      "Are you sure you want to delete this job posting? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            setLoading(true);
            try {
              await axios.delete(`${API_URL}/api/jobs/${job.id}/`);
              Alert.alert("Deleted", "Job posting removed.", [
                 { text: "OK", onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.log("Delete error:", error);
              Alert.alert("Error", "Failed to delete job.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
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

      {/* SAVE BUTTON */}
      <TouchableOpacity style={styles.btn} onPress={handleUpdate} disabled={loading}>
        {loading ? <ActivityIndicator color="white"/> : <Text style={styles.btnText}>Save Changes</Text>}
      </TouchableOpacity>

      {/* DELETE BUTTON - Added Here */}
      <TouchableOpacity style={[styles.btn, styles.deleteBtn]} onPress={handleDelete} disabled={loading}>
        <Text style={styles.btnText}>Delete Job</Text>
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
  
  // Green Save Button
  btn: { backgroundColor: '#198754', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  
  // Red Delete Button
  deleteBtn: { backgroundColor: '#dc3545', marginTop: 15 },
  
  btnText: { color: 'white', fontWeight: 'bold' }
});

export default EditJobScreen;