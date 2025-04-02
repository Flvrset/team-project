import { Box, CircularProgress } from '@mui/material';
import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../contexts/AuthProvider';

const AdminRoute = () => {
    const auth = useAuth();

    useEffect(() => {
        if (!auth.isAuthenticated && !auth.loading) {
            auth.checkAuthStatus();
        }
    }, [auth]);

    if (auth.loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <CircularProgress />
            </Box>
        );
    }

    if (auth.isAuthenticated && !auth.isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return auth.isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminRoute;