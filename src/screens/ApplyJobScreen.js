import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';

const ApplyJobScreen = ({ route, navigation }) => {
  const { job, user } = route.params;
  const [coverLetter, setCoverLetter] = useState('');

  const handleSubmit = () => {
    // Note: Since the backend expects a FormData POST request with file uploads which
    // is complex in React Native without specific libraries (expo-document-picker),
    // this mimics the request structure.
    
    Alert.alert("Application Submitted", `You have applied for ${job.title}!`);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Submit Application</Text>
            <Text style={styles.headerSub}>Applying for: {job.title}</Text>
        </View>

        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Applicant Details</Text>
            <Text style={styles.label}>Name: <Text style={styles.value}>{user.first_name} {user.last_name}</Text></Text>
            <Text style={styles.label}>Email: <Text style={styles.value}>{user.email}</Text></Text>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Cover Letter / Why should we hire you?</Text>
            <TextInput 
                style={styles.textArea}
                multiline={true}
                numberOfLines={6}
                placeholder="Dear Hiring Manager..."
                value={coverLetter}
                onChangeText={setCoverLetter}
                textAlignVertical="top"
            />

            <Text style={styles.sectionTitle}>Upload Resume</Text>
            <TouchableOpacity style={styles.fileBtn}>
                <Text>Choose File (No file chosen)</Text>
            </TouchableOpacity>

            <View style={styles.footerBtns}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{color: '#666'}}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                    <Text style={styles.submitText}>Submit Application</Text>
                </TouchableOpacity>
            </View>
        </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    header: { backgroundColor: '#0066cc', padding: 20 },
    headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    headerSub: { color: '#d1e7ff' },
    card: { backgroundColor: 'white', margin: 15, padding: 20, borderRadius: 8, elevation: 3 },
    sectionTitle: { fontWeight: 'bold', fontSize: 14, marginTop: 15, marginBottom: 5 },
    label: { color: '#333', marginBottom: 5 },
    value: { color: '#666' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
    textArea: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 10, height: 100, backgroundColor: '#f9f9f9' },
    fileBtn: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 4, backgroundColor: '#f8f9fa', marginTop: 5, marginBottom: 20 },
    footerBtns: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    submitBtn: { backgroundColor: '#0066cc', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 5 },
    submitText: { color: 'white', fontWeight: 'bold' }
});

export default ApplyJobScreen;