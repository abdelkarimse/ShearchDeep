import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Upload,
  Users,
  LogOut,
  Search,
  LayoutDashboard,
  Moon,
  Sun,
  BarChart3,
} from 'lucide-react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { useAuth } from '@/context/AuthContext';
import { useThemeStore } from '@/Zustand/themeStore';
import { mockApiService } from '@/services/mockApi';
import type { AuthDocument } from '@/types/auth';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [documents, setDocuments] = useState<AuthDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useThemeStore();
  const isAdmin = user?.role === 'admin';

  // Load documents for search
  useEffect(() => {
    const loadDocuments = async () => {
      if (!user?.id) return;
      try {
        const docs = isAdmin
          ? await mockApiService.getAllDocuments()
          : await mockApiService.getUserDocuments(user.id);
        setDocuments(docs);
      } catch (error) {
        console.error('Failed to load documents:', error);
      }
    };

    if (open && isAuthenticated) {
      loadDocuments();
    }
  }, [open, user?.id, isAdmin, isAuthenticated]);

  // Register keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Filter documents based on search
  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.aiKeywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
  ).slice(0, 5);

  if (!isAuthenticated) return null;

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Type a command or search documents..." 
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Quick Search Results */}
        {searchQuery && filteredDocuments.length > 0 && (
          <CommandGroup heading="Documents">
            {filteredDocuments.map((doc) => (
              <CommandItem
                key={doc.id}
                value={`doc-${doc.title}`}
                onSelect={() => runCommand(() => {
                  // Navigate to documents with search
                  const path = isAdmin ? '/admin/dashboard/documents' : '/client/dashboard';
                  navigate(path);
                })}
              >
                <FileText className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{doc.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {doc.fileType.toUpperCase()} • {doc.ownerName || 'Unknown'}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          <CommandItem
            value="dashboard"
            onSelect={() => runCommand(() => 
              navigate(isAdmin ? '/admin/dashboard' : '/client/dashboard')
            )}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Go to Dashboard</span>
          </CommandItem>
          
          <CommandItem
            value="documents"
            onSelect={() => runCommand(() => 
              navigate(isAdmin ? '/admin/dashboard/documents' : '/client/dashboard')
            )}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>View Documents</span>
          </CommandItem>

          {isAdmin && (
            <>
              <CommandItem
                value="users"
                onSelect={() => runCommand(() => navigate('/admin/dashboard/users'))}
              >
                <Users className="mr-2 h-4 w-4" />
                <span>Manage Users</span>
              </CommandItem>
              
              <CommandItem
                value="analytics"
                onSelect={() => runCommand(() => navigate('/admin/dashboard/documents'))}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>View Analytics</span>
              </CommandItem>
            </>
          )}
        </CommandGroup>

        <CommandSeparator />

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem
            value="upload"
            onSelect={() => runCommand(() => {
              const path = isAdmin ? '/admin/dashboard/documents' : '/client/dashboard';
              navigate(path);
              // TODO: Trigger upload modal
            })}
          >
            <Upload className="mr-2 h-4 w-4" />
            <span>Upload Document</span>
            <CommandShortcut>⌘U</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="search"
            onSelect={() => runCommand(() => {
              const path = isAdmin ? '/admin/dashboard/documents' : '/client/dashboard';
              navigate(path);
            })}
          >
            <Search className="mr-2 h-4 w-4" />
            <span>Search Documents</span>
            <CommandShortcut>⌘F</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Settings */}
        <CommandGroup heading="Settings">
          <CommandItem
            value="toggle-theme"
            onSelect={() => runCommand(() => toggleTheme())}
          >
            {theme === 'dark' ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Moon className="mr-2 h-4 w-4" />
            )}
            <span>Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
          </CommandItem>

          <CommandItem
            value="logout"
            onSelect={() => runCommand(handleLogout)}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
            <CommandShortcut>⌘Q</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

// Hook to programmatically open the command palette
export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  
  return {
    open,
    setOpen,
    toggle: () => setOpen(prev => !prev),
  };
}
