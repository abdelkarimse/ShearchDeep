import { create } from "zustand";

export interface Reader {
  id: string;
  username: string;
  email: string;
  readTime: number;
  lastAccessed: string;
  isBlocked: boolean;
  documentId ?: string;
}

interface ReaderState {
  readers: Reader[];
  setReaders: (readers: Reader[]) => void;
  addReader: (reader: Reader) => void;
  updateReader: (id: string, updates: Partial<Reader>) => void;
  removeReader: (id: string) => void;
  toggleBlockReader: (id: string) => void;
  clearReaders: () => void;
}

export const useReaderStore = create<ReaderState>((set) => ({
  readers: [],
  setReaders: (readers: Reader[]) => set({ readers }),
  addReader: (reader: Reader) =>
    set((state) => {
      const existingIndex = state.readers.findIndex(r => r.id === reader.id);
      if (existingIndex !== -1) {
        const updatedReaders = [...state.readers];
        updatedReaders[existingIndex] = { ...updatedReaders[existingIndex], ...reader };
        return { readers: updatedReaders };
      }
      return {
        readers: [...state.readers, reader],
      };
    }),
  updateReader: (id: string, updates: Partial<Reader>) =>
    set((state) => ({
      readers: state.readers.map((reader) =>
        reader.id === id ? { ...reader, ...updates } : reader
      ),
    })),
  removeReader: (id: string) =>
    set((state) => ({
      readers: state.readers.filter((reader) => reader.id !== id),
    })),
  toggleBlockReader: (id: string) =>
    set((state) => ({
      readers: state.readers.map((reader) =>
        reader.id === id ? { ...reader, isBlocked: !reader.isBlocked } : reader
      ),
    })),
  clearReaders: () => set({ readers: [] }),
}));
