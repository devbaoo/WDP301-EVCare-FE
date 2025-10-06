import { useEffect, useMemo } from "react";
import { Spin, Empty, message, Tooltip, Pagination, Select } from "antd";
import { useAppDispatch, useAppSelector } from "@/services/store/store";
import {
  fetchChatBookings,
  fetchChatConversations,
  startConversation,
  setBookingsPage,
  setBookingsItemsPerPage,
} from "@/services/features/chat/chatSlice";

interface BookingChatListProps {
  onOpenConversation: (conversationId: string) => void;
}

const BookingChatList = ({ onOpenConversation }: BookingChatListProps) => {
  const dispatch = useAppDispatch();
  const {
    bookings,
    bookingsLoading,
    bookingsPagination
  } = useAppSelector((state) => state.chat);

  useEffect(() => {
    if (!bookings.length) {
      void dispatch(fetchChatBookings());
    }
  }, [bookings.length, dispatch]);

  // Calculate paginated bookings
  const paginatedBookings = useMemo(() => {
    const { currentPage, itemsPerPage } = bookingsPagination;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return bookings.slice(startIndex, endIndex);
  }, [bookings, bookingsPagination]);

  const handlePageChange = (page: number) => {
    dispatch(setBookingsPage(page));
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    dispatch(setBookingsItemsPerPage(itemsPerPage));
  };

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
      <div className="bg-gray-50 px-6 py-4 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-800">
          Lịch hẹn
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {paginatedBookings.map((booking) => (
          <div key={booking.bookingId} className="flex flex-col gap-4 px-6 py-4">
            <div className="flex items-center justify-between text-base text-gray-600">
              <span className="font-semibold text-gray-800">
                {new Date(booking.appointmentDate).toLocaleDateString("vi-VN")}
              </span>
              <span>{booking.appointmentStartTime}</span>
            </div>
            <div className="text-base font-medium text-gray-700">
              {booking.serviceType?.name ?? "Dịch vụ"}
            </div>
            <Tooltip title={booking.vehicle?.licensePlate ?? ""}>
              <div className="text-base text-gray-500">
                {booking.vehicle?.brand} {booking.vehicle?.model}
              </div>
            </Tooltip>
            <div className="text-sm uppercase tracking-wide text-gray-400">
              Trạng thái: {booking.status}
            </div>
            <div className="text-base text-gray-600">
              Có thể chat với: {booking.otherParticipants.map((p) => p.name).join(", ")}
            </div>
            <button
              onClick={() =>
                handleStartChat(booking.bookingId, booking.conversationId ?? undefined)
              }
              className="rounded-full bg-emerald-500 px-6 py-3 text-base font-semibold text-white transition hover:bg-emerald-600"
            >
              {booking.hasConversation ? "Tiếp tục chat" : "Bắt đầu chat"}
            </button>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {bookingsPagination.totalPages > 1 && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Hiển thị:</span>
              <Select
                value={bookingsPagination.itemsPerPage}
                onChange={handleItemsPerPageChange}
                size="small"
                className="w-20"
                options={[
                  { value: 3, label: "3" },
                  { value: 5, label: "5" },
                  { value: 10, label: "10" },
                  { value: 20, label: "20" },
                  { value: 50, label: "50" },
                ]}
              />
              <span>trên {bookingsPagination.totalItems} lịch hẹn</span>
            </div>
            <Pagination
              current={bookingsPagination.currentPage}
              total={bookingsPagination.totalItems}
              pageSize={bookingsPagination.itemsPerPage}
              onChange={handlePageChange}
              showSizeChanger={false}
              showQuickJumper
              size="small"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingChatList;
