interface EmptyStateProps {
  message: string;
  description?: string;
}

export default function EmptyState({ message, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <span className="text-2xl text-gray-400">—</span>
      </div>
      <p className="text-gray-700 font-medium">{message}</p>
      {description && (
        <p className="text-gray-400 text-sm mt-1">{description}</p>
      )}
    </div>
  );
}
