import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '@/services/store/store';
import { logout } from '@/services/features/auth/authSlice';
import {
    DollarSign,
    Wrench,
    Settings,
    LogOut,
    Menu,
    ChevronDown,
    ShieldCheck,
    CalendarDays,
    type LucideIcon,
    Calendar,
    MessageSquare,
    Package,
    Boxes,
    Sparkles,
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
    const [collapsed, setCollapsed] = useState(false);
    const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);

    const menuItems: MenuItem[] = [
        { icon: CalendarDays, label: 'Bookings', path: '/staff/booking' },
        
        { icon: ShieldCheck, label: 'Certificate', path: '/staff/certificate' },
        { icon: DollarSign, label: 'Payments', path: '/staff/payment' },
        { icon: Package, label: 'Parts', path: '/staff/parts' },
        { icon: Boxes, label: 'Inventory', path: '/staff/inventory' },
        { icon: Sparkles, label: 'AI Optimization', path: '/staff/ai' },
        { icon: Wrench, label: 'Technicians', path: '/staff/technicians' },
        { icon: MessageSquare, label: 'Chat', path: '/staff/chat' },
        { icon: Calendar, label: 'Schedules', path: '/staff/schedules' },
        { icon: Settings, label: 'Settings', path: '/staff/settings' },
    ];

    const handleLogout = () => {
        dispatch(logout());
        localStorage.clear();
        navigate('/login');
    };

    const isActive = (path: string) => {
        const isRoot = path === '/staff';
        return isRoot ? location.pathname === '/staff' : location.pathname.startsWith(path);
    };

    const toggleDropdown = (path: string) => {
        setOpenDropdowns(prev =>
            prev.includes(path)
                ? prev.filter(p => p !== path)
                : [...prev, path]
        );
    };

    const isDropdownOpen = (path: string) => openDropdowns.includes(path);

    // Clear open dropdowns when navigating if collapsed
    useEffect(() => {
        if (collapsed) {
            setOpenDropdowns([]);
        }
    }, [location.pathname, collapsed]);

    return (
        <aside
            className={`h-screen sticky top-0 shrink-0 bg-white border-r border-gray-200 shadow-sm transition-all duration-200 ${collapsed ? 'w-20' : 'w-64'
                }`}
        >
            <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200 ml-1">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        aria-label="Toggle sidebar"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    {!collapsed && (
                        <span className="text-lg font-bold tracking-wide">EV CARE</span>
                    )}
                </div>
            </div>

            <nav className="py-4 ml-3">
                {menuItems.map((item) => {
                    const active = isActive(item.path);
                    const hasChildren = item.children && item.children.length > 0;
                    const isOpen = isDropdownOpen(item.path);

                    return (
                        <div key={item.path} className="relative">
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
                                {!collapsed && (
                                    <>
                                        <span className="text-sm font-medium">{item.label}</span>
                                        {hasChildren && (
                                            <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                        )}
                                    </>
                                )}
                            </button>
                            {/* Dropdown children */}
                            {hasChildren && isOpen && (
                                !collapsed ? (
                                    <div className="ml-6 border-l border-gray-200">
                                        {item.children!.map((child) => {
                                            const childActive = isActive(child.path);
                                            return (
                                                <button
                                                    key={child.path}
                                                    onClick={() => {
                                                        navigate(child.path);
                                                        if (collapsed) {
                                                            setOpenDropdowns(prev => prev.filter(p => p !== item.path));
                                                        }
                                                    }}
                                                    className={`w-full flex items-center gap-3 px-4 py-2 transition-colors ${childActive
                                                        ? 'bg-gray-100 text-gray-900'
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                        }`}
                                                >
                                                    <child.icon className="w-4 h-4" />
                                                    <span className="text-sm font-medium">{child.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="absolute left-full top-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg py-2 w-56">
                                        {item.children!.map((child) => {
                                            const childActive = isActive(child.path);
                                            return (
                                                <button
                                                    key={child.path}
                                                    onClick={() => {
                                                        navigate(child.path);
                                                        if (collapsed) {
                                                            setOpenDropdowns(prev => prev.filter(p => p !== item.path));
                                                        }
                                                    }}
                                                    className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${childActive
                                                        ? 'bg-gray-100 text-gray-900'
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                        }`}
                                                >
                                                    <child.icon className="w-4 h-4" />
                                                    <span className="text-sm font-medium">{child.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )
                            )}
                        </div>
                    );
                })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    {!collapsed && <span className="text-sm font-medium">Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default SidebarStaff;
