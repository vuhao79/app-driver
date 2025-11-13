import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  navigation: any;
}

const WelcomeScreen = ({ navigation }: WelcomeScreenProps) => {
  const handleAppleLogin = () => {
    // Navigate to Login Screen
    navigation.navigate('Login');
  };

  const handleGoogleLogin = () => {
    // Navigate to Login Screen
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      {/* Logo and Buttons - Centered */}
      <View style={styles.centerContent}>
        {/* Logo Section */}
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logoContainer}
          resizeMode="contain"
        />
        
        {/* Buttons Section */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.appleButton}
            onPress={handleAppleLogin}>
            <Ionicons name="arrow-forward-circle-outline" size={24} color="#fff" />
            <Text style={styles.appleButtonText}>
              Continue with WCL
            </Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Welcome to the ultimate platform for truck seekers and drivers!
          </Text>
        </View>
      </View>

      {/* Truck Image - Always at Bottom */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/truck.png')}
          style={styles.truckImage}
          resizeMode="cover"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    backgroundColor: '#F5F5F5',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: height * 0.1,
  },
  logoContainer: {
    width: 200,
    height: 70,
    alignSelf: 'center',
    marginBottom: 40,
  },
  
 
  buttonsContainer: {
    width: '100%',
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  appleButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#042f40',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  appleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
 
  footerText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  imageContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: height * 0.35,
  },
  truckImage: {
    width: '100%',
    height: '100%',
  },
});

export default WelcomeScreen;
