import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../api/config';

const EditProfile = ({ route, navigation }) => {
  const initialUser = route.params?.user;
  const userId = initialUser?.id || route.params?.userId;

  const [loading, setLoading] = useState(!initialUser && !!userId);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: initialUser?.first_name || '',
    last_name: initialUser?.last_name || '',
    email: initialUser?.email || '',
    phone_number: initialUser?.phone_number || '',
    address: initialUser?.address || '',
    bio: initialUser?.bio || '',
    skills: initialUser?.skills || '',
  });
  const [image, setImage] = useState(initialUser?.profile_picture ? { uri: initialUser.profile_picture } : null);

  useEffect(() => {
    if (!initialUser && userId) {
      // fetch user
      api.get(`/reg/api/users/${userId}/`)
        .then(res => {
          setForm({
            first_name: res.data.first_name || '',
            last_name: res.data.last_name || '',
            email: res.data.email || '',
            phone_number: res.data.phone_number || '',
            address: res.data.address || '',
            bio: res.data.bio || '',
            skills: res.data.skills || '',
          });
        })
        .catch(err => {
          console.log('Failed to load user', err);
          Alert.alert('Error', 'Unable to load profile');
        })
        .finally(() => setLoading(false));
    }
  }, []);

  useEffect(() => {
    // request permission for media library on mount (expo)
    (async () => {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          console.log('Media library permission not granted');
        }
      } catch (e) {
        console.log('Error requesting media permissions', e);
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      // Handle both old and new response shapes from expo-image-picker
      // Newer versions return { canceled: boolean, assets: [{ uri, ... }] }
      // Older versions return { cancelled: boolean, uri }
      const canceled = result.canceled ?? result.cancelled;
      if (!canceled) {
        let pickedUri = null;
        if (result.assets && result.assets.length > 0) {
          pickedUri = result.assets[0].uri;
        } else if (result.uri) {
          pickedUri = result.uri;
        }
        if (pickedUri) setImage({ uri: pickedUri });
      }
    } catch (err) {
      console.log('Image pick error', err);
      Alert.alert('Error', 'Could not pick image');
    }
  };

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!userId) return Alert.alert('Error', 'Missing user id');
    setSaving(true);
    // Use multipart/form-data if there's a newly picked local image, otherwise JSON
    const uri = image?.uri || null;
    const isRemote = typeof uri === 'string' && (uri.startsWith('http') || uri.startsWith('/'));
    const hasImage = typeof uri === 'string' && !isRemote;
    if (hasImage) {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key] !== undefined && form[key] !== null) formData.append(key, form[key]);
      });

      // Safely determine file extension and mime type. If missing, default to jpg/jpeg.
      const uriParts = uri.split('.');
      const fileExt = uriParts.length > 1 ? uriParts[uriParts.length - 1].split('?')[0] : 'jpg';
      const lowerExt = fileExt.toLowerCase();
      const mimeType = lowerExt === 'jpg' || lowerExt === 'jpeg' ? 'image/jpeg' : `image/${lowerExt}`;

      formData.append('profile_picture', {
        uri: uri,
        name: `profile.${fileExt}`,
        type: mimeType,
      });

      api.put(`/reg/api/users/${userId}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then(res => {
          navigation.navigate('Profile', { user: res.data });
        })
        .catch(err => {
          console.log('Save error', err.response || err.message || err);
          Alert.alert('Save failed', 'Please try again');
        })
        .finally(() => setSaving(false));
    } else {
      // plain JSON update
      api.put(`/reg/api/users/${userId}/`, form)
        .then(res => {
          navigation.navigate('Profile', { user: res.data });
        })
        .catch(err => {
          console.log('Save error', err.response || err.message || err);
          Alert.alert('Save failed', 'Please try again');
        })
        .finally(() => setSaving(false));
    }
  };

  if (loading) return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><ActivityIndicator /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{padding:15}}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{marginBottom:10}}>
        <Text style={{color:'#666'}}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>Edit Profile</Text>

        <TouchableOpacity onPress={pickImage} style={{alignSelf:'center', marginBottom:12}}>
          {image && image.uri ? (
            <Image source={{ uri: image.uri }} style={{width:90,height:90,borderRadius:45}} />
          ) : (
            <View style={{width:90,height:90,borderRadius:45,backgroundColor:'#eee',alignItems:'center',justifyContent:'center'}}>
              <Text style={{color:'#666'}}>Pick</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>First name</Text>
        <TextInput value={form.first_name} onChangeText={v=>handleChange('first_name',v)} style={styles.input} />

        <Text style={styles.label}>Last name</Text>
        <TextInput value={form.last_name} onChangeText={v=>handleChange('last_name',v)} style={styles.input} />

        <Text style={styles.label}>Email (read-only)</Text>
        <TextInput value={form.email} editable={false} style={[styles.input,{backgroundColor:'#f2f2f2'}]} />

        <Text style={styles.label}>Phone number</Text>
        <TextInput value={form.phone_number} onChangeText={v=>handleChange('phone_number',v)} style={styles.input} />

        <Text style={styles.label}>Address</Text>
        <TextInput value={form.address} onChangeText={v=>handleChange('address',v)} style={styles.input} />

        <Text style={styles.label}>Bio</Text>
        <TextInput value={form.bio} onChangeText={v=>handleChange('bio',v)} style={[styles.input,{height:100}]} multiline />

        <Text style={styles.label}>Skills (comma separated)</Text>
        <TextInput value={form.skills} onChangeText={v=>handleChange('skills',v)} style={styles.input} />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  card: { backgroundColor: 'white', borderRadius: 8, padding: 15, elevation: 2 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  label: { color: '#333', marginTop: 8, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#e6e6e6', borderRadius: 6, padding: 8, backgroundColor: 'white' },
  saveBtn: { backgroundColor: '#007bff', padding: 12, borderRadius: 6, marginTop: 15, alignItems: 'center' },
  saveText: { color: 'white', fontWeight: 'bold' }
});

export default EditProfile;
