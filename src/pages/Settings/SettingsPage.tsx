import React, { useState } from 'react';
import ParametersSection from './ParametersSection';
import UnitsSection from './UnitsSection';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'parameters' | 'units'>('parameters');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">System configuration and preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('parameters')}
            className={`${
              activeTab === 'parameters'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Parameters
          </button>
          <button
            onClick={() => setActiveTab('units')}
            className={`${
              activeTab === 'units'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Units
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'parameters' && <ParametersSection />}
      {activeTab === 'units' && <UnitsSection />}
    </div>
  );
};

export default SettingsPage;
