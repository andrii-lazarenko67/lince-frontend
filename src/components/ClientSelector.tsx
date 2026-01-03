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
      dispatch(fetchClients());
      dispatch(loadSelectedClientFromStorage());
    }
  }, [dispatch, isServiceProvider]);

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
        <option value="" className="text-gray-900">
          {t('settings.clients.allClients')}
        </option>
        {clients.map((client) => (
          <option key={client.id} value={client.id} className="text-gray-900">
            {client.name}
          </option>
        ))}
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
