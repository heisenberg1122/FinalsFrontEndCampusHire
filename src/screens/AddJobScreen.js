import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const AddJobScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [position, setPosition] = useState('');
  const [description, setDescription] = useState('');
  const [salary, setSalary] = useState('');
  const [slots, setSlots] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'https://finalsbackendcampushire.onrender.com';

  const handleSubmit = async () => {
    // 1. Basic Validation
    if(!title || !position || !description || !salary || !slots) {
        Alert.alert("Error", "Please fill all fields");
        return;
    }

    // 2. Number Validation
    const salaryNum = parseFloat(salary);
    const slotsNum = parseInt(slots);

    if (isNaN(salaryNum) || isNaN(slotsNum)) {
        Alert.alert("Error", "Salary and Slots must be valid numbers.");
        return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        job_position: position, // Must match Django Model field name
        description,
        salary: salaryNum,
        slots: slotsNum,
        status: 'Open'
      };
      
      console.log("Sending Payload:", payload); // Debugging: See what you are sending

      await axios.post(`${API_URL}/api/jobs/`, payload);
      
      Alert.alert("Success", "Job Posted!", [{ text: "OK", onPress: () => navigation.goBack() }]);
    
    } catch (error) {
      console.log(error);
      
      // --- IMPROVED ERROR HANDLING ---
      // This will now show you exactly what Django is complaining about
      let errorMessage = "Failed to post job.";
      
      if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log("Server Error Data:", error.response.data);
          
          // Convert the error object (e.g., {salary: ["Invalid number"]}) to a string
          errorMessage = JSON.stringify(error.response.data);
      } else if (error.request) {
          // The request was made but no response was received
          errorMessage = "Network error. Is the backend running?";
      }

      Alert.alert("Submission Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post New Job</Text>
      </View>
      
      <Text style={styles.label}>Job Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Software Engineer" />

      <Text style={styles.label}>Position</Text>
      <TextInput style={styles.input} value={position} onChangeText={setPosition} placeholder="e.g. Junior Dev" />

      <Text style={styles.label}>Salary</Text>
      <TextInput 
        style={styles.input} 
        value={salary} 
        onChangeText={setSalary} 
        keyboardType="numeric" 
        placeholder="0.00" 
      />

      <Text style={styles.label}>Slots</Text>
      <TextInput 
        style={styles.input} 
        value={slots} 
        onChangeText={setSlots} 
        keyboardType="numeric" 
        placeholder="e.g. 5" 
      />

      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline />

      <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="white"/> : <Text style={styles.btnText}>Submit Job</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: 'white', flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginLeft: 10, color: '#333' },
  label: { fontWeight: '600', marginBottom: 5, color: '#555' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15 },
  textArea: { height: 100, textAlignVertical: 'top' },
  btn: { backgroundColor: '#0d6efd', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  btnText: { color: 'white', fontWeight: 'bold' }
});

export default AddJobScreen;