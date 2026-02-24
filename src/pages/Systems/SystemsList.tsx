import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppNavigation, useAppDispatch, usePagination } from '../../hooks';
import { PaginatedTable, Badge, Button } from '../../components/common';
import { ChevronRight, ExpandMore, AccountTree, Add } from '@mui/icons-material';
import type { System } from '../../types';
import SystemForm from './SystemForm';
import { fetchSystems } from '../../store/slices/systemSlice';

const SystemsList: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { systems, pagination, loading } = useAppSelector((state) => state.systems);
  const { selectedClientId } = useAppSelector((state) => state.clients);
  const { goToSystemDetail } = useAppNavigation();
  const [expandedSystems, setExpandedSystems] = useState<Set<number>>(new Set());
  const [isStageFormOpen, setIsStageFormOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);

  // Use the pagination hook
  const {
    page,
    rowsPerPage,
    apiPage,
    apiLimit,
    handleChangePage,
    handleChangeRowsPerPage
  } = usePagination({ initialRowsPerPage: 25 });

  // Load systems - re-fetch when client or pagination changes
  const loadSystems = useCallback(() => {
    dispatch(fetchSystems({ page: apiPage, limit: apiLimit }));
  }, [dispatch, apiPage, apiLimit, selectedClientId]);

  // Initial load and when pagination or selected client changes
  useEffect(() => {
    loadSystems();
  }, [loadSystems]);

  const handleCloseStageForm = () => {
    setIsStageFormOpen(false);
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
      header: t('common.name'),
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
              ({item.children?.length})
            </span>
          )}
        </div>
      )
    },
    {
      key: 'type',
      header: t('common.type'),
      render: (system: System) => (
        <span>{system.systemType?.name || '-'}</span>
      )
    },
    {
      key: 'location',
      header: t('common.location'),
      render: (system: System) => system.location || '-'
    },
    {
      key: 'status',
      header: t('common.status'),
      render: (system: System) => (
        <Badge variant={system.status === 'active' ? 'success' : 'secondary'}>
          {system.status === 'active' ? t('systems.active') : system.status === 'inactive' ? t('systems.inactive') : t('systems.maintenance')}
        </Badge>
      )
    },
    {
      key: 'monitoringPoints',
      header: t('systems.monitoringPoints'),
      render: (system: System) => system.monitoringPoints?.length || 0
    },
    {
      key: 'createdAt',
      header: t('systems.createdAt'),
      render: (system: System) => new Date(system.createdAt).toLocaleDateString()
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (item: System & { level: number; hasChildren: boolean }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedParentId(item.id);
              setIsStageFormOpen(true);
            }}
          >
            <Add fontSize="small" className="mr-1" />
            {t('inspections.stage')}
          </Button>
        </div>
      )
    }
  ];

  return (
    <>
      <PaginatedTable
        columns={columns}
        data={hierarchicalSystems}
        keyExtractor={(system: System & { level: number; hasChildren: boolean }) => system.id}
        onRowClick={(system: System & { level: number; hasChildren: boolean }) => goToSystemDetail(system.id)}
        emptyMessage={t('systems.noSystems')}
        loading={loading}
        pagination={pagination}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <SystemForm
        isOpen={isStageFormOpen}
        onClose={handleCloseStageForm}
        parentId={selectedParentId}
      />
    </>
  );
};

export default SystemsList;
