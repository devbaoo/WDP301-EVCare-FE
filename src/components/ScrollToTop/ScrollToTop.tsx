import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Immediate scroll to top for production compatibility
        window.scrollTo(0, 0);

        // Additional smooth scroll with timeout for better reliability
        const timeoutId = setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);

        // Cleanup timeout on unmount
        return () => clearTimeout(timeoutId);
    }, [pathname]);

    return null;
};

export default ScrollToTop;
