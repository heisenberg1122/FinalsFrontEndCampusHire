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

  const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'http://10.0.2.2:8000';

  const handleSubmit = async () => {
    if(!title || !position || !description || !salary || !slots) {
        Alert.alert("Error", "Please fill all fields");
        return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/jobs/`, {
        title,
        job_position: position,
        description,
        salary: parseFloat(salary), // Fix: Send number
        slots: parseInt(slots),     // Fix: Send number
        status: 'Open'
      });
      
      Alert.alert("Success", "Job Posted!", [{ text: "OK", onPress: () => navigation.goBack() }]);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to post job. Check inputs.");
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
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Title" />

      <Text style={styles.label}>Position</Text>
      <TextInput style={styles.input} value={position} onChangeText={setPosition} placeholder="Position" />

      <Text style={styles.label}>Salary</Text>
      <TextInput style={styles.input} value={salary} onChangeText={setSalary} keyboardType="numeric" placeholder="0.00" />

      <Text style={styles.label}>Slots</Text>
      <TextInput style={styles.input} value={slots} onChangeText={setSlots} keyboardType="numeric" placeholder="0" />

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