import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/api';
import { Trip } from '../types';

const TripHistoryScreen = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalEarnings: 0,
    avgFare: 0,
    thisWeek: 0,
  });

  useEffect(() => {
    loadTripHistory();
  }, []);

  const loadTripHistory = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getTrips();

      const completedTrips = data.filter((trip: Trip) => trip.tripStatus === 'Completed');
      setTrips(completedTrips);
      calculateStats(completedTrips);
    } catch (error) {
      console.error('Error loading trip history:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTripHistory();
    setRefreshing(false);
  };

  const calculateStats = (completedTrips: Trip[]) => {
    const totalTrips = completedTrips.length;
    const totalEarnings = completedTrips.reduce(
      (sum, trip) => sum + parseFloat(trip.revenue || '0'),
      0,
    );
    const avgFare = totalTrips > 0 ? totalEarnings / totalTrips : 0;
    const thisWeek = totalTrips; // Simplified for demo

    setStats({
      totalTrips,
      totalEarnings,
      avgFare,
      thisWeek,
    });
  };

  const getDemoCompletedTrips = (): Trip[] => {
    return [];
  };

  const renderStatCard = (title: string, value: string, icon: string, color: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIconContainer}>
        <Ionicons name={icon as any} size={32} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const renderTripItem = ({ item }: { item: Trip }) => (
    <View style={styles.tripCard}>
      <View style={styles.tripHeader}>
        <Text style={styles.tripDate}>#{item.id}</Text>
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>COMPLETED</Text>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={20} color="#042f40" style={styles.icon} />
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>From</Text>
            <Text style={styles.locationText}>{item.pickUpNameLocation}</Text>
          </View>
        </View>

        <View style={styles.arrowContainer}>
          <Ionicons name="arrow-down" size={16} color="#9CA3AF" />
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location" size={20} color="#F44336" style={styles.icon} />
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>To</Text>
            <Text style={styles.locationText}>{item.dropOffNameLocation}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.tripFooter}>
        <View style={styles.footerLeft}>
          <View style={styles.infoItem}>
            <Ionicons name="person" size={16} color="#6B7280" />
            <Text style={styles.infoText}>{item.customer}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#042f40" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Trip History</Text>
          {/* <Text style={styles.headerSubtitle}>Your completed trips and earnings</Text> */}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            {renderStatCard('Total Trips', stats.totalTrips.toString(), 'car-sport', '#042f40')}
            {renderStatCard('This Week', stats.thisWeek.toString(), 'calendar', '#00BCD4')}
          </View>
          {/* <View style={styles.statsRow}>
            {renderStatCard('Total Earnings', `$${stats.totalEarnings.toFixed(2)}`, 'cash', '#4CAF50')}
            {renderStatCard('Avg Fare', `$${stats.avgFare.toFixed(2)}`, 'trending-up', '#FF9800')}
          </View> */}
        </View>

        {/* Trip List */}
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Recent Completed Trips</Text>

          {trips.length > 0 ? (
            <FlatList
              data={trips}
              renderItem={renderTripItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyText}>No completed trips yet</Text>
              <Text style={styles.emptySubtext}>Your completed trips will appear here</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#042f40',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginTop: -32,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIconContainer: {
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
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 12,
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripDate: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
    color: '#042f40',
  },
  completedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  completedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  routeContainer: {
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  icon: {
    marginRight: 8,
    marginTop: 2,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
  },
  arrowContainer: {
    marginLeft: 28,
    marginVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
  },
  fareText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
});

export default TripHistoryScreen;
