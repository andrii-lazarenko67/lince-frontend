import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { updateProfile, uploadAvatar } from '../../store/slices/authSlice';
import { Card, Button, Input, Alert, Badge } from '../../components/common';
import { CameraAlt } from '@mui/icons-material';

const ProfileInfoSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
    setSuccessMessage('');
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const result = await dispatch(updateProfile({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined
    }));
    setLoading(false);

    if (updateProfile.fulfilled.match(result)) {
      setSuccessMessage('Profile updated successfully');
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, or WEBP)');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      handleAvatarUpload(file);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    const result = await dispatch(uploadAvatar(file));

    if (uploadAvatar.fulfilled.match(result)) {
      setSuccessMessage('Avatar updated successfully');
      setAvatarPreview(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'manager': return 'Manager';
      case 'technician': return 'Technician';
      default: return role;
    }
  };

  const getRoleBadgeVariant = (role: string): 'primary' | 'secondary' | 'danger' => {
    switch (role) {
      case 'admin': return 'danger';
      case 'manager': return 'primary';
      default: return 'secondary';
    }
  };

  return (
    <Card title="Profile Information">
      {successMessage && (
        <Alert type="success" message={successMessage} className="mb-4" />
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            label="Name"
            placeholder="Enter your name"
            error={errors.name}
            required
          />

          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            label="Email"
            placeholder="Enter your email"
            error={errors.email}
            required
          />

          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            label="Phone"
            placeholder="Enter your phone number (optional)"
          />

          <div className="flex justify-end space-x-3 mt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              Save Changes
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-center mb-6">
            <div className="relative mr-4">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="w-16 h-16 rounded-full" />
              ) : user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-2xl font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={triggerFileInput}
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1.5 shadow-lg transition-colors"
                title="Upload avatar"
              >
                <CameraAlt style={{ fontSize: 16 }} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
              <Badge variant={getRoleBadgeVariant(user?.role || 'technician')}>
                {getRoleLabel(user?.role || 'technician')}
              </Badge>
            </div>
          </div>

          <dl className="space-y-4">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="text-sm text-gray-900">{user?.email}</dd>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="text-sm text-gray-900">{user?.phone || '-'}</dd>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd>
                <Badge variant={user?.isActive ? 'success' : 'danger'}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </dd>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <dt className="text-sm font-medium text-gray-500">Last Login</dt>
              <dd className="text-sm text-gray-900">
                {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
              </dd>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <dt className="text-sm font-medium text-gray-500">Member Since</dt>
              <dd className="text-sm text-gray-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
              </dd>
            </div>
          </dl>

          <Button
            variant="primary"
            className="mt-6 w-full"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        </>
      )}
    </Card>
  );
};

export default ProfileInfoSection;
