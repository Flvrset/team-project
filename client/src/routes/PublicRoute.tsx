import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../hooks/AuthProvider';


const PublicRoute = () => {
    const auth = useAuth();
    
    useEffect(() => {
        auth.checkAuthStatus();
    }, []);

    return auth.isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default PublicRoute;