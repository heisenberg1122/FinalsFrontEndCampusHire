import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, Platform } from 'react-native';
import axios from 'axios'; 

const SignupScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('Male');
  const [loading, setLoading] = useState(false);

  // 🌐 AUTO-DETECT URL
  const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'http://10.0.2.2:8000';

  const handleSignup = async () => {
    if(!firstName || !lastName || !email || !password) {
        const msg = "Please fill all fields";
        Platform.OS === 'web' ? alert(msg) : Alert.alert("Error", msg);
        return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API_URL}/reg/api/register/`, {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        gender,
        role: 'Applicant'
      });
      
      const successMsg = "Account created! Login now.";
      if (Platform.OS === 'web') {
          alert(successMsg);
          navigation.navigate("Login");
      } else {
          Alert.alert("Success", successMsg, [{ text: "Login", onPress: () => navigation.navigate("Login") }]);
      }
    } catch (error) {
      Platform.OS === 'web' ? alert("Registration Failed") : Alert.alert("Error", "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>
        <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First Name" />
        <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last Name" />
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" />
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" />
        
        <View style={styles.row}>
            <TouchableOpacity style={[styles.genderBtn, gender==='Male'&&styles.active]} onPress={()=>setGender('Male')}>
                <Text style={gender==='Male'?styles.activeTxt:styles.txt}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.genderBtn, gender==='Female'&&styles.active]} onPress={()=>setGender('Female')}>
                <Text style={gender==='Female'?styles.activeTxt:styles.txt}>Female</Text>
            </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleSignup} disabled={loading}>
            {loading ? <ActivityIndicator color="white"/> : <Text style={styles.btnText}>Sign Up</Text>}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={{textAlign:'center', color:'#0d6efd', marginTop:10, cursor:'pointer'}}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#ecf0f3', justifyContent: 'center', padding: 20, alignItems: 'center' }, // Centered for Web
  card: { width: '100%', maxWidth: 400, backgroundColor: 'white', padding: 25, borderRadius: 10, elevation: 5 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 10, marginBottom: 15, outlineStyle: 'none' },
  row: { flexDirection: 'row', marginBottom: 20 },
  genderBtn: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', margin: 2, borderRadius: 5, cursor: 'pointer' },
  active: { backgroundColor: '#0d6efd', borderColor: '#0d6efd' },
  activeTxt: { color: 'white', fontWeight: 'bold' },
  txt: { color: '#555' },
  btn: { backgroundColor: '#0d6efd', padding: 15, borderRadius: 5, alignItems: 'center', cursor: 'pointer' },
  btnText: { color: 'white', fontWeight: 'bold' }
});

export default SignupScreen;