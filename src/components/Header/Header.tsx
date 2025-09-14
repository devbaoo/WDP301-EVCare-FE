import { Button, Dropdown } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import type { MenuProps } from 'antd';
import { useAppSelector, useAppDispatch } from "../../services/store/store";
import { logout } from "../../services/features/auth/authSlice";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleNavigateToProfile = () => {
    navigate("/profileCustomer");
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: handleNavigateToProfile,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href="/">
              <div className="text-2xl font-bold text-synop-blue-dark">
                EV-CARE
              </div>
            </a>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="/">
              <button className="text-synop-blue-dark font-semibold text-sm tracking-wide hover:text-synop-blue-primary transition-colors">
                Home
              </button>
            </a>
            <button className="text-synop-blue-dark font-semibold text-sm tracking-wide hover:text-synop-blue-primary transition-colors">
              Booking
            </button>
            <button className="text-synop-blue-dark font-semibold text-sm tracking-wide hover:text-synop-blue-primary transition-colors">
              About us
            </button>
            <button className="text-synop-blue-dark font-semibold text-sm tracking-wide hover:text-synop-blue-primary transition-colors">
              Contacts
            </button>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <span className="text-synop-blue-dark font-medium">
                  Hello, {user.fullName}
                </span>
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                  <Button
                    type="text"
                    icon={<UserOutlined />}
                    className="text-synop-blue-primary hover:text-synop-blue-dark"
                  />
                </Dropdown>
              </div>
            ) : (
              <a href="/login">
                <Button className="bg-white text-synop-blue-primary border border-synop-blue-primary hover:bg-synop-blue-primary hover:text-white rounded-full px-6">
                  Login/Register
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
