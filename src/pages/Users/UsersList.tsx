import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, usePagination } from '../../hooks';
import { fetchUsers, createUser, updateUser, deleteUser, uploadUserAvatar } from '../../store/slices/userSlice';
import { Card, Button, Badge, Modal, Input, Select, PaginatedTable } from '../../components/common';
import { CameraAlt } from '@mui/icons-material';
import type { User, CreateUserRequest } from '../../types';

const UsersList: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { users, pagination, loading: storeLoading } = useAppSelector((state) => state.users);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use the pagination hook
  const {
    page,
    rowsPerPage,
    apiPage,
    apiLimit,
    handleChangePage,
    handleChangeRowsPerPage
  } = usePagination();

  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateUserRequest & { password?: string }>({
    name: '',
    email: '',
    password: '',
    role: 'technician',
    phone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load users with current pagination
  const loadUsers = useCallback(() => {
    dispatch(fetchUsers({ page: apiPage, limit: apiLimit }));
  }, [dispatch, apiPage, apiLimit]);

  // Initial load and when pagination changes
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleOpenForm = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        password: '',
        phone: user.phone || ''
      });
      setAvatarPreview(user.avatar || null);
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'technician',
        phone: ''
      });
      setAvatarPreview(null);
    }
    setErrors({});
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
    setAvatarPreview(null);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingUser) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert(t('users.form.invalidImageType'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(t('users.form.fileSizeLimit'));
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setLoading(true);
    await dispatch(uploadUserAvatar({ id: editingUser.id, file }));
    setLoading(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t('users.form.nameRequired');
    if (!formData.email.trim()) newErrors.email = t('users.form.emailRequired');
    if (!editingUser && !formData.password) newErrors.password = t('users.form.passwordRequired');
    if (!editingUser && formData.password && formData.password.length < 6) {
      newErrors.password = t('users.form.passwordLength');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    if (editingUser) {
      const updateData: Partial<CreateUserRequest> = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone || undefined
      };
      const result = await dispatch(updateUser({ id: editingUser.id, data: updateData }));
      if (updateUser.fulfilled.match(result)) {
        handleCloseForm();
      }
    } else {
      const result = await dispatch(createUser(formData as CreateUserRequest));
      if (createUser.fulfilled.match(result)) {
        handleCloseForm();
      }
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (deletingUser) {
      setLoading(true);
      const result = await dispatch(deleteUser(deletingUser.id));
      setLoading(false);
      if (deleteUser.fulfilled.match(result)) {
        setIsDeleteOpen(false);
        setDeletingUser(null);
      }
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return t('users.roles.admin');
      case 'manager': return t('users.roles.manager');
      case 'technician': return t('users.roles.technician');
      default: return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'manager': return 'primary';
      default: return 'secondary';
    }
  };

  const columns = [
    {
      key: 'id',
      header: t('users.list.id'),
      render: (user: User) => (
        <span className="text-gray-500 text-sm">#{user.id}</span>
      )
    },
    {
      key: 'name',
      header: t('users.list.name'),
      render: (user: User) => (
        <div className="flex items-center">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full mr-2" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
              <span className="text-gray-600 text-sm font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="font-medium text-gray-900">{user.name}</span>
        </div>
      )
    },
    {
      key: 'email',
      header: t('users.list.email'),
      render: (user: User) => (
        <a href={`mailto:${user.email}`} className="text-blue-600 hover:underline">
          {user.email}
        </a>
      )
    },
    {
      key: 'phone',
      header: t('users.list.phone'),
      render: (user: User) => user.phone || '-'
    },
    {
      key: 'role',
      header: t('users.list.role'),
      render: (user: User) => (
        <Badge variant={getRoleBadgeVariant(user.role) as 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'}>
          {getRoleLabel(user.role)}
        </Badge>
      )
    },
    {
      key: 'status',
      header: t('users.list.status'),
      render: (user: User) => (
        <Badge variant={user.isActive ? 'success' : 'danger'}>
          {user.isActive ? t('users.status.active') : t('users.status.inactive')}
        </Badge>
      )
    },
    {
      key: 'lastLogin',
      header: t('users.list.lastLogin'),
      render: (user: User) => user.lastLogin ? new Date(user.lastLogin).toLocaleString() : t('users.list.never')
    },
    {
      key: 'createdAt',
      header: t('users.list.created'),
      render: (user: User) => new Date(user.createdAt).toLocaleDateString()
    },
    {
      key: 'actions',
      header: t('users.list.actions'),
      render: (user: User) => (
        <div className="flex space-x-2" data-tour="user-actions">
          <Button size="sm" variant="outline" onClick={() => handleOpenForm(user)}>
            {t('common.edit')}
          </Button>
          <Button size="sm" variant="danger" onClick={() => { setDeletingUser(user); setIsDeleteOpen(true); }}>
            {t('common.delete')}
          </Button>
        </div>
      )
    }
  ];

  const roleOptions = [
    { value: 'technician', label: t('users.roles.technician') },
    { value: 'manager', label: t('users.roles.manager') },
    { value: 'admin', label: t('users.roles.admin') }
  ];

  return (
    <>
      <div data-tour="users-table">
        <Card
          title={t('users.list.title')}
          subtitle={t('users.list.subtitle')}
          noPadding
          headerActions={
            <div data-tour="add-user-button">
              <Button variant="primary" onClick={() => handleOpenForm()}>
                {t('users.list.addUser')}
              </Button>
            </div>
          }
        >
          <PaginatedTable
            columns={columns}
            data={users}
            keyExtractor={(user: User) => user.id}
            emptyMessage={t('users.list.emptyMessage')}
            loading={storeLoading || loading}
            pagination={pagination}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={isFormOpen} onClose={handleCloseForm} title={editingUser ? t('users.form.editUser') : t('users.form.addUser')}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Avatar Upload (only for editing) */}
          {editingUser && (
            <div className="flex flex-col items-center mb-4">
              <div className="relative">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-600 text-2xl font-medium">
                      {formData.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1.5 shadow-lg transition-colors"
                  title={t('users.form.uploadAvatar')}
                >
                  <CameraAlt style={{ fontSize: 16 }} />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <span className="text-xs text-gray-500 mt-2">{t('users.form.avatarHint')}</span>
            </div>
          )}

          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            label={t('users.form.name')}
            placeholder={t('users.form.namePlaceholder')}
            error={errors.name}
            required
          />

          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            label={t('users.form.email')}
            placeholder={t('users.form.emailPlaceholder')}
            error={errors.email}
            required
          />

          {!editingUser && (
            <Input
              type="password"
              name="password"
              value={formData.password || ''}
              onChange={handleChange}
              label={t('users.form.password')}
              placeholder={t('users.form.passwordPlaceholder')}
              error={errors.password}
              required
            />
          )}

          <Input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            label={t('users.form.phone')}
            placeholder={t('users.form.phonePlaceholder')}
          />

          <Select
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={roleOptions}
            label={t('users.form.role')}
            required
          />

          <div className="flex justify-end space-x-3 mt-4">
            <Button type="button" variant="outline" onClick={handleCloseForm}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {editingUser ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title={t('users.form.deleteUser')} size="sm">
        <p className="text-gray-600 mb-6">
          {t('users.form.deleteConfirm', { name: deletingUser?.name })}
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {t('common.delete')}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default UsersList;
