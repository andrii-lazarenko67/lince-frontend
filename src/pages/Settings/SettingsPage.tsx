import React from 'react';
import { Card } from '../../components/common';

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">System configuration and preferences</p>
        </div>
      </div>

      <Card title="System Settings">
        <p className="text-gray-500">
          System-wide configuration options will be available here.
        </p>
      </Card>
    </div>
  );
};

export default SettingsPage;
