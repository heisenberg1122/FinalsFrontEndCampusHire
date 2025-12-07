import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Helper to construct full image URL
const getImageUrl = (path) => {
  if (!path) return 'https://ui-avatars.com/api/?name=User&background=random';
  return path.startsWith('http') ? path : `http://10.0.2.2:8000${path}`;
};

const ProfileScreen = ({ route, navigation }) => {
  const { user } = route.params;

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back to Jobs</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>My Profile</Text>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="pencil" size={14} color="white" />
            <Text style={styles.editBtnText}> Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardBody}>
          {/* Header Section */}
          <View style={styles.profileHeader}>
            <Image 
              source={{ uri: getImageUrl(user.profile_picture) }} 
              style={styles.avatar} 
            />
            <View>
              <Text style={styles.name}>{user.first_name} {user.last_name}</Text>
              <Text style={styles.email}>{user.email}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{user.role}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Details Section */}
          <View style={styles.detailsRow}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About Me</Text>
              <Text style={styles.sectionContent}>
                {user.bio ? user.bio : "No bio added yet. Click Edit to set up."}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Details</Text>
              <View style={styles.contactItem}>
                <Ionicons name="call" size={16} color="#e91e63" />
                <Text style={styles.contactText}> {user.phone_number ? user.phone_number : "Not set"}</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="location" size={16} color="#e91e63" />
                <Text style={styles.contactText}> {user.address ? user.address : "Not set"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
             <Text style={styles.sectionTitle}>Skills</Text>
             <Text style={styles.sectionContent}>
                {user.skills ? user.skills : "No skills listed."}
             </Text>
          </View>

          {/* Resume Section */}
          <View style={styles.resumeBox}>
            <Ionicons name="document-text" size={24} color="#666" />
            <View style={{marginLeft: 10}}>
                <Text style={{fontWeight: 'bold', color: '#333'}}>Resume</Text>
                <Text style={{color: '#666', fontSize: 12}}>
                    {user.resume ? "Resume uploaded" : "No resume uploaded."}
                </Text>
            </View>
          </View>

        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 15 },
  backButton: { marginBottom: 15, padding: 5 },
  backText: { color: '#666' },
  
  card: { backgroundColor: 'white', borderRadius: 10, overflow: 'hidden', elevation: 3 },
  cardHeader: { backgroundColor: '#212529', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  editBtn: { backgroundColor: '#007bff', flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4, alignItems: 'center' },
  editBtnText: { color: 'white', fontSize: 12, fontWeight: 'bold' },

  cardBody: { padding: 20 },
  
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 70, height: 70, borderRadius: 35, marginRight: 15 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  email: { color: '#666', marginBottom: 5 },
  badge: { backgroundColor: '#00bcd4', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },

  detailsRow: { marginBottom: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { color: '#007bff', fontWeight: 'bold', marginBottom: 8, fontSize: 16 },
  sectionContent: { color: '#666', fontStyle: 'italic' },

  contactItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  contactText: { color: '#333' },

  resumeBox: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 5, borderWidth: 1, borderColor: '#eee', flexDirection: 'row', alignItems: 'center' }
});

export default ProfileScreen;