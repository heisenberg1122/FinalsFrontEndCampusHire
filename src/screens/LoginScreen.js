import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, 
  ActivityIndicator, KeyboardAvoidingView, Platform, ImageBackground, Dimensions 
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('Candidate');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🌐 AUTO-DETECT URL
  const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'http://10.0.2.2:8000';

  // Professional Background
  const BACKGROUND_IMAGE_URL = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop&ixlib=rb-4.0.3';

  const handleLogin = async () => {
    if (!email || !password) {
      const msg = "Please enter both email and password.";
      Platform.OS === 'web' ? alert(msg) : Alert.alert("Missing Info", msg);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/login/`, { email, password });
      const user = response.data.user;

      if (activeTab === 'Admin' && user.role !== 'Admin') {
        const msg = "Access Denied: This login is for HR Admins only.";
        Platform.OS === 'web' ? alert(msg) : Alert.alert("Access Denied", msg);
        setLoading(false);
        return;
      }

      if (user.role === 'Admin') {
        navigation.replace('AdminDashboard', { user });
      } else {
        navigation.replace('CandidateDashboard', { user });
      }

    } catch (error) {
      console.log(error);
      let msg = "An unexpected error occurred.";
      if (error.response) {
        msg = "Invalid email or password. Please try again.";
      } else if (error.request) {
        msg = `Network Error: Could not connect to server at ${API_URL}. Ensure backend is running.`;
      }
       Platform.OS === 'web' ? alert(msg) : Alert.alert("Login Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={{ uri: BACKGROUND_IMAGE_URL }} style={styles.backgroundImage} resizeMode="cover">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.overlay}>
          <View style={styles.card}>
            
            {/* Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.welcomeText}>Welcome Back!</Text>
              <Text style={styles.subtitleText}>Sign in to your {activeTab} portal</Text>
            </View>

            {/* Toggle Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'Candidate' && styles.activeTab]}
                onPress={() => setActiveTab('Candidate')}
                activeOpacity={0.8}
              >
                <Ionicons name="person" size={16} color={activeTab === 'Candidate' ? 'white' : '#666'} style={{marginRight: 8}} />
                <Text style={[styles.tabText, activeTab === 'Candidate' && styles.activeTabText]}>Candidate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'Admin' && styles.activeTab]}
                onPress={() => setActiveTab('Admin')}
                activeOpacity={0.8}
              >
                 <Ionicons name="briefcase" size={16} color={activeTab === 'Admin' ? 'white' : '#666'} style={{marginRight: 8}} />
                <Text style={[styles.tabText, activeTab === 'Admin' && styles.activeTabText]}>HR Admin</Text>
              </TouchableOpacity>
            </View>

            {/* Input Fields */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#aaa"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordIcon}>
                 <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#999" />
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Sign In</Text>}
            </TouchableOpacity>

            {/* Create Account Link */}
            <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.signupLinkContainer}>
               <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkHighlight}>Create Now</Text></Text>
            </TouchableOpacity>

          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: width, height: height },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center', width: '100%' },
  card: {
    width: '90%', maxWidth: 420, backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25, paddingVertical: 40, paddingHorizontal: 30,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  headerContainer: { marginBottom: 30, alignItems: 'center' },
  welcomeText: { fontSize: 28, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  subtitleText: { fontSize: 16, color: '#666', fontWeight: '500' },
  tabContainer: { flexDirection: 'row', marginBottom: 30, backgroundColor: '#f0f2f5', borderRadius: 50, padding: 4 },
  tab: { flex: 1, flexDirection: 'row', paddingVertical: 12, justifyContent: 'center', alignItems: 'center', borderRadius: 50 },
  activeTab: { backgroundColor: '#0d6efd', shadowColor: '#0d6efd', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 3 },
  tabText: { color: '#666', fontWeight: '600', fontSize: 15 },
  activeTabText: { color: 'white' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 15,
    marginBottom: 15, paddingHorizontal: 15, borderWidth: 1, borderColor: '#e1e5e9', height: 55,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: '100%', color: '#333', fontSize: 16, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  passwordIcon: { padding: 10 },
  button: {
    backgroundColor: '#0d6efd', paddingVertical: 16, borderRadius: 15, alignItems: 'center',
    marginTop: 10, marginBottom: 25, shadowColor: '#0d6efd', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5, ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  signupLinkContainer: { alignItems: 'center', ...Platform.select({ web: { cursor: 'pointer' } }) },
  linkText: { textAlign: 'center', color: '#666', fontSize: 15 },
  linkHighlight: { color: '#0d6efd', fontWeight: '700' },
});

export default LoginScreen;