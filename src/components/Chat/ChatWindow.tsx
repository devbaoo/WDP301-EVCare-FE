import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/services/store/store";
import {
  fetchConversationMessages,
  markConversationAsRead,
  sendChatMessage,
} from "@/services/features/chat/chatSlice";
import { message as antdMessage, Spin, Empty } from "antd";

interface ChatWindowProps {
  conversationId: string;
  onClose: () => void;
}

const formatTime = (isoDate: string) => {
  try {
    return new Date(isoDate).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoDate;
  }
};

const ChatWindow = ({ conversationId, onClose }: ChatWindowProps) => {
  const dispatch = useAppDispatch();
  const { messagesByConversation, participantsByConversation, messagesLoading, sendingMessage } =
    useAppSelector((state) => state.chat);
  const currentUserId = useAppSelector((state) => state.auth.user?.id);

  const messages = messagesByConversation[conversationId] ?? [];
  const participants = participantsByConversation[conversationId] ?? [];
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (conversationId) {
      void dispatch(
        fetchConversationMessages({ conversationId, page: 1, limit: 50 })
      );
      void dispatch(markConversationAsRead(conversationId));
    }
  }, [conversationId, dispatch]);

  useEffect(() => {
    setNewMessage("");
  }, [conversationId]);

  useEffect(() => {
    if (!messagesLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, messagesLoading]);

  const otherParticipants = useMemo(() => {
    return participants
      .filter((participant) => participant.userId !== currentUserId)
      .map((participant) => participant.name)
      .join(", ");
  }, [participants, currentUserId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage) return;

    const resultAction = await dispatch(
      sendChatMessage({ conversationId, content: trimmedMessage })
    );

    if (sendChatMessage.fulfilled.match(resultAction)) {
      setNewMessage("");
    } else {
      const errorMessage = resultAction.payload ?? "Gửi tin nhắn thất bại";
      antdMessage.error(errorMessage as string);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between bg-blue-600 px-5 py-4 text-white">
        <div>
          <h4 className="text-lg font-semibold">Cuộc trò chuyện</h4>
          <p className="text-sm text-blue-100">
            {otherParticipants || "Các thành viên cuộc trò chuyện"}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-full border border-blue-200 px-3 py-1 text-sm font-medium text-white transition hover:bg-white hover:text-blue-600"
        >
          Đóng
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 p-5">
        {messagesLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spin />
          </div>
        ) : !messages.length ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <Empty description="Chưa có tin nhắn" />
            <p className="text-sm text-gray-500">
              Hãy gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện.
            </p>
          </div>
        ) : (
          messages.map((messageItem) => {
            const isSentByCurrentUser =
              messageItem.senderId?._id === currentUserId;
            return (
              <div
                key={messageItem._id}
                className={`mb-4 flex w-full flex-col ${
                  isSentByCurrentUser ? "items-end" : "items-start"
                }`}
              >
                <div className="mb-1 text-xs font-medium text-gray-500">
                  {messageItem.senderId.name}
                </div>
                <div
                  className={`max-w-xl rounded-2xl px-4 py-2 text-sm shadow ${
                    isSentByCurrentUser
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-800"
                  }`}
                >
                  {messageItem.content}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  {formatTime(messageItem.sentAt)}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <input
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="Nhập tin nhắn..."
            disabled={sendingMessage}
          />
          <button
            type="submit"
            disabled={sendingMessage || !newMessage.trim()}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {sendingMessage ? "Đang gửi..." : "Gửi"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
