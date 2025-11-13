import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginRequest, LoginResponse, Trip, UserProfile, TripRouteDetail } from '../types';

const API_BASE_URL = 'http://api.test.acexustrans.com/api'; // Replace with your actual API URL

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await this.clearToken();
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management
  async saveToken(token: string): Promise<void> {
    this.token = token;
    await AsyncStorage.setItem('authToken', token);
  }

  async getToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await AsyncStorage.getItem('authToken');
    }
    return this.token;
  }

  async clearToken(): Promise<void> {
    this.token = null;
    await AsyncStorage.removeItem('authToken');
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    
    const response = await this.api.post<LoginResponse>('/account/login', credentials);
    if (response.data.token) {
      await this.saveToken(response.data.token);
    }
    await this.getDriverId();
    return response.data;
  }

  async getDriverId(): Promise<string | null> {
    const token = await this.getToken();
    if (!token) return null;
    const response = await this.api.get('/Settings_Users/GetMainUserById');
    
    if(response.data.data) {
   
         await AsyncStorage.setItem('id', response.data.data.userId);
         await AsyncStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data.data.userId;
  }

  async logout(): Promise<void> {
    await this.clearToken();
  }

  // Trips
  async getTrips(): Promise<Trip[]> {
    const id = await AsyncStorage.getItem('id');
    if (!id) return [];
    
    const response = await this.api.get<any>('/Loads_Trips/Trip_ListByDriver', {
      params: { DriverId: id }
    });
    
    return response.data.data || [];
  }

  async getTripById(tripId: string): Promise<Trip> {
    const response = await this.api.get<Trip>(`/trips/${tripId}`);
    return response.data;
  }

  async updateTripStatus(tripId: string, status: string): Promise<Trip> {
    const response = await this.api.patch<Trip>(`/trips/${tripId}/status`, {
      status,
      timestamp: new Date().toISOString(),
    });
    return response.data;
  }

  async markArrived(tripId: string): Promise<Trip> {
    return this.updateTripStatus(tripId, 'arrived');
  }

  async markDeparted(tripId: string): Promise<Trip> {
    return this.updateTripStatus(tripId, 'departed');
  }

  async completeTrip(tripId: string): Promise<Trip> {
    return this.updateTripStatus(tripId, 'completed');
  }

  // Trip Route Details
  async getTripRouteDetails(tripId: number): Promise<TripRouteDetail[]> {
    const response = await this.api.get<any>(`/Loads_Trips/TripRouteDetail`, {
      params: { tripId }
    });
    return response.data.data || [];
  }

  async updateArriveStatus(routeId: number, isArrive: boolean): Promise<void> {
    await this.api.put('/Loads_Trips/Trip_UpdateArriveOrDepart', {
      tripId: routeId,
      arriveStatus : isArrive,
      arriveTime: new Date().toISOString()
    });
  }

  async updateDepartStatus(routeId: number, isDepart: boolean): Promise<void> {
   try {
    
     await this.api.put('/Loads_Trips/Trip_UpdateArriveOrDepart', {
      tripId: routeId,
      departStatus : isDepart,
      departTime: new Date().toISOString()
    });
   
   }
    catch (error) {
      console.error('Error updating depart status:', error);
    }
  }

  // User Profile
  async getProfile(): Promise<UserProfile> {
    const response = await this.api.get<UserProfile>('/profile');
    return response.data;
  }

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const response = await this.api.put<UserProfile>('/profile', profile);
    return response.data;
  }
}

export default new ApiService();
