import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
  Animated,
  ScrollView,
} from 'react-native';
import { User } from '../types';
import { FontAwesome6 } from '@expo/vector-icons';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

interface MenuCard {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof FontAwesome6.glyphMap;
  iconColor: string;
  iconBgColor: string;
  onPress: () => void;
}

const HomeScreen = ({ navigation }: any) => {
  const [location, setLocation] = useState<string>('VIET NAM');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [user, setUser] = useState<User>({} as User);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    requestLocationPermission();
    getCurrentUser();
    startAvatarAnimation();
  }, []);

  const startAvatarAnimation = () => {
    // Initial scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Subtle rotation animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Pulse animation for the border
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };
  const getCurrentUser = async () => {
    const userFromStore = await AsyncStorage.getItem('user');
    if (userFromStore) {
      setUser(JSON.parse(userFromStore));
    }
  };
  const requestLocationPermission = async () => {
    try {
      setLoadingLocation(true);

      // Check if location was saved from LocationPermissionScreen
      const savedLocation = await AsyncStorage.getItem('userLocation');
      if (savedLocation) {
        setLocation(savedLocation);
        setLoadingLocation(false);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to show your current address.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Location.requestForegroundPermissionsAsync() },
          ],
        );
        setLoadingLocation(false);
        return;
      }

      await getCurrentLocation();
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLoadingLocation(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = currentLocation.coords;

      // Reverse geocoding to get address
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses && addresses.length > 0) {
        const address = addresses[0];
        const locationString = [address.city, address.region, address.country]
          .filter(Boolean)
          .join(', ');

        setLocation(locationString || 'Location Found');

        // Save to AsyncStorage
        await AsyncStorage.setItem('userLocation', locationString);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your current location');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleLocationPress = () => {
    setLoadingLocation(true);
    getCurrentLocation();
  };

  // Menu cards configuration - Easy to add more cards
  const menuCards: MenuCard[] = [
    {
      id: '1',
      title: 'All Trips',
      description: 'View and manage all your trips in one place',
      icon: 'list',
      iconColor: '#E91E63',
      iconBgColor: '#FCE4EC',
      onPress: () => navigation.navigate('Dashboard'),
    },

    {
      id: '2',
      title: 'Notes',
      description: 'Keep important notes and reminders for your trips',
      icon: 'note-sticky',
      iconColor: '#4CAF50',
      iconBgColor: '#E8F5E9',
      onPress: () => console.log('Expenses'),
    },
  ];

  const renderCard = (card: MenuCard) => (
    <TouchableOpacity key={card.id} style={styles.card} onPress={card.onPress} activeOpacity={0.7}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 12,
        }}>
        <View style={[styles.iconContainer, { backgroundColor: card.iconBgColor }]}>
          <FontAwesome6 name={card.icon} size={32} color={card.iconColor} />
        </View>
        <Text style={styles.cardTitle}>{card.title}</Text>
      </View>
      <Text style={styles.cardDescription} numberOfLines={3}>
        {card.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background Image - Fixed Header */}
      <ImageBackground
        source={require('../../assets/truck-welcome.jpg')}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}>
        <View style={styles.backgroundOverlay}>
          {/* Header Section - Fixed */}
          <View style={styles.headerSection}>
            {/* Status Bar */}
            <View style={styles.statusBar}>
              <Text style={styles.time}></Text>
              <View style={styles.rightIcons} />
            </View>

            {/* Location */}
            <View style={styles.locationContainer}>
              <Text style={styles.locationLabel}>Current Address</Text>
              <View style={styles.locationRow}>
                {loadingLocation ? (
                  <View style={styles.loadingLocationContainer}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.loadingLocationText}>Getting location...</Text>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity style={styles.locationButton} onPress={handleLocationPress}>
                      <FontAwesome6 name="location-dot" size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.locationText} numberOfLines={1}>
                      {location}
                    </Text>
                  </>
                )}
              </View>
            </View>

            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
              <View style={styles.welcomeContent}>
                <View style={styles.welcomeTextContainer}>
                  <Text style={styles.welcomeText}>WELCOME</Text>
                  <Text style={styles.driverName}>
                    {user ? user.firstName + ' ' + user.lastName : 'Guest'}
                  </Text>
                  <Text style={styles.driverInfo}>Email: {user?.email || 'N/A'}</Text>
                  <Text style={styles.driverInfo}>Vehicle Number: N/A</Text>
                </View>

                {/* Animated Avatar */}
                <Animated.View
                  style={[
                    styles.avatarContainer,
                    {
                      transform: [
                        { scale: scaleAnim },
                        {
                          rotate: rotateAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '5deg'],
                          }),
                        },
                      ],
                    },
                  ]}>
                  <Animated.View
                    style={[
                      styles.avatarBorder,
                      {
                        transform: [{ scale: pulseAnim }],
                      },
                    ]}>
                    {user?.avatar ? (
                      <Image
                        source={{
                          uri: `http://api.test.acexustrans.com/upload/User_Avatar/${user.avatar}`,
                        }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarInitials}>
                          {user?.firstName?.[0] || 'G'}
                          {user?.lastName?.[0] || 'N'}
                        </Text>
                      </View>
                    )}
                    {/* Online Status Indicator */}
                    <View style={styles.onlineIndicator}>
                      <View style={styles.onlineDot} />
                    </View>
                  </Animated.View>
                </Animated.View>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>

      {/* Dashboard Section - Scrollable */}
      <View style={styles.dashboardContainer}>
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.cards}>
            <View
              style={styles.dashboardScrollView}
              // contentContainerStyle={styles.dashboardScrollContent}
              // showsVerticalScrollIndicator={false}
            >
              <View style={styles.cardsSection}>
                {/* Quick Stats */}
                <View style={styles.statsContainer}>
                  <View style={styles.statCard}>
                    <View style={styles.statIconContainer}>
                      <FontAwesome6 name="truck-fast" size={24} color="#2196F3" />
                    </View>
                    <View style={styles.statContent}>
                      <Text style={styles.statValue}>0</Text>
                      <Text style={styles.statLabel}>Active Trips</Text>
                    </View>
                  </View>

                  <View style={styles.statCard}>
                    <View style={[styles.statIconContainer, { backgroundColor: '#E8F5E9' }]}>
                      <FontAwesome6 name="circle-check" size={24} color="#4CAF50" />
                    </View>
                    <View style={styles.statContent}>
                      <Text style={styles.statValue}>0</Text>
                      <Text style={styles.statLabel}>Completed</Text>
                    </View>
                  </View>
                </View>

                {/* Performance Card */}
                <View style={styles.performanceCard}>
                  <View style={styles.performanceHeader}>
                    <Text style={styles.performanceTitle}>Today&apos;s Performance</Text>
                    <View style={styles.dateBadge}>
                      <FontAwesome6 name="calendar-day" size={12} color="#6B7280" />
                      <Text style={styles.dateText}>Nov 3</Text>
                    </View>
                  </View>

                  <View style={styles.performanceGrid}>
                    <View style={styles.performanceItem}>
                      <View style={styles.performanceIconBox}>
                        <FontAwesome6 name="route" size={18} color="#FF6B35" />
                      </View>
                      <Text style={styles.performanceValue}>0 km</Text>
                      <Text style={styles.performanceLabel}>Distance</Text>
                    </View>

                    <View style={styles.performanceDivider} />

                    <View style={styles.performanceItem}>
                      <View style={[styles.performanceIconBox, { backgroundColor: '#FFF3E0' }]}>
                        <FontAwesome6 name="clock" size={18} color="#FF9800" />
                      </View>
                      <Text style={styles.performanceValue}>0h</Text>
                      <Text style={styles.performanceLabel}>Hours</Text>
                    </View>

                    <View style={styles.performanceDivider} />

                    <View style={styles.performanceItem}>
                      <View style={[styles.performanceIconBox, { backgroundColor: '#E8F5E9' }]}>
                        <FontAwesome6 name="box" size={18} color="#4CAF50" />
                      </View>
                      <Text style={styles.performanceValue}>0</Text>
                      <Text style={styles.performanceLabel}>Deliveries</Text>
                    </View>
                  </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsContainer}>
                  <Text style={styles.sectionTitle}>Quick Actions</Text>
                  <View style={styles.quickActionsGrid}>
                    {menuCards.map((card) => renderCard(card))}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  backgroundImage: {
    width: '100%',
    height: 300,
  },
  backgroundImageStyle: {
    resizeMode: 'cover',
  },
  backgroundOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerSection: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  dashboardContainer: {
    flex: 1,
    marginTop: -20,
  },
  dashboardScrollView: {
    flex: 1,
  },
  dashboardScrollContent: {
    flexGrow: 1,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  time: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationLabel: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  locationButton: {
    // padding: 4,
  },
  loadingLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingLocationText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  welcomeSection: {
    // marginBottom: 12,
    marginTop: 20,
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 1,
  },
  driverName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  driverInfo: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.9,
  },
  avatarContainer: {
    marginLeft: 16,
  },
  avatarBorder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
  },
  dutyToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  cards: {
    backgroundColor: '#f4f6fa',
    // borderTopLeftRadius: 24,
    // borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 16,
    height: '100%',
  },
  cardsSection: {
    backgroundColor: '#f4f6fa',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    // paddingTop: 16,
    // paddingHorizontal: 16,
    // minHeight: 600,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  performanceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  performanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  performanceIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFE5DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  performanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  performanceLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  performanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  quickActionsContainer: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  quickActionsGrid: {
    // chia thành 2 cột
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: (width - 48) / 2 - 6, // Two cards per row with spacing
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 1.5,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
});

export default HomeScreen;
