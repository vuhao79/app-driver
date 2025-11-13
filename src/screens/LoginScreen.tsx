import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      // Alert.alert('Success', 'Login successful!');
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
         'Invalid credentials'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
            <Image
                    source={require('../../assets/logo.png')}
                    style={styles.logoContainer}
                    resizeMode="contain"
                  />
          {/* Logo & Title */}
          <View style={styles.header}>
            <Text style={styles.loginTitle}>Login to your account</Text>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            {/* Email Input with Icon */}
            <View style={styles.inputWithIcon}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail-outline" size={20} color="#fff" />
              </View>
              <TextInput
                style={styles.inputField}
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            {/* Password Input with Icon */}
            <View style={styles.inputWithIcon}>
              <View style={styles.iconContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#fff" />
              </View>
              <TextInput
                style={styles.inputField}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>

        
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
    logoContainer: {
    width: 200,
    height: 70,
    alignSelf: 'center',
    marginBottom: 40,
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#42474eff',
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2a3442ff',
    marginTop: 12,
  },
  form: {
    marginBottom: 16,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 52,
  },
  iconContainer: {
    width: 52,
    height: 52,
    backgroundColor: '#042f40',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputField: {
    flex: 1,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1F2937',
  },
  eyeIcon: {
    paddingHorizontal: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: '#042f40',
    fontWeight: '500',
  },
  button: {
    height: 52,
    backgroundColor: '#042f40',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  demoInfo: {
    marginTop: 32,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  demoText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default LoginScreen;
