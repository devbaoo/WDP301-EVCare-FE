import { io, Socket } from "socket.io-client";
import { BASE_URL } from "@/services/constant/apiConfig";

let chatSocket: Socket | null = null;

const createSocket = (token: string): Socket => {
  const socketInstance = io(BASE_URL, {
    transports: ["websocket"],
    autoConnect: false,
    auth: {
      token: `Bearer ${token}`,
    },
  });

  socketInstance.connect();

  return socketInstance;
};

export const connectChatSocket = (token: string | null | undefined): Socket | null => {
  if (!token) {
    return null;
  }

  if (chatSocket) {
    if (!chatSocket.connected) {
      chatSocket.auth = { token: `Bearer ${token}` };
      chatSocket.connect();
    }
    return chatSocket;
  }

  chatSocket = createSocket(token);
  return chatSocket;
};

export const disconnectChatSocket = () => {
  if (chatSocket) {
    chatSocket.removeAllListeners();
    chatSocket.disconnect();
    chatSocket = null;
  }
};

export const getChatSocket = (): Socket | null => chatSocket;

export const joinConversationRoom = (conversationId: string) => {
  if (!conversationId) return;
  chatSocket?.emit("conversation:join", { conversationId });
};

export const leaveConversationRoom = (conversationId: string) => {
  if (!conversationId) return;
  chatSocket?.emit("conversation:leave", { conversationId });
};
