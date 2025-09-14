import { Outlet } from 'react-router-dom';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

const CustomerLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="min-h-screen">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default CustomerLayout;
