import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import {
    LayoutDashboard,
    Calendar,
    Wrench,
    Settings,
    LogOut,
    Menu,
    X,
    Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/services/store/store';
import { logout } from '@/services/features/auth/authSlice';

const TechnicianLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/technician' },
        { icon: Calendar, label: 'Schedule', path: '/technician/schedule' },
        { icon: Wrench, label: 'My Services', path: '/technician/services' },
        { icon: Clock, label: 'History', path: '/technician/history' },
        { icon: Settings, label: 'Settings', path: '/technician/settings' },
    ];

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">Technician Panel</h1>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="mt-6">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => {
                                navigate(item.path);
                                setSidebarOpen(false);
                            }}
                            className="w-full flex items-center px-6 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:ml-64">
                {/* Top bar */}
                <div className="bg-white shadow-sm border-b border-gray-200">
                    <div className="flex items-center justify-between h-16 px-6">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">Welcome, Technician</span>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default TechnicianLayout;
