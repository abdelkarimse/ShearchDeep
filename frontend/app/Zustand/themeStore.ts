import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (newTheme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light', 
      toggleTheme: () => 
        set((state) => ({ 
          theme: state.theme === 'light' ? 'dark' : 'light' 
        })),
      setTheme: (newTheme) => 
        set(() => ({ 
          theme: newTheme 
        })),
    }),
    {
      name: 'theme',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
export const useTheme = () => useThemeStore((state) => state.theme);
export const useThemeActions = () => useThemeStore(
  (state) => ({
    toggleTheme: state.toggleTheme,
    setTheme: state.setTheme,
  })
);