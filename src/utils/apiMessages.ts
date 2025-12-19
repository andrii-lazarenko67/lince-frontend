import i18n from '../i18n';

interface ApiResponse {
  message?: string;
  messageKey?: string;
  messageParams?: Record<string, string | number>;
}

/**
 * Extract and translate the message from an API response
 * Supports both direct messages and translation keys (messageKey)
 */
export const getApiMessage = (response: ApiResponse | undefined, defaultMessage: string): string => {
  if (!response) return defaultMessage;

  // If messageKey is provided, translate it
  if (response.messageKey) {
    const translated = i18n.t(response.messageKey, response.messageParams || {});
    // If translation returns the same key, it wasn't found - use default
    return translated !== response.messageKey ? translated : defaultMessage;
  }

  // Fall back to direct message
  return response.message || defaultMessage;
};

/**
 * Extract error message from axios error response
 */
export const getApiErrorMessage = (
  error: { response?: { data?: ApiResponse } } | unknown,
  defaultMessage: string
): string => {
  const err = error as { response?: { data?: ApiResponse } };
  return getApiMessage(err.response?.data, defaultMessage);
};

/**
 * Extract success message from axios success response
 */
export const getApiSuccessMessage = (
  response: { data?: ApiResponse } | undefined,
  defaultMessage: string
): string => {
  return getApiMessage(response?.data, defaultMessage);
};
