import { useEffect } from "react";
import { Spin, Empty, message, Tooltip } from "antd";
import { useAppDispatch, useAppSelector } from "@/services/store/store";
import {
  fetchChatBookings,
  fetchChatConversations,
  startConversation,
} from "@/services/features/chat/chatSlice";

interface BookingChatListProps {
  onOpenConversation: (conversationId: string) => void;
}

const BookingChatList = ({ onOpenConversation }: BookingChatListProps) => {
  const dispatch = useAppDispatch();
  const { bookings, bookingsLoading } = useAppSelector((state) => state.chat);

  useEffect(() => {
    if (!bookings.length) {
      void dispatch(fetchChatBookings());
    }
  }, [bookings.length, dispatch]);

  const handleStartChat = async (bookingId: string, conversationId?: string | null) => {
    try {
      if (conversationId) {
        onOpenConversation(conversationId);
        return;
      }

      const resultAction = await dispatch(
        startConversation({
          bookingId,
          initialMessage: "Xin chào, tôi có câu hỏi về lịch hẹn này.",
        })
      );

      if (startConversation.fulfilled.match(resultAction)) {
        const payload = resultAction.payload;
        const newConversationId = payload.conversationId;
        onOpenConversation(newConversationId);
        void dispatch(fetchChatConversations());
        if (payload.isNew) {
          message.success("Khởi tạo cuộc trò chuyện thành công");
        }
      } else {
        const errorMessage = resultAction.payload ?? "Không thể bắt đầu cuộc trò chuyện";
        message.error(errorMessage as string);
      }
    } catch (error) {
      console.error("Error starting chat", error);
      message.error("Đã có lỗi xảy ra khi bắt đầu cuộc trò chuyện");
    }
  };

  if (bookingsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spin />
      </div>
    );
  }

  if (!bookings.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <Empty description="Không có lịch hẹn khả dụng" />
        <p className="text-sm text-gray-500">
          Các lịch hẹn được chỉ định cho bạn sẽ hiển thị tại đây.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="bg-gray-50 px-4 py-3">
        <h3 className="text-base font-semibold text-gray-800">
          Lịch hẹn
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {bookings.map((booking) => (
          <div key={booking.bookingId} className="flex flex-col gap-3 px-4 py-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span className="font-semibold text-gray-800">
                {new Date(booking.appointmentDate).toLocaleDateString("vi-VN")}
              </span>
              <span>{booking.appointmentStartTime}</span>
            </div>
            <div className="text-sm font-medium text-gray-700">
              {booking.serviceType?.name ?? "Dịch vụ"}
            </div>
            <Tooltip title={booking.vehicle?.licensePlate ?? ""}>
              <div className="text-sm text-gray-500">
                {booking.vehicle?.brand} {booking.vehicle?.model}
              </div>
            </Tooltip>
            <div className="text-xs uppercase tracking-wide text-gray-400">
              Trạng thái: {booking.status}
            </div>
            <div className="text-sm text-gray-600">
              Có thể chat với: {booking.otherParticipants.map((p) => p.name).join(", ")}
            </div>
            <button
              onClick={() =>
                handleStartChat(booking.bookingId, booking.conversationId ?? undefined)
              }
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              {booking.hasConversation ? "Tiếp tục chat" : "Bắt đầu chat"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingChatList;
