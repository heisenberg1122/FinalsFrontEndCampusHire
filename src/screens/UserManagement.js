import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import axios from 'axios'; 

const UserManagement = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🌐 AUTO-DETECT URL
  const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'http://10.0.2.2:8000';

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/reg/api/users/`);
        setUsers(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const getImageUrl = (path) => {
    if (!path) return 'https://ui-avatars.com/api/?name=User';
    return path.startsWith('http') ? path : `${API_URL}${path}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f4f6f9', padding: 15 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, marginBottom: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>User Management</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AdminDashboard')}>
            <Text style={{color:'#0066cc', fontWeight:'bold', cursor:'pointer'}}>Back</Text>
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator size="large" color="#0066cc" /> : (
        <FlatList
          data={users}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{flexDirection:'row', alignItems:'center', flex:2}}>
                <Image source={{ uri: getImageUrl(item.profile_picture) }} style={styles.avatar} />
                <View><Text style={{fontWeight:'bold'}}>{item.first_name}</Text><Text style={{fontSize:10, color:'#888'}}>{item.role}</Text></View>
              </View>
              <Text style={{flex:2, fontSize:12}}>{item.email}</Text>
              <TouchableOpacity style={styles.delBtn}><Text style={{color:'white', fontSize:10}}>Delete</Text></TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { backgroundColor: 'white', flexDirection: 'row', padding: 15, marginBottom: 5, borderRadius: 5, alignItems: 'center' },
  avatar: { width: 35, height: 35, borderRadius: 17, marginRight: 10, backgroundColor: '#ddd' },
  delBtn: { backgroundColor: '#dc3545', padding: 5, borderRadius: 3, cursor: 'pointer' }
});

export default UserManagement;