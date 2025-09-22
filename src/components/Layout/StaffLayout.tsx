import { Outlet } from 'react-router-dom';
import SidebarStaff from '../Sibebar/SidebarStaff';

const StaffLayout = () => {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <SidebarStaff />

            {/* Main content */}
            <div className="flex-1 p-8">
                <Outlet />
            </div>
        </div>
    );
};

export default StaffLayout;