import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchUsers } from '../../store/slices/userSlice';
import { Button, Input } from '../../components/common';
import type { CreateNotificationRequest, NotificationType, NotificationPriority } from '../../types';

interface CreateNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateNotificationRequest) => void;
}

const CreateNotificationModal: React.FC<CreateNotificationModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const dispatch = useAppDispatch();
  const { users } = useAppSelector((state) => state.users);

  const [formData, setFormData] = useState({
    type: 'system' as NotificationType,
    title: '',
    message: '',
    priority: 'medium' as NotificationPriority,
    sendToAll: true,
    recipientIds: [] as number[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchUsers({}));
    }
  }, [isOpen, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRecipientToggle = (userId: number) => {
    setFormData(prev => ({
      ...prev,
      recipientIds: prev.recipientIds.includes(userId)
        ? prev.recipientIds.filter(id => id !== userId)
        : [...prev.recipientIds, userId]
    }));
  };

  const handleSendToAllToggle = () => {
    setFormData(prev => ({
      ...prev,
      sendToAll: !prev.sendToAll,
      recipientIds: []
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    if (!formData.sendToAll && formData.recipientIds.length === 0) {
      newErrors.recipients = 'Select at least one recipient or send to all';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;

    onSubmit({
      type: formData.type,
      title: formData.title,
      message: formData.message,
      priority: formData.priority,
      sendToAll: formData.sendToAll,
      recipientIds: formData.sendToAll ? undefined : formData.recipientIds
    });

    // Reset form
    setFormData({
      type: 'system',
      title: '',
      message: '',
      priority: 'medium',
      sendToAll: true,
      recipientIds: []
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Create Notification</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="system">System</option>
                  <option value="alert">Alert</option>
                  <option value="incident">Incident</option>
                  <option value="inspection">Inspection</option>
                  <option value="stock">Stock</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <Input
              type="text"
              name="title"
              label="Title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter notification title"
              error={errors.title}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Enter notification message"
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.message ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-500">{errors.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
              <div className="mb-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.sendToAll}
                    onChange={handleSendToAllToggle}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Send to all users</span>
                </label>
              </div>

              {!formData.sendToAll && (
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {users.map(user => (
                    <label
                      key={user.id}
                      className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.recipientIds.includes(user.id)}
                        onChange={() => handleRecipientToggle(user.id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email} - {user.role}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {errors.recipients && (
                <p className="mt-1 text-sm text-red-500">{errors.recipients}</p>
              )}
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Create Notification
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateNotificationModal;
