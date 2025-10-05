import { useMemo } from "react";
import { useAppSelector } from "@/services/store/store";
import { ChatConversation } from "@/interfaces/chat";
import { Spin, Empty } from "antd";

interface ChatListProps {
  onSelectConversation: (conversationId: string) => void;
  activeConversationId?: string | null;
}

const formatDate = (isoDate: string) => {
  if (!isoDate) return "";
  try {
    return new Date(isoDate).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
};

const formatTime = (isoDate: string) => {
  if (!isoDate) return "";
  try {
    return new Date(isoDate).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoDate;
  }
};

const ChatList = ({ onSelectConversation, activeConversationId }: ChatListProps) => {
  const { conversations, conversationsLoading } = useAppSelector(
    (state) => state.chat
  );
  const currentUserId = useAppSelector((state) => state.auth.user?.id);

  const sortedConversations = useMemo(() => {
    return [...conversations].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [conversations]);

  if (conversationsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spin />
      </div>
    );
  }

  if (!sortedConversations.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <Empty description="Chưa có cuộc trò chuyện" />
        <p className="text-sm text-gray-500">
          Hãy bắt đầu trò chuyện từ một lịch hẹn của bạn.
        </p>
      </div>
    );
  }

  const renderParticipants = (conversation: ChatConversation) => {
    return conversation.participants
      .filter((participant) => participant.userId !== currentUserId)
      .map((participant) => participant.name)
      .join(", ");
  };

  return (
    <div className="flex h-full flex-col divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="bg-gray-50 px-4 py-3">
        <h3 className="text-base font-semibold text-gray-800">
          Cuộc trò chuyện
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {sortedConversations.map((conversation) => {
          const isActive =
            conversation.conversationId === activeConversationId;
          return (
            <button
              key={conversation.conversationId}
              onClick={() => onSelectConversation(conversation.conversationId)}
              className={`flex w-full flex-col gap-2 px-4 py-3 text-left transition-colors ${
                isActive
                  ? "bg-blue-50"
                  : "hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
              }`}
            >
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="font-medium text-gray-700">
                  {formatDate(conversation.bookingDate)}
                </span>
                {conversation.unreadCount > 0 && (
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
              <div className="text-sm font-medium text-gray-700">
                {renderParticipants(conversation) || "Cuộc trò chuyện"}
              </div>
              {conversation.lastMessage && (
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="line-clamp-1 text-gray-600">
                    {conversation.lastMessage.content}
                  </span>
                  <span>{formatTime(conversation.lastMessage.sentAt)}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ChatList;
