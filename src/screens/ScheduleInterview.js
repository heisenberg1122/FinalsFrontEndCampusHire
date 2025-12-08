import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Alert, 
    ActivityIndicator,
    Platform
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const ScheduleInterview = ({ route, navigation }) => {
    // Get data passed from PendingTask page
    const { applicationId, applicantName, jobTitle } = route.params;

    const [date, setDate] = useState(''); // YYYY-MM-DD
    const [time, setTime] = useState(''); // HH:MM
    const [location, setLocation] = useState('Online');
    const [loading, setLoading] = useState(false);

    // API root auto-detect
    const API_ROOT = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'https://finalsbackendcampushire.onrender.com';
    const API_URL = `${API_ROOT}/job/api/interviews/create/`;

    const handleSubmit = async () => {
        if (!date || !time || !location) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
                const res = await axios.post(API_URL, {
                    application_id: applicationId,
                    date: date,
                    time: time,
                    location: location
                }, {
                    validateStatus: () => true
                });

                console.log('Attempt POST to:', API_URL);
                console.log('Response status:', res.status, 'data:', res.data);

                if (res.status >= 200 && res.status < 300) {
                    const interview = res.data;
                    Alert.alert("Success", "Interview Scheduled!", [
                        { text: "OK", onPress: () => navigation.navigate("AdminDashboard", { newInterview: interview }) }
                    ]);
                } else {
                    const msg = res.data?.error || res.data?.message || JSON.stringify(res.data);
                    Alert.alert("Server Error", `Status: ${res.status}\nMessage: ${msg}`);
                }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to schedule interview.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header with Back Button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Schedule Interview</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.subHeader}>Applicant: <Text style={styles.bold}>{applicantName}</Text></Text>
                <Text style={styles.subHeader}>Position: <Text style={styles.bold}>{jobTitle}</Text></Text>

                {/* Date Input */}
                <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="2025-12-30" 
                    value={date} 
                    onChangeText={setDate} 
                />

                {/* Time Input */}
                <Text style={styles.label}>Time (HH:MM)</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="14:30" 
                    value={time} 
                    onChangeText={setTime} 
                />

                {/* Location Input */}
                <Text style={styles.label}>Location / Link</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="Zoom Link or Office Address" 
                    value={location} 
                    onChangeText={setLocation} 
                />

                <TouchableOpacity 
                    style={styles.submitButton} 
                    onPress={handleSubmit} 
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitText}>Confirm Schedule</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f9', padding: 20 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 20 },
    backButton: { padding: 5, marginRight: 15 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, shadowOpacity: 0.1, elevation: 3 },
    subHeader: { fontSize: 16, marginBottom: 10, color: '#555' },
    bold: { fontWeight: 'bold', color: '#333' },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 5, color: '#333', marginTop: 10 },
    input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16 },
    submitButton: { backgroundColor: '#fd7e14', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30 },
    submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default ScheduleInterview;