import ChatMain from "@/components/Chat/ChatMain";

const ChatPage = () => {
  return (
    <div className="mx-auto max-w-6xl py-6 h-[calc(100vh-120px)]">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">
        Trung tâm trò chuyện
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Quản lý cuộc trò chuyện với khách hàng, nhân viên và kỹ thuật viên cho từng lịch hẹn.
      </p>
      <div className="h-[calc(100%-80px)]">
        <ChatMain />
      </div>
    </div>
  );
};

export default ChatPage;
