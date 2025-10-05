export type ChatRole = "customer" | "staff" | "technician" | "admin" | string;

export interface ChatParticipant {
  userId: string;
  name: string;
  role: ChatRole;
  avatarUrl?: string | null;
}

export interface ChatBookingServiceType {
  id: string;
  name: string;
}

export interface ChatBookingVehicle {
  id: string;
  brand: string;
  model: string;
  licensePlate: string;
}

export interface ChatBooking {
  bookingId: string;
  appointmentDate: string;
  appointmentStartTime: string;
  status: string;
  serviceType?: ChatBookingServiceType | null;
  vehicle?: ChatBookingVehicle | null;
  hasConversation: boolean;
  conversationId?: string | null;
  otherParticipants: ChatParticipant[];
}

export type ChatMessageType = "text" | "image" | "document" | "system";

export interface ChatLastMessage {
  content: string;
  senderId: string;
  sentAt: string;
  messageType: ChatMessageType;
}

export interface ChatConversation {
  conversationId: string;
  bookingId: string;
  bookingStatus: string;
  bookingDate: string;
  participants: ChatParticipant[];
  lastMessage?: ChatLastMessage | null;
  unreadCount: number;
  updatedAt: string;
}

export interface ChatMessageSender {
  _id: string;
  name: string;
  role: ChatRole;
  avatarUrl?: string | null;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: ChatMessageSender;
  messageType: ChatMessageType;
  content: string;
  attachmentUrl?: string | null;
  sentAt: string;
}

export interface ChatPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ChatMessagesPayload {
  messages: ChatMessage[];
  participants: ChatParticipant[];
  pagination: ChatPagination;
}

export interface StartConversationResponse {
  conversationId: string;
  bookingId: string;
  participants: ChatParticipant[];
  isNew: boolean;
  message?: {
    content: string;
    sentAt: string;
    messageType?: ChatMessageType;
  } | null;
}

export interface SendMessagePayload {
  conversationId: string;
  messageId: string;
  message: ChatMessage;
}

export interface ChatState {
  bookings: ChatBooking[];
  bookingsLoading: boolean;
  conversations: ChatConversation[];
  conversationsLoading: boolean;
  messagesByConversation: Record<string, ChatMessage[]>;
  participantsByConversation: Record<string, ChatParticipant[]>;
  paginationByConversation: Record<string, ChatPagination | null>;
  messagesLoading: boolean;
  sendingMessage: boolean;
  unreadCount: number;
  error: string | null;
  activeConversationId: string | null;

}
