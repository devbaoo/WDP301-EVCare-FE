import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import BookingChatList from "./BookingChatList";
import { useAppDispatch, useAppSelector } from "@/services/store/store";
import {
  fetchChatConversations,
  fetchUnreadCount,
  fetchChatBookings,
  receiveIncomingMessage,
  setActiveConversationId,
} from "@/services/features/chat/chatSlice";
import {
  connectChatSocket,
  disconnectChatSocket,
} from "@/services/features/chat/chatSocket";
import { ChatMessage } from "@/interfaces/chat";


const ChatMain = () => {
  const dispatch = useAppDispatch();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"conversations" | "bookings">(
    "conversations"
  );
  const unreadCount = useAppSelector((state) => state.chat.unreadCount);
  const token = useAppSelector((state) => state.auth.token);
  const currentUserId = useAppSelector((state) => state.auth.user?.id ?? null);
  const conversations = useAppSelector((state) => state.chat.conversations);
  const [socket, setSocket] = useState<Socket | null>(null);


  useEffect(() => {
    void dispatch(fetchChatConversations());
    void dispatch(fetchUnreadCount());
  }, [dispatch]);

  useEffect(() => {
    if (activeTab === "bookings") {
      void dispatch(fetchChatBookings());
    }
  }, [activeTab, dispatch]);

  useEffect(() => {
    dispatch(setActiveConversationId(selectedConversationId));
  }, [dispatch, selectedConversationId]);

  useEffect(() => {
    if (!token) {
      setSocket(null);
      disconnectChatSocket();
      return;
    }

    const socketInstance = connectChatSocket(token);
    if (!socketInstance) {
      setSocket(null);
      return;
    }

    setSocket(socketInstance);

    const handleConnect = () => {
      setSocket(socketInstance);
    };

    const handleDisconnect = () => {
      setSocket(null);
    };

    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);

    return () => {
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
      disconnectChatSocket();
      setSocket(null);
    };
  }, [token]);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (message: ChatMessage) => {
      dispatch(
        receiveIncomingMessage({
          message,
          currentUserId,
        })
      );

      const conversationExists = conversations.some(
        (conversation) => conversation.conversationId === message.conversationId
      );

      if (!conversationExists) {
        void dispatch(fetchChatConversations());
      }
    };

    socket.on("chat:new-message", handleIncomingMessage);

    return () => {
      socket.off("chat:new-message", handleIncomingMessage);
    };
  }, [socket, dispatch, currentUserId, conversations]);


  const handleOpenConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setActiveTab("conversations");
  };

  return (
    <div className="grid h-[700px] grid-cols-1 gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <div className="flex h-full flex-col gap-4">
        <div className="flex rounded-full bg-gray-100 p-1">
          <button
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === "conversations"
                ? "bg-white text-blue-600 shadow"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("conversations")}
          >
            Cuộc trò chuyện
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === "bookings"
                ? "bg-white text-blue-600 shadow"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("bookings")}
          >
            Lịch hẹn
          </button>
        </div>

        <div className="flex-1">
          {activeTab === "conversations" ? (
            <ChatList
              onSelectConversation={setSelectedConversationId}
              activeConversationId={selectedConversationId}
            />
          ) : (
            <BookingChatList onOpenConversation={handleOpenConversation} />
          )}
        </div>
      </div>

      <div className="hidden h-full lg:block">
        {selectedConversationId ? (
          <ChatWindow
            conversationId={selectedConversationId}
            onClose={() => setSelectedConversationId(null)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center">
            <h3 className="text-lg font-semibold text-gray-700">
              Chọn một cuộc trò chuyện để bắt đầu
            </h3>
            <p className="mt-2 max-w-sm text-sm text-gray-500">
              Chọn một cuộc trò chuyện từ danh sách hoặc bắt đầu chat từ một lịch hẹn.
            </p>
          </div>
        )}
      </div>

      {/* Mobile conversation window */}
      <div className="lg:hidden">
        {selectedConversationId ? (
          <ChatWindow
            conversationId={selectedConversationId}
            onClose={() => setSelectedConversationId(null)}
          />
        ) : null}
      </div>
    </div>
  );
};

export default ChatMain;
