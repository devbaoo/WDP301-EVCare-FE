import { Button, Dropdown } from "antd";
import { UserOutlined, LogoutOutlined, CarOutlined, HistoryOutlined, CreditCardOutlined, MessageOutlined } from "@ant-design/icons";
import type { MenuProps } from 'antd';
import { useAppSelector, useAppDispatch } from "../../services/store/store";
import { logout } from "../../services/features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Header() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleNavigateToProfile = () => {
    navigate("/customer/profile");
  };

  const handleNavigateToVehicles = () => {
    navigate("/customer/vehicles");
  };

  const handleNavigateToBookingHistory = () => {
    navigate("/customer/bookings");
  };

  const handleNavigateToPaymentHistory = () => {
    navigate("/customer/payments");
  };

  const handleNavigateToChat = () => {
    navigate("/customer/chat");
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ',
      onClick: handleNavigateToProfile,
    },
    {
      type: 'divider',
    },
    {
      key: 'chat',
      icon: <MessageOutlined />,
      label: 'Trung tâm chat',
      onClick: handleNavigateToChat,
    },
    {
      type: 'divider',
    },
    {
      key: 'manageVehicles',
      icon: <CarOutlined />,
      label: 'Quản lý xe',
      onClick: handleNavigateToVehicles,
    },
    {
      type: 'divider',
    },
    {
      key: 'history',
      icon: <HistoryOutlined />,
      label: 'Lịch sử đặt lịch',
      onClick: handleNavigateToBookingHistory,
    },
    {
      key: 'payments',
      icon: <CreditCardOutlined />,
      label: 'Lịch sử thanh toán',
      onClick: handleNavigateToPaymentHistory,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center"
          >
            <motion.a
              href="/"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-2xl font-bold text-synop-blue-dark">
                EV CARE
              </div>
            </motion.a>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden md:flex items-center space-x-8"
          >
            <motion.a href="/" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button className="text-synop-blue-dark font-semibold text-sm tracking-wide hover:text-synop-blue-primary transition-colors">
                Trang chủ
              </button>
            </motion.a>
            <motion.a
              href="/booking"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-synop-blue-dark font-semibold text-sm tracking-wide hover:text-synop-blue-primary transition-colors"
            >
              Đặt lịch
            </motion.a>
            <motion.a
              href="/about"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-synop-blue-dark font-semibold text-sm tracking-wide hover:text-synop-blue-primary transition-colors"
            >
              Về chúng tôi
            </motion.a>
            <motion.a
              href="/contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-synop-blue-dark font-semibold text-sm tracking-wide hover:text-synop-blue-primary transition-colors"
            >
              Liên hệ
            </motion.a>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center space-x-4"
          >
            {isAuthenticated && user ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex items-center space-x-3"
              >
                <span className="text-synop-blue-dark font-medium">
                  Hello, {user.fullName || user.username || user.email || 'User'}
                </span>
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      type="text"
                      icon={<UserOutlined />}
                      className="text-synop-blue-primary hover:text-synop-blue-dark"
                    />
                  </motion.div>
                </Dropdown>
              </motion.div>
            ) : (
              <motion.a
                href="/login"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-white text-synop-blue-primary border border-synop-blue-primary hover:bg-synop-blue-primary hover:text-white rounded-full px-6">
                  Đăng nhập/Đăng ký
                </Button>
              </motion.a>
            )}
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}
