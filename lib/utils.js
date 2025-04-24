// Generate a random order number
export const generateOrderNumber = () => {
  const prefix = 'ORD';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${timestamp}${random}`;
};

// Calculate the price based on the number of images
export const calculatePrice = (imageCount) => {
  let pricePerImage = 5; // Base price $5 per image
  
  // Apply volume discounts
  if (imageCount >= 50) {
    pricePerImage = 3.75; // 25% off
  } else if (imageCount >= 25) {
    pricePerImage = 4.00; // 20% off
  } else if (imageCount >= 10) {
    pricePerImage = 4.25; // 15% off
  } else if (imageCount >= 5) {
    pricePerImage = 4.50; // 10% off
  }
  
  return pricePerImage * imageCount;
};

// Format date
export const formatDate = (date) => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(d);
};

// Get file extension
export const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}; 