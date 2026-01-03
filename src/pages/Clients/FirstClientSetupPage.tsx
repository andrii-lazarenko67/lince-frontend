import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppNavigation } from '../../hooks';
import { createClient, setSelectedClient } from '../../store/slices/clientSlice';
import { Input, Button, Alert } from '../../components/common';
import { GlobalLoader } from '../../components/common';
import LanguageSwitcher from '../../components/LanguageSwitcher';

/**
 * Standalone page for service providers to add their first client after signup.
 * This page is shown outside the main layout.
 */
const FirstClientSetupPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { goToDashboard } = useAppNavigation();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact: '',
    phone: '',
    email: ''
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      setFormError(t('settings.clients.errors.nameRequired', 'Client name is required'));
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await dispatch(createClient(formData));
      if (createClient.fulfilled.match(result)) {
        // Set the newly created client as selected
        dispatch(setSelectedClient(result.payload.id));
        goToDashboard();
      } else {
        setFormError(t('settings.clients.errors.createFailed', 'Failed to create client'));
      }
    } catch {
      setFormError(t('settings.clients.errors.createFailed', 'Failed to create client'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
      <GlobalLoader />
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600">
              {t('clients.addFirst.title', 'Add Your First Client')}
            </h1>
            <p className="text-gray-500 mt-2">
              {t('clients.addFirst.subtitle', 'Start by adding your first client to manage')}
            </p>
          </div>

          {formError && (
            <Alert
              type="error"
              message={formError}
              className="mb-4"
            />
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              label={t('settings.clients.name', 'Client Name')}
              placeholder={t('settings.clients.namePlaceholder', 'Enter client name')}
              required
            />

            <Input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              label={t('settings.clients.address', 'Address')}
              placeholder={t('settings.clients.addressPlaceholder', 'Enter address')}
            />

            <Input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              label={t('settings.clients.contact', 'Contact Person')}
              placeholder={t('settings.clients.contactPlaceholder', 'Enter contact name')}
            />

            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              label={t('settings.clients.phone', 'Phone')}
              placeholder={t('settings.clients.phonePlaceholder', 'Enter phone number')}
            />

            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              label={t('settings.clients.email', 'Email')}
              placeholder={t('settings.clients.emailPlaceholder', 'Enter email address')}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              className="mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? t('common.saving', 'Saving...')
                : t('clients.addFirst.submitButton', 'Add Client & Continue')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FirstClientSetupPage;
