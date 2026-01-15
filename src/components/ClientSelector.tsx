import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchClients, setSelectedClient, loadSelectedClientFromStorage } from '../store/slices/clientSlice';

const ClientSelector: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { clients, selectedClientId } = useAppSelector((state) => state.clients);

  const isServiceProvider = user?.isServiceProvider;

  useEffect(() => {
    if (isServiceProvider) {
      // Fetch all clients for the selector dropdown (use high limit to get all)
      dispatch(fetchClients({ limit: 100 }));
      dispatch(loadSelectedClientFromStorage());
    }
  }, [dispatch, isServiceProvider]);

  // Auto-select first client if none is selected (required for service providers)
  useEffect(() => {
    if (isServiceProvider && clients.length > 0 && !selectedClientId) {
      dispatch(setSelectedClient(clients[0].id));
    }
  }, [dispatch, isServiceProvider, clients, selectedClientId]);

  if (!isServiceProvider) {
    return null;
  }

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    dispatch(setSelectedClient(value ? parseInt(value, 10) : null));
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedClientId || ''}
        onChange={handleClientChange}
        className="bg-white/10 text-white text-sm rounded-md border border-white/20 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer min-w-[150px]"
      >
        {clients.length === 0 ? (
          <option value="" className="text-gray-900">
            {t('settings.clients.noClients')}
          </option>
        ) : (
          clients.map((client) => (
            <option key={client.id} value={client.id} className="text-gray-900">
              {client.name}
            </option>
          ))
        )}
      </select>
      {selectedClient && (
        <span className="text-xs text-white/70 hidden md:inline">
          {selectedClient.name}
        </span>
      )}
    </div>
  );
};

export default ClientSelector;
