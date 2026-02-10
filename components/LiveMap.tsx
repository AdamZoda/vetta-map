
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Store, Driver, User, Order } from '../types';
import { StoreIcon, DriverIdleIcon, DriverBusyIcon, UserIdleIcon, UserActiveIcon } from './MarkerIcons';
import { INITIAL_CENTER } from '../constants';

interface MapProps {
  stores: Store[];
  drivers: Driver[];
  users: User[];
  orders: Order[];
  selectedOrderId: string | null;
}

const LiveMap: React.FC<MapProps> = ({ stores, drivers, users, orders, selectedOrderId }) => {
  const selectedOrder = orders.find(o => o.id === selectedOrderId);
  const activeUser = selectedOrder ? users.find(u => u.id === selectedOrder.userId) : null;
  const activeStore = selectedOrder ? stores.find(s => s.id === selectedOrder.storeId) : null;
  const activeDriver = selectedOrder?.assignedDriverId ? drivers.find(d => d.id === selectedOrder.assignedDriverId) : null;

  return (
    <div className="w-full h-full relative">
      <MapContainer 
        center={INITIAL_CENTER} 
        zoom={13} 
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {stores.map(store => (
          <Marker key={store.id} position={[store.lat, store.lng]} icon={StoreIcon}>
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-gray-800">{store.name}</h3>
                <p className="text-xs text-gray-500">{store.address}</p>
                <div className="mt-2 text-[10px] bg-red-50 text-red-600 font-bold px-2 py-1 rounded">Magasin Partenaire</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {drivers.map(driver => {
          const isBusy = driver.status === 'busy';
          const currentOrder = orders.find(o => o.assignedDriverId === driver.id && o.status !== 'delivered');
          const destinationUser = currentOrder ? users.find(u => u.id === currentOrder.userId) : null;

          return (
            <Marker 
              key={driver.id} 
              position={[driver.lat, driver.lng]} 
              icon={isBusy ? DriverBusyIcon : DriverIdleIcon}
            >
              <Popup>
                <div className="p-2 min-w-[150px]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${isBusy ? 'bg-red-500' : 'bg-black'}`}></div>
                    <h3 className="font-bold">Livreur: {driver.name}</h3>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    Statut: {isBusy ? 'En livraison' : 'Disponible'}
                  </p>
                  {currentOrder && destinationUser && (
                    <div className="border-t pt-2 mt-2">
                      <p className="text-[10px] font-bold text-red-500 uppercase">Mission en cours</p>
                      <p className="text-xs font-semibold">Vers: {destinationUser.name}</p>
                      <p className="text-[10px] text-gray-400">Commande #{currentOrder.id}</p>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {users.map(user => {
          const isOrdering = user.isOrdering;
          const currentOrder = orders.find(o => o.userId === user.id && o.status !== 'delivered');
          const assignedDriver = currentOrder?.assignedDriverId ? drivers.find(d => d.id === currentOrder.assignedDriverId) : null;

          return (
            <Marker 
              key={user.id} 
              position={[user.lat, user.lng]} 
              icon={isOrdering ? UserActiveIcon : UserIdleIcon}
            >
              <Popup>
                <div className="p-2 min-w-[150px]">
                  <h3 className="font-bold text-indigo-600">Client: {user.name}</h3>
                  <p className="text-xs mb-2">
                    Statut: <span className={isOrdering ? 'text-green-600 font-bold' : 'text-gray-500'}>
                      {isOrdering ? 'Commande Active' : 'Aucune activité'}
                    </span>
                  </p>
                  {currentOrder && (
                    <div className="border-t pt-2 mt-2 bg-green-50 p-2 rounded">
                      <p className="text-[10px] font-bold text-green-700 uppercase">Détails Commande</p>
                      <p className="text-xs font-medium">Etat: {currentOrder.status}</p>
                      {assignedDriver && (
                        <p className="text-[10px] text-green-600">Livreur: {assignedDriver.name}</p>
                      )}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {selectedOrder && activeUser && activeStore && (
          <>
            <Polyline 
              positions={[[activeStore.lat, activeStore.lng], [activeUser.lat, activeUser.lng]]} 
              color="#22c55e" 
              dashArray="10, 10" 
              weight={2}
            />
            {activeDriver && (
              <Polyline 
                positions={[[activeDriver.lat, activeDriver.lng], [activeStore.lat, activeStore.lng]]} 
                color="#ef4444" 
                weight={3}
              />
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
