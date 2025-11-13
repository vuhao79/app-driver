import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";
import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/LoginScreen";
import LocationPermissionScreen from "../screens/LocationPermissionScreen";
import MainNavigator from "./MainNavigator";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [locationChecked, setLocationChecked] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      checkLocationPermission();
    }
  }, [isAuthenticated]);

  const checkLocationPermission = async () => {
    try {
      const enabled = await AsyncStorage.getItem("locationEnabled");
      setLocationEnabled(enabled);
    } catch (error) {
      console.error("Error checking location permission:", error);
    } finally {
      setLocationChecked(true);
    }
  };

  if (isLoading || (isAuthenticated && !locationChecked)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#042f40" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        ) : (
          <>
            {locationEnabled !== "true" && locationEnabled !== "skipped" && (
              <Stack.Screen
                name="LocationPermission"
                component={LocationPermissionScreen}
                options={{ gestureEnabled: false }}
              />
            )}
            <Stack.Screen name="Main" component={MainNavigator} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

export default AppNavigator;
