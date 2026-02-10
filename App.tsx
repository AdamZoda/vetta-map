
import React, { useState, useEffect, useCallback } from 'react';
import LiveMap from './components/LiveMap';
import Sidebar from './components/Sidebar';
import { MOCK_STORES, MOCK_DRIVERS, MOCK_USERS } from './constants';
import { Store, Driver, User, Order, AIRecommendation } from './types';
import { getDispatchRecommendation } from './services/geminiService';
import { INITIAL_CENTER } from './constants';

const App: React.FC = () => {
  const [stores, setStores] = useState<Store[]>(MOCK_STORES);
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [aiRec, setAiRec] = useState<AIRecommendation | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Simulation mouvement livreurs
  useEffect(() => {
    const interval = setInterval(() => {
      setDrivers(prev => prev.map(d => {
        if (d.status === 'offline') return d;
        // Simulating slow movement
        const latDelta = (Math.random() - 0.5) * 0.0002;
        const lngDelta = (Math.random() - 0.5) * 0.0002;
        return { ...d, lat: d.lat + latDelta, lng: d.lng + lngDelta };
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Dispatch AI
  useEffect(() => {
    if (!selectedOrderId) return;
    const order = orders.find(o => o.id === selectedOrderId);
    if (!order || order.status !== 'pending') return;

    const user = users.find(u => u.id === order.userId);
    const store = stores.find(s => s.id === order.storeId);
    if (user && store) {
      setIsAiLoading(true);
      getDispatchRecommendation(selectedOrderId, user, store, drivers)
        .then(rec => setAiRec(rec))
        .finally(() => setIsAiLoading(false));
    }
  }, [selectedOrderId, orders, drivers, users, stores]);

  const handleAddEntity = (type: 'user' | 'driver' | 'store', name: string, lat?: number, lng?: number) => {
    if (!name) return;
    const id = `${type}_${Date.now()}`;
    
    // Default location calculation (simulating "Fetch from GPS/DB")
    const defaultLat = INITIAL_CENTER[0] + (Math.random() - 0.5) * 0.04;
    const defaultLng = INITIAL_CENTER[1] + (Math.random() - 0.5) * 0.04;

    const finalLat = lat ?? defaultLat;
    const finalLng = lng ?? defaultLng;

    if (type === 'user') {
      setUsers(prev => [...prev, { id, name, lat: finalLat, lng: finalLng, isOrdering: false }]);
    } else if (type === 'driver') {
      setDrivers(prev => [...prev, { id, name, lat: finalLat, lng: finalLng, status: 'available', lastUpdated: Date.now() }]);
    } else {
      setStores(prev => [...prev, { id, name, lat: finalLat, lng: finalLng, type: 'restaurant', address: 'Casablanca, Morocco' }]);
    }
  };

  const handleSimulateOrder = (userId: string) => {
    if (stores.length === 0) {
      alert("Ajoutez un magasin d'abord!");
      return;
    }
    const randomStore = stores[Math.floor(Math.random() * stores.length)];
    const orderId = `order_${Date.now()}`;
    
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isOrdering: true } : u));
    setOrders(prev => [...prev, {
      id: orderId,
      userId,
      storeId: randomStore.id,
      status: 'pending',
      timestamp: Date.now()
    }]);
    setSelectedOrderId(orderId);
  };

  const handleAssignDriver = useCallback((orderId: string, driverId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'assigned', assignedDriverId: driverId } : o));
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status: 'busy' } : d));
    setAiRec(null);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      <Sidebar 
        orders={orders}
        users={users}
        stores={stores}
        drivers={drivers}
        selectedOrderId={selectedOrderId}
        onSelectOrder={setSelectedOrderId}
        aiRecommendation={aiRec}
        isAiLoading={isAiLoading}
        onAssignDriver={handleAssignDriver}
        onAddEntity={handleAddEntity}
        onSimulateOrder={handleSimulateOrder}
      />
      
      <main className="flex-1 relative">
        <LiveMap 
          stores={stores}
          drivers={drivers}
          users={users}
          orders={orders}
          selectedOrderId={selectedOrderId}
        />
        
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            <div className="bg-white/90 p-3 rounded-lg shadow-md border text-[10px] font-bold uppercase tracking-wider">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-green-700">{users.filter(u => u.isOrdering).length} Clients actifs</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-red-700">{drivers.filter(d => d.status === 'busy').length} En livraison</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-black rounded-full"></span>
                  <span className="text-gray-800">{drivers.filter(d => d.status === 'available').length} Livreurs libres</span>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;
