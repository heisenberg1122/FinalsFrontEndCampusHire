import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import AdminDashboard from './src/screens/AdminDashboard';
import CandidateDashboard from './src/screens/CandidateDashboard';
import JobPostings from './src/screens/JobPostings';
import AddJobScreen from './src/screens/AddJobScreen';
import EditJobScreen from './src/screens/EditJobScreen';
import UserManagement from './src/screens/UserManagement';
import ViewApplications from './src/screens/ViewApplications';
import ApplyJobScreen from './src/screens/ApplyJobScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfile from './src/screens/EditProfile';
import AdminPending from './src/screens/AdminPending';
import ScheduleInterview from './src/screens/ScheduleInterview';
import Notifications from './src/screens/Notifications';
import RegisterScreen from './src/screens/RegisterScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        
        {/* Job Management */}
        <Stack.Screen name="JobPostings" component={JobPostings} />
        <Stack.Screen name="AddJob" component={AddJobScreen} />
        <Stack.Screen name="EditJob" component={EditJobScreen} />
        
        {/* User & Application Management */}
        <Stack.Screen name="UserManagement" component={UserManagement} />
        <Stack.Screen name="ViewApplications" component={ViewApplications} />
        <Stack.Screen name="CandidateDashboard" component={CandidateDashboard} />
        <Stack.Screen name="ApplyJob" component={ApplyJobScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="AdminPending" component={AdminPending} />
        <Stack.Screen name="ScheduleInterview" component={ScheduleInterview} />
        <Stack.Screen name="Notifications" component={Notifications} />
        
        {/* This is the screen required for your UserManagement 'Add Member' button */}
        <Stack.Screen name="SignUp" component={RegisterScreen} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}