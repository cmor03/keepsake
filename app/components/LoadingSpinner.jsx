export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };
  
  const spinnerSize = sizeClasses[size] || sizeClasses.md;
  
  return (
    <div 
      className={`${spinnerSize} ${className} border-4 border-gray-200 border-t-black dark:border-gray-700 dark:border-t-white rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
} 