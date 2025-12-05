import { IoIosDocument } from 'react-icons/io';
import { MdEdit, MdDelete } from 'react-icons/md';
import type { JSX } from 'react/jsx-dev-runtime';
import { useTheme } from '../Zustand/themeStore';

interface CardDocumentProps {
  id: number;
  title: string;
  description: string;
  date: string;
  size: string;
  fileType: string;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const CardDocument = ({
  id,
  title,
  description,
  date,
  size,
  fileType,
  onEdit,
  onDelete,
}: CardDocumentProps) => {
  const theme = useTheme();

  const getFileIcon = (type: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      pdf: <IoIosDocument  />,
    };
    return iconMap[type.toLowerCase()] || '📄';
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`${bgColor} ${textColor} rounded-lg border ${borderColor} p-6 shadow-md hover:shadow-lg transition-shadow relative flex flex-col h-full`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1 truncate">{title}</h3>
          <p className={`${secondaryText} text-sm mb-3 uppercase tracking-wide`}>{fileType.toUpperCase()}</p>
        </div>
        <div className="text-3xl ml-2">{getFileIcon(fileType)}</div>
      </div>

      <p className={`${secondaryText} text-sm mb-4 line-clamp-2`}>
        {description}
      </p>

      <div className="space-y-2 mb-4 flex-grow">
        <div className="flex justify-between items-center">
          <span className={`${secondaryText} text-sm`}>Size:</span>
          <span className={`${textColor} text-sm font-medium`}>{size}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`${secondaryText} text-sm`}>Date:</span>
          <span className={`${textColor} text-sm font-medium`}>{date}</span>
        </div>
      </div>

      <div className={`border-t ${borderColor} pt-4 flex gap-2 mt-auto`}>
        <button 
          onClick={() => onEdit?.(id)}
          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2 rounded transition-colors flex items-center justify-center gap-1">
          <MdEdit size={16} />
          Edit
        </button>
        <button 
          onClick={() => onDelete?.(id)}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded transition-colors flex items-center justify-center gap-1">
          <MdDelete size={16} />
          Delete
        </button>
      </div>
    </div>
  );
};
