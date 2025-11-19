import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/api';
import { Trip, TripRouteDetail } from '../types';

const TripDetailScreen = ({ route, navigation }: any) => {
  const [trip, setTrip] = useState<Trip>(route.params.trip);
  const [routeDetails, setRouteDetails] = useState<TripRouteDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRouteDetails();
  }, []);

  const loadRouteDetails = async () => {
    try {
      setLoading(true);
      const details = await ApiService.getTripRouteDetails(trip.id);
      setRouteDetails(details.sort((a, b) => a.no - b.no));
    } catch (error) {
      console.error('Error loading route details:', error);
      Alert.alert('Error', 'Failed to load route details');
    } finally {
      setLoading(false);
    }
  };

  const refreshTripData = async () => {
    try {
      setRefreshing(true);
      const trips = await ApiService.getTrips();
      const updatedTrip = trips.find((t) => t.id === trip.id);
      if (updatedTrip) {
        setTrip(updatedTrip);
      }
      await loadRouteDetails();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getNextAction = (): { stop: TripRouteDetail; action: 'arrive' | 'depart' } | null => {
    for (const stop of routeDetails) {
      if (!stop.isArrive) {
        return { stop, action: 'arrive' };
      }
      if (!stop.isDepart) {
        return { stop, action: 'depart' };
      }
    }
    return null;
  };

  const handleCheckIn = async (stop: TripRouteDetail, action: 'arrive' | 'depart') => {
    const nextAction = getNextAction();
    if (!nextAction || nextAction.stop.id !== stop.id || nextAction.action !== action) {
      Alert.alert('Invalid Action', 'Please complete check-ins in order');
      return;
    }

    try {
      setLoading(true);
      if (action === 'arrive') {
        await ApiService.updateArriveStatus(stop.id, true);
        Alert.alert('Success', `Arrived at ${stop.businessName}`);
      } else {
        await ApiService.updateDepartStatus(stop.id, true);
        Alert.alert('Success', `Departed from ${stop.businessName}`);
      }
      await refreshTripData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const upperStatus = status.toUpperCase();
    if (upperStatus.startsWith('PENDING')) return '#FF9800';
    if (upperStatus.startsWith('IN-PROGRESS') || upperStatus.startsWith('IN PROGRESS'))
      return '#042f40';
    if (upperStatus.startsWith('ARRIVED')) return '#9C27B0';
    if (upperStatus.startsWith('DEPARTED')) return '#00BCD4';
    if (upperStatus.startsWith('COMPLETED')) return '#4CAF50';
    return '#042f40';
  };

  const callCustomer = () => {
    Linking.openURL(`tel:${trip.customerContact || ''}`);
  };

  const renderStopCard = (stop: TripRouteDetail, index: number) => {
    const nextAction = getNextAction();
    const isNextStop = nextAction?.stop.id === stop.id;
    const isCompleted = stop.isArrive && stop.isDepart;

    const getActivityIcon = () => {
      if (stop.activity === 'Pickup') return 'cube';
      if (stop.activity === 'Trip Stop') return 'navigate-circle';
      if (stop.activity === 'Delivery') return 'checkmark-done-circle';
      if (stop.activity === 'Return') return 'return-up-back';
      return 'flag';
    };

    const getActivityColor = () => {
      if (stop.activity === 'Pickup') return '#042f40';
      if (stop.activity === 'Delivery') return '#4CAF50';
      if (stop.activity === 'Return') return '#FF9800';
      return '#9C27B0';
    };

    const getStopStatus = () => {
      if (isCompleted) return 'completed';
      if (stop.isArrive && !stop.isDepart) return 'arrived';
      if (isNextStop) return 'active';
      return 'pending';
    };

    const stopStatus = getStopStatus();

    const getStatusBadgeStyle = () => {
      if (stopStatus === 'completed') return { bg: '#E8F5E9', text: '#4CAF50', label: 'Completed' };
      if (stopStatus === 'arrived') return { bg: '#FFF3E0', text: '#FF9800', label: 'At Location' };
      if (stopStatus === 'active') return { bg: '#E3F2FD', text: '#042f40', label: 'Next Stop' };
      return { bg: '#F5F5F5', text: '#9CA3AF', label: 'Pending' };
    };

    const statusStyle = getStatusBadgeStyle();

    return (
      <View key={stop.id} style={styles.stopCard}>
        {/* Status Indicator Line */}
        <View style={[styles.statusLine, { backgroundColor: statusStyle.text }]} />

        {/* Activity Header with Icon */}
        <View style={[styles.activityHeader, { backgroundColor: getActivityColor() + '15' }]}>
          <View style={[styles.activityIconContainer, { backgroundColor: getActivityColor() }]}>
            <Ionicons name={getActivityIcon()} size={24} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.activityLabel}>{stop.activity.toUpperCase()}</Text>
            <Text style={styles.businessNameNew}>{stop.businessName}</Text>
          </View>
          {isCompleted ? (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.completedText}>Done</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                {statusStyle.label}
              </Text>
            </View>
          )}
        </View>

        {/* Address Section */}
        <View style={styles.addressSection}>
          <View style={styles.addressRow}>
            <View style={styles.addressIconBox}>
              <Ionicons name="location" size={16} color="#042f40" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.addressTextNew}>{stop.address}</Text>
              <Text style={styles.cityStateNew}>
                {stop.city}, {stop.state}
              </Text>
            </View>
          </View>
        </View>

        {/* Timeline Info */}
        <View style={styles.timelineContainer}>
          {/* Scheduled Time */}
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: '#ccc' }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Appointment : </Text>
              <Text style={styles.timelineValue}>
                {stop.startedDate
                  ? new Date(stop.startedDate).toLocaleString('us-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </Text>
            </View>
          </View>

          {/* Arrived Time */}
          {stop.isArrive && (
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#4CAF50' }]}>
                <Ionicons name="checkmark" size={10} color="#fff" />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Arrived</Text>
                <Text style={[styles.timelineValue, { color: '#4CAF50', fontWeight: '700' }]}>
                  {stop.arrive
                    ? new Date(stop.arrive).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-'}
                </Text>
              </View>
            </View>
          )}

          {/* Departed Time */}
          {stop.isDepart && (
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#4CAF50' }]}>
                <Ionicons name="checkmark" size={10} color="#fff" />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Departed</Text>
                <Text style={[styles.timelineValue, { color: '#4CAF50', fontWeight: '700' }]}>
                  {stop.depart
                    ? new Date(stop.depart).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Connection Line to Next Stop */}
        {index < routeDetails.length - 1 && (
          <View style={styles.connectionLine}>
            <View style={styles.connectionDots}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>
        )}
      </View>
    );
  };

  const allStopsCompleted = trip.tripStatus.toLowerCase() === 'completed';
  const nextAction = getNextAction();

  const handleBottomButtonPress = async () => {
    if (!nextAction) return;
    await handleCheckIn(nextAction.stop, nextAction.action);
  };

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={{ paddingBottom: nextAction && !allStopsCompleted ? 100 : 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshTripData} />}>
          <View style={styles.content}>
            {/* Trip Header Card */}
            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.tripId}>Trip #{trip.id}</Text>
                <View
                  style={[styles.statusTrip, { backgroundColor: getStatusColor(trip.tripStatus) }]}>
                  <Text
                    style={{
                      color: '#fff',
                      fontWeight: 'bold',
                    }}>
                    {trip.tripStatus.toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Customer</Text>
                <Text style={styles.detailValue}>{trip.customer}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Dispatcher</Text>
                <Text style={styles.detailValue}>{trip.dispatcher || 'N/A'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Vehicle</Text>
                <Text style={styles.detailValue}>{trip.vehicle || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Trailer & Chassis</Text>
                <Text style={styles.detailValue}>
                  {trip.trailer?.replace(/\s*Mounted\s+.*/i, '') || 'N/A'}
                </Text>
              </View>

              {trip.customerContact && (
                <TouchableOpacity style={styles.callButton} onPress={callCustomer}>
                  <Ionicons name="call" size={18} color="#042f40" />
                  <Text style={styles.callButtonText}>Call Customer</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Route Stops Section */}
            <View style={styles.sectionHeader}>
              <Ionicons name="map-outline" size={24} color="#042f40" />
              <Text style={styles.sectionHeaderText}>Route Stops</Text>
            </View>

            {loading && routeDetails.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#042f40" />
                <Text style={styles.loadingText}>Loading route details...</Text>
              </View>
            ) : (
              <>{routeDetails.map((stop, index) => renderStopCard(stop, index))}</>
            )}

            {allStopsCompleted && (
              <View style={styles.completedContainer}>
                <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
                <Text style={styles.completedTitle}>All Stops Completed!</Text>
                <Text style={styles.completedSubtitle}>Great job! This trip is finished.</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Fixed Action Button */}
        {nextAction && !allStopsCompleted && trip.tripStatus.toUpperCase() !== 'ASSIGNED' && (
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity
              style={[
                styles.bottomButton,
                { backgroundColor: nextAction.action === 'arrive' ? '#042f40' : '#FF9800' },
              ]}
              onPress={handleBottomButtonPress}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons
                    name={nextAction.action === 'arrive' ? 'log-in-outline' : 'log-out-outline'}
                    size={24}
                    color="#fff"
                  />
                  <View style={styles.bottomButtonTextContainer}>
                    <Text style={styles.bottomButtonTitle}>
                      {nextAction.action === 'arrive' ? 'Check In (Arrive)' : 'Check Out (Depart)'}
                    </Text>
                    <Text style={styles.bottomButtonSubtitle}>
                      Stop {nextAction.stop.no}: {nextAction.stop.businessName}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tripId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statusText: {
    color: '#494949ff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#042f40',
    marginBottom: 12,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  routeInfo: {
    marginLeft: 12,
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  routeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  routeLine: {
    marginLeft: 10,
    marginVertical: 4,
  },
  lineBar: {
    width: 2,
    height: 32,
    backgroundColor: '#D1D5DB',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    gap: 6,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  fareValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#042f40',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8,
    gap: 8,
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#042f40',
  },
  actionContainer: {
    gap: 12,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#042f40',
    borderRadius: 8,
    paddingVertical: 14,
    gap: 8,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#042f40',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 16,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  completedContainer: {
    backgroundColor: '#F0F9FF',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  completedTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 12,
  },
  completedSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    gap: 8,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  stopCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  statusLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  stopBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  stopBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingRight: 60,
    gap: 12,
  },
  activityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  activityLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  businessNameNew: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: 20,
    maxWidth: '90%',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    position: 'absolute',
    top: 16,
    right: 16,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4CAF50',
  },
  statusTrip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    position: 'absolute',
    top: 16,
    right: 16,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  addressSection: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    gap: 10,
  },
  addressIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressTextNew: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
    fontWeight: '500',
  },
  cityStateNew: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  timelineContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 8,
  },
  timelineLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  timelineValue: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '600',
  },
  connectionLine: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  connectionDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 12,
  },
  bottomButtonTextContainer: {
    flex: 1,
  },
  bottomButtonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  bottomButtonSubtitle: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
});

export default TripDetailScreen;
