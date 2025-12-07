"use client";
import { useStore } from "../Zustand/Store";
import {
  Cursor,
  CursorFollow,
  CursorProvider,
  type CursorFollowProps,
} from "@/components/animate-ui/components/animate/cursor";
export default function CursorManager() {
  const { cursor, mouseColor } = useStore();
  return (
    <CursorProvider global={true}>
      <Cursor color={mouseColor} />
      {cursor.enableCursorFollow && (
        <CursorFollow
          side={"bottom"}
          sideOffset={15}
          align={"end"}
          alignOffset={0}
          variants={{
            active: {
              backgroundColor: "white",
            },
          }}
        >
          {cursor.textcursor}
        </CursorFollow>
      )}
    </CursorProvider>
  );
}
