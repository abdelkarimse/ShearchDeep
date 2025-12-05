import { useTheme } from '../Zustand/themeStore';
import type { User } from '../types/users';

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
  const theme = useTheme();
  
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  
  const getStatusStyles = (status: string) => {
    if (status === 'active') {
      return {
        bg: isDark ? 'bg-green-900' : 'bg-green-100',
        text: isDark ? 'text-green-300' : 'text-green-700'
      };
    }
    return {
      bg: isDark ? 'bg-red-900' : 'bg-red-100',
      text: isDark ? 'text-red-300' : 'text-red-700'
    };
  };
  
  const statusStyles = getStatusStyles(user.status);

  return (
    <div className={`${bgColor} ${textColor} rounded-lg border ${borderColor} p-6 shadow-md hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{user.name}</h3>
          <p className={`${secondaryText} text-sm mb-3`}>{user.email}</p>
        </div>
        <span className={`${statusStyles.bg} ${statusStyles.text} px-3 py-1 rounded-full text-xs font-medium capitalize`}>
          {user.status}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className={`${secondaryText} text-sm`}>Phone:</span>
          <span className={`${textColor} text-sm font-medium`}>{user.phone}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`${secondaryText} text-sm`}>Role:</span>
          <span className={`${textColor} text-sm font-medium`}>{user.role}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`${secondaryText} text-sm`}>Joined:</span>
          <span className={`${textColor} text-sm font-medium`}>{user.joinDate}</span>
        </div>
      </div>

      <div className={`border-t ${borderColor} pt-4 flex gap-2`}>
        <button 
          onClick={() => onEdit(user)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded transition-colors">
          Edit
        </button>
        <button 
          onClick={() => onDelete(user)}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded transition-colors">
          Delete
        </button>
      </div>
    </div>
  );
};
