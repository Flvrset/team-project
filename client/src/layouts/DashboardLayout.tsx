import ApprovalIcon from '@mui/icons-material/Approval';
import EditIcon from '@mui/icons-material/Edit';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import PetsIcon from '@mui/icons-material/Pets';
import { Avatar, Box, Container, Divider, Menu, MenuItem, Toolbar, Typography, AppBar, useTheme, Button } from '@mui/material';
import { useState, MouseEvent } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

import Footer from '../components/Footer';
import GlobalSnackbar from '../components/GlobalSnackbar';
import { useAuth } from '../contexts/AuthProvider';

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

    const navigateTo = (path: string) => {
        setAnchorEl(null);
        navigate(path);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                            component={Link}
                            to='/dashboard'
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                textTransform: 'none',
                                color: 'inherit',
                                borderRadius: '12px',
                                py: 1,
                                px: 1.5,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                    transform: 'translateY(-2px)',
                                },
                            }}
                            startIcon={
                                <PetsIcon
                                    sx={{
                                        fontSize: 32,
                                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                                    }}
                                />
                            }
                        >
                            <Typography
                                variant="h6"
                                noWrap
                                component="div"
                                sx={{
                                    fontWeight: 'bold',
                                    letterSpacing: '0.5px',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            >
                                PetBuddies
                            </Typography>
                        </Button>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>

                        <Avatar
                            onClick={handleMenuClick}
                            src={auth.userData?.file_link}
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
                            <MenuItem onClick={() => navigateTo('/dashboard/my-posts')} sx={{ py: 1.5 }}>
                                <ListAltIcon fontSize="small" sx={{ mr: 1.5 }} />
                                Twoje ogłoszenia
                            </MenuItem>
                            <MenuItem onClick={() => navigateTo('/dashboard/my-applications')} sx={{ py: 1.5 }}>
                                <ApprovalIcon fontSize="small" sx={{ mr: 1.5 }} />
                                Twoje zgłoszenia
                            </MenuItem>
                            <MenuItem onClick={() => navigateTo('/dashboard/edit-data')} sx={{ py: 1.5 }}>
                                <EditIcon fontSize="small" sx={{ mr: 1.5 }} />
                                Edytuj dane
                            </MenuItem>
                            <MenuItem onClick={() => navigateTo('/dashboard/pets')} sx={{ py: 1.5 }}>
                                <PetsIcon fontSize="small" sx={{ mr: 1.5 }} />
                                Twoje zwierzaki
                            </MenuItem>
                            <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                                <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
                                Wyloguj się
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

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
                        <Outlet />
                    </Box>
                </Container>
            </Box>
            <GlobalSnackbar />
            <Footer />
        </Box>
    );
};

export default DashboardLayout;