
import React, { useState } from 'react';
import { Order, User, Store, Driver, AIRecommendation } from '../types';
import { formatDistance, calculateDistance } from '../utils/geoUtils';

interface SidebarProps {
  orders: Order[];
  users: User[];
  stores: Store[];
  drivers: Driver[];
  selectedOrderId: string | null;
  onSelectOrder: (id: string) => void;
  aiRecommendation: AIRecommendation | null;
  isAiLoading: boolean;
  onAssignDriver: (orderId: string, driverId: string) => void;
  onAddEntity: (type: 'user' | 'driver' | 'store', name: string, lat?: number, lng?: number) => void;
  onSimulateOrder: (userId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  orders, users, stores, drivers,
  selectedOrderId, onSelectOrder,
  aiRecommendation, isAiLoading,
  onAssignDriver, onAddEntity, onSimulateOrder
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'admin'>('orders');
  const [newName, setNewName] = useState('');
  const [newLat, setNewLat] = useState('');
  const [newLng, setNewLng] = useState('');

  const selectedOrder = orders.find(o => o.id === selectedOrderId);
  const activeStore = selectedOrder ? stores.find(s => s.id === selectedOrder.storeId) : null;

  const handleAddStore = () => {
    const lat = parseFloat(newLat);
    const lng = parseFloat(newLng);
    if (!newName || isNaN(lat) || isNaN(lng)) {
      alert("Veuillez remplir le nom et les coordonnées X/Y (Latitude/Longitude)");
      return;
    }
    onAddEntity('store', newName, lat, lng);
    setNewName(''); setNewLat(''); setNewLng('');
  };

  const handleAddAutoLocation = (type: 'user' | 'driver') => {
    if (!newName) {
      alert("Veuillez entrer un nom d'abord");
      return;
    }
    // Simulate getting from DB/GPS
    onAddEntity(type, newName);
    setNewName('');
  };

  return (
    <div className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col h-full shadow-lg z-[1001]">
      <div className="p-6 bg-indigo-700 text-white">
        <h1 className="text-xl font-bold">DeliverDash Admin Morocco</h1>
        <div className="mt-4 flex bg-indigo-800 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'orders' ? 'bg-indigo-600 shadow-sm' : 'hover:bg-indigo-700'}`}
          >
            Commandes
          </button>
          <button 
            onClick={() => setActiveTab('admin')}
            className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'admin' ? 'bg-indigo-600 shadow-sm' : 'hover:bg-indigo-700'}`}
          >
            Administration
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'orders' ? (
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase">Commandes Actives</h2>
            {orders.length === 0 && <p className="text-xs text-gray-400 italic">Aucune commande en attente.</p>}
            {orders.map(order => {
              const user = users.find(u => u.id === order.userId);
              const store = stores.find(s => s.id === order.storeId);
              return (
                <div 
                  key={order.id}
                  onClick={() => onSelectOrder(order.id)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedOrderId === order.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 hover:border-indigo-200'}`}
                >
                  <div className="flex justify-between text-[10px] font-bold mb-1">
                    <span className="text-gray-400">#{order.id}</span>
                    <span className={order.status === 'pending' ? 'text-orange-500' : 'text-green-500'}>{order.status.toUpperCase()}</span>
                  </div>
                  <p className="font-bold text-sm text-gray-800">{store?.name}</p>
                  <p className="text-xs text-gray-500">Client: {user?.name}</p>
                </div>
              );
            })}

            {selectedOrder && activeStore && (
              <div className="mt-6 border-t pt-4 space-y-4">
                <h3 className="text-xs font-bold text-indigo-600">Assistant IA Dispatch</h3>
                {isAiLoading ? (
                  <div className="animate-pulse text-xs text-gray-400">Analyse de la meilleure route...</div>
                ) : aiRecommendation ? (
                  <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                    <p className="text-xs font-bold mb-1">Suggéré: {drivers.find(d => d.id === aiRecommendation.suggestedDriverId)?.name}</p>
                    <p className="text-[10px] text-gray-600 italic">"{aiRecommendation.reasoning}"</p>
                    <button 
                      onClick={() => onAssignDriver(selectedOrder.id, aiRecommendation.suggestedDriverId)}
                      className="w-full mt-2 py-2 bg-indigo-600 text-white rounded text-xs font-bold"
                    >
                      Confirmer le Dispatch
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl space-y-3">
              <h2 className="text-sm font-bold text-gray-700">Ajouter une entité</h2>
              <div className="space-y-2">
                <input 
                  type="text" 
                  placeholder="Nom de l'entité" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="number" 
                    placeholder="Lat (X)" 
                    value={newLat}
                    onChange={(e) => setNewLat(e.target.value)}
                    className="p-2 border rounded text-xs outline-none"
                  />
                  <input 
                    type="number" 
                    placeholder="Lng (Y)" 
                    value={newLng}
                    onChange={(e) => setNewLng(e.target.value)}
                    className="p-2 border rounded text-xs outline-none"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <button 
                  onClick={handleAddStore}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded text-[10px] font-bold shadow-sm transition-colors"
                >
                  Ajouter Magasin (via X/Y)
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleAddAutoLocation('driver')}
                    className="bg-black hover:bg-gray-800 text-white py-2 rounded text-[10px] font-bold shadow-sm transition-colors"
                  >
                    Livreur (Auto GPS)
                  </button>
                  <button 
                    onClick={() => handleAddAutoLocation('user')}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 rounded text-[10px] font-bold shadow-sm transition-colors"
                  >
                    Client (Auto GPS)
                  </button>
                </div>
                <p className="text-[9px] text-gray-400 italic text-center">
                  * Livreurs et Clients récupèrent la position GPS de la base de données.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-xs font-bold text-gray-400 uppercase">Simuler une commande</h2>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {users.filter(u => !u.isOrdering).map(user => (
                  <div key={user.id} className="flex justify-between items-center p-2 bg-white border rounded-lg">
                    <span className="text-xs font-medium">{user.name}</span>
                    <button 
                      onClick={() => onSimulateOrder(user.id)}
                      className="px-2 py-1 bg-green-600 text-white text-[10px] font-bold rounded"
                    >
                      Commander
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
