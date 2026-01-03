/**
 * Image Compression Utility
 * Provides functions to compress and resize images for PDF reports
 * Max width: 800px as specified in requirements
 */

const MAX_WIDTH = 800;
const MAX_HEIGHT = 600;
const JPEG_QUALITY = 0.8;

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface CompressedImage {
  dataUrl: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  sizeBytes: number;
}

/**
 * Compresses an image from a URL
 */
export async function compressImageFromUrl(
  imageUrl: string,
  options: CompressionOptions = {}
): Promise<CompressedImage> {
  const {
    maxWidth = MAX_WIDTH,
    maxHeight = MAX_HEIGHT,
    quality = JPEG_QUALITY,
    format = 'jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const result = compressImage(img, { maxWidth, maxHeight, quality, format });
        resolve({
          ...result,
          originalWidth: img.naturalWidth,
          originalHeight: img.naturalHeight
        });
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${imageUrl}`));
    };

    img.src = imageUrl;
  });
}

/**
 * Compresses an image from a File object
 */
export async function compressImageFromFile(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const dataUrl = e.target?.result as string;
        const result = await compressImageFromUrl(dataUrl, options);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Core compression function
 */
function compressImage(
  img: HTMLImageElement,
  options: Required<CompressionOptions>
): Omit<CompressedImage, 'originalWidth' | 'originalHeight'> {
  const { maxWidth, maxHeight, quality, format } = options;

  // Calculate new dimensions maintaining aspect ratio
  let { width, height } = calculateDimensions(
    img.naturalWidth,
    img.naturalHeight,
    maxWidth,
    maxHeight
  );

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Enable image smoothing for better quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw image
  ctx.drawImage(img, 0, 0, width, height);

  // Convert to data URL
  const mimeType = `image/${format}`;
  const dataUrl = canvas.toDataURL(mimeType, quality);

  // Calculate approximate size
  const base64 = dataUrl.split(',')[1];
  const sizeBytes = Math.round((base64.length * 3) / 4);

  return {
    dataUrl,
    width,
    height,
    sizeBytes
  };
}

/**
 * Calculate dimensions maintaining aspect ratio
 */
function calculateDimensions(
  origWidth: number,
  origHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = origWidth;
  let height = origHeight;

  // Check if resizing is needed
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  // Calculate ratios
  const widthRatio = maxWidth / width;
  const heightRatio = maxHeight / height;
  const ratio = Math.min(widthRatio, heightRatio);

  // Apply ratio
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);

  return { width, height };
}

/**
 * Batch compress multiple images
 */
export async function compressImages(
  imageUrls: string[],
  options: CompressionOptions = {}
): Promise<Map<string, CompressedImage>> {
  const results = new Map<string, CompressedImage>();

  await Promise.all(
    imageUrls.map(async (url) => {
      try {
        const compressed = await compressImageFromUrl(url, options);
        results.set(url, compressed);
      } catch (error) {
        console.warn(`Failed to compress image: ${url}`, error);
        // Store original URL on failure
        results.set(url, {
          dataUrl: url,
          width: 0,
          height: 0,
          originalWidth: 0,
          originalHeight: 0,
          sizeBytes: 0
        });
      }
    })
  );

  return results;
}

/**
 * Check if an image needs compression
 */
export function needsCompression(
  width: number,
  height: number,
  maxWidth: number = MAX_WIDTH,
  maxHeight: number = MAX_HEIGHT
): boolean {
  return width > maxWidth || height > maxHeight;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Convert data URL to Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const base64 = atob(parts[1]);
  const array = new Uint8Array(base64.length);

  for (let i = 0; i < base64.length; i++) {
    array[i] = base64.charCodeAt(i);
  }

  return new Blob([array], { type: mime });
}

/**
 * Convert Blob to data URL
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default {
  compressImageFromUrl,
  compressImageFromFile,
  compressImages,
  needsCompression,
  formatFileSize,
  dataUrlToBlob,
  blobToDataUrl
};
