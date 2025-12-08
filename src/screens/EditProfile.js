import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios'; 

const API_URL = 'https://finalsbackendcampushire.onrender.com';

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

  const getDisplayUri = (uri) => {
    if (!uri) return null;
    if (uri.startsWith('file://') || uri.startsWith('content://')) return uri; 
    if (uri.startsWith('http')) return uri; 
    return `${API_URL}${uri}`; 
  };

  useEffect(() => {
    if (!initialUser && userId) {
      // FIX 1: Added "/reg/" to match your backend structure
      axios.get(`${API_URL}/reg/api/users/${userId}/`)
        .then(res => {
          const data = res.data;
          setForm({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            email: data.email || '',
            phone_number: data.phone_number || '',
            address: data.address || '',
            bio: data.bio || '',
            skills: data.skills || '',
          });
          if (data.profile_picture) {
            setImage({ uri: data.profile_picture });
          }
        })
        .catch(err => {
          console.log('Failed to load user', err);
          Alert.alert('Error', 'Unable to load profile');
        })
        .finally(() => setLoading(false));
    }
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need permission to access your photos.');
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images, // Corrected Syntax
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage({ uri: result.assets[0].uri });
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

    const uri = image?.uri || null;
    const isNewImage = uri && (uri.startsWith('file://') || uri.startsWith('content://'));

    if (isNewImage) {
      // --- MULTIPART REQUEST (Image Changed) ---
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key] !== undefined && form[key] !== null) {
            formData.append(key, form[key]);
        }
      });

      const uriParts = uri.split('.');
      const fileExt = uriParts.length > 1 ? uriParts[uriParts.length - 1].split('?')[0] : 'jpg';
      
      formData.append('profile_picture', {
        uri: uri,
        name: `profile.${fileExt}`,
        type: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
      });

      // FIX 2: Added "/reg/" here as well
      // Note: No manual 'Content-Type' header needed
      axios.put(`${API_URL}/reg/api/users/${userId}/`, formData)
      .then(res => {
        navigation.navigate('Profile', { user: res.data });
      })
      .catch(err => {
        console.error('Save error:', err.response?.data || err.message);
        Alert.alert('Save failed', 'Please try again');
      })
      .finally(() => setSaving(false));

    } else {
      // --- JSON REQUEST (No Image Change) ---
      // FIX 3: Added "/reg/" here as well
      axios.put(`${API_URL}/reg/api/users/${userId}/`, form)
        .then(res => {
          navigation.navigate('Profile', { user: res.data });
        })
        .catch(err => {
          console.error('Save error:', err.response?.data || err.message);
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
            <Image 
                source={{ uri: getDisplayUri(image.uri) }} 
                style={{width:90,height:90,borderRadius:45}} 
            />
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
          {saving ? <ActivityIndicator color="white" /> : <Text style={styles.saveText}>Save Changes</Text>}
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