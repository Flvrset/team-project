import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../hooks/AuthProvider';



const ProtectedRoute = () => {
    const auth = useAuth();
    useEffect(() => {
        auth.checkAuthStatus();
    }, []);
    return !auth.isAuthenticated ? <Navigate to="/login" replace /> : <Outlet />;
};

export default ProtectedRoute;