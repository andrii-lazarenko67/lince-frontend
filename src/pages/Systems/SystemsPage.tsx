import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../../hooks';
import { fetchSystems } from '../../store/slices/systemSlice';
import { Card, Button } from '../../components/common';
import { SystemsList, SystemForm } from './sections';

const SystemsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchSystems());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Systems</h1>
          <p className="text-gray-500 mt-1">Manage your water treatment systems</p>
        </div>
        <Button variant="primary" onClick={() => setIsFormOpen(true)}>
          Add System
        </Button>
      </div>

      <Card noPadding>
        <SystemsList />
      </Card>

      <SystemForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
};

export default SystemsPage;
