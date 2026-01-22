/**
 * Download File Utility
 * Cross-platform file download helper that works on both desktop and mobile browsers
 */

import axiosInstance from '../api/axiosInstance';

/**
 * Download a file from a blob
 * Works reliably on both desktop and mobile browsers
 */
export function downloadBlob(blob: Blob, filename: string): void {
  // Create blob URL
  const url = window.URL.createObjectURL(blob);

  // Create temporary link element
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  // Required for iOS Safari
  link.style.display = 'none';

  // Append to body (required for Firefox)
  document.body.appendChild(link);

  // Trigger download
  link.click();

  // Cleanup after a delay to ensure mobile browsers have time to process
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Download a file from a URL by fetching it as a blob first
 * This ensures the file is downloaded rather than opened in a new tab
 */
export async function downloadFromUrl(url: string, filename: string): Promise<void> {
  try {
    // Fetch the file as a blob
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const blob = await response.blob();

    // Use the blob download method
    downloadBlob(blob, filename);
  } catch (error) {
    console.error('Error downloading file from URL:', error);
    // Fallback: try opening in new window (may not download on mobile)
    window.open(url, '_blank');
  }
}

/**
 * Download a file from an authenticated API endpoint
 * Handles auth headers and blob conversion
 */
export async function downloadFromApi(
  endpoint: string,
  filename: string,
  params?: Record<string, unknown>
): Promise<void> {
  try {
    const response = await axiosInstance.get(endpoint, {
      params,
      responseType: 'blob'
    });

    const blob = new Blob([response.data as BlobPart]);
    downloadBlob(blob, filename);
  } catch (error) {
    console.error('Error downloading file from API:', error);
    throw error;
  }
}

/**
 * Extract filename from Content-Disposition header
 */
export function getFilenameFromHeaders(headers: Record<string, string>): string | null {
  const contentDisposition = headers['content-disposition'];
  if (!contentDisposition) return null;

  const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
  if (matches && matches[1]) {
    return matches[1].replace(/['"]/g, '');
  }

  return null;
}

/**
 * Detect if user is on a mobile device
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}
