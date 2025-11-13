import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { FontAwesome6 } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TripDetailScreen from '../screens/TripDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TripHistoryScreen from '../screens/TripHistoryScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tab Navigator with only Home, History, Profile
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
      tabBarActiveTintColor: '#042f40',
      tabBarInactiveTintColor: '#666',
      tabBarStyle: {
        height: 80,
        paddingBottom: 12,
        paddingTop: 12,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
      },
      }}>
      <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        headerShown: false,
        tabBarLabel: 'Home',
        tabBarIcon: ({ color, size }) => (
        <FontAwesome6 name="house" size={size} color={color} solid />
        ),
      }}
      />
      <Tab.Screen
      name="History"
      component={TripHistoryScreen}
      options={{
        headerShown: false,
        tabBarLabel: 'History',
        tabBarIcon: ({ color, size }) => (
        <FontAwesome6 name="clock-rotate-left" size={size} color={color}  />
        ),
      }}
      />
        <Tab.Screen
      name="Notifications"
      component={TripHistoryScreen}
      options={{
        headerShown: false,
        tabBarLabel: 'Notifications',
        tabBarIcon: ({ color, size }) => (
        <FontAwesome6 name="bell" size={size} color={color} solid />
        ),
      }}
      />
      <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size }) => (
        <FontAwesome6 name="user" size={size} color={color} solid />
        ),
      }}
      />
    </Tab.Navigator>
  );
};

// Main Stack Navigator with Dashboard and TripDetail outside tabs
const MainNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}>
      <Stack.Screen 
        name="Tabs" 
        component={TabNavigator}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forNoAnimation,
        }}
      />
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 300,
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 300,
              },
            },
          },
        }}
      />
      <Stack.Screen 
        name="TripDetail" 
        component={TripDetailScreen}
        options={{ 
          headerShown: true, 
          title: 'Trip Details',
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
