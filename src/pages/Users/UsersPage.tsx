import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchUsers, createUser, updateUser, deleteUser } from '../../store/slices/userSlice';
import { Card, Button, Table, Badge, Modal, Input, Select } from '../../components/common';
import { User, CreateUserRequest } from '../../types';

const UsersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users } = useAppSelector((state) => state.users);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserRequest & { password?: string }>({
    name: '',
    email: '',
    password: '',
    role: 'technician'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleOpenForm = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        password: ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'technician'
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

    if (editingUser) {
      const updateData: Partial<CreateUserRequest> = {
        name: formData.name,
        email: formData.email,
        role: formData.role
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
  };

  const handleDelete = async () => {
    if (deletingUser) {
      const result = await dispatch(deleteUser(deletingUser.id));
      if (deleteUser.fulfilled.match(result)) {
        setIsDeleteOpen(false);
        setDeletingUser(null);
      }
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (user: User) => (
        <span className="font-medium text-gray-900">{user.name}</span>
      )
    },
    {
      key: 'email',
      header: 'Email'
    },
    {
      key: 'role',
      header: 'Role',
      render: (user: User) => (
        <Badge variant={user.role === 'manager' ? 'primary' : 'secondary'}>
          {user.role === 'manager' ? 'Manager' : 'Technician'}
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
      key: 'createdAt',
      header: 'Created',
      render: (user: User) => new Date(user.createdAt).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user: User) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleOpenForm(user); }}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); setDeletingUser(user); setIsDeleteOpen(true); }}>
            Delete
          </Button>
        </div>
      )
    }
  ];

  const roleOptions = [
    { value: 'technician', label: 'Technician' },
    { value: 'manager', label: 'Manager' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">Manage system users and permissions</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenForm()}>
          Add User
        </Button>
      </div>

      <Card noPadding>
        <Table
          columns={columns}
          data={users}
          keyExtractor={(user) => user.id}
          emptyMessage="No users found. Click 'Add User' to create one."
        />
      </Card>

      <Modal isOpen={isFormOpen} onClose={handleCloseForm} title={editingUser ? 'Edit User' : 'Add User'}>
        <form onSubmit={handleSubmit}>
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

          <Select
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={roleOptions}
            label="Role"
            required
          />

          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="outline" onClick={handleCloseForm}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingUser ? 'Update' : 'Create'} User
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete User" size="sm">
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{deletingUser?.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
