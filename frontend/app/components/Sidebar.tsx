'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  FiHome, 
  FiSearch, 
  FiFile, 
  FiUsers, 
  FiSettings, 
  FiChevronLeft,
  FiChevronRight,
  FiLayout
} from 'react-icons/fi';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navigationItems: SidebarItem[] = [
  { name: 'Home', href: '/', icon: FiHome },
  { name: 'Documents', href: '/Admin/documents', icon: FiFile },
  { name: 'Users', href: '/Admin/users', icon: FiUsers },
  { name: 'Dashboard', href: '/Admin/dashoard', icon: FiLayout },
  { name: 'Settings', href: '/settings', icon: FiSettings },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-gradient-to-b from-[#3D4A55] to-[#2a3540] border-r border-gray-700 shadow-2xl transition-all duration-300 ease-in-out flex flex-col h-screen sticky top-0`}
    >
      {/* Logo/Brand Section */}
      <div className="px-4 py-6 border-b border-gray-700">
        {!isCollapsed ? (
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FiSearch className="text-[#499FA4]" />
            SearchDeep
          </h1>
        ) : (
          <div className="flex justify-center">
            <FiSearch className="w-6 h-6 text-[#499FA4]" />
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-[#499FA4] text-white shadow-lg shadow-[#499FA4]/30'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
              title={isCollapsed ? item.name : ''}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${
                isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
              }`} />
              {!isCollapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Toggle Button */}
      <div className="px-3 pb-4">
        <button
          onClick={toggleSidebar}
          className="w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-300 hover:text-white flex items-center justify-center"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <FiChevronRight className="w-5 h-5" />
          ) : (
            <div className="flex items-center gap-2">
              <FiChevronLeft className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </div>
          )}
        </button>
      </div>

      {/* Footer Section */}
      {!isCollapsed && (
        <div className="px-4 py-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 text-center">
            © 2025 SearchDeep
          </div>
        </div>
      )}
    </aside>
  );
}
