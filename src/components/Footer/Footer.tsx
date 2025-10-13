import { Button } from "antd";
import { MessageSquare, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-synop-blue-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">
                Sẵn sàng nâng tầm trung tâm dịch vụ xe điện của bạn?
              </h3>
              <a href="/login">
                <Button className="bg-white text-synop-blue-primary hover:bg-gray-100 rounded-full px-8">
                  Bắt đầu
                </Button>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Giải pháp</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-synop-blue-light transition-colors">Quản lý sạc</a></li>
              <li><a href="#" className="hover:text-synop-blue-light transition-colors">Quản lý phương tiện</a></li>
              <li><a href="#" className="hover:text-synop-blue-light transition-colors">Quản lý năng lượng</a></li>
              <li><a href="#" className="hover:text-synop-blue-light transition-colors">Quản lý thanh toán</a></li>
              <li><a href="#" className="hover:text-synop-blue-light transition-colors">SynopLink</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Công ty</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-synop-blue-light transition-colors">Tình huống sử dụng</a></li>
              <li><a href="#" className="hover:text-synop-blue-light transition-colors">Về chúng tôi</a></li>
              <li><a href="#" className="hover:text-synop-blue-light transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-synop-blue-light transition-colors">Phòng báo chí</a></li>
              <li><a href="#" className="hover:text-synop-blue-light transition-colors">Tuyển dụng</a></li>
              <li><a href="#" className="hover:text-synop-blue-light transition-colors">Liên hệ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Thông tin liên hệ</h4>
            <div className="space-y-3 text-sm">
              <p>Email: info@EV CARE.com</p>
              <p>Điện thoại: +1 (555) 123-4567</p>
              <p>Địa chỉ: Vinhome Grand Park, Quận 9</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <div className="flex space-x-4">
                <MessageSquare className="w-5 h-5" />
                <Globe className="w-5 h-5" />
              </div>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-synop-blue-light transition-colors underline">Báo chí</a>
                <a href="#" className="hover:text-synop-blue-light transition-colors underline">Liên hệ</a>
                <a href="#" className="hover:text-synop-blue-light transition-colors underline">Trạng thái</a>
                <a href="#" className="hover:text-synop-blue-light transition-colors underline">Bảo mật</a>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <span>Vinhome Grand Park, Quận 9</span>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-synop-blue-light transition-colors underline">Chính sách bảo mật</a>
                <a href="#" className="hover:text-synop-blue-light transition-colors underline">Điều khoản & Điều kiện</a>
              </div>
              <span>© BẢN QUYỀN EV CARE 2025</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
