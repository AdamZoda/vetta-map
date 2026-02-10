
export type LatLng = [number, number];

export interface Store {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'restaurant' | 'grocery' | 'pharmacy';
  address: string;
}

export interface Driver {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'available' | 'busy' | 'offline';
  lastUpdated: number;
}

export interface User {
  id: string;
  name: string;
  lat: number;
  lng: number;
  isOrdering: boolean;
  activeOrderId?: string;
}

export interface Order {
  id: string;
  userId: string;
  storeId: string;
  status: 'pending' | 'assigned' | 'in-transit' | 'delivered';
  assignedDriverId?: string;
  timestamp: number;
}

export interface AIRecommendation {
  suggestedDriverId: string;
  reasoning: string;
  estimatedTime: string;
}
