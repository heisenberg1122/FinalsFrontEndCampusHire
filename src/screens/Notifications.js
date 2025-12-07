import React, {useState, useCallback} from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

const Notifications = ({ route, navigation }) => {
  const { user } = route.params || { user: null };
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'http://10.0.2.2:8000';

  const fetchNotifications = async () => {
    if (!user || !user.id) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/job/api/notifications/${user.id}/`);
      setNotifications(res.data || []);
    } catch (err) {
      console.log('Failed to fetch notifications', err);
      Alert.alert('Error', 'Unable to fetch notifications');
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [user])
  );

  const markRead = async (id) => {
    try {
      await axios.post(`${API_URL}/job/api/notifications/${id}/mark_read/`);
      setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n));
    } catch (err) {
      console.log('Mark read failed', err);
    }
  }

  const renderItem = ({item}) => (
    <TouchableOpacity style={[styles.item, item.read ? styles.read : null]} onPress={() => {
      markRead(item.id);
      Alert.alert(item.title, item.message);
    }}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.msg} numberOfLines={2}>{item.message}</Text>
      <Text style={styles.time}>{new Date(item.created_at).toLocaleString()}</Text>
    </TouchableOpacity>
  );

if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>

  // ADD THIS CHECK:
  if (!user) {
    return (
      <View style={styles.center}>
        <Text>Please log in to view notifications.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList data={notifications} keyExtractor={i=>i.id.toString()} renderItem={renderItem} ListEmptyComponent={<View style={styles.empty}><Text>No notifications</Text></View>} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding: 16, backgroundColor: '#fff' },
  center: { flex:1, justifyContent:'center', alignItems:'center' },
  item: { padding: 14, borderBottomWidth:1, borderColor: '#eee' },
  title: { fontWeight: '700' },
  msg: { color: '#444', marginTop: 6 },
  time: { color: '#888', marginTop: 6, fontSize: 12 },
  empty: { padding: 40, alignItems: 'center' },
  read: { opacity: 0.6 }
});

export default Notifications;
