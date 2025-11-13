import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  ActivityIndicator,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

const LocationPermissionScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);

  // Animation values
  const mapAnim = useRef(new Animated.Value(0)).current;
  const pin1Anim = useRef(new Animated.Value(0)).current;
  const pin2Anim = useRef(new Animated.Value(0)).current;
  const dashAnim = useRef(new Animated.Value(0)).current;


  const handleEnableLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        // Save location permission status
        await AsyncStorage.setItem('locationEnabled', 'true');
        
        // Get initial location
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = currentLocation.coords;
        const addresses = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (addresses && addresses.length > 0) {
          const address = addresses[0];
          const locationString = [
            address.city,
            address.region,
            address.country,
          ]
            .filter(Boolean)
            .join(', ');
          
          await AsyncStorage.setItem('userLocation', locationString);
        }

        // Use navigate instead of replace
        if (navigation.navigate) {
          navigation.navigate('Main');
        }
      } else {
        alert('Location permission is required to use this app');
      }
    } catch (error) {
      console.error('Error enabling location:', error);
      alert('Failed to enable location');
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    handleEnableLocation();
  };

  const handleSkip = async () => {
    // Save that user skipped
    await AsyncStorage.setItem('locationEnabled', 'skipped');
    if (navigation.navigate) {
      navigation.navigate('Main');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Animated Map Illustration */}
      <View style={styles.illustrationContainer}>
          <Image
          source={require('../../assets/Artwork.png')}
          ></Image>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Enable location</Text>
        <Text style={styles.description}>
          To enable location, allow we will know your location
        </Text>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.enableButton}
            onPress={handleEnableLocation}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.enableButtonText}>Enable</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.useLocationButton}
            onPress={handleUseCurrentLocation}
            disabled={loading}>
            <Text style={styles.useLocationButtonText}>
              Use Current Location
            </Text>
          </TouchableOpacity>
        </View>
      </View>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  mapBackground: {
    width: 280,
    height: 280,
    backgroundColor: '#F0F4FF',
    borderRadius: 140,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  sparkle: {
    position: 'absolute',
  },
  pinContainer: {
    position: 'absolute',
  },
  pin: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pinRed: {
    backgroundColor: '#EF4444',
  },
  pinBlue: {
    backgroundColor: '#2196F3',
  },
  dashedLine: {
    position: 'absolute',
    left: 80,
    top: 100,
    right: 80,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  dash: {
    width: 12,
    height: 3,
    backgroundColor: '#94A3B8',
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  buttonsContainer: {
    gap: 12,
  },
  enableButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  enableButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  useLocationButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  useLocationButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#000',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 8,
  },
});

export default LocationPermissionScreen;
