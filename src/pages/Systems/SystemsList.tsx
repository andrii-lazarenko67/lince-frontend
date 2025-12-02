import React, { useState } from 'react';
import { useAppSelector, useAppNavigation } from '../../hooks';
import { Table, Badge, Button } from '../../components/common';
import { ChevronRight, ExpandMore, AccountTree, Add } from '@mui/icons-material';
import type { System } from '../../types';
import SystemForm from './SystemForm';

const SystemsList: React.FC = () => {
  const { systems } = useAppSelector((state) => state.systems);
  const { goToSystemDetail } = useAppNavigation();
  const [expandedSystems, setExpandedSystems] = useState<Set<number>>(new Set());
  const [isSubSystemFormOpen, setIsSubSystemFormOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);

  const handleCloseSubSystemForm = () => {
    setIsSubSystemFormOpen(false);
    setSelectedParentId(null);
  };

  // Build hierarchical data structure
  const buildHierarchy = (): System[] => {
    const result: System[] = [];
    const systemsMap = new Map<number, System>();

    // First pass: create map of all systems
    systems.forEach(system => {
      systemsMap.set(system.id, { ...system });
    });

    // Second pass: build hierarchy
    systems.forEach(system => {
      if (!system.parentId) {
        result.push(systemsMap.get(system.id)!);
      }
    });

    return result;
  };

  const toggleExpand = (systemId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedSystems);
    if (newExpanded.has(systemId)) {
      newExpanded.delete(systemId);
    } else {
      newExpanded.add(systemId);
    }
    setExpandedSystems(newExpanded);
  };

  const flattenWithChildren = (): Array<System & { level: number; hasChildren: boolean }> => {
    const result: Array<System & { level: number; hasChildren: boolean }> = [];

    const addSystem = (system: System, level: number) => {
      const hasChildren = (system.children?.length || 0) > 0;
      result.push({ ...system, level, hasChildren });

      if (hasChildren && expandedSystems.has(system.id)) {
        system.children?.forEach(child => {
          const fullChild = systems.find(s => s.id === child.id);
          if (fullChild) {
            addSystem(fullChild, level + 1);
          }
        });
      }
    };

    const rootSystems = buildHierarchy();
    rootSystems.forEach(system => addSystem(system, 0));

    return result;
  };

  const hierarchicalSystems = flattenWithChildren();

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (item: System & { level: number; hasChildren: boolean }) => (
        <div className="flex items-center" style={{ paddingLeft: `${item.level * 24}px` }}>
          {item.hasChildren && (
            <button
              onClick={(e) => toggleExpand(item.id, e)}
              className="mr-2 text-gray-500 hover:text-gray-700"
            >
              {expandedSystems.has(item.id) ? (
                <ExpandMore fontSize="small" />
              ) : (
                <ChevronRight fontSize="small" />
              )}
            </button>
          )}
          {!item.hasChildren && item.level > 0 && (
            <span className="mr-2 text-gray-400">
              <AccountTree fontSize="small" />
            </span>
          )}
          <span className="font-medium text-gray-900">{item.name}</span>
          {item.hasChildren && (
            <span className="ml-2 text-xs text-gray-500">
              ({item.children?.length} sub-system{(item.children?.length || 0) !== 1 ? 's' : ''})
            </span>
          )}
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (system: System) => (
        <span className="capitalize">{system.type}</span>
      )
    },
    {
      key: 'location',
      header: 'Location',
      render: (system: System) => system.location || '-'
    },
    {
      key: 'status',
      header: 'Status',
      render: (system: System) => (
        <Badge variant={system.status === 'active' ? 'success' : 'secondary'}>
          {system.status}
        </Badge>
      )
    },
    {
      key: 'monitoringPoints',
      header: 'Monitoring Points',
      render: (system: System) => system.monitoringPoints?.length || 0
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (system: System) => new Date(system.createdAt).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: System & { level: number; hasChildren: boolean }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedParentId(item.id);
              setIsSubSystemFormOpen(true);
            }}
          >
            <Add fontSize="small" className="mr-1" />
            Sub-System
          </Button>
        </div>
      )
    }
  ];

  return (
    <>
      <Table
        columns={columns}
        data={hierarchicalSystems}
        keyExtractor={(system) => system.id}
        onRowClick={(system) => goToSystemDetail(system.id)}
        emptyMessage="No systems found. Click 'Add System' to create one."
      />

      <SystemForm
        isOpen={isSubSystemFormOpen}
        onClose={handleCloseSubSystemForm}
        parentId={selectedParentId}
      />
    </>
  );
};

export default SystemsList;
