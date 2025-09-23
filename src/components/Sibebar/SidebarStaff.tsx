import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '@/services/store/store';
import { logout } from '@/services/features/auth/authSlice';
import {
    LayoutDashboard,
    DollarSign,
    Users,
    Wrench,
    Settings,
    LogOut,
    ChevronDown,
    ChevronRight,
    ShieldCheck,  
    type LucideIcon,
} from 'lucide-react';

type MenuItem = {
    icon: LucideIcon;
    label: string;
    path: string;
    children?: MenuItem[];
};

const SidebarStaff = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);

    const menuItems: MenuItem[] = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/staff' },
        { icon: ShieldCheck, label: 'Certificate', path: '/staff/certificate' },
        { icon: DollarSign, label: 'Payments', path: '/staff/payments' },
        { icon: Users, label: 'Service Centers', path: '/staff/service-centers' },
        { icon: Wrench, label: 'Technicians', path: '/staff/technicians' },
        { icon: Settings, label: 'Settings', path: '/staff/settings' },
    ];

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    const toggleDropdown = (path: string) => {
        setOpenDropdowns(prev =>
            prev.includes(path)
                ? prev.filter(p => p !== path)
                : [...prev, path]
        );
    };

    const isDropdownOpen = (path: string) => openDropdowns.includes(path);

    return (
        <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-900">Staff Panel</h1>
                <p className="text-sm text-gray-600 mt-1">Management Dashboard</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const active = isActive(item.path);
                    const hasChildren = item.children && item.children.length > 0;
                    const isOpen = isDropdownOpen(item.path);

                    return (
                        <div key={item.path}>
                            <button
                                onClick={() => {
                                    if (hasChildren) {
                                        toggleDropdown(item.path);
                                    } else {
                                        navigate(item.path);
                                    }
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${active
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="flex-1 text-left">{item.label}</span>
                                {hasChildren && (
                                    <span className="text-gray-400">
                                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    </span>
                                )}
                            </button>
                            {/* Dropdown children */}
                            {hasChildren && isOpen && (
                                <div className="ml-4 mt-2 space-y-1">
                                    {item.children!.map((child) => {
                                        const childActive = isActive(child.path);
                                        return (
                                            <button
                                                key={child.path}
                                                onClick={() => navigate(child.path)}
                                                className={`w-full flex items-center gap-3 px-4 py-2 transition-colors ${childActive
                                                    ? 'bg-gray-100 text-gray-900'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                    }`}
                                            >
                                                <child.icon className="w-4 h-4" />
                                                <span className="flex-1 text-left">{child.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default SidebarStaff;
