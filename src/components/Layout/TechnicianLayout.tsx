import { Outlet } from 'react-router-dom';
import SidebarTechnician from '../Sibebar/SidebarTechnician';

const TechnicianLayout = () => {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <SidebarTechnician />

            {/* Main content */}
            <div className="flex-1 p-8">
                <Outlet />
            </div>
        </div>
    );
};

export default TechnicianLayout;