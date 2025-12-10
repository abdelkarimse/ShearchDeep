import { Client, IFrame } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Reader } from "../Zustand/readerStore";

// ---- Types from your backend ----

export interface UserRepresentation {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  attributes: { [key: string]: string[] };
}
export type TypeMessage = "DOCUMENT8Viewed" | "Bloc_VIEWED" |"GETBOOKSVIWER" | "CLOSEBOOKSVIWER";

export interface WebsocketMessagae {
  senderId: string;
  receiverId?: string;
  typeMessage: TypeMessage;
  documentId?: string;
  user?: Reader;
  users?: Reader[];
}

// ---- STOMP client singleton ----

let stompClient: Client | null = null;

export const connectWebSocket = (
  session: any,
  token: string,
  onMessage?: (msg: any) => void
): Client | null => {
  const senderId = session?.user?.id;
  if (!senderId || !token) return null;

  const socket = new SockJS("http://localhost:8082/ws");

  stompClient = new Client({
    webSocketFactory: () => socket,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 3000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: (msg) => console.log("[STOMP]", msg),

    onConnect: () => {
      console.log("✅ WebSocket Connected");
      stompClient?.subscribe(
        `/user/${senderId}/queue/action`,
        (frame) => {
          try {
            const data = JSON.parse(frame.body);
            console.log( "WebSocket message received:", data);

            if (onMessage) onMessage(data);
          } catch (e) {
            console.error("Failed to parse WS message:", e);
          }
        }
      );
    },

    onDisconnect: () => {
      console.log("❌ WebSocket Disconnected");
    },

    onStompError: (frame: IFrame) => {
      console.error("❌ STOMP ERROR:", frame.headers["message"]);
    },
  });

  stompClient.activate();
  return stompClient;
};

// ---- Send message to backend ----

export const sendActionMessage = (
  message: WebsocketMessagae,
  token: string,
  client?: Client | null
) => {
  const clientToUse = client || stompClient;
  if (!clientToUse?.connected) {
    console.warn("STOMP not connected");
    return;
  }
  console.log("Sending WebSocket message:", message);
  clientToUse.publish({
    destination: "/app/action",
    body: JSON.stringify(message),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ---- Disconnect ----

export const disconnectWebSocket = () => {
  stompClient?.deactivate();
  stompClient = null;
};
