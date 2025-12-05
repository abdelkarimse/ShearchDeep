import { useTheme } from '../Zustand/themeStore';

interface ConfirmDeleteDocumentProps {
  isOpen: boolean;
  documentTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteDocument: React.FC<ConfirmDeleteDocumentProps> = ({ 
  isOpen, 
  documentTitle, 
  onConfirm, 
  onCancel 
}) => {
  const theme = useTheme();
  const isDark = theme === 'dark';
  
  const bgColor = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';

  if (!isOpen) return null;
  
  const overlayBg = isDark
    ? "bg-black/60 backdrop-blur-md"
    : "bg-white/50 backdrop-blur-sm";

  return (
    <div className={`fixed inset-0 ${overlayBg} flex items-center justify-center z-50 p-4`}>
      <div className={`${bgColor} rounded-2xl shadow-2xl p-6 w-full max-w-sm transform transition-all duration-300 ease-out`}>
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        
        <h3 className={`${textColor} text-lg font-semibold text-center mb-2`}>
          Delete Document
        </h3>
        
        <p className={`${secondaryText} text-center text-sm mb-6`}>
          Are you sure you want to delete <span className="font-semibold text-red-600 dark:text-red-400">{documentTitle}</span>? This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 rounded-lg transition-colors"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};
