import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert, Platform, ImageBackground, Dimensions, StatusBar, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios'; 
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const UserManagement = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 🌐 AUTO-DETECT URL
  const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'http://10.0.2.2:8000';
  
  // Shared Background Image
  const BACKGROUND_IMAGE_URL = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop&ixlib=rb-4.0.3';

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/reg/api/users/`);
      setUsers(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Reload data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const onRefresh = () => { setRefreshing(true); fetchUsers(); };

  const handleDelete = (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to remove this user?", [
        { text: "Cancel", style: "cancel" },
        { 
            text: "Delete", 
            style: "destructive",
            onPress: async () => {
                // Add your delete API call here
                // await axios.delete(`${API_URL}/reg/api/users/${id}/`);
                Alert.alert("Note", "Delete logic needs backend endpoint.");
            }
        }
    ]);
  };

  const getImageUrl = (path) => {
    if (!path) return 'https://ui-avatars.com/api/?background=0d6efd&color=fff&name=User';
    return path.startsWith('http') ? path : `${API_URL}${path}`;
  };

  const renderUserItem = ({ item }) => {
    const isAdmin = item.role === 'Admin';
    
    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
            {/* Avatar */}
            <Image 
                source={{ uri: getImageUrl(item.profile_picture) }} 
                style={styles.avatar} 
            />
            
            {/* Text Info */}
            <View style={styles.textContainer}>
                <View style={styles.nameRow}>
                    <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
                    {/* Role Badge */}
                    <View style={[styles.badge, isAdmin ? styles.badgeAdmin : styles.badgeUser]}>
                        <Text style={[styles.badgeText, isAdmin ? styles.textAdmin : styles.textUser]}>
                            {item.role || 'Applicant'}
                        </Text>
                    </View>
                </View>
                <Text style={styles.email}>{item.email}</Text>
                <Text style={styles.gender}>{item.gender}</Text>
            </View>
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash-outline" size={18} color="#dc3545" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ImageBackground source={{ uri: BACKGROUND_IMAGE_URL }} style={styles.backgroundImage} resizeMode="cover">
      <View style={styles.overlay}>
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('AdminDashboard')} style={styles.backBtn}>
                <View style={styles.iconCircle}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </View>
                <Text style={styles.headerTitle}>User Management</Text>
            </TouchableOpacity>
            
            {/* Add User Button (Optional) */}
            <TouchableOpacity style={styles.addBtn}>
                 <Ionicons name="person-add" size={20} color="white" />
            </TouchableOpacity>
        </View>

        {loading ? (
             <View style={styles.centerLoading}><ActivityIndicator size="large" color="#ffffff" /></View>
        ) : (
            <FlatList
                data={users}
                keyExtractor={item => item.id.toString()}
                renderItem={renderUserItem}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={50} color="white" style={{opacity: 0.8}} />
                        <Text style={{color: 'white', marginTop: 10, fontSize: 16}}>No users found.</Text>
                    </View>
                }
            />
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  // --- Background & Layout ---
  backgroundImage: { flex: 1, width: width, height: height },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },

  // --- Header ---
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 45, paddingBottom: 15,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
      backgroundColor: 'rgba(255,255,255,0.2)', width: 35, height: 35, borderRadius: 17.5,
      justifyContent: 'center', alignItems: 'center', marginRight: 10
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: 'white' },
  addBtn: {
      backgroundColor: 'rgba(255,255,255,0.2)', width: 40, height: 40, borderRadius: 20,
      justifyContent: 'center', alignItems: 'center'
  },

  // --- List ---
  listContent: { padding: 20, paddingBottom: 40 },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },

  // --- Card Design (Glassmorphism) ---
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // High opacity white
    borderRadius: 16, padding: 15, marginBottom: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 3 }, elevation: 3
  },
  cardContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  
  // Avatar
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15, borderWidth: 2, borderColor: '#f0f0f0' },
  
  // Text Area
  textContainer: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 2 },
  name: { fontSize: 16, fontWeight: '700', color: '#333', marginRight: 8 },
  
  // Role Badges
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1 },
  badgeAdmin: { backgroundColor: '#e0cffc', borderColor: '#b197fc' }, // Light Purple
  badgeUser: { backgroundColor: '#d1e7dd', borderColor: '#a3cfbb' }, // Light Green
  
  badgeText: { fontSize: 10, fontWeight: '700' },
  textAdmin: { color: '#59359a' },
  textUser: { color: '#0f5132' },

  email: { fontSize: 12, color: '#666' },
  gender: { fontSize: 11, color: '#999', marginTop: 2 },

  // Delete Button
  deleteBtn: {
    backgroundColor: '#fff5f5', padding: 10, borderRadius: 10, marginLeft: 10,
    borderWidth: 1, borderColor: '#ffebeb'
  }
});

export default UserManagement;