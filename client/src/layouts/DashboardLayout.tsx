import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PetsIcon from '@mui/icons-material/Pets';
import { Avatar, Box, Container, Divider, IconButton, Menu, MenuItem, Toolbar, Typography, AppBar, useTheme } from '@mui/material';
import { useState, MouseEvent } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import Footer from '../components/Footer';
import { useAuth } from '../hooks/AuthProvider';

const DashboardLayout = () => {
    const auth = useAuth();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const theme = useTheme();
    const navigate = useNavigate();

    const handleLogout = async () => {
        auth.logout();
    };

    const getInitials = () => {
        if (!auth.userData) return '';
        return `${auth.userData.name.charAt(0)}${auth.userData.surname.charAt(0)}`;
    };

    const handleMenuClick = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleEditData = () => {
        setAnchorEl(null);
        navigate('/dashboard/editData');
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

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
                                    {auth.userData?.name} {auth.userData?.surname}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" noWrap>
                                    {auth.userData?.email}
                                </Typography>
                            </Box>
                            <Divider />
                            <MenuItem onClick={handleEditData} sx={{ py: 1.5 }}>
                                <EditIcon fontSize="small" sx={{ mr: 1.5 }} />
                                Edytuj dane
                            </MenuItem>
                            <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                                <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
                                Wyloguj się
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Main content - will render child routes */}
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
                        {/* Render the child route content here */}
                        <Outlet />
                    </Box>
                </Container>
            </Box>
            <Footer />
        </Box>
    );
};

export default DashboardLayout;