import React, {useState, useCallback} from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

const Notifications = ({ route, navigation }) => {
  // Support either { user } or { user_id } or an override apiUrl in route.params for testing on device
  const params = route.params || {};
  const user = params.user || (params.user_id ? { id: params.user_id } : null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentlyDeleted, setRecentlyDeleted] = useState([]); // {item, timeoutId}

  // Allow overriding API host via navigation params (useful for real device testing)
  const API_URL = params.apiUrl || (Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'https://finalsbackendcampushire.onrender.com');

  const fetchNotifications = async () => {
    if (!user || !user.id) {
      console.log('Notifications.fetch: missing user param, route.params=', route.params);
      setNotifications([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      console.log(`Notifications.fetch: GET ${API_URL}/job/api/notifications/${user.id}/`);
      const res = await axios.get(`${API_URL}/job/api/notifications/${user.id}/`);
      console.log('Notifications.fetch: response:', res.status, res.data);

      // Normalize backend fields: support both `is_read` and `read` naming
      const list = (res.data || []).map(n => ({
        ...n,
        read: (n.read !== undefined) ? n.read : (n.is_read !== undefined ? n.is_read : false),
      }));

      setNotifications(list);
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
      setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true, is_read: true} : n));
    } catch (err) {
      console.log('Mark read failed', err);
    }
  }

  const markAllRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => axios.post(`${API_URL}/job/api/notifications/${n.id}/mark_read/`)));
      setNotifications(prev => prev.map(n => ({...n, read: true, is_read: true})));
      Alert.alert('Marked', 'All notifications marked as read');
    } catch (err) {
      console.log('Mark all read failed', err);
      Alert.alert('Error', 'Failed to mark all as read');
    }
  }

  const renderRightActions = (id) => () => (
    <TouchableOpacity style={styles.swipeDelete} onPress={() => {
      Alert.alert('Delete notification', 'Are you sure you want to delete this notification?', [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Delete', style: 'destructive', onPress: () => deleteNotification(id)}
      ]);
    }}>
      <Ionicons name="trash" size={22} color="#fff" />
    </TouchableOpacity>
  );

  const renderItem = ({item}) => {
    const accentColor = item.read ? '#e9ecef' : '#0d6efd';
    return (
      <Swipeable renderRightActions={renderRightActions(item.id)}>
        <TouchableOpacity style={[styles.item, item.read ? styles.read : null]} onPress={() => {
          markRead(item.id);
          Alert.alert(item.title, item.message);
        }}>
          <View style={[styles.accent, {backgroundColor: accentColor}]} />
          <View style={styles.content}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.msg} numberOfLines={2}>{item.message}</Text>
            <Text style={styles.time}>{new Date(item.created_at).toLocaleString()}</Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const deleteNotification = async (id) => {
    // Optimistic UI: remove immediately and allow undo for 5s before calling backend
    try {
      const item = notifications.find(n => n.id === id);
      if (!item) return;
      // remove from UI
      setNotifications(prev => prev.filter(n => n.id !== id));

      // schedule permanent delete after 5s
      const timeoutId = setTimeout(async () => {
        try {
          await axios.delete(`${API_URL}/job/api/notifications/${id}/delete/`);
        } catch (err) {
          console.log('Permanent delete failed', err);
        }
        // remove from recentlyDeleted
        setRecentlyDeleted(prev => prev.filter(r => r.item.id !== id));
      }, 5000);

      setRecentlyDeleted(prev => [...prev, { item, timeoutId }]);
      // Show temporary feedback
      Alert.alert('Deleted', 'Notification removed (undo available)');
    } catch (err) {
      console.log('Delete notification failed', err);
      Alert.alert('Error', 'Failed to delete notification');
    }
  }

  const undoDelete = async (id) => {
    try {
      const entry = recentlyDeleted.find(r => r.item.id === id);
      if (!entry) return;
      clearTimeout(entry.timeoutId);

      // recreate on backend
      const body = { user_id: user.id, title: entry.item.title, message: entry.item.message };
      const res = await axios.post(`${API_URL}/job/api/notifications/create/`, body);
      const recreated = res.data;

      // restore in UI (prepend)
      setNotifications(prev => [recreated, ...prev]);
      setRecentlyDeleted(prev => prev.filter(r => r.item.id !== id));
      Alert.alert('Undo', 'Notification restored');
    } catch (err) {
      console.log('Undo failed', err);
      Alert.alert('Error', 'Failed to restore notification');
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>

  if (!user || !user.id) {
    return (
      <View style={styles.container}>
        <View style={styles.empty}><Text>No user information provided. Go back and open Notifications from your profile/dashboard.</Text></View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={markAllRead} style={styles.headerActionBtn}>
            <Ionicons name="checkmark-done" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={notifications}
        keyExtractor={i=>i.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}><Text style={styles.emptyText}>No notifications</Text></View>
        }
        contentContainerStyle={notifications.length === 0 ? {flex:1} : {}}
      />

      {/* Undo bar for recently deleted items */}
      {recentlyDeleted.length > 0 && (
        <View style={styles.undoBar}>
          <Text style={styles.undoText}>{recentlyDeleted.length} notification(s) removed</Text>
          <TouchableOpacity onPress={() => undoDelete(recentlyDeleted[recentlyDeleted.length-1].item.id)} style={styles.undoBtn}>
            <Text style={styles.undoBtnText}>UNDO</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor: '#f6f8fb' },
  center: { flex:1, justifyContent:'center', alignItems:'center' },
  header: { height: 72, backgroundColor: '#0d6efd', paddingHorizontal: 12, paddingTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: '#fff', marginLeft: 6, fontWeight: '600' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerActions: { flexDirection: 'row' },
  headerActionBtn: { padding: 6 },

  item: { flexDirection: 'row', padding: 14, borderBottomWidth:1, borderColor: '#eef2f6', backgroundColor: '#fff', marginHorizontal: 12, marginTop: 12, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 2 },
  accent: { width: 6, borderRadius: 4, marginRight: 12 },
  content: { flex: 1 },
  deleteBtn: { paddingHorizontal: 10, justifyContent: 'center', alignItems: 'center' },
  swipeDelete: { backgroundColor: '#dc3545', justifyContent: 'center', alignItems: 'center', width: 72, borderRadius: 10, marginTop: 12, marginRight: 12 },
  title: { fontWeight: '700', fontSize: 15, color: '#111' },
  msg: { color: '#555', marginTop: 6 },
  time: { color: '#888', marginTop: 8, fontSize: 12 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#666' },
  read: { opacity: 0.6 }
  ,undoBar: { position: 'absolute', left: 12, right: 12, bottom: 20, backgroundColor: '#222', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  undoText: { color: '#fff' },
  undoBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#0d6efd', borderRadius: 6 },
  undoBtnText: { color: '#fff', fontWeight: '700' }
});

export default Notifications;
