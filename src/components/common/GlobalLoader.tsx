import React from 'react';
import { useAppSelector } from '../../hooks';

const GlobalLoader: React.FC = () => {
  const { loading } = useAppSelector((state) => state.ui);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-10">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export default GlobalLoader;
