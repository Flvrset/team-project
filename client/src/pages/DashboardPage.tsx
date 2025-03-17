import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PetsIcon from '@mui/icons-material/Pets';
import { Avatar, Box, Button, CircularProgress, Container, Divider, IconButton, Menu, MenuItem, Toolbar, Typography, AppBar, useTheme } from '@mui/material';
import { useEffect, useState, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import Footer from '../components/Footer';

interface UserData {
    name: string;
    surname: string;
    email: string;
    login: string;
}

const DashboardPage = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const response = await fetch('/api/protected', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserData(data.user);
                } else {
                    // User is not authenticated, redirect to login
                    navigate('/login');
                }
            } catch (error) {
                console.error('Authentication check failed:', error);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuthentication();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/logout', {
                method: 'POST',
            });

            if (response.ok) {
                navigate('/login');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getInitials = () => {
        if (!userData) return '';
        return `${userData.name.charAt(0)}${userData.surname.charAt(0)}`;
    };

    const handleMenuClick = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    bgcolor: 'background.default',
                }}
            >
                <CircularProgress color="primary" size={60} />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PetsIcon sx={{ mr: 2, fontSize: 28 }} />
                        <Typography variant="h6" noWrap component="div">
                            PetBuddies
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton size="large" color="inherit" sx={{ mr: 2 }}>
                            <NotificationsIcon />
                        </IconButton>

                        <Avatar
                            onClick={handleMenuClick}
                            sx={{
                                bgcolor: theme.palette.secondary.main,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    transform: 'scale(1.1)',
                                    boxShadow: '0 0 8px rgba(255,255,255,0.5)'
                                }
                            }}
                        >
                            {getInitials()}
                        </Avatar>

                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            PaperProps={{
                                elevation: 3,
                                sx: {
                                    mt: 1.5,
                                    minWidth: 180,
                                    borderRadius: 2,
                                    overflow: 'visible',
                                    '&:before': {
                                        content: '""',
                                        display: 'block',
                                        position: 'absolute',
                                        top: 0,
                                        right: 14,
                                        width: 10,
                                        height: 10,
                                        bgcolor: 'background.paper',
                                        transform: 'translateY(-50%) rotate(45deg)',
                                        zIndex: 0,
                                    },
                                },
                            }}
                        >
                            <Box sx={{ px: 2, py: 1.5 }}>
                                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                    {userData?.name} {userData?.surname}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" noWrap>
                                    {userData?.email}
                                </Typography>
                            </Box>
                            <Divider />
                            <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                                <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
                                Wyloguj się
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    mt: 8,
                    backgroundColor: 'background.default',
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ py: 4 }}>
                        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                            Dashboard
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Witaj, {userData?.name}! Oto Twój panel główny w aplikacji PetBuddies.
                        </Typography>

                        <Box
                            sx={{
                                mt: 4,
                                p: 3,
                                bgcolor: 'white',
                                borderRadius: 4,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                minHeight: '300px'
                            }}
                        >
                            <DashboardIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2, opacity: 0.7 }} />
                            <Typography variant="h5" align="center" gutterBottom>
                                Twój panel zarządzania
                            </Typography>
                            <Typography variant="body1" align="center" color="text.secondary">
                                Tutaj będą dostępne funkcje zarządzania Twoimi zwierzętami i ogłoszeniami.
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                sx={{
                                    mt: 4,
                                    borderRadius: 2,
                                    px: 4,
                                    py: 1
                                }}
                            >
                                Dodaj ogłoszenie
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>
            <Footer />
        </Box>
    );
};

export default DashboardPage;