export default function OrderStatusBadge({ status }) {
  const statusConfig = {
    pending: {
      color: "bg-yellow-100 text-yellow-800",
      label: "Pending",
    },
    processing: {
      color: "bg-blue-100 text-blue-800",
      label: "Processing",
    },
    complete: {
      color: "bg-green-100 text-green-800",
      label: "Complete",
    },
    failed: {
      color: "bg-red-100 text-red-800",
      label: "Failed",
    },
  };

  const config = statusConfig[status?.toLowerCase()] || {
    color: "bg-gray-100 text-gray-800",
    label: status || "Unknown",
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
} 