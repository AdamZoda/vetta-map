
import React from 'react';
import { Store, Driver, User } from './types';

// Morocco Coordinates (Casablanca)
export const INITIAL_CENTER: [number, number] = [33.5731, -7.5898];

export const MOCK_STORES: Store[] = [
  { id: 's1', name: 'McDonald\'s Maarif', lat: 33.5822, lng: -7.6325, type: 'restaurant', address: 'Boulvard Al Massira Al Khadra' },
  { id: 's2', name: 'Burger King Anfa', lat: 33.5951, lng: -7.6432, type: 'restaurant', address: 'Bd de la Corniche' },
  { id: 's3', name: 'Carrefour Market Gauthier', lat: 33.5864, lng: -7.6252, type: 'grocery', address: 'Rue de la Liberté' },
  { id: 's4', name: 'Pharmacie du Port', lat: 33.5990, lng: -7.6150, type: 'pharmacy', address: 'Place des Nations Unies' },
];

export const MOCK_DRIVERS: Driver[] = [
  { id: 'd1', name: 'Yassine', lat: 33.5850, lng: -7.6100, status: 'available', lastUpdated: Date.now() },
  { id: 'd2', name: 'Fatima', lat: 33.5750, lng: -7.6300, status: 'available', lastUpdated: Date.now() },
  { id: 'd3', name: 'Omar', lat: 33.5900, lng: -7.6500, status: 'busy', lastUpdated: Date.now() },
];

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Khalid Alami', lat: 33.5780, lng: -7.6200, isOrdering: false },
  { id: 'u2', name: 'Siham Tazi', lat: 33.5650, lng: -7.6400, isOrdering: true, activeOrderId: 'o1' },
];
