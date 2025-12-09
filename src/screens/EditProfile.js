import React, { useState, useEffect } from 'react';

import {

    View,

    Text,

    TextInput,

    StyleSheet,

    TouchableOpacity,

    ScrollView,

    ActivityIndicator,

    Alert,

    Image,

    ImageBackground,

    Dimensions,

    StatusBar,

    KeyboardAvoidingView,

    Platform,

    useWindowDimensions

} from 'react-native';

import * as ImagePicker from 'expo-image-picker';

import axios from 'axios';

import { Ionicons } from '@expo/vector-icons';

import { SafeAreaView } from 'react-native-safe-area-context';



const { width, height } = Dimensions.get('window');



// --- SHARED DESIGN PALETTE ---

const palette = {

    surface: "#FFFFFF",

    background: "#F8FAFC",

    textPrimary: "#1E293B",

    textSecondary: "#64748B",

    accent: "#3B82F6",

    accentSoft: "rgba(59, 130, 246, 0.1)",

    cardBorder: "#E2E8F0",

    iconNeutral: "#94A3B8"

};



const API_URL = 'https://finalsbackendcampushire.onrender.com';

const HEADER_BG = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop';



const EditProfile = ({ route, navigation }) => {

    const { width: screenWidth } = useWindowDimensions();

    const isDesktop = screenWidth > 768;



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

                mediaTypes: ImagePicker.MediaType.Images,

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

            // --- MULTIPART REQUEST ---

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

            // --- JSON REQUEST ---

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



    if (loading) return (

        <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor: palette.background}}>

            <ActivityIndicator size="large" color={palette.accent} />

        </View>

    );



    return (

        <View style={styles.container}>

            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />



            {/* 1. Header Background */}

            <ImageBackground source={{ uri: HEADER_BG }} style={styles.headerBackground}>

                <View style={styles.headerOverlay}>

                    <SafeAreaView edges={['top']} style={styles.safeArea}>

                        {/* Navigation Bar */}

                        <View style={[styles.topNav, { paddingHorizontal: isDesktop ? 32 : 24 }]}>

                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navLeft}>

                                <View style={styles.iconBtn}>

                                    <Ionicons name="arrow-back" size={24} color="#fff" />

                                </View>

                                <View>

                                    <Text style={styles.screenLabel}>MY ACCOUNT</Text>

                                    <Text style={styles.screenTitle}>Edit Profile</Text>

                                </View>

                            </TouchableOpacity>

                        </View>

                    </SafeAreaView>

                </View>

            </ImageBackground>



            {/* 2. Floating Sheet Surface */}

            <View style={styles.surface}>

                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex:1}}>

                    <ScrollView

                        contentContainerStyle={[

                            styles.scrollContent,

                            { paddingHorizontal: isDesktop ? 32 : 24 }

                        ]}

                        showsVerticalScrollIndicator={false}

                    >

                        {/* FORM CONTAINER */}

                        <View style={[styles.formContainer, isDesktop && { width: '60%', alignSelf: 'center' }]}>

                           

                            {/* IMAGE PICKER */}

                            <View style={styles.imagePickerContainer}>

                                <TouchableOpacity onPress={pickImage} activeOpacity={0.8} style={styles.imageWrapper}>

                                    {image && image.uri ? (

                                        <Image

                                            source={{ uri: getDisplayUri(image.uri) }}

                                            style={styles.profileImage}

                                        />

                                    ) : (

                                        <View style={styles.placeholderImage}>

                                            <Ionicons name="person" size={40} color={palette.iconNeutral} />

                                        </View>

                                    )}

                                    <View style={styles.cameraIconBadge}>

                                        <Ionicons name="camera" size={16} color="white" />

                                    </View>

                                </TouchableOpacity>

                                <Text style={styles.changePhotoText}>Change Photo</Text>

                            </View>



                            {/* NAME FIELDS */}

                            <View style={styles.row}>

                                <View style={[styles.col, { marginRight: 10 }]}>

                                    <Text style={styles.label}>FIRST NAME</Text>

                                    <TextInput

                                        value={form.first_name}

                                        onChangeText={v=>handleChange('first_name',v)}

                                        style={styles.input}

                                        placeholderTextColor={palette.iconNeutral}

                                    />

                                </View>

                                <View style={[styles.col, { marginLeft: 10 }]}>

                                    <Text style={styles.label}>LAST NAME</Text>

                                    <TextInput

                                        value={form.last_name}

                                        onChangeText={v=>handleChange('last_name',v)}

                                        style={styles.input}

                                        placeholderTextColor={palette.iconNeutral}

                                    />

                                </View>

                            </View>



                            {/* EMAIL (Read Only) */}

                            <Text style={styles.label}>EMAIL ADDRESS (READ ONLY)</Text>

                            <View style={[styles.input, styles.readOnlyInput]}>

                                <Text style={{color: palette.textSecondary}}>{form.email}</Text>

                                <Ionicons name="lock-closed" size={16} color={palette.iconNeutral} />

                            </View>



                            {/* CONTACT INFO */}

                            <Text style={styles.label}>PHONE NUMBER</Text>

                            <TextInput

                                value={form.phone_number}

                                onChangeText={v=>handleChange('phone_number',v)}

                                style={styles.input}

                                keyboardType="phone-pad"

                                placeholderTextColor={palette.iconNeutral}

                            />



                            <Text style={styles.label}>ADDRESS</Text>

                            <TextInput

                                value={form.address}

                                onChangeText={v=>handleChange('address',v)}

                                style={styles.input}

                                placeholderTextColor={palette.iconNeutral}

                            />



                            {/* BIO & SKILLS */}

                            <Text style={styles.label}>BIO</Text>

                            <TextInput

                                value={form.bio}

                                onChangeText={v=>handleChange('bio',v)}

                                style={[styles.input, styles.textArea]}

                                multiline

                                textAlignVertical="top"

                                placeholder="Tell us about yourself..."

                                placeholderTextColor={palette.iconNeutral}

                            />



                            <Text style={styles.label}>SKILLS (COMMA SEPARATED)</Text>

                            <TextInput

                                value={form.skills}

                                onChangeText={v=>handleChange('skills',v)}

                                style={styles.input}

                                placeholder="Java, Python, React..."

                                placeholderTextColor={palette.iconNeutral}

                            />



                            {/* SAVE BUTTON */}

                            <TouchableOpacity

                                style={[styles.saveBtn, saving && {opacity: 0.7}]}

                                onPress={handleSave}

                                disabled={saving}

                            >

                                {saving ? (

                                    <ActivityIndicator color="white" />

                                ) : (

                                    <>

                                        <Text style={styles.saveText}>Save Changes</Text>

                                        <Ionicons name="checkmark-circle" size={20} color="white" style={{marginLeft: 8}}/>

                                    </>

                                )}

                            </TouchableOpacity>



                        </View>

                       

                        <View style={{height: 40}} />

                    </ScrollView>

                </KeyboardAvoidingView>

            </View>

        </View>

    );

};



const styles = StyleSheet.create({

    container: { flex: 1, backgroundColor: palette.background },



    // --- Header ---

    headerBackground: { height: height * 0.22, width: '100%' },

    headerOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.9)' },

    safeArea: { flex: 1 },

    topNav: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },

    navLeft: { flexDirection: 'row', alignItems: 'center' },

    iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },

   

    screenLabel: { color: palette.iconNeutral, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },

    screenTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },



    // --- Surface ---

    surface: {

        flex: 1,

        backgroundColor: palette.background,

        borderTopLeftRadius: 30,

        borderTopRightRadius: 30,

        marginTop: -30,

        overflow: 'hidden'

    },

    scrollContent: { paddingTop: 32 },



    // --- Form Container ---

    formContainer: {

        backgroundColor: palette.surface,

        borderRadius: 20,

        padding: 24,

        borderWidth: 1, borderColor: palette.cardBorder,

        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,

    },



    // Image Picker

    imagePickerContainer: { alignItems: 'center', marginBottom: 24 },

    imageWrapper: { position: 'relative' },

    profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: palette.background },

    placeholderImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: palette.background, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: palette.cardBorder },

    cameraIconBadge: {

        position: 'absolute', bottom: 0, right: 0,

        backgroundColor: palette.accent, width: 32, height: 32, borderRadius: 16,

        justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: palette.surface

    },

    changePhotoText: { marginTop: 8, color: palette.accent, fontWeight: '700', fontSize: 13 },



    // Inputs

    label: { fontSize: 11, fontWeight: '800', color: palette.textSecondary, marginBottom: 8, marginLeft: 4, letterSpacing: 0.5 },

    input: {

        backgroundColor: palette.background,

        borderWidth: 1, borderColor: palette.cardBorder,

        borderRadius: 12,

        padding: 14, marginBottom: 20,

        fontSize: 15, color: palette.textPrimary, fontWeight: '500'

    },

    readOnlyInput: {

        backgroundColor: '#F1F5F9', // Slightly darker grey

        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'

    },

    textArea: { height: 100 },



    // Layout

    row: { flexDirection: 'row', justifyContent: 'space-between' },

    col: { flex: 1 },



    // Button

    saveBtn: {

        backgroundColor: palette.accent,

        paddingVertical: 16, borderRadius: 14,

        alignItems: 'center', flexDirection: 'row', justifyContent: 'center',

        marginTop: 10,

        shadowColor: palette.accent, shadowOpacity: 0.3, shadowOffset: {width: 0, height: 4}, elevation: 4

    },

    saveText: { color: 'white', fontWeight: '700', fontSize: 16 }

});



export default EditProfile;