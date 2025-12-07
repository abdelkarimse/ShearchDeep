import { create } from "zustand";
interface Cursorfollow {
  enableCursorFollow: boolean;
  textcursor: string;
}
interface StoreState {
  mouseColor: string;
  cursor: Cursorfollow;
  setcursor: (cursor: Cursorfollow) => void;
  setMouseColor: (color: string) => void;
}
export const useStore = create<StoreState>((set) => ({
  mouseColor: "white",
  setMouseColor: (color: string) => set({ mouseColor: color }),
  cursor: { enableCursorFollow: false, textcursor: "" },
  setcursor: (cursor: Cursorfollow) => set({ cursor: cursor }),
}));
