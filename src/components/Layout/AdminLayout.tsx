
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sibebar/SidebarAdmin';

const AdminLayout = () => {

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />

        
            {/* Main content */}
            <div className="flex-1 p-8">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout; 