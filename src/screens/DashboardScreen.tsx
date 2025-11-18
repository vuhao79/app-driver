import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import ApiService from '../services/api';
import { Trip } from '../types';

const DashboardScreen = ({ navigation }: any) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress'>('all');

  useEffect(() => {
    loadTrips();
  }, []);

  // Reload trips when screen comes into focus (e.g., returning from TripDetailScreen)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTrips();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    filterTrips();
  }, [trips, searchQuery, filter]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getTrips();
      setTrips(data);
    } catch (error: any) {
      console.error('Failed to load trips from API', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTrips();
    setRefreshing(false);
  };

  const filterTrips = () => {
    let result = [...trips];

    if (filter !== 'all') {
      result = result.filter((trip) => {
        const status = trip.tripStatus?.toLowerCase() || '';
        if (filter === 'pending') return status === 'planned' || status === 'assigned';
        if (filter === 'in-progress') return status !== 'assigned';

        return true;
      });
    }

    if (searchQuery) {
      result = result.filter(
        (trip) =>
          trip.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trip.id?.toString().includes(searchQuery) ||
          trip.tripStartLocation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trip.tripEndLocation?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredTrips(result);
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('assigned') || statusLower.includes('scheduled')) return '#042f40';
    if (statusLower.startsWith('enroute') || statusLower.startsWith('arrived')) return '#00437aff';
    if (statusLower.includes('delivered') || statusLower.includes('completed')) return '#4CAF50';
    if (statusLower.includes('cancelled')) return '#F44336';
    return '#9CA3AF';
  };

  const renderTripCard = ({ item }: { item: Trip }) => (
    <TouchableOpacity
      style={styles.tripCard}
      onPress={() => {
        if (item.tripStatus?.toLowerCase() !== 'assigned') {
          navigation.navigate('TripDetail', { trip: item });
        }
      }}
      activeOpacity={item.tripStatus?.toLowerCase() === 'assigned' ? 1 : 0.7}
      disabled={item.tripStatus?.toLowerCase() === 'assigned'}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={{ color: '#042f40', fontSize: 16, fontWeight: 'bold' }}>#{item.id}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.tripStatus) }]}>
          <Text style={styles.badgeText}>
            {item.tripStatus?.toUpperCase() === 'ASSIGNED'
              ? 'UP COMMING'
              : item.tripStatus?.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.locationRow}>
          <FontAwesome6 name="location-dot" size={20} color="#042f40" style={styles.locationIcon} />
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>From</Text>
            <Text style={styles.locationTitle}>{item.tripNameStartLocation}</Text>
            <Text style={styles.infoText}>
              Appt #:{' '}
              {`${
                item.tripStart
                  ? new Date(item.tripStart).toLocaleDateString('us-Us', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : 'N/A'
              } `}
            </Text>
            <Text style={styles.locationText}>{item.tripStartLocation ?? 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.arrowContainer}>
          <FontAwesome6 name="arrow-down" size={18} color="#042f40" />
        </View>

        <View style={styles.locationRow}>
          <FontAwesome6 name="location-dot" size={20} color="#F44336" style={styles.locationIcon} />
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>To</Text>
            <Text style={styles.locationTitle}>{item.tripNameEndLocation}</Text>
            <Text style={styles.infoText}>
              Appt #:{' '}
              {`${
                item.tripEnd
                  ? new Date(item.tripEnd).toLocaleDateString('us-Us', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : 'N/A'
              } `}
            </Text>
            <Text style={styles.locationText}>{item.tripEndLocation ?? 'N/A'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.footerRow}>
          <View style={styles.infoItem}>
            <FontAwesome6 name="user" size={16} color="#6B7280" />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.customer ?? 'N/A'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <FontAwesome6 name="truck" size={16} color="#6B7280" />
            <Text style={styles.infoText}>{item.vehicle ?? 'N/A'}</Text>
          </View>
        </View>
        <View style={styles.footerRow}>
          <View style={styles.infoItem}>
            <FontAwesome6 name="user-tie" size={16} color="#6B7280" />
            <Text style={styles.infoText}>{item.dispatcher ?? 'N/A'}</Text>
          </View>
          <View style={styles.infoItem}>
            <FontAwesome6 name="trailer" size={16} color="#6B7280" />
            <Text style={styles.infoText}>
              {item.trailer?.replace(/\s*Mounted\s+.*/i, '') ?? 'N/A'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Custom Header with Back Button */}
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            }
          }}>
          <FontAwesome6 name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Trips</Text>
        <View style={styles.headerRightSpace} />
      </View>

      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <FontAwesome6
            name="magnifying-glass"
            size={20}
            color="#9CA3AF"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search trips..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}>
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}
            onPress={() => setFilter('pending')}>
            <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
              Pending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'in-progress' && styles.filterButtonActive]}
            onPress={() => setFilter('in-progress')}>
            <Text style={[styles.filterText, filter === 'in-progress' && styles.filterTextActive]}>
              Active
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredTrips}
        renderItem={renderTripCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#042f40" />
              <Text style={styles.loadingText}>Loading trips...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <FontAwesome6 name="map-location" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>No trips found</Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerRightSpace: {
    width: 40,
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#042f40',
  },
  filterText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fareText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  routeContainer: {
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  locationIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  locationText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7e7e7eff',
  },
  arrowContainer: {
    marginLeft: 28,
    marginBottom: 8,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    gap: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    maxWidth: 180,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default DashboardScreen;
