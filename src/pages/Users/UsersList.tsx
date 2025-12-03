import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchUsers, createUser, updateUser, deleteUser } from '../../store/slices/userSlice';
import { Card, Button, Table, Badge, Modal, Input, Select } from '../../components/common';
import type { User, CreateUserRequest } from '../../types';

const UsersList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users } = useAppSelector((state) => state.users);

  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserRequest & { password?: string }>({
    name: '',
    email: '',
    password: '',
    role: 'technician',
    phone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchUsers({}));
  }, [dispatch]);

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
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'technician',
        phone: ''
      });
    }
    setErrors({});
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
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
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!editingUser && !formData.password) newErrors.password = 'Password is required';
    if (!editingUser && formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      case 'admin': return 'Admin';
      case 'manager': return 'Manager';
      case 'technician': return 'Technician';
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
      header: 'ID',
      render: (user: User) => (
        <span className="text-gray-500 text-sm">#{user.id}</span>
      )
    },
    {
      key: 'name',
      header: 'Name',
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
      header: 'Email',
      render: (user: User) => (
        <a href={`mailto:${user.email}`} className="text-blue-600 hover:underline">
          {user.email}
        </a>
      )
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (user: User) => user.phone || '-'
    },
    {
      key: 'role',
      header: 'Role',
      render: (user: User) => (
        <Badge variant={getRoleBadgeVariant(user.role) as 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'}>
          {getRoleLabel(user.role)}
        </Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (user: User) => (
        <Badge variant={user.isActive ? 'success' : 'danger'}>
          {user.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      render: (user: User) => user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (user: User) => new Date(user.createdAt).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user: User) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => handleOpenForm(user)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => { setDeletingUser(user); setIsDeleteOpen(true); }}>
            Delete
          </Button>
        </div>
      )
    }
  ];

  const roleOptions = [
    { value: 'technician', label: 'Technician' },
    { value: 'manager', label: 'Manager' },
    { value: 'admin', label: 'Admin' }
  ];

  return (
    <>
      <Card
        title="Users"
        subtitle="System users and their roles"
        noPadding
        headerActions={
          <Button variant="primary" onClick={() => handleOpenForm()}>
            Add User
          </Button>
        }
      >
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Table
            columns={columns}
            data={users}
            keyExtractor={(user) => user.id}
            emptyMessage="No users found. Click 'Add User' to create one."
          />
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal isOpen={isFormOpen} onClose={handleCloseForm} title={editingUser ? 'Edit User' : 'Add User'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            label="Name"
            placeholder="Enter user name"
            error={errors.name}
            required
          />

          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            label="Email"
            placeholder="Enter email address"
            error={errors.email}
            required
          />

          {!editingUser && (
            <Input
              type="password"
              name="password"
              value={formData.password || ''}
              onChange={handleChange}
              label="Password"
              placeholder="Enter password"
              error={errors.password}
              required
            />
          )}

          <Input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            label="Phone"
            placeholder="Enter phone number (optional)"
          />

          <Select
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={roleOptions}
            label="Role"
            required
          />

          <div className="flex justify-end space-x-3 mt-4">
            <Button type="button" variant="outline" onClick={handleCloseForm}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete User" size="sm">
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{deletingUser?.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default UsersList;
