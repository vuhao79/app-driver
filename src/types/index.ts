export interface Trip {
  id: number;
  tripID: string;
  tripStatus: string;
  driver: string;
  driverId: string;
  revenue: string;
  dispatcher: string;
  dispatcherId: string | null;
  vehicle: string;
  vehicleId: number;
  trailer: string;
  trailerId: number;
  chassis: string | null;
  container: string;
  legs: number;
  tripStartLocation: string;
  tripEndLocation: string;
  tripStart: string;
  tripEnd: string;
  loadID: number;
  manifestID: string;
  customer: string;
  reference: string;
  settlementStatus: string;
  settlementAmount: string;
  tripMiles: number;
  emptyMiles: number;
  dispatcherTerminal: string | null;
  createdDatetime: string;
  delay: boolean;
  dispatcherNotes: string | null;
  seal: string;
  requiredEquipmentType: string;
  commondityType: string;
  pickupStatus: string | null;
  deliveryStatus: string | null;
  pickUpNameLocation: string;
  pickUpAddress: string;
  dropOffNameLocation: string;
  dropOffAddress: string;
  customerAddress: string;
  trailerStatus: string | null;
  pickUpAppointment: string;
  deliveryAppointment: string | null;
  returnAppointment: string;
  bookingAppointment: string | null;
  no: number;
  customerContact: string | null;
  tripNameStartLocation: string;
  tripNameEndLocation: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleNumber: string;
  rating: number;
}

export interface TripRouteDetail {
  id: number;
  loadId: number;
  activity: string;
  activityId: number;
  startedDate: string;
  endDate: string | null;
  address: string;
  tripID: string;
  type: number;
  no: number;
  businessName: string;
  city: string;
  state: string;
  handlingTime: string;
  arrive: string | null;
  arriveStatus: string;
  timeAtLocation: string;
  depart: string | null;
  departStatus: string;
  check: number;
  isArrive: boolean;
  isDepart: boolean;
  notes: string | null;
  driverAssist: boolean;
  reference: string | null;
}
export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  emailConfirmed: boolean;
  phoneNumber: string;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lockoutEnd: string | null;
  lockoutEnabled: boolean;
  accessFailedCount: number;
  avatar: string | null;
  primaryDispatcherId: string;
  primaryDispatcherName: string;
  employmentTypeId: string | null;
  employmentTypeName: string | null;
  operationTypeId: string | null;
  operationTypeName: string | null;
  address: string;
  primaryTerminalId: string | null;
  primaryTerminalName: string | null;
  ecFirstName: string | null;
  ecLastName: string;
  ecPhoneNumber: string;
  ecMail: string | null;
  ecAddress: string;
  role: string;
  teamDriverId: number;
}
