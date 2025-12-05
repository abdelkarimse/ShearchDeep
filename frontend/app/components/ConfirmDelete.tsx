import { useTheme } from '../Zustand/themeStore';

interface ConfirmDeleteProps {
  isOpen: boolean;
  userName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({ isOpen, userName, onConfirm, onCancel }) => {
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
    <div className={`fixed inset-0 ${overlayBg} flex items-center justify-center z-50`}>
      <div className={`${bgColor} rounded-lg shadow-xl p-6 w-full max-w-sm mx-4`}>
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0-6a9 9 0 1 1 0 18 9 9 0 0 1 0-18z" />
          </svg>
        </div>
        
        <h3 className={`${textColor} text-lg font-semibold text-center mb-2`}>
          Delete User
        </h3>
        
        <p className={`${secondaryText} text-center text-sm mb-6`}>
          Are you sure you want to delete <span className="font-semibold">{userName}</span>? This action cannot be undone.
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
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};
