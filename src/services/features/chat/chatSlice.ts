import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../constant/axiosInstance";
import {
  CHAT_BOOKINGS_ENDPOINT,
  CHAT_CONVERSATIONS_ENDPOINT,
  CHAT_CONVERSATION_MARK_READ_ENDPOINT,
  CHAT_CONVERSATION_MESSAGES_ENDPOINT,
  CHAT_CONVERSATION_SEND_MESSAGE_ENDPOINT,
  CHAT_UNREAD_COUNT_ENDPOINT,
} from "../../constant/apiConfig";
import {
  ChatBooking,
  ChatConversation,
  ChatMessage,
  ChatMessagesPayload,
  ChatState,
  StartConversationResponse,
  ChatMessageType,
} from "../../../interfaces/chat";

interface FetchMessagesParams {
  conversationId: string;
  page?: number;
  limit?: number;
  append?: boolean;
}

interface FetchMessagesResult {
  conversationId: string;
  data: ChatMessagesPayload;
  append: boolean;
}

interface StartConversationParams {
  bookingId: string;
  initialMessage?: string;
}

interface SendMessageParams {
  conversationId: string;
  content: string;
  messageType?: ChatMessageType;
  attachmentUrl?: string | null;
}

const initialState: ChatState = {
  bookings: [],
  bookingsLoading: false,
  conversations: [],
  conversationsLoading: false,
  messagesByConversation: {},
  participantsByConversation: {},
  paginationByConversation: {},
  messagesLoading: false,
  sendingMessage: false,
  unreadCount: 0,
  error: null,
  activeConversationId: null,
  // Frontend pagination for bookings
  bookingsPagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 2,
  },
};

const getErrorMessage = (error: unknown): string => {
  const fallback = "Đã có lỗi xảy ra. Vui lòng thử lại";
  if (!error || typeof error !== "object") return fallback;
  const err = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return err.response?.data?.message || err.message || fallback;
};

export const fetchChatBookings = createAsyncThunk<
  ChatBooking[],
  void,
  { rejectValue: string }
>("chat/fetchChatBookings", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(CHAT_BOOKINGS_ENDPOINT);
    return response.data?.data ?? [];
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchChatConversations = createAsyncThunk<
  ChatConversation[],
  void,
  { rejectValue: string }
>("chat/fetchChatConversations", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(CHAT_CONVERSATIONS_ENDPOINT);
    return response.data?.data ?? [];
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchConversationMessages = createAsyncThunk<
  FetchMessagesResult,
  FetchMessagesParams,
  { rejectValue: string }
>(
  "chat/fetchConversationMessages",
  async (
    { conversationId, page = 1, limit = 20, append },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get(
        CHAT_CONVERSATION_MESSAGES_ENDPOINT(conversationId, page, limit)
      );
      const data: ChatMessagesPayload = response.data?.data ?? {
        messages: [],
        participants: [],
        pagination: {
          total: 0,
          page,
          limit,
          pages: 0,
        },
      };
      return {
        conversationId,
        data,
        append: append ?? page > 1,
      };
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const startConversation = createAsyncThunk<
  StartConversationResponse,
  StartConversationParams,
  { rejectValue: string }
>("chat/startConversation", async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(
      CHAT_CONVERSATIONS_ENDPOINT,
      payload
    );
    return response.data?.data;
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const markConversationAsRead = createAsyncThunk<
  { conversationId: string },
  string,
  { rejectValue: string }
>(
  "chat/markConversationAsRead",
  async (conversationId, { rejectWithValue }) => {
    try {
      await axiosInstance.put(
        CHAT_CONVERSATION_MARK_READ_ENDPOINT(conversationId)
      );
      return { conversationId };
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchUnreadCount = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>("chat/fetchUnreadCount", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(CHAT_UNREAD_COUNT_ENDPOINT);
    return response.data?.data?.count ?? 0;
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const sendChatMessage = createAsyncThunk<
  ChatMessage,
  SendMessageParams,
  { rejectValue: string }
>("chat/sendChatMessage", async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(
      CHAT_CONVERSATION_SEND_MESSAGE_ENDPOINT(payload.conversationId),
      {
        content: payload.content,
        messageType: payload.messageType ?? "text",
        attachmentUrl: payload.attachmentUrl,
      }
    );
    const responseData = response.data;
    const rawPayload = responseData?.data ?? responseData;
    const messagePayload =
      rawPayload?.message && typeof rawPayload.message === "object"
        ? rawPayload.message
        : rawPayload;

    if (!messagePayload || !messagePayload._id) {
      throw new Error("Không nhận được dữ liệu tin nhắn hợp lệ từ máy chủ");
    }

    return messagePayload as ChatMessage;
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    prependMessage(
      state,
      action: PayloadAction<{ conversationId: string; message: ChatMessage }>
    ) {
      const { conversationId, message } = action.payload;
      const currentMessages =
        state.messagesByConversation[conversationId] ?? [];
      state.messagesByConversation[conversationId] = [
        ...currentMessages,
        message,
      ];
    },
    setChatError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearConversation(state, action: PayloadAction<string>) {
      const conversationId = action.payload;
      delete state.messagesByConversation[conversationId];
      delete state.participantsByConversation[conversationId];
      delete state.paginationByConversation[conversationId];
    },
    setActiveConversationId(state, action: PayloadAction<string | null>) {
      state.activeConversationId = action.payload;
    },
    receiveIncomingMessage(
      state,
      action: PayloadAction<{
        message: ChatMessage;
        currentUserId?: string | null;
      }>
    ) {
      const { message, currentUserId } = action.payload;
      if (!message?.conversationId || !message._id) {
        return;
      }

      const conversationId = message.conversationId;
      const existingMessages =
        state.messagesByConversation[conversationId] ?? [];
      const messageAlreadyExists = existingMessages.some(
        (item) => item._id === message._id
      );

      if (!messageAlreadyExists) {
        state.messagesByConversation[conversationId] = [
          ...existingMessages,
          message,
        ];
      }

      const conversationIndex = state.conversations.findIndex(
        (item) => item.conversationId === conversationId
      );

      const isSentByCurrentUser =
        message.senderId?._id && message.senderId._id === currentUserId;
      const isActiveConversation =
        state.activeConversationId === conversationId;

      if (conversationIndex >= 0) {
        const conversation = state.conversations[conversationIndex];
        const previousUnread = conversation.unreadCount ?? 0;

        conversation.lastMessage = {
          content: message.content,
          senderId: message.senderId?._id ?? "",
          sentAt: message.sentAt,
          messageType: message.messageType,
        };
        conversation.updatedAt = message.sentAt;

        if (!isSentByCurrentUser) {
          if (isActiveConversation) {
            if (previousUnread > 0) {
              state.unreadCount = Math.max(
                0,
                state.unreadCount - previousUnread
              );
            }
            conversation.unreadCount = 0;
          } else {
            conversation.unreadCount = previousUnread + 1;
            state.unreadCount += 1;
          }
        }
      }
    },
    // Frontend pagination for bookings
    setBookingsPage(state, action: PayloadAction<number>) {
      state.bookingsPagination.currentPage = action.payload;
    },
    setBookingsItemsPerPage(state, action: PayloadAction<number>) {
      state.bookingsPagination.itemsPerPage = action.payload;
      state.bookingsPagination.currentPage = 1; // Reset to first page
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch bookings
      .addCase(fetchChatBookings.pending, (state) => {
        state.bookingsLoading = true;
        state.error = null;
      })
      .addCase(fetchChatBookings.fulfilled, (state, action) => {
        state.bookingsLoading = false;
        state.bookings = action.payload;
        // Update pagination info
        const totalItems = action.payload.length;
        const itemsPerPage = state.bookingsPagination.itemsPerPage;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        state.bookingsPagination = {
          ...state.bookingsPagination,
          totalItems,
          totalPages,
        };
      })
      .addCase(fetchChatBookings.rejected, (state, action) => {
        state.bookingsLoading = false;
        state.error = action.payload ?? null;
      })
      // Fetch conversations
      .addCase(fetchChatConversations.pending, (state) => {
        state.conversationsLoading = true;
        state.error = null;
      })
      .addCase(fetchChatConversations.fulfilled, (state, action) => {
        state.conversationsLoading = false;
        state.conversations = [...action.payload].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        state.unreadCount = state.conversations.reduce(
          (total, item) => total + (item.unreadCount ?? 0),
          0
        );
      })
      .addCase(fetchChatConversations.rejected, (state, action) => {
        state.conversationsLoading = false;
        state.error = action.payload ?? null;
      })
      // Fetch messages
      .addCase(fetchConversationMessages.pending, (state) => {
        state.messagesLoading = true;
        state.error = null;
      })
      .addCase(fetchConversationMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        const { conversationId, data, append } = action.payload;
        const existingMessages =
          state.messagesByConversation[conversationId] ?? [];
        state.messagesByConversation[conversationId] = append
          ? [...data.messages, ...existingMessages]
          : data.messages;
        state.participantsByConversation[conversationId] = data.participants;
        state.paginationByConversation[conversationId] =
          data.pagination ?? null;
      })
      .addCase(fetchConversationMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.error = action.payload ?? null;
      })
      // Start conversation
      .addCase(startConversation.fulfilled, (state, action) => {
        const payload = action.payload;
        if (!payload) return;

        const existingIndex = state.conversations.findIndex(
          (conversation) =>
            conversation.conversationId === payload.conversationId
        );

        const booking = state.bookings.find(
          (item) => item.bookingId === payload.bookingId
        );

        const newConversation: ChatConversation = {
          conversationId: payload.conversationId,
          bookingId: payload.bookingId,
          bookingStatus: booking?.status ?? "",
          bookingDate: booking?.appointmentDate ?? new Date().toISOString(),
          participants: payload.participants,
          lastMessage: payload.message
            ? {
                content: payload.message.content,
                senderId: "",
                sentAt: payload.message.sentAt,
                messageType: payload.message.messageType ?? "text",
              }
            : null,
          unreadCount: 0,
          updatedAt: payload.message?.sentAt ?? new Date().toISOString(),
        };

        if (existingIndex >= 0) {
          state.conversations[existingIndex] = {
            ...state.conversations[existingIndex],
            ...newConversation,
          };
        } else {
          state.conversations = [newConversation, ...state.conversations];
        }

        if (booking) {
          booking.hasConversation = true;
          booking.conversationId = payload.conversationId;
        }
      })
      .addCase(startConversation.rejected, (state, action) => {
        state.error = action.payload ?? null;
      })
      // Mark as read
      .addCase(markConversationAsRead.fulfilled, (state, action) => {
        const { conversationId } = action.payload;
        const conversation = state.conversations.find(
          (item) => item.conversationId === conversationId
        );
        if (conversation) {
          const previousUnread = conversation.unreadCount;
          conversation.unreadCount = 0;
          state.unreadCount = Math.max(0, state.unreadCount - previousUnread);
        }
      })
      .addCase(markConversationAsRead.rejected, (state, action) => {
        state.error = action.payload ?? null;
      })
      // Unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.error = action.payload ?? null;
      })
      // Send message
      .addCase(sendChatMessage.pending, (state) => {
        state.sendingMessage = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.sendingMessage = false;
        const message = action.payload;
        if (!message) return;
        const conversationId = message.conversationId;
        const existingMessages =
          state.messagesByConversation[conversationId] ?? [];
        state.messagesByConversation[conversationId] = [
          ...existingMessages,
          message,
        ];

        const conversation = state.conversations.find(
          (item) => item.conversationId === conversationId
        );
        if (conversation) {
          conversation.lastMessage = {
            content: message.content,
            senderId: message.senderId._id,
            sentAt: message.sentAt,
            messageType: message.messageType,
          };
          conversation.updatedAt = message.sentAt;
        }
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.sendingMessage = false;
        state.error = action.payload ?? null;
      });
  },
});

export const {
  prependMessage,
  setChatError,
  clearConversation,
  setActiveConversationId,
  receiveIncomingMessage,
  setBookingsPage,
  setBookingsItemsPerPage,
} = chatSlice.actions;

export default chatSlice.reducer;
